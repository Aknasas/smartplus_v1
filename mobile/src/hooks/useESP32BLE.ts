// hooks/useESP32BLE.ts
import { useEffect, useRef, useState } from "react";
import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";
import { Buffer } from "buffer";

export interface ESP32SensorData {
  heartRate: number;
  spo2: number;
  bodyTemperature: number;
  ambientTemperature?: number;
  acceleration?: { x: number; y: number; z: number };
  fingerDetected?: boolean;
  timestamp?: number;
}

export interface BLEDeviceInfo {
  id: string;
  name: string | null;
}

/* UUIDs */
const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const CHAR_HR = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const CHAR_SPO2 = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const CHAR_BODYTEMP = "6e400004-b5a3-f393-e0a9-e50e24dcca9e";
const CHAR_AMBTEMP = "6e400005-b5a3-f393-e0a9-e50e24dcca9e";
const CHAR_ACCEL = "6e400006-b5a3-f393-e0a9-e50e24dcca9e";
const CHAR_JSON = "6e400007-b5a3-f393-e0a9-e50e24dcca9e";

const manager = new BleManager();

function log(...args: any[]) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  console.log(`[BLE ${timestamp}]`, ...args);
}

// ============ Hook Implementation ============ //

export function useESP32BLE(onData: (data: ESP32SensorData) => void) {
  const [devices, setDevices] = useState<BLEDeviceInfo[]>([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastDeviceRef = useRef<Device | null>(null);
  const monitorSubscriptionsRef = useRef<Array<() => void>>([]);
  const isDisconnectingRef = useRef(false); // Add flag to prevent multiple disconnects

  // Track consecutive zero readings for finger detection
  const zeroReadingsRef = useRef({
    heartRateZeros: 0,
    spo2Zeros: 0,
    maxZeroReadings: 3,
    lastUpdateTime: Date.now()
  });

  // Track sensor data
  const sensorDataRef = useRef<ESP32SensorData>({
    heartRate: 0,
    spo2: 0,
    bodyTemperature: 0,
    ambientTemperature: 0,
    acceleration: { x: 0, y: 0, z: 0 },
    fingerDetected: false,
    timestamp: Date.now()
  });

  // ===== MERGE incoming partial readings ===== //
  function mergeNewData(partial: Partial<ESP32SensorData>) {
    // Update sensor data
    if (partial.heartRate !== undefined) {
      sensorDataRef.current.heartRate = partial.heartRate;
      // Track consecutive zero readings for HR
      if (partial.heartRate > 0) {
        zeroReadingsRef.current.heartRateZeros = 0;
      } else {
        zeroReadingsRef.current.heartRateZeros++;
      }
    }

    if (partial.spo2 !== undefined) {
      sensorDataRef.current.spo2 = partial.spo2;
      // Track consecutive zero readings for SpO2
      if (partial.spo2 > 0) {
        zeroReadingsRef.current.spo2Zeros = 0;
      } else {
        zeroReadingsRef.current.spo2Zeros++;
      }
    }

    if (partial.bodyTemperature !== undefined) sensorDataRef.current.bodyTemperature = partial.bodyTemperature;
    if (partial.ambientTemperature !== undefined) sensorDataRef.current.ambientTemperature = partial.ambientTemperature;
    if (partial.acceleration !== undefined) {
      sensorDataRef.current.acceleration = partial.acceleration;
      log(`ACCELERATION UPDATE: X=${partial.acceleration.x.toFixed(3)}g, Y=${partial.acceleration.y.toFixed(3)}g, Z=${partial.acceleration.z.toFixed(3)}g`);
    }

    // Determine finger detection based on consecutive zero readings
    const bothZeroForTooLong =
      zeroReadingsRef.current.heartRateZeros >= zeroReadingsRef.current.maxZeroReadings &&
      zeroReadingsRef.current.spo2Zeros >= zeroReadingsRef.current.maxZeroReadings;

    const fingerDetected = !bothZeroForTooLong;
    sensorDataRef.current.fingerDetected = fingerDetected;
    sensorDataRef.current.timestamp = Date.now();
    zeroReadingsRef.current.lastUpdateTime = Date.now();

    log("Updated sensor data:", {
      heartRate: sensorDataRef.current.heartRate,
      spo2: sensorDataRef.current.spo2,
      bodyTemperature: sensorDataRef.current.bodyTemperature,
      ambientTemperature: sensorDataRef.current.ambientTemperature,
      acceleration: sensorDataRef.current.acceleration,
      fingerDetected: sensorDataRef.current.fingerDetected
    });

    onData(sensorDataRef.current);
  }

  // ============ Permissions ============ //
  const requestBLEPermissions = async () => {
    if (Platform.OS !== "android") return true;

    try {
      const api = Number(Platform.Version);
      if (api >= 31) {
        const res = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(res).every(
          (r) => r === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const g = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return g === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch {
      return false;
    }
  };

  // ============ Monitor Helper ============ //
  const monitorChar = async (
    device: Device,
    serviceUuid: string,
    charUuid: string,
    handler: (c: Characteristic | null) => void
  ) => {
    try {
      log(`Starting monitor for ${charUuid}`);

      const unsub = device.monitorCharacteristicForService(
        serviceUuid,
        charUuid,
        (error, characteristic) => {
          if (error) {
            log(`Monitor error for ${charUuid}:`, error.message);
            return;
          }
          log(`Data received from ${charUuid}`);
          handler(characteristic);
        }
      );

      monitorSubscriptionsRef.current.push(() => {
        try {
          // @ts-ignore
          unsub && unsub();
          log(`Stopped monitoring ${charUuid}`);
        } catch (e) {
          log(`Error unsubscribing from ${charUuid}:`, e);
        }
      });
    } catch (e) {
      log(`monitorChar exception for ${charUuid}:`, e);
    }
  };

  // ============ SCAN ============ //
  const scanForDevices = async () => {
    if (scanning) return;

    const ok = await requestBLEPermissions();
    if (!ok) {
      log("Permissions denied");
      setError("Bluetooth permissions required");
      return;
    }

    setScanning(true);
    setDevices([]);
    setError(null);
    log("Scanning for SmartPlus_ESP32...");

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        log("Scan error:", error);
        setError(error.message);
        setScanning(false);
        manager.stopDeviceScan();
        return;
      }

      if (device?.name?.includes("SmartPlus_ESP32")) {
        log(`Found: ${device.name} (${device.id})`);
        setDevices((prev) =>
          prev.some((d) => d.id === device.id)
            ? prev
            : [...prev, { id: device.id, name: device.name }]
        );
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
      log("Scan stopped");
    }, 8000);
  };

  // ============ Debug function to check characteristic values ============ //
  const debugCharacteristics = async (device: Device) => {
    try {
      log("=== DEBUG: Checking available characteristics ===");
      const service = await device.getService(SERVICE_UUID);
      const characteristics = await service.characteristics();

      for (const char of characteristics) {
        try {
          log(`Characteristic ${char.uuid}:`);
          log(`  - IsReadable: ${char.isReadable}`);
          log(`  - IsNotifiable: ${char.isNotifiable}`);
          log(`  - IsWritableWithResponse: ${char.isWritableWithResponse}`);
          log(`  - IsWritableWithoutResponse: ${char.isWritableWithoutResponse}`);

          // Try to read value
          if (char.isReadable) {
            const value = await char.read();
            if (value?.value) {
              const stringValue = Buffer.from(value.value, 'base64').toString('utf8');
              log(`  Value: "${stringValue.substring(0, 50)}${stringValue.length > 50 ? '...' : ''}"`);
              log(`  Value length: ${stringValue.length} chars`);
            } else {
              log(`  Value: No readable value`);
            }
          }
        } catch (readErr) {
          log(`  Error reading: ${readErr.message}`);
        }
      }
      log("=== END DEBUG ===");
    } catch (err) {
      log("Debug error:", err);
    }
  };

  // ============ Special debug for acceleration ============ //
  const debugAccelerationCharacteristic = async (device: Device) => {
    try {
      log("=== DEBUGGING ACCELERATION CHARACTERISTIC ===");

      // Check if characteristic exists
      const service = await device.getService(SERVICE_UUID);
      const characteristics = await service.characteristics();

      const accelChar = characteristics.find(c => c.uuid === CHAR_ACCEL);
      if (!accelChar) {
        log("CHAR_ACCEL not found in service!");
        return;
      }

      log(`CHAR_ACCEL found. UUID: ${accelChar.uuid}`);
      log(`Properties:`);
      log(`  - isReadable: ${accelChar.isReadable}`);
      log(`  - isNotifiable: ${accelChar.isNotifiable}`);
      log(`  - isWritableWithResponse: ${accelChar.isWritableWithResponse}`);
      log(`  - isWritableWithoutResponse: ${accelChar.isWritableWithoutResponse}`);

      // Try to read current value
      if (accelChar.isReadable) {
        try {
          log("Attempting to read ACCEL value...");
          const value = await accelChar.read();
          if (value?.value) {
            const stringValue = Buffer.from(value.value, 'base64').toString('utf8');
            log(`Current ACCEL value: "${stringValue}"`);
            log(`Value length: ${stringValue.length} chars`);

            // Try to parse it
            try {
              const parsed = JSON.parse(stringValue);
              log(`Successfully parsed JSON:`, parsed);
            } catch (parseErr) {
              log(`Failed to parse JSON: ${parseErr.message}`);
            }
          } else {
            log("No current ACCEL value (empty)");
          }
        } catch (readErr) {
          log("Error reading ACCEL:", readErr.message);
        }
      } else {
        log("ACCEL characteristic is not readable");
      }

      log("=== END ACCEL DEBUG ===");
    } catch (err) {
      log("Debug error:", err);
    }
  };

  // ============ CONNECT ============ //
  const connectToDevice = async (id: string) => {
    try {
      setConnecting(true);
      setError(null);

      // Stop any ongoing scan
      try {
        manager.stopDeviceScan();
      } catch (e) {
        log("Error stopping scan:", e);
      }

      log("Connecting to:", id);

      const device = await manager.connectToDevice(id, { timeout: 10000 });
      await device.discoverAllServicesAndCharacteristics();

      lastDeviceRef.current = device;
      setDeviceName(device.name);
      setConnected(true);

      log("Connected:", device.name);

      // Clear old monitors
      monitorSubscriptionsRef.current.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          log("Error cleaning up old monitor:", e);
        }
      });
      monitorSubscriptionsRef.current = [];

      // Reset zero readings counter
      zeroReadingsRef.current.heartRateZeros = 0;
      zeroReadingsRef.current.spo2Zeros = 0;
      zeroReadingsRef.current.lastUpdateTime = Date.now();

      // Reset disconnecting flag
      isDisconnectingRef.current = false;

      // Run debug to see what characteristics are available
      setTimeout(() => {
        debugCharacteristics(device);
      }, 500);

      // ===== HANDLER FOR CHARACTERISTIC DATA =====
      const handleCharacteristicData = (c: Characteristic | null, uuid: string) => {
        if (!c?.value) return;

        const raw = Buffer.from(c.value, "base64").toString("utf8").trim();
        log(`Data from ${uuid}: "${raw}"`);

        // Handle acceleration characteristic
        if (uuid === CHAR_ACCEL || uuid.includes('400006')) {
          try {
            const accelData = JSON.parse(raw);
            if (accelData.x !== undefined && accelData.y !== undefined && accelData.z !== undefined) {
              const x = parseFloat(accelData.x) || 0;
              const y = parseFloat(accelData.y) || 0;
              const z = parseFloat(accelData.z) || 0;

              log(`Acceleration from monitor: X=${x}, Y=${y}, Z=${z}`);
              mergeNewData({
                acceleration: { x, y, z }
              });
            }
          } catch (err) {
            log(`Not acceleration JSON: ${raw}`);
          }
        }
        // Handle JSON characteristic (contains all data)
        else if (uuid === CHAR_JSON || uuid.includes('400007')) {
          try {
            const jsonData = JSON.parse(raw);
            log(`Full JSON received:`, jsonData);

            // Extract acceleration if present
            let acceleration = sensorDataRef.current.acceleration;
            if (jsonData.acc && typeof jsonData.acc === 'object') {
              acceleration = {
                x: parseFloat(jsonData.acc.x) || 0,
                y: parseFloat(jsonData.acc.y) || 0,
                z: parseFloat(jsonData.acc.z) || 0
              };
              log(`Acceleration from JSON: X=${acceleration.x}, Y=${acceleration.y}, Z=${acceleration.z}`);
            }

            mergeNewData({
              heartRate: Number(jsonData.hr ?? jsonData.heartRate ?? 0),
              spo2: Number(jsonData.spo2 ?? 0),
              bodyTemperature: Number(jsonData.temp ?? jsonData.bodyTemperature ?? jsonData.bodyTemp ?? 0),
              ambientTemperature: Number(jsonData.amb ?? jsonData.ambientTemperature ?? jsonData.ambTemp ?? 0),
              acceleration: acceleration,
              fingerDetected: Boolean(jsonData.finger ?? jsonData.fingerDetected ?? false),
            });
          } catch (err) {
            log(`Failed to parse JSON: ${err}`);
          }
        }
        // Handle individual characteristics (HR, SpO2, Temp)
        else {
          const numValue = Number(raw);
          if (!isNaN(numValue)) {
            if (uuid === CHAR_HR || uuid.includes('400002')) {
              log(`HR from monitor: ${numValue}`);
              mergeNewData({ heartRate: numValue });
            } else if (uuid === CHAR_SPO2 || uuid.includes('400003')) {
              log(`SpO2 from monitor: ${numValue}`);
              mergeNewData({ spo2: numValue });
            } else if (uuid === CHAR_BODYTEMP || uuid.includes('400004')) {
              if (numValue > 0) {
                log(`Body temp from monitor: ${numValue}`);
                mergeNewData({ bodyTemperature: numValue });
              }
            } else if (uuid === CHAR_AMBTEMP || uuid.includes('400005')) {
              log(`Ambient temp from monitor: ${numValue}`);
              mergeNewData({ ambientTemperature: numValue });
            }
          }
        }
      };

      // ===== SET UP MONITORS FOR WORKING CHARACTERISTICS =====
      // HR, SpO2, Temperature monitors are working
      const workingCharacteristics = [
        CHAR_HR,
        CHAR_SPO2,
        CHAR_BODYTEMP,
        CHAR_AMBTEMP
      ];

      for (const charUuid of workingCharacteristics) {
        await monitorChar(device, SERVICE_UUID, charUuid, (c) => {
          handleCharacteristicData(c, charUuid);
        });
      }

      // ===== TRY MONITOR FOR JSON CHARACTERISTIC =====
      // This might contain acceleration data
      await monitorChar(device, SERVICE_UUID, CHAR_JSON, (c) => {
        handleCharacteristicData(c, CHAR_JSON);
      });

      // ===== TRY MONITOR FOR ACCELERATION CHARACTERISTIC =====
      // This might not work, but we'll try anyway
      await monitorChar(device, SERVICE_UUID, CHAR_ACCEL, (c) => {
        handleCharacteristicData(c, CHAR_ACCEL);
      });

      // ===== POLLING FOR ACCELERATION =====
      // Since ACCEL monitor might not work reliably, we poll it
      const pollAcceleration = async () => {
        try {
          // Check if we're disconnecting
          if (isDisconnectingRef.current) return;

          const accelChar = await device.readCharacteristicForService(
            SERVICE_UUID,
            CHAR_ACCEL
          );

          if (accelChar?.value) {
            const value = Buffer.from(accelChar.value, 'base64').toString('utf8').trim();

            try {
              const accelData = JSON.parse(value);
              if (accelData.x !== undefined && accelData.y !== undefined && accelData.z !== undefined) {
                const x = parseFloat(accelData.x) || 0;
                const y = parseFloat(accelData.y) || 0;
                const z = parseFloat(accelData.z) || 0;

                log(`Polled Acceleration: X=${x.toFixed(2)}, Y=${y.toFixed(2)}, Z=${z.toFixed(2)}`);

                // Calculate magnitude for activity detection
                const magnitude = Math.sqrt(x*x + y*y + z*z);
                log(`Acceleration magnitude: ${magnitude.toFixed(2)}g`);

                // Log activity level based on magnitude
                if (magnitude > 1.5) {
                  log(`HIGH ACTIVITY DETECTED: ${magnitude.toFixed(2)}g`);
                } else if (magnitude > 1.0) {
                  log(`MEDIUM ACTIVITY DETECTED: ${magnitude.toFixed(2)}g`);
                } else if (magnitude > 0.5) {
                  log(`LOW ACTIVITY DETECTED: ${magnitude.toFixed(2)}g`);
                }

                mergeNewData({
                  acceleration: { x, y, z }
                });
              }
            } catch (parseErr) {
              log(`Not acceleration JSON: "${value}"`);
            }
          }
        } catch (err) {
          // Silently ignore polling errors
        }
      };

      // Poll acceleration every 1 second
      const pollInterval = setInterval(pollAcceleration, 1000);
      monitorSubscriptionsRef.current.push(() => {
        clearInterval(pollInterval);
        log("Cleared acceleration polling interval");
      });

      // ===== POLL JSON CHARACTERISTIC FOR ACCELERATION =====
      // As a backup, also check JSON characteristic
      const pollJsonForAcceleration = async () => {
        try {
          // Check if we're disconnecting
          if (isDisconnectingRef.current) return;

          const jsonChar = await device.readCharacteristicForService(
            SERVICE_UUID,
            CHAR_JSON
          );

          if (jsonChar?.value) {
            const value = Buffer.from(jsonChar.value, 'base64').toString('utf8').trim();

            try {
              const jsonData = JSON.parse(value);
              if (jsonData.acc && typeof jsonData.acc === 'object') {
                const x = parseFloat(jsonData.acc.x) || 0;
                const y = parseFloat(jsonData.acc.y) || 0;
                const z = parseFloat(jsonData.acc.z) || 0;

                log(`Acceleration from JSON poll: X=${x}, Y=${y}, Z=${z}`);

                // Only update acceleration, keep other values
                mergeNewData({
                  acceleration: { x, y, z }
                });
              }
            } catch (parseErr) {
              // Not JSON, ignore
            }
          }
        } catch (err) {
          // Ignore polling errors
        }
      };

      // Poll JSON every 2 seconds
      const jsonPollInterval = setInterval(pollJsonForAcceleration, 2000);
      monitorSubscriptionsRef.current.push(() => {
        clearInterval(jsonPollInterval);
        log("Cleared JSON polling interval");
      });

      // Auto-reset finger detection after 5 seconds of no data
      const fingerResetInterval = setInterval(() => {
        const timeSinceLastUpdate = Date.now() - zeroReadingsRef.current.lastUpdateTime;
        if (timeSinceLastUpdate > 5000) {
          log("No data for 5 seconds, resetting finger detection");
          zeroReadingsRef.current.heartRateZeros = zeroReadingsRef.current.maxZeroReadings;
          zeroReadingsRef.current.spo2Zeros = zeroReadingsRef.current.maxZeroReadings;
          mergeNewData({});
        }
      }, 1000);

      monitorSubscriptionsRef.current.push(() => {
        clearInterval(fingerResetInterval);
        log("Cleared finger reset interval");
      });

      log("All BLE monitors and polling started successfully!");

    } catch (err: any) {
      log("Connect error:", err.message);
      setError(`Connection failed: ${err.message}`);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  // ============ SAFE DISCONNECT FUNCTION ============ //
  const disconnect = async () => {
    // Prevent multiple simultaneous disconnect calls
    if (isDisconnectingRef.current) {
      log("Disconnect already in progress");
      return;
    }

    isDisconnectingRef.current = true;

    try {
      log("Starting disconnect process...");

      // 1. Clear all subscriptions and intervals FIRST
      log(`Clearing ${monitorSubscriptionsRef.current.length} subscriptions...`);
      monitorSubscriptionsRef.current.forEach((cleanupFn, index) => {
        try {
          if (cleanupFn) {
            cleanupFn();
            log(`Cleared subscription ${index + 1}`);
          }
        } catch (e) {
          log(`Error clearing subscription ${index + 1}:`, e);
        }
      });
      monitorSubscriptionsRef.current = [];

      // 2. Stop any ongoing BLE scan
      try {
        log("Stopping BLE scan...");
        manager.stopDeviceScan();
        log("BLE scan stopped");
      } catch (e) {
        log("Error stopping BLE scan:", e);
      }

      // 3. Disconnect from device (if connected)
      const deviceToDisconnect = lastDeviceRef.current;
      if (deviceToDisconnect && deviceToDisconnect.id) {
        try {
          log(`Disconnecting from device: ${deviceToDisconnect.id}...`);
          await manager.cancelDeviceConnection(deviceToDisconnect.id);
          log("Device connection cancelled successfully");
        } catch (err: any) {
          // Don't throw error - just log it
          log("Error cancelling device connection:", err?.message || err);
        }
      } else {
        log("No device to disconnect from");
      }

    } catch (err: any) {
      log("Unexpected error during disconnect:", err?.message || err);
    } finally {
      // 4. ALWAYS reset state, even if errors occurred
      log("Resetting state...");

      // Update React state
      setConnected(false);
      setConnecting(false);
      setScanning(false);
      setDeviceName(null);
      setError(null);

      // Clear refs
      lastDeviceRef.current = null;

      // Reset sensor data to defaults
      sensorDataRef.current = {
        heartRate: 0,
        spo2: 0,
        bodyTemperature: 0,
        ambientTemperature: 0,
        acceleration: { x: 0, y: 0, z: 0 },
        fingerDetected: false,
        timestamp: Date.now()
      };

      // Reset zero readings
      zeroReadingsRef.current = {
        heartRateZeros: 0,
        spo2Zeros: 0,
        maxZeroReadings: 3,
        lastUpdateTime: Date.now()
      };

      log("Disconnect process completed");

      // Reset disconnecting flag after a short delay
      setTimeout(() => {
        isDisconnectingRef.current = false;
      }, 100);
    }
  };

  // ============ Cleanup on component unmount ============ //
  useEffect(() => {
    return () => {
      log("Component unmounting, cleaning up BLE resources...");

      // Use a local function to avoid calling the hook's disconnect
      // which might update React state after unmount
      const cleanup = async () => {
        // Clear subscriptions
        monitorSubscriptionsRef.current.forEach((cleanupFn) => {
          try {
            if (cleanupFn) cleanupFn();
          } catch (e) {
            // Ignore errors during cleanup
          }
        });
        monitorSubscriptionsRef.current = [];

        // Stop scanning
        try {
          manager.stopDeviceScan();
        } catch (e) {
          // Ignore errors
        }

        // Disconnect from device if connected
        if (lastDeviceRef.current && lastDeviceRef.current.id) {
          try {
            await manager.cancelDeviceConnection(lastDeviceRef.current.id);
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      };

      cleanup();
    };
  }, []);

  return {
    devices,
    scanning,
    connecting,
    connected,
    deviceName,
    error,
    scanForDevices,
    connectToDevice,
    disconnect,
    currentData: sensorDataRef.current,
    debugCharacteristics: () => {
      if (lastDeviceRef.current) {
        debugCharacteristics(lastDeviceRef.current);
      }
    },
    debugAcceleration: () => {
      if (lastDeviceRef.current) {
        debugAccelerationCharacteristic(lastDeviceRef.current);
      }
    }
  };
}

export default useESP32BLE;
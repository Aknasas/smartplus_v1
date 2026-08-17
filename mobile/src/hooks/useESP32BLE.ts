// hooks/useESP32BLE.ts - Improved with better error handling and stability
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

// Create manager instance once
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
  const isDisconnectingRef = useRef(false);
  const isMountedRef = useRef(true);
  const pollIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Clear all intervals
  const clearAllIntervals = () => {
    pollIntervalsRef.current.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (e) {
        // Ignore
      }
    });
    pollIntervalsRef.current = [];

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = undefined;
    }
  };

  // Clear all monitor subscriptions
  const clearAllSubscriptions = () => {
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
  };

  // ===== MERGE incoming partial readings ===== //
  function mergeNewData(partial: Partial<ESP32SensorData>) {
    if (!isMountedRef.current) return;

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

    // Call onData callback
    try {
      onData(sensorDataRef.current);
    } catch (callbackError) {
      log("Error in onData callback:", callbackError);
    }
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
    if (!isMountedRef.current) return;

    try {
      log(`Starting monitor for ${charUuid}`);

      const subscription = device.monitorCharacteristicForService(
        serviceUuid,
        charUuid,
        (error, characteristic) => {
          if (error) {
            // Don't log disconnection errors during normal operation
            if (!error.message.includes('disconnected')) {
              log(`Monitor error for ${charUuid}:`, error.message);
            }
            return;
          }
          if (isMountedRef.current) {
            log(`Data received from ${charUuid}`);
            handler(characteristic);
          }
        }
      );

      // Store cleanup function
      monitorSubscriptionsRef.current.push(() => {
        try {
          subscription.remove();
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
    if (scanning || !isMountedRef.current) return;

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

    try {
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          log("Scan error:", error);
          if (isMountedRef.current) {
            setError(error.message);
          }
          return;
        }

        if (device?.name?.includes("SmartPlus_ESP32") && isMountedRef.current) {
          log(`Found: ${device.name} (${device.id})`);
          setDevices((prev) =>
            prev.some((d) => d.id === device.id)
              ? prev
              : [...prev, { id: device.id, name: device.name }]
          );
        }
      });
    } catch (scanError) {
      log("Failed to start scan:", scanError);
      if (isMountedRef.current) {
        setError("Failed to start scan");
      }
    }

    // Auto-stop scan after timeout
    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        try {
          manager.stopDeviceScan();
        } catch (e) {
          // Ignore
        }
        setScanning(false);
        log("Scan stopped");
      }
    }, 8000);

    pollIntervalsRef.current.push(timeout as unknown as NodeJS.Timeout);
  };

  // ============ Debug function to check characteristic values ============ //
  const debugCharacteristics = async (device: Device) => {
    if (!device || !isMountedRef.current) return;

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

  // ============ CONNECT ============ //
  const connectToDevice = async (id: string) => {
    if (!isMountedRef.current || connecting || isDisconnectingRef.current) return;

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

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && connecting) {
          setError("Connection timeout");
          setConnecting(false);
        }
      }, 15000);

      const device = await manager.connectToDevice(id, {
        timeout: 10000,
        requestMTU: 512 // Request larger MTU for better performance
      });

      await device.discoverAllServicesAndCharacteristics();

      // Clear connection timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = undefined;
      }

      if (!isMountedRef.current) {
        await device.cancelConnection();
        return;
      }

      lastDeviceRef.current = device;
      setDeviceName(device.name);
      setConnected(true);
      setConnecting(false);

      log("Connected:", device.name);

      // Clear old monitors and intervals
      clearAllSubscriptions();
      clearAllIntervals();

      // Reset zero readings counter
      zeroReadingsRef.current = {
        heartRateZeros: 0,
        spo2Zeros: 0,
        maxZeroReadings: 3,
        lastUpdateTime: Date.now()
      };

      // Reset disconnecting flag
      isDisconnectingRef.current = false;

      // ===== HANDLER FOR CHARACTERISTIC DATA =====
      const handleCharacteristicData = (c: Characteristic | null, uuid: string) => {
        if (!c?.value || !isMountedRef.current) return;

        try {
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

                mergeNewData({
                  acceleration: { x, y, z }
                });
              }
            } catch (err) {
              // Not JSON, ignore
            }
          }
          // Handle JSON characteristic (contains all data)
          else if (uuid === CHAR_JSON || uuid.includes('400007')) {
            try {
              const jsonData = JSON.parse(raw);

              let acceleration = sensorDataRef.current.acceleration;
              if (jsonData.acc && typeof jsonData.acc === 'object') {
                acceleration = {
                  x: parseFloat(jsonData.acc.x) || 0,
                  y: parseFloat(jsonData.acc.y) || 0,
                  z: parseFloat(jsonData.acc.z) || 0
                };
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
          // Handle individual characteristics
          else {
            const numValue = Number(raw);
            if (!isNaN(numValue)) {
              if (uuid === CHAR_HR || uuid.includes('400002')) {
                mergeNewData({ heartRate: numValue });
              } else if (uuid === CHAR_SPO2 || uuid.includes('400003')) {
                mergeNewData({ spo2: numValue });
              } else if (uuid === CHAR_BODYTEMP || uuid.includes('400004')) {
                if (numValue > 0) {
                  mergeNewData({ bodyTemperature: numValue });
                }
              } else if (uuid === CHAR_AMBTEMP || uuid.includes('400005')) {
                mergeNewData({ ambientTemperature: numValue });
              }
            }
          }
        } catch (handlerError) {
          log("Error in characteristic handler:", handlerError);
        }
      };

      // ===== SET UP MONITORS =====
      const workingCharacteristics = [
        CHAR_HR,
        CHAR_SPO2,
        CHAR_BODYTEMP,
        CHAR_AMBTEMP,
        CHAR_JSON,
        CHAR_ACCEL
      ];

      for (const charUuid of workingCharacteristics) {
        if (isMountedRef.current) {
          await monitorChar(device, SERVICE_UUID, charUuid, (c) => {
            handleCharacteristicData(c, charUuid);
          });
        }
      }

      // ===== POLLING FOR ADDITIONAL DATA =====
      // Poll acceleration as backup
      const pollAcceleration = async () => {
        if (!isMountedRef.current || isDisconnectingRef.current || !lastDeviceRef.current) return;

        try {
          const isConnected = await lastDeviceRef.current.isConnected();
          if (!isConnected) return;

          const accelChar = await lastDeviceRef.current.readCharacteristicForService(
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

                mergeNewData({
                  acceleration: { x, y, z }
                });
              }
            } catch (parseErr) {
              // Ignore parse errors
            }
          }
        } catch (err) {
          // Silently ignore polling errors
        }
      };

      const pollInterval = setInterval(pollAcceleration, 1000);
      pollIntervalsRef.current.push(pollInterval);

      // Auto-reset finger detection after 5 seconds of no data
      const fingerResetInterval = setInterval(() => {
        if (!isMountedRef.current) return;

        const timeSinceLastUpdate = Date.now() - zeroReadingsRef.current.lastUpdateTime;
        if (timeSinceLastUpdate > 5000) {
          log("No data for 5 seconds, resetting finger detection");
          zeroReadingsRef.current.heartRateZeros = zeroReadingsRef.current.maxZeroReadings;
          zeroReadingsRef.current.spo2Zeros = zeroReadingsRef.current.maxZeroReadings;
          mergeNewData({});
        }
      }, 1000);

      pollIntervalsRef.current.push(fingerResetInterval);

      log("All BLE monitors and polling started successfully!");

    } catch (err: any) {
      log("Connect error:", err.message);
      if (isMountedRef.current) {
        setError(`Connection failed: ${err.message}`);
        setConnected(false);
        setConnecting(false);
      }

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = undefined;
      }
    }
  };

  // ============ SAFE DISCONNECT FUNCTION ============ //
  const disconnect = async () => {
    if (isDisconnectingRef.current) {
      log("Disconnect already in progress");
      return;
    }

    isDisconnectingRef.current = true;
    const deviceToDisconnect = lastDeviceRef.current;
    lastDeviceRef.current = null;

    try {
      log("Starting disconnect process...");

      // 1. Clear all intervals FIRST
      clearAllIntervals();

      // 2. Clear all subscriptions
      clearAllSubscriptions();

      // 3. Stop any ongoing BLE scan
      try {
        log("Stopping BLE scan...");
        manager.stopDeviceScan();
      } catch (e) {
        log("Error stopping BLE scan:", e);
      }

      // 4. Disconnect from device
      if (deviceToDisconnect && deviceToDisconnect.id) {
        try {
          log(`Disconnecting from device: ${deviceToDisconnect.id}...`);
          await manager.cancelDeviceConnection(deviceToDisconnect.id);
          log("Device connection cancelled successfully");
        } catch (err: any) {
          log("Error cancelling device connection:", err?.message || err);
        }
      }

    } catch (err: any) {
      log("Unexpected error during disconnect:", err?.message || err);
    } finally {
      // 5. Reset state if still mounted
      if (isMountedRef.current) {
        setConnected(false);
        setConnecting(false);
        setScanning(false);
        setDeviceName(null);
        setError(null);
      }

      // Reset sensor data
      sensorDataRef.current = {
        heartRate: 0,
        spo2: 0,
        bodyTemperature: 0,
        ambientTemperature: 0,
        acceleration: { x: 0, y: 0, z: 0 },
        fingerDetected: false,
        timestamp: Date.now()
      };

      zeroReadingsRef.current = {
        heartRateZeros: 0,
        spo2Zeros: 0,
        maxZeroReadings: 3,
        lastUpdateTime: Date.now()
      };

      log("Disconnect process completed");

      setTimeout(() => {
        isDisconnectingRef.current = false;
      }, 100);
    }
  };

  // ============ Cleanup on component unmount ============ //
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      log("Component unmounting, cleaning up BLE resources...");
      isMountedRef.current = false;

      // Clear all intervals
      clearAllIntervals();

      // Clear all subscriptions
      clearAllSubscriptions();

      // Stop scanning
      try {
        manager.stopDeviceScan();
      } catch (e) {
        // Ignore
      }

      // Disconnect from device
      if (lastDeviceRef.current && lastDeviceRef.current.id) {
        manager.cancelDeviceConnection(lastDeviceRef.current.id).catch(() => {
          // Ignore errors during cleanup
        });
      }
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
      if (lastDeviceRef.current && isMountedRef.current) {
        debugCharacteristics(lastDeviceRef.current);
      }
    }
  };
}

export default useESP32BLE;
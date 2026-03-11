import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, PermissionsAndroid, Platform } from "react-native";
import { bleManager } from "./BleManager";

export default function DeviceScanner() {
  const [devices, setDevices] = useState([]);

  async function requestPermissions() {
    if (Platform.OS === "android") {
      const apiLevel = parseInt(Platform.Version, 10);

      if (apiLevel >= 31) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
        ]);
      } else {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
      }
    }
  }

function startScan() {
  console.log("🟡 Requesting scan...");
  bleManager.stopDeviceScan();
  setDevices([]);

  bleManager.startDeviceScan(null, { scanMode: 2 }, (error, device) => {
    if (error) {
      console.log("❌ Scan error:", error);
      return;
    }

    // Log everything to confirm scan is running
    console.log("📡 Device found:", device?.name, device?.id);

    if (device?.name === "SmartPlus_ESP32") {
      console.log("🎉 ESP32 FOUND:", device);
      setDevices(prev => [...prev, device]);
      bleManager.stopDeviceScan();
    }
  });
}

  useEffect(() => {
    requestPermissions().then(() => {
      startScan();
    });

    return () => bleManager.stopDeviceScan();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Scanning BLE devices…</Text>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ paddingVertical: 5 }}>
            {item.name || "Unnamed"} ({item.id})
          </Text>
        )}
      />

      <Button title="Rescan" onPress={startScan} />
    </View>
  );
}

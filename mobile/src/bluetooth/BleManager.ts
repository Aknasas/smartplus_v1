import { BleManager } from "react-native-ble-plx";

export const bleManager = new BleManager({
  restoreStateIdentifier: "bleManagerState",
  restoreStateFunction: (state) => {
    console.log("BLE state restored", state);
  }
});

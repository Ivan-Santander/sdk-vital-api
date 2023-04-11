/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  useColorScheme,
  View,
  PermissionsAndroid
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import { VitalCore } from "@tryvital/vital-core-react-native";
import { HealthConfig, VitalHealth, VitalHealthEvents, VitalHealthReactNativeModule, VitalResource } from '@tryvital/vital-health-react-native';
import { VitalClient } from '@tryvital/vital-node';
import { VITAL_API_KEY, VITAL_ENVIRONMENT, VITAL_REGION, VITAL_USER_ID } from './Environment';
import { Brand, Cancellable, DeviceKind, DeviceModel, VitalDevicesManager } from '@tryvital/vital-devices-react-native';
import { check, request,PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const { VitalDevicesReactNative } = NativeModules;

export const vitalNodeClient = new VitalClient({
  environment: VITAL_ENVIRONMENT,
  api_key: VITAL_API_KEY,
  region: VITAL_REGION,
});

VitalHealth.configureClient(
  VITAL_API_KEY,
  VITAL_ENVIRONMENT,
  VITAL_REGION,
  true,
).then(() => {
  VitalHealth.configure(new HealthConfig()).then(() => {
    VitalHealth.setUserId(VITAL_USER_ID)
      .then(() => {
        VitalHealth.askForResources([VitalResource.Steps])
          .then(() => {
            VitalHealth.syncData([VitalResource.Steps])
              .then(() => {
                console.log('VitalHealth synced data');
              })
              .catch((error: any) => {
                console.error(error);
              });
          })
          .catch((error: any) => {
            console.error(error);
          });
      })
      .catch((error: any) => {
        console.error(error);
      });
  });
});

const healthEventEmitter = new NativeEventEmitter(VitalHealthReactNativeModule);

healthEventEmitter.addListener(VitalHealthEvents.statusEvent, (event: any) => {
  console.log("addListener",VitalHealthEvents);
  // console.log("VitalHealthEvents.statusEvent",VitalHealthEvents.statusEvent);
  // console.log("event", event);
  // console.log("addListener_VitalHealthEvents.statusEvent, event",VitalHealthEvents.statusEvent, event);
});

const vitalDevicesManager = new VitalDevicesManager((module) => new NativeEventEmitter(module));

let bleSimulator: DeviceModel = {
  id: (Platform.OS == "ios" ? '$vital_ble_simulator$' : '_vital_ble_simulator_'),
  name: 'Vital BLE Simulator',
  brand: Brand.AccuChek,
  kind: DeviceKind.GlucoseMeter,
};

// async function requestBluetoothScanPermission() {
//   try {
//     if (Platform.OS == 'android') {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('ACCESS_COARSE_LOCATION',PermissionsAndroid.RESULTS.GRANTED);
//       } else {
//         console.log('ACCESS_COARSE_LOCATION false');
//       }
//     } else {
//       console.log('Dispositivo != android');
//     }
//   } catch (error) {
//     console.error('Error al solicitar permiso ACCESS_COARSE_LOCATION', error);
//   }
// }



// async function requestBluetoothScanPermission() {
//   try {
//     const result = await check(
//       Platform.OS === 'android'
//         ? PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION
//         : PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
//     );
//     if (result === RESULTS.GRANTED) {
//       console.log('Permiso ACCESS_COARSE_LOCATION otorgado');
//     }else if(result == 'denied'){
//       const result = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
//       if (result === RESULTS.GRANTED) {
//         console.log('Permiso ACCESS_COARSE_LOCATION otorgado');
//       }else{
//         console.log('Permiso ACCESS_COARSE_LOCATION NOO otorgado result->', result);
//       }
//     }
//   } catch (error) {
//     console.error('Error al solicitar permiso ACCESS_COARSE_LOCATION', error);
//   }
// }


const bluetoothPermission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION : PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL;

check(bluetoothPermission)
  .then((result) => {
    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('Permiso no disponible en este dispositivo');
        break;
      case RESULTS.DENIED:
        console.log('Permiso denegado, solicitando permiso...');
        requestPermission();
        break;
      case RESULTS.GRANTED:
        console.log('Permiso concedido 11');
        break;
      case RESULTS.BLOCKED:
        console.log('El permiso ha sido bloqueado, deberías habilitarlo manualmente');
        break;
    }
  })
  .catch((error) => console.log(error));


  const requestPermission = () => {
    request(bluetoothPermission)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('Permiso no disponible en este dispositivo');
            break;
          case RESULTS.DENIED:
            console.log('Permiso denegado');
            break;
          case RESULTS.GRANTED:
            console.log('Permiso concedido 22');
            break;
          case RESULTS.BLOCKED:
            console.log('El permiso ha sido bloqueado, deberías habilitarlo manualmente');
            break;
          default:
            console.log('Permiso default', result);

        }
      })
      .catch((error) => console.log(error));
  };
  

requestMultiple([
  PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
]).then(statuses => {
  console.log("statuses",statuses);
  if (
      statuses[PERMISSIONS.ANDROID.BLUETOOTH_SCAN ] === 'granted'
  ) {
    console.log("@@@ Start1 scanning for device type: " + bleSimulator.name)

    var scanner: Cancellable | null
    scanner = vitalDevicesManager.scanForDevice(
      bleSimulator,
      {
        onDiscovered: (device) => {
          console.log("@@@2 Discovered device: " + device.name + " (id = " + device.id + ")")
          scanner?.cancel()

          console.log("@@@3 Start pairing device: " + device.name + " (id = " + device.id + ")")
          vitalDevicesManager.pairDevice(device.id)
            .then(() => {
              console.log("@@@4 Successfully paired device: " + device.name + " (id = " + device.id + ")")
              console.log("@@@5 Start reading from device: " + device.name + " (id = " + device.id + ")")

              return vitalDevicesManager.readGlucoseMeter(device.id)
            })
            .then((samples) => {
              console.log("@@@6 Read " + samples.length + " samples from device: " + device.name + " (id = " + device.id + ")")
              console.log(samples)
            })
            .catch((error) => console.log('1',error))
        },
        onError: (error) => console.log('2',error)
      }
    )
  }
});

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [isVitalReady, setIsVitalReady] = useState(false);

  // useEffect(() => {
  //   requestBluetoothPermission();
  //   console.log('useEffect')
  // }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text>Hola mundo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


export default App;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import { VitalCore } from "@tryvital/vital-core-react-native";
import { HealthConfig, VitalHealth, VitalHealthEvents, VitalHealthReactNativeModule, VitalResource } from '@tryvital/vital-health-react-native';
import { VitalClient } from '@tryvital/vital-node';
import {VITAL_API_KEY, VITAL_ENVIRONMENT, VITAL_REGION, VITAL_USER_ID} from './Environment';
import { Brand, Cancellable, DeviceKind, DeviceModel, VitalDevicesManager } from '@tryvital/vital-devices-react-native';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';

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
  console.log('VitalHealth configured client');
  VitalHealth.configure(new HealthConfig()).then(() => {
    console.log('VitalHealth configured');
    VitalHealth.setUserId(VITAL_USER_ID)
      .then(() => {
        console.log('VitalHealth setUserId');
        VitalHealth.askForResources([VitalResource.Steps])
          .then(() => {
            console.log('VitalHealth asked for resources');
            VitalHealth.syncData([VitalResource.Steps])
              .then(() => {
                console.log('VitalHealth synced data');
              })
              .catch((error: any) => {
                console.log(error);
              });
          })
          .catch((error: any) => {
            console.log(error);
          });
      })
      .catch((error: any) => {
        console.log(error);
      });
  });
});

const healthEventEmitter = new NativeEventEmitter(VitalHealthReactNativeModule);

healthEventEmitter.addListener(VitalHealthEvents.statusEvent, (event: any) => {
  console.log(VitalHealthEvents.statusEvent, event);
});

const vitalDevicesManager = new VitalDevicesManager((module) => new NativeEventEmitter(module));

let bleSimulator: DeviceModel = {
  id: (Platform.OS == "ios" ? '$vital_ble_simulator$' : '_vital_ble_simulator_'),
  name: 'Vital BLE Simulator',
  brand: Brand.AccuChek,
  kind: DeviceKind.GlucoseMeter,
};


function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [isVitalReady, setIsVitalReady] = useState(false);

  useEffect(() => {
    console.log('useEffect')
  }, []);

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

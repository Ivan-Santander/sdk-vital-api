/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import { useCallback } from 'react';

import { useVitalLink } from '@tryvital/vital-link';

const API_URL = "https://be4care-vital.herokuapp.com"

// const userKey = '4f60d2b4-e279-46bc-8ed0-81b55255d73c';
const userKey = '8181c51a-529d-4d18-856e-60777264005a';

// export const VITAL_API_KEY = 'sk_us_CBAcPPiwDnporPRIFCZRqKwrHYKU4Rw3Yc4ez6_zDuI';

const getTokenFromBackend = async (userKey: string, env: string) => {
  const resp = await fetch(`${API_URL}/token/${userKey}`);
  const data = await resp.json();
  return data;
  // const resp = await fetch(API_URL)
  // return await resp.json()
}


function App(): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setLoading] = useState(false);
  const [newData, setNewData] = useState([]);
  const [newData2, setNewData2] = useState([]);
  const [nombre, setNombre] = useState("");

  const onSuccess = useCallback(metadata => {
    // Device is now connected.
  }, []);

  const onExit = useCallback(metadata => {
    // User has quit the link flow.
  }, []);

  const onError = useCallback(metadata => {
    // Error encountered in connecting device.
  }, []);

  const config = {
    onSuccess,
    onExit,
    onError,
    env: "sandbox"
  };

  const { open, ready, error } = useVitalLink(config);


  const handleVitalOpen = async () => {
    setLoading(true);
    const token = await getTokenFromBackend(userKey, "sandbox");
    const url = `https://link.tryvital.io/?token=${token.link_token}&origin=http://localhost:3000&env=sandbox&region=us`;
    await Linking.openURL(url);
    setLoading(false);
  };


  const VitalAnalize = async () => {
    setLoading(true);
    const resp = await fetch(`${API_URL}/summary/activity/${userKey}?start_date=2023-04-01T19:48:37.078Z&end_date=2023-04-11T19:48:37.078Z`);
    const data = await resp.json();
      // Organizar datos
    const summary = data.activity;
    const newData = [];
    summary.forEach(item => {
      const newItem = {
        calendar_date: item.calendar_date,
        date: item.calendar_date,
        steps: item.steps,
        distance: item.distance,
        calories_active: item.calories_active,
        calories_total: item.calories_total,
        platform: item.source.name
      };
      newData.push(newItem);
    });

    // Usar los datos organizados
    console.log("newData", newData);
    setNewData(newData);
    setLoading(false);
    setLoading(false);
  };

  const VitalAnalizeData = async () => {
    setLoading(true);
    const resp = await fetch(`${API_URL}/summary/${userKey}?start_date=2023-04-01T19:48:37.078Z&end_date=2023-04-11T19:48:37.078Z`);
    const data = await resp.json();
      // Organizar datos
    const summary = data.activity;
    console.log("summary",summary)
    // const newData2 = [];
    // summary.forEach(item => {
    //   const newItem = {
    //     calendar_date: item.calendar_date,
    //     date: item.calendar_date,
    //     steps: item.steps,
    //     distance: item.distance,
    //     calories_active: item.calories_active,
    //     calories_total: item.calories_total,
    //     platform: item.source.name
    //   };
    //   newData2.push(newItem);
    // });

    // // Usar los datos organizados
    // console.log("newData2", newData2);
    setNewData(newData2);
    setLoading(false);
    setLoading(false);
  };
  // 

  const CreateUserVital = async (nombre) => {
    const resp = await fetch(`${API_URL}/user/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"client_user_id":nombre}),
    });
    console.log("resp", resp);
    if(resp.status === 200){
      setShowModal(false)
      setNombre('')
    }
    const data = await resp.json();
    console.log("data", data);
    return data;
  };
  
      
  useEffect(() => {
    console.log('useEffect')
    // handleVitalOpen();
  }, []);

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
           <Text numberOfLines={1}>{"\n"}</Text>
           <Text style={styles.texto}>Hi Humans</Text>
           <Button title="Crear nuevo usuario" onPress={() => setShowModal(true)} />
           <Text numberOfLines={1}>{"\n"}</Text>
           <Button title="Conectar dispositivo" onPress={handleVitalOpen} />
           <Text numberOfLines={1}>{"\n"}</Text>
           <Button title="Ver datos completos" onPress={VitalAnalizeData} />
           <Text numberOfLines={1}>{"\n"}</Text>
           <Button  title="Ver actividad" onPress={VitalAnalize} />
           <Text numberOfLines={1}>{"\n"}</Text>
           <FlatList
              data={newData}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text>{item.calendar_date}</Text>
                  <Text>{item.calories_active}</Text>
                  <Text>{item.steps}</Text>
                  <Text>{item.platform}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />

            <Modal visible={showModal}>
              <View>
                <Text>Ingrese los datos:</Text>
                <TextInput placeholder="Nombre" onChangeText={text => setNombre(text)} />
                <Button title="Enviar" onPress={() => CreateUserVital(nombre)} />
                <Button title="Cancelar" onPress={() => setShowModal(false)} />
              </View>
            </Modal>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  });

export default App;


import React, { useEffect, useState } from 'react';
import {
  Button,
  Linking,
  Modal,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';


const API_URL = "https://be4care-vital.herokuapp.com"


function App(): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setLoading] = useState(false);
  //Data actividad
  const [dataActivity, setDataActivity] = useState([]);
  //Data completa
  const [dataUsers, setDataUser] = useState([]);
  //Data all users
  const [allUsers, setAllUsers] = useState([]);
  const [nombre, setNombre] = useState("");
  const [userKey, setUserKey]:any = useState('8181c51a-529d-4d18-856e-60777264005a');


  const getTokenFromBackend = async (userKey: string, env: string) => {
    const resp = await fetch(`${API_URL}/token/${userKey}`);
    const data = await resp.json();
    return data;
  }

  const handleVitalOpen = async () => {
    setLoading(true);
    const token = await getTokenFromBackend(userKey, "sandbox");
    const url = `https://link.tryvital.io/?token=${token.link_token}&origin=http://localhost:3000&env=sandbox&region=us`;
    await Linking.openURL(url);
    setLoading(false);
  };

  const viewAllUsers = async () => {
    setLoading(true);
    const resp = await fetch(`${API_URL}/users/`);
    const data = await resp.json();
    console.log("data_viewUsers",data)
    setAllUsers(data)
    console.log('allUsers',allUsers)
    setLoading(false);
  }

  const VitalAnalizeActivity = async () => {
    setLoading(true);
    const resp = await fetch(`${API_URL}/summary/activity/${userKey}?start_date=2023-04-01T19:48:37.078Z&end_date=2023-04-11T19:48:37.078Z`);
    const data = await resp.json();
      // Organizar datos
    const summary = data.activity;
    const newData:any = [];
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
    setDataActivity(newData);
    console.log('dataActivity',dataActivity)
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
    setDataUser(data);
    setLoading(false);
  };
  // 

  const CreateUserVital = async (nombre:any) => {
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
    <SafeAreaView style={{ flex: 1 }}>
      <Text numberOfLines={1}>{"\n"}</Text>
      <Text style={styles.texto}>B4collect v0.0.1</Text>
      <Text numberOfLines={1}>{"\n"}</Text>

      {!userKey ? (
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
          flex: 1,
        }}>
         <Button title="Ver usuarios" onPress={() => viewAllUsers()} />
         <Text numberOfLines={1}>{"\n"}</Text>
         <Button title="Crear nuevo usuario" onPress={() => setShowModal(true)} />
         <Text numberOfLines={1}>{"\n"}</Text>
         <Modal visible={showModal}>
            <View>
              <Text>Ingrese los datos:</Text>
              <TextInput placeholder="Nombre" onChangeText={text => setNombre(text)} />
              <Button title="Enviar" onPress={() => CreateUserVital(nombre)} />
              <Button title="Cancelar" onPress={() => setShowModal(false)} />
            </View>
          </Modal>
      </View>
      ) : (
      <View
        style={{
          backgroundColor: isDarkMode ? Colors.black : Colors.white,
          flex: 1,
        }}>
         <Button title="Cambiar usuario" onPress={() => {
          console.log("userKey",userKey)
          setUserKey(undefined);
          console.log("userKey",userKey)
         }} />
         <Text numberOfLines={1}>{"\n"}</Text>
         <Button title="Conectar dispositivo" onPress={handleVitalOpen} />
         <Text numberOfLines={1}>{"\n"}</Text>
         <Button title="Ver datos completos" onPress={VitalAnalizeData} />
         <Text numberOfLines={1}>{"\n"}</Text>
         <Button title="Ver actividad" onPress={VitalAnalizeActivity} />
         <Text numberOfLines={1}>{"\n"}</Text>
         <SectionList
            sections={[{ data: dataActivity }]}
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
      </View>
      )}

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
  visible: {
    display: 'flex'
  },
  hidden: {
    display: 'none'
  }
  });

export default App;


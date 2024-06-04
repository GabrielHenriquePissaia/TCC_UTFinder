import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import useAuth from '../hooks/useAuth';
import { setDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, timestamp } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const Modal = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [image, setImage] = useState('');
  const [curso, setCurso] = useState(null);
  const [anoFormacao, setAnoFormacao] = useState(null);
  const [campus, setCampus] = useState(null);
  const [location, setLocation] = useState(null);

  const cursoData = [
    { label: 'Engenharia de Software', value: 'Engenharia de Software' },
    { label: 'Engenharia de Computação', value: 'Engenharia de Computação' },
    { label: 'Engenharia Mecânica', value: 'Engenharia Mecânica' },
    { label: 'Engenharia Elétrica', value: 'Engenharia Elétrica' },
    { label: 'Engenharia de Controle e Automação', value: 'Engenharia de Controle e Automação' },
    { label: 'Engenharia Eletrônica', value: 'Engenharia Eletrônica' },
    { label: 'Licenciatura em Matemática', value: 'Licenciatura em Matemática' },
  ];

  const anoFormacaoData = [
    { label: '2017-1', value: '2017-1' },
    { label: '2017-2', value: '2017-2' },
    { label: '2018-1', value: '2018-1' },
    { label: '2018-2', value: '2018-2' },
    { label: '2019-1', value: '2019-1' },
    { label: '2019-2', value: '2019-2' },
    { label: '2020-1', value: '2020-1' },
    { label: '2020-2', value: '2020-2' },
    { label: '2021-1', value: '2021-1' },
    { label: '2021-2', value: '2021-2' },
    { label: '2022-1', value: '2022-1' },
    { label: '2022-2', value: '2022-2' },
    { label: '2023-1', value: '2023-1' },
    { label: '2023-2', value: '2023-2' },
    { label: '2024-1', value: '2024-1' },
    { label: '2024-2', value: '2024-2' },
  ];

  const campusData = [
    { label: 'Curitiba', value: 'Curitiba' },
    { label: 'Cornélio Procópio', value: 'Cornélio Procópio' },
    { label: 'Campo Mourão', value: 'Campo Mourão' },
    { label: 'Medianeira', value: 'Medianeira' },
    { label: 'Pato Branco', value: 'Pato Branco' },
    { label: 'Ponta Grossa', value: 'Ponta Grossa' },
    { label: 'Dois Vizinhos', value: 'Dois Vizinhos' },
    { label: 'Londrina', value: 'Londrina' },
    { label: 'Toledo', value: 'Toledo' },
    { label: 'Apucarana', value: 'Apucarana' },
    { label: 'Francisco Beltrão', value: 'Francisco Beltrão' },
    { label: 'Guarapuava', value: 'Guarapuava' },
    { label: 'Santa Helena', value: 'Santa Helena' }
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      const userData = doc.data();
      if (userData) {
        setImage(userData.photoURL || '');
        setCurso(userData.curso || null);
        setAnoFormacao(userData.anoFormacao || null);
        setCampus(userData.campus || null);
        setLocation(userData.location || null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [user.uid]);

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de localização negada', 'Precisamos de permissão para acessar sua localização');
      return;
    }
  
    let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation({
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    });
    console.log("Localização atual:", currentLocation.coords); // Isso registrará as coordenadas atuais
  };

  const handleNoLocation = () => {
    setLocation(null);
    Alert.alert('Localização não compartilhada', 'Você optou por não compartilhar sua localização.');
  };

  const updateUserProfile = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName,
        photoURL: image,
        curso,
        campus,
        universidade: 'UTFPR',
        anoFormacao,
        location, 
        timestamp,
      }, { merge: true });
      Alert.alert("Perfil atualizado", "Seu perfil foi atualizado com sucesso!");
    } catch (err) {
      Alert.alert("Erro ao atualizar perfil", err.message);
    }
  };

  return (
    <ScrollView style={tw.style("flex-1")} contentContainerStyle={tw.style("items-center pt-1")}>
      <Image style={tw.style("h-20 w-full")} resizeMode="contain" source={require("../assets/Logo.png")} />
      <Text style={tw.style("text-xl text-gray-500 p-5 font-bold")}>Olá {user.displayName}</Text>
      <TextInput placeholder="Coloque o URL de sua foto de perfil" style={tw.style("text-center text-xl pb-2")} keyboardType='url' value={image} onChangeText={setImage} />
      <Text style={tw.style("text-xl text-red-500 p-5 font-bold")}>Seu Curso</Text>
      <Dropdown style={styles.dropdown} data={cursoData} labelField="label" valueField="value" placeholder="Selecione o curso" value={curso} onChange={item => setCurso(item.value)} />
      <Text style={tw.style("text-xl text-red-500 p-5 font-bold")}>Seu Campus</Text>
      <Dropdown
        style={styles.dropdown}
        data={campusData}
        labelField="label"
        valueField="value"
        placeholder="Selecione o campus"
        value={campus}
        onChange={item => setCampus(item.value)}
      />
      <Text style={tw.style("text-xl text-red-500 p-5 font-bold")}>Seu ano de formação</Text>
      <Dropdown style={styles.dropdown} data={anoFormacaoData} labelField="label" valueField="value" placeholder="Selecione o ano" value={anoFormacao} onChange={item => setAnoFormacao(item.value)} />
      <TouchableOpacity
        style={tw.style("w-64 p-3 rounded-xl bg-blue-500", { marginBottom: 20 })}
        onPress={handleGetLocation}
      >
        <Text style={tw.style("text-center text-xl text-white")}>Usar minha localização atual</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={tw.style("w-64 p-3 rounded-xl bg-red-500", { marginBottom: 20 })}
        onPress={handleNoLocation}
      >
        <Text style={tw.style("text-center text-xl text-white")}>Não compartilhar localização</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={!image || !curso || !anoFormacao } style={tw.style("w-64 p-3 rounded-xl bg-gray-400", { marginBottom: 20 })} onPress={updateUserProfile}>
        <Text style={tw.style("text-center text-xl")}>Atualizar Perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    width: '90%',
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  mapStyle: {
    width: '90%',
    height: 300,
    marginBottom: 20,
  }
});

export default Modal;

import React, { useState } from 'react';
import { ScrollView, View, Text, Image, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import useAuth from '../hooks/useAuth';
import { setDoc, doc } from 'firebase/firestore';
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
  const [selectedState, setSelectedState] = useState(null);
  const [location, setLocation] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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

  const estadosBrasileiros = [
  { label: 'Acre', value: { latitude: -9.0238, longitude: -70.8120, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Alagoas', value: { latitude: -9.5713, longitude: -36.7820, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Amapá', value: { latitude: 0.9020, longitude: -52.0030, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Amazonas', value: { latitude: -3.4168, longitude: -65.8561, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Bahia', value: { latitude: -12.5797, longitude: -41.7007, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Ceará', value: { latitude: -5.4984, longitude: -39.3206, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Distrito Federal', value: { latitude: -15.7998, longitude: -47.8645, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Espírito Santo', value: { latitude: -19.1834, longitude: -40.3089, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Goiás', value: { latitude: -15.8270, longitude: -49.8362, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Maranhão', value: { latitude: -4.9609, longitude: -45.2744, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Mato Grosso', value: { latitude: -12.6819, longitude: -56.9211, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Mato Grosso do Sul', value: { latitude: -20.7722, longitude: -54.7852, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Minas Gerais', value: { latitude: -18.5122, longitude: -44.5550, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Pará', value: { latitude: -3.4168, longitude: -52.0364, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Paraíba', value: { latitude: -7.2400, longitude: -36.7820, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Paraná', value: { latitude: -24.4842, longitude: -51.7558, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Pernambuco', value: { latitude: -8.8137, longitude: -36.9541, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Piauí', value: { latitude: -7.7183, longitude: -42.7289, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Rio de Janeiro', value: { latitude: -22.9068, longitude: -43.1729, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Rio Grande do Norte', value: { latitude: -5.4026, longitude: -36.9541, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Rio Grande do Sul', value: { latitude: -30.0346, longitude: -51.2177, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Rondônia', value: { latitude: -10.8853, longitude: -61.9517, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Roraima', value: { latitude: 1.9222, longitude: -61.8567, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Santa Catarina', value: { latitude: -27.2423, longitude: -50.2189, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'São Paulo', value: { latitude: -23.5505, longitude: -46.6333, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Sergipe', value: { latitude: -10.9472, longitude: -37.0731, latitudeDelta: 0.5, longitudeDelta: 0.5 } },
  { label: 'Tocantins', value: { latitude: -10.1753, longitude: -48.2982, latitudeDelta: 0.5, longitudeDelta: 0.5 } }
];

  const handleSelectState = (state) => {
    setSelectedState(state.label);
    setLocation(state.value);
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({
      latitude,
      longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const updateUserProfile = () => {
    setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      displayName: user.displayName,
      photoURL: image,
      curso,
      campus: 'UTFPR',
      anoFormacao,
      location,
      timestamp,
    }).then(() => {
      navigation.navigate("Home");
    }).catch((err) => {
      Alert.alert("Error", err.message);
    });
  };

  return (
    <ScrollView style={tw.style("flex-1")} contentContainerStyle={tw.style("items-center pt-1")}>
      <Image style={tw.style("h-20 w-full")} resizeMode="contain" source={require("../assets/Logo.png")} />
      <Text style={tw.style("text-xl text-gray-500 p-5 font-bold")}>Olá {user.displayName}</Text>
      <TextInput placeholder="Coloque o URL de sua foto de perfil" style={tw.style("text-center text-xl pb-2")} keyboardType='url' value={image} onChangeText={setImage} />
      <Text style={tw.style("text-xl text-red-500 p-5 font-bold")}>Seu Curso</Text>
      <Dropdown style={styles.dropdown} data={cursoData} labelField="label" valueField="value" placeholder="Selecione o curso" value={curso} onChange={item => setCurso(item.value)} />
      <Text style={tw.style("text-xl text-red-500 p-5 font-bold")}>Seu ano de formação</Text>
      <Dropdown style={styles.dropdown} data={anoFormacaoData} labelField="label" valueField="value" placeholder="Selecione o ano" value={anoFormacao} onChange={item => setAnoFormacao(item.value)} />
      <Text style={tw.style("text-xl text-red-500 p-5 font-bold")}>Selecione seu Estado</Text>
      <Dropdown
        style={styles.dropdown}
        data={estadosBrasileiros}
        labelField="label"
        valueField="value"
        placeholder="Selecione o estado"
        value={selectedState}
        onChange={handleSelectState}
      />
      <MapView
        style={styles.mapStyle}
        region={location}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        <Marker coordinate={location} />
      </MapView>
      <TouchableOpacity style={tw.style("w-64 p-3 rounded-xl bg-blue-500")} onPress={() => console.log("Localização final:", location)}>
        <Text style={tw.style("text-center text-xl text-white")}>Capturar Localização</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={!image || !curso || !anoFormacao || !location} style={tw.style("w-64 p-3 rounded-xl bg-gray-400", { marginBottom: 20 })} onPress={updateUserProfile}>
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

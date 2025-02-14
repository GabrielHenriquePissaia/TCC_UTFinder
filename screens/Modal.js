import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import useAuth from '../hooks/useAuth';
import { setDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, timestamp } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';

const Modal = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [image, setImage] = useState('');
  const [curso, setCurso] = useState('');
  const [anoFormacao, setAnoFormacao] = useState(new Date());
  const [campus, setCampus] = useState(null);
  const [location, setLocation] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  //para carregar dados do usuário do Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      const userData = doc.data();
      if (userData) {
        setImage(userData.photoURL || '');
        setCurso(userData.curso || '');
        setAnoFormacao(userData.anoFormacao ? new Date(userData.anoFormacao, 0, 1) : new Date());
        setCampus(userData.campus || null);
        setLocation(userData.location || null);
      }
    });

    return () => unsubscribe();
  }, [user.uid]);

//   Obtém os dados do usuário do Firestore:
// Escuta mudanças no documento users/{user.uid}.
// Atualiza os estados do componente (image, curso, anoFormacao, campus, location).
// Retorno do useEffect:
// Cancela a assinatura (unsubscribe) ao desmontar o componente.

//para obter a localização do usuário
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
    console.log("Localização atual:", currentLocation.coords);

    Alert.alert('Localização não compartilhada', 'Você optou por compartilhar sua localização, Após o botão ok, aperte em Atualizar perfil.');
  };
//   Solicita permissão de acesso à localização:
// Se negada, exibe um alerta e interrompe a função.
// Obtém a localização atual do dispositivo:
// Location.getCurrentPositionAsync(): Obtém coordenadas GPS com alta precisão.
// Atualiza o estado location com latitude e longitude.
// Exibe um alerta informativo para o usuário.

// const handleGetLocation = async () => {
  //   let { status } = await Location.getForegroundPermissionsAsync(); // Obtém status atual
  
  //   if (status === 'granted') {
  //     // Permissão já concedida → Obtém a localização
  //     let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  //     setLocation({
  //       latitude: currentLocation.coords.latitude,
  //       longitude: currentLocation.coords.longitude,
  //       latitudeDelta: 0.005,
  //       longitudeDelta: 0.005
  //     });
  
  //     console.log("Localização atual:", currentLocation.coords);
  //   } else {
  //     // Permissão não concedida → Solicita novamente
  //     let { status: newStatus } = await Location.requestForegroundPermissionsAsync();
  
  //     if (newStatus === 'granted') {
  //       // Permissão concedida após segunda tentativa → Obtém localização
  //       let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  //       setLocation({
  //         latitude: currentLocation.coords.latitude,
  //         longitude: currentLocation.coords.longitude,
  //         latitudeDelta: 0.005,
  //         longitudeDelta: 0.005
  //       });
  
  //       console.log("Localização atual:", currentLocation.coords);
  //     } else {
  //       // Permissão negada novamente → Abre configurações
  //       Alert.alert(
  //         'Permissão negada',
  //         'Você negou o acesso à localização. Para ativar, vá até as configurações do seu dispositivo.',
  //         [
  //           { text: 'Ok', style: 'cancel' },
  //         ]
  //       );
  //     }
  //   }
  // };

  //Função para remover a localização
  const handleNoLocation = () => {
    setLocation(null);
    Alert.alert('Localização não compartilhada', 'Você optou por não compartilhar sua localização, Após o botão ok, aperte em Atualizar perfil.');
  };

  //Função para atualizar o perfil do usuário
  const updateUserProfile = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName,
        photoURL: image,
        curso,
        campus,
        universidade: 'UTFPR',
        anoFormacao: anoFormacao.getFullYear(),
        location, 
        timestamp,
      }, { merge: true });
      Alert.alert("Perfil atualizado", "Seu perfil foi atualizado com sucesso!");
      navigation.goBack(); // Fechar o modal
    } catch (err) {
      Alert.alert("Erro ao atualizar perfil", err.message);
    }
  };

  const isProfileComplete = image && curso && campus && anoFormacao;

  return (
    <ScrollView style={tw.style("flex-1")} contentContainerStyle={tw.style("items-center pt-1")}>
      <Image style={tw.style("h-20 w-full")} resizeMode="contain" source={require("../assets/Logo.png")} />
      <Text style={tw.style("text-xl text-gray-500 p-5 font-bold")}>Olá {user.displayName}</Text>
      <Text style={tw.style("text-xl text-red-500 p-5 font-bold")}>Url de sua foto de perfil</Text>
      <TextInput placeholder="Coloque o URL de sua foto de perfil" style={tw.style("text-center text-xl pb-2")} keyboardType='url' value={image} onChangeText={setImage} />
      <Text style={tw.style("text-xl text-red-500 p-5 font-bold")}>Seu Curso</Text>
      <TextInput placeholder="Digite seu curso" style={tw.style("text-center text-xl pb-2")} value={curso} onChangeText={setCurso} />
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
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={tw.style("text-center text-xl")}>{anoFormacao.getFullYear()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={anoFormacao}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setAnoFormacao(selectedDate);
            }
          }}
        />
      )}
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
      <TouchableOpacity
        disabled={!isProfileComplete}
        style={[
          tw.style("w-64 p-3 rounded-xl", { marginBottom: 20 }),
          isProfileComplete ? tw.style("bg-green-500") : tw.style("bg-gray-400"),
        ]}
        onPress={updateUserProfile}
      >
        <Text style={tw.style("text-center text-xl text-white")}>Atualizar Perfil</Text>
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
  dateButton: {
    width: '90%',
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  mapStyle: {
    width: '90%',
    height: 300,
    marginBottom: 20,
  }
});

export default Modal;

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../hooks/useAuth'; // Importa o hook useAuth
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

const Inicio = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth(); // Utiliza o hook useAuth
  const [currentRequest, setCurrentRequest] = useState(null);

  useEffect(() => {
    if (user) {
      // Aqui você pode implementar uma lógica para carregar informações adicionais se necessário
      const unsubscribe = onSnapshot(collection(db, "friendRequests", user.uid, "requests"), (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (requests.length > 0) {
          setCurrentRequest(requests[0]); // Assume que você só lida com uma por vez
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
      <ImageBackground style={tw.style('flex-1 justify-center items-center bg-yellow-500')}
        resizeMode="cover" source={require("../assets/BackgroundLogin.jpg")}
      >
        <View style={styles.header}>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="chevron-back-outline" size={34} color="#FF5864" />
        </TouchableOpacity>
        <Text style={tw.style('text-2xl font-bold pb-10')}>Bem vindo, {user ? user.displayName : ''}</Text>
        <Text style={tw.style('pb-5 text-lg')}>O que deseja fazer?</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Procurar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.buttonText}>Conversar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Modal')}>
          <Text style={styles.buttonText}>Atualizar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Pedidos')}>
          <Text style={styles.buttonText}>Pedidos de amizade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        </View>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    padding: 15,
    width: 300,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default Inicio;

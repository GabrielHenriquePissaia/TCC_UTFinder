import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import { collection, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Inicio = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth(); // Utilizando o hook useAuth
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
        const userData = doc.data();
        if (userData && userData.photoURL && userData.curso && userData.campus && userData.anoFormacao) {
          setProfileComplete(true);
        } else {
          setProfileComplete(false);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const getButtonStyle = (isEnabled) => {
    return isEnabled ? styles.button : [styles.button, styles.disabledButton];
  };

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={45} color="red" />
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
        </View>
      <ImageBackground style={tw.style('flex-1 justify-center items-center bg-yellow-500')}
        resizeMode="cover" source={require("../assets/BackgroundLogin.jpg")}
      >
        <Text style={tw.style('text-2xl font-bold pb-10')}>Olá {user ? user.displayName : ''}</Text>
        <Text style={tw.style('pb-5 text-lg')}>O que deseja fazer?</Text>
        {!profileComplete && (
          <Text style={styles.warningText}>
            Para usar nosso aplicativo, deve-se atualizar seus dados de cadastro.
          </Text>
        )}
        <TouchableOpacity style={getButtonStyle(profileComplete)} onPress={() => navigation.navigate('Home')} disabled={!profileComplete}>
          <Text style={styles.buttonText}>Procurar Egressos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={getButtonStyle(profileComplete)} onPress={() => navigation.navigate('Location')} disabled={!profileComplete}>
          <Text style={styles.buttonText}>Meu Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={getButtonStyle(profileComplete)} onPress={() => navigation.navigate('Chat')} disabled={!profileComplete}>
          <Text style={styles.buttonText}>Conversar com Amigos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={getButtonStyle(profileComplete)} onPress={() => navigation.navigate('Pedidos')} disabled={!profileComplete}>
          <Text style={styles.buttonText}>Pedidos de amizade</Text>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
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
    color: 'black', 
  },
  disabledButton: {
    opacity: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: 'red',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default Inicio;

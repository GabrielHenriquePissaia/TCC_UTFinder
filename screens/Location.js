import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import useAuth from '../hooks/useAuth';
import MapView, { Marker } from 'react-native-maps';
import tw from 'tailwind-react-native-classnames';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const { user } = useAuth();
  const [location, setLocation] = useState(user.location);
  const navigation = useNavigation()

  useEffect(() => {
    return () => {
      // Unsubscribe from any subscriptions here
    };
  }, []);

  const handleStopSharing = async () => {
    try {
      await setDoc(doc(db, "users", user.uid), { location: null }, { merge: true });
      setLocation(null);
      Alert.alert("Localização", "Você parou de compartilhar sua localização.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível parar de compartilhar a localização: " + error.message);
    }
  };

  const handleStartSharing = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de localização negada', 'Precisamos de permissão para acessar sua localização');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    try {
      await setDoc(doc(db, "users", user.uid), {
        location: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        }
      }, { merge: true });
      setLocation(currentLocation.coords);
      Alert.alert("Localização", "Você começou a compartilhar sua localização.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar a localização: " + error.message);
    }
  };

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Ionicons name="chevron-back-outline" size={34} color="black" />
        </TouchableOpacity>
          <Ionicons name="happy-outline" size={30} color={"#000000"}/>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="search-circle-sharp" size={36} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Pedidos")}>
          <Ionicons name="people" size={30} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Bloqueios")}>
          <Ionicons name="person-remove" size={24} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color={"#000000"}/>
        </TouchableOpacity>
      </View>
      <ImageBackground style={tw.style('flex-1 justify-center items-center bg-yellow-500')}
          resizeMode="cover" source={require("../assets/BackgroundLogin.jpg")}
        >
        <View style={styles.header}>
          <Image
            style={styles.profileImage}
            source={{ uri: user.photoURL || 'https://placehold.it/100x100' }}
          />
          <Text style={styles.headerText}>{user.displayName || 'Não informado'}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Seu curso: {user.curso || 'Não informado'}</Text>
          <Text style={styles.detailsText}>Seu período de formação: {user.anoFormacao || 'Não informado'}</Text>
          <Text style={styles.detailsText}>Sua universidade: {user.universidade || 'Não informado'}</Text>
          <Text style={styles.detailsText}>Seu campus: {user.campus || 'Não informado'}</Text>
          <View style={styles.mapContainer}>
            {location ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={"Sua localização"}
                />
              </MapView>
            ) : (
              <Text style={styles.noLocationText}>Localização não informada</Text>
            )}
          </View>
          {location ? (
            <TouchableOpacity style={styles.buttonolocation} onPress={handleStopSharing}>
              <Text style={styles.buttonText}>Parar de compartilhar localização</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleStartSharing}>
              <Text style={styles.buttonText}>Compartilhar localização</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 20,
  },
  detailsText: {
    fontSize: 18,
    marginBottom: 10,
  },
  mapContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
  },
  map: {
    flex: 1,
  },
  noLocationText: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  buttonolocation: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
});

export default Profile;

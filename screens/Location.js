import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import useAuth from '../hooks/useAuth';
import MapView, { Marker } from 'react-native-maps';
import tw from 'tailwind-react-native-classnames';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import * as Location from 'expo-location';
import updateUserLocation from '../utils/locationUtils';

const LocationScreen = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({});
  const [location, setLocation] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const navigation = useNavigation();
  const mapRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      const userData = doc.data();
      setProfileData(userData || {});
      setLocation(userData?.location || null);
      setIsProfileComplete(userData?.curso && userData?.anoFormacao && userData?.universidade);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (location && mapRef.current && location.latitude !== null && location.longitude !== null) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  }, [location]);

  const handleStopSharingLocation = async () => {
    try {
      await updateUserLocation(user.uid, null);
      setLocation(null);
    } catch (error) {
      console.error("Erro ao atualizar localização:", error);
    }
  };

  const startLocationUpdates = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de localização negada', 'Precisamos de permissão para acessar sua localização');
      return;
    }

    await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 50 },
      (newLocation) => {
        const { coords } = newLocation;
        if (coords && coords.latitude !== null && coords.longitude !== null && location !== null) {
          updateUserLocation(user.uid, coords);
        }
      }
    );
  };

  useEffect(() => {
    if (location && location.latitude !== null && location.longitude !== null) {
      startLocationUpdates();
    }
  }, [location]);

  if (!profileData) {
    return (
      <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100 justify-center items-center")}>
        <Text style={tw.style("text-lg text-gray-500")}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Ionicons name="home" size={34} color="black" />
        </TouchableOpacity>
        <Ionicons name="happy-outline" size={30} color={"#000000"} />
        <TouchableOpacity onPress={() => isProfileComplete && navigation.navigate("Home")} disabled={!isProfileComplete}>
          <Ionicons name="search-circle-sharp" size={36} color={isProfileComplete ? "black" : "gray"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => isProfileComplete && navigation.navigate("Pedidos")} disabled={!isProfileComplete}>
          <Ionicons name="people" size={30} color={isProfileComplete ? "black" : "gray"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => isProfileComplete && navigation.navigate("Bloqueios")} disabled={!isProfileComplete}>
          <Ionicons name="person-remove" size={24} color={isProfileComplete ? "black" : "gray"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => isProfileComplete && navigation.navigate("Chat")} disabled={!isProfileComplete}>
          <Ionicons name="chatbubbles-sharp" size={30} color={isProfileComplete ? "black" : "gray"} />
        </TouchableOpacity>
      </View>
      <ImageBackground style={tw.style('flex-1 justify-center items-center bg-yellow-500')}
        resizeMode="cover" source={require("../assets/BackgroundLogin.jpg")}
      >
        <View style={styles.user}>
          <Image
            style={styles.profileImage}
            source={{ uri: profileData.photoURL || 'https://placehold.it/100x100' }}
          />
          <Text style={styles.headerText}>{profileData.displayName || 'Não informado'}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Seu curso: {profileData.curso || 'Não informado'}</Text>
          <Text style={styles.detailsText}>Seu ano de formação: {profileData.anoFormacao || 'Não informado'}</Text>
          <Text style={styles.detailsText}>Sua universidade: {profileData.universidade || 'Não informado'}</Text>
          <Text style={styles.detailsText}>Seu campus: {profileData.campus || 'Não informado'}</Text>
          <View style={styles.mapContainer}>
            {location && location.latitude !== null && location.longitude !== null ? (
              <MapView
                ref={mapRef}
                style={styles.map}
                region={{
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
          {!isProfileComplete && (
            <Text style={styles.warningText}>
              Para usar nosso aplicativo, deve-se atualizar seus dados de cadastro.
            </Text>
          )}
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Modal')}>
            <Text style={styles.buttonText}>Atualizar Perfil</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  user: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 125,
    height: 125,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  warningText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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

export default LocationScreen;
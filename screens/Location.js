import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import useAuth from '../hooks/useAuth';
import MapView, { Marker } from 'react-native-maps';
import tw from 'tailwind-react-native-classnames';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const { user } = useAuth();

  return (
  <SafeAreaView style={tw.style("flex-1")}>
    <Header title={"Perfil"} />
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
          {user.location ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: user.location.latitude,
                longitude: user.location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: user.location.latitude,
                  longitude: user.location.longitude,
                }}
                title={"Sua localização"}
              />
            </MapView>
          ) : (
            <Text style={styles.noLocationText}>Localização não informada</Text>
          )}
        </View>
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
});

export default Profile;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import useAuth from '../hooks/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LocationScreen = () => {
  const { user } = useAuth();
  const [showMarker, setShowMarker] = useState(true);

  // Coordenadas do Ponto Nemo
  const pontoNemo = {
    latitude: -48.876667,
    longitude: -123.393333,
  };

  // Função para alternar a visibilidade da localização
  const toggleLocation = async (sharing) => {
    const newLocation = sharing ? user.originalLocation : pontoNemo;
    const userRef = doc(db, "users", user.uid);
    // Atualiza a localização no Firestore
    await setDoc(userRef, { location: newLocation }, { merge: true });
    console.log(sharing ? "Voltar a Compartilhar foi clicado." : "Parar de Compartilhar foi clicado.");
    setShowMarker(sharing);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.headerText}>Essa é sua localização atual</Text>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {showMarker && (
          <Marker
            coordinate={{ latitude: user.location.latitude, longitude: user.location.longitude }}
            title="Sua Localização de Cadastro"
            description="Localização registrada no seu perfil"
          />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: showMarker ? 'red' : 'grey' }]}
          disabled={!showMarker}
          onPress={() => toggleLocation(false)}
        >
          <Text style={styles.buttonText}>Parar de Compartilhar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: !showMarker ? 'blue' : 'grey' }]}
          disabled={showMarker}
          onPress={() => toggleLocation(true)}
        >
          <Text style={styles.buttonText}>Voltar a Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#f0f0f0',
    marginTop: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LocationScreen;

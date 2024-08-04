import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';
import { serverTimestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
import updateUserLocation from '../utils/locationUtils';

const Home = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [distanceFilter, setDistanceFilter] = useState(200);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  const haversineDistance = (coords1, coords2) => {
    const R = 6371; // Raio da terra
    const lat1 = coords1.latitude * Math.PI / 180;
    const lat2 = coords2.latitude * Math.PI / 180;
    const deltaLat = (coords2.latitude - coords1.latitude) * Math.PI / 180;
    const deltaLon = (coords2.longitude - coords1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia em km
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      const userData = doc.data();
      if (userData.location && userData.location.latitude !== null && userData.location.longitude !== null) {
        fetchUsers(userData.location);
      } else {
        fetchUsers(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [user.uid, distanceFilter, blockedUsers, blockedByUsers]);

  useEffect(() => {
    if (user) {
      const blockedRef = collection(db, "users", user.uid, "blockedUsers");
      const blockedByRef = collection(db, "users", user.uid, "blockedByUser");

      const unsubscribeBlocked = onSnapshot(blockedRef, (snapshot) => {
        const blocked = snapshot.docs.map(doc => doc.id);
        setBlockedUsers(blocked);
      });

      const unsubscribeBlockedBy = onSnapshot(blockedByRef, (snapshot) => {
        const blockedBy = snapshot.docs.map(doc => doc.id);
        setBlockedByUsers(blockedBy);
      });

      return () => {
        unsubscribeBlocked();
        unsubscribeBlockedBy();
      };
    }
  }, [user]);

  const fetchUsers = async (location) => {
    if (user) {
      const querySnapshot = await getDocs(collection(db, "users"));
      const fetchedUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        distance: doc.data().location && location ? haversineDistance(location, doc.data().location) : null
      }));
  
      let filteredUsers;
      if (distanceFilter <= 500) {
        if (location && location.latitude !== null && location.longitude !== null) {
          filteredUsers = fetchedUsers.filter(u => 
            u.location !== null && 
            u.distance <= distanceFilter && 
            !blockedUsers.includes(u.id) && 
            !blockedByUsers.includes(u.id)
          );
        } else {
          filteredUsers = []; // Usuário sem localização não vê ninguém quando a distância é <= 500
        }
      } else {
        // Mostrar todos os usuários, independente da localização
        filteredUsers = fetchedUsers.filter(u => 
          !blockedUsers.includes(u.id) && 
          !blockedByUsers.includes(u.id)
        );
      }
  
      setUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
    } else {
      console.log("Usuário deslogado ou localização do usuário não informada");
      setUsers([]);
      setFilteredUsers([]);
    }
  };  

  useEffect(() => {
    if (user) {
      const friendsRef = collection(db, "friends", user.uid, "userFriends");
      getDocs(friendsRef).then(snapshot => {
        const friendList = snapshot.docs.map(doc => doc.id).filter(id => !blockedUsers.includes(id) && !blockedByUsers.includes(id));
        setFriends(friendList);
      }).catch(error => {
        console.error("Erro ao buscar amigos:", error);
      });
    }
  }, [user, blockedUsers, blockedByUsers]);

  useEffect(() => {
    const filtered = users.filter(u =>
      (!selectedYear || u.anoFormacao === selectedYear) &&
      (u.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      u.curso.toLowerCase().includes(searchText.toLowerCase()) ||
      u.campus.toLowerCase().includes(searchText.toLowerCase())) &&
      !blockedUsers.includes(u.id) &&
      !blockedByUsers.includes(u.id)
    );
    setFilteredUsers(filtered);
  }, [searchText, selectedYear, users, blockedUsers, blockedByUsers]);

  useEffect(() => {
    let locationSubscription;
  
    const startLocationUpdates = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de localização negada', 'Precisamos de permissão para acessar sua localização');
        return;
      }
  
      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 50 },
        (newLocation) => {
          const { coords } = newLocation;
          if (coords && coords.latitude !== null && coords.longitude !== null && user.location !== null) {
            updateUserLocation(user.uid, coords);
          }
        }
      );
    };
  
    if (user.location && user.location.latitude !== null && user.location.longitude !== null) {
      startLocationUpdates();
    }
  
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [user.location]);

  const handleAddContact = async (targetUserId) => {
    if (friends.includes(targetUserId)) {
      Alert.alert("Erro", "Você já é amigo deste usuário.");
      return;
    }
    try {
      await setDoc(doc(db, "friendRequests", targetUserId, "requests", user.uid), {
        requesterId: user.uid,
        requesterName: user.displayName,
        requesterPhotoURL: user.photoURL,
        status: "pending",
        timestamp: serverTimestamp(),
      });
      Alert.alert("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação de amizade:", error);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedYear(null);
  };

  const yearData = [
    { label: '2009', value: 2009 },
    { label: '2010', value: 2010 },
    { label: '2011', value: 2011 },
    { label: '2012', value: 2012 },
    { label: '2013', value: 2013 },
    { label: '2014', value: 2014 },
    { label: '2015', value: 2015 },
    { label: '2016', value: 2016 },
    { label: '2017', value: 2017 },
    { label: '2018', value: 2018 },
    { label: '2019', value: 2019 },
    { label: '2020', value: 2020 },
    { label: '2021', value: 2021 },
    { label: '2022', value: 2022 },
    { label: '2023', value: 2023 },
    { label: '2024', value: 2024 },
  ];

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Ionicons name="home" size={34} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Location")}>
          <Ionicons name="happy" size={30} color={"#000000"}/>
        </TouchableOpacity>
          <Ionicons name="search-circle-outline" size={36} color="black"/>
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
      <Text style={styles.sectionTitle}>Todos os contatos no raio de {distanceFilter <= 500 ? `${distanceFilter} KM` : 'qualquer distância'}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Slider
          style={{width: 200, height: 40}}
          minimumValue={10}
          maximumValue={501}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          step={10}
          value={distanceFilter}
          onValueChange={setDistanceFilter}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 10 }}>
        <TextInput
          style={[styles.searchInput, { flex: 1, marginRight: 5 }]}
          placeholder="Pesquisar..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <Dropdown
          style={[styles.dropdown, { flex: 1, marginLeft: 5 }]}
          data={yearData}
          labelField="label"
          valueField="value"
          placeholder="Selecione um ano"
          value={selectedYear}
          onChange={item => setSelectedYear(item.value)}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClearFilters}
        >
          <Text style={styles.buttonText}>Limpar Filtros</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredUsers.filter(u => user && u.id !== user.uid && !blockedUsers.includes(u.id) && !blockedByUsers.includes(u.id))}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image style={styles.avatar} source={{ uri: item.photoURL }} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.details}>Curso: {item.curso}</Text>
              <Text style={styles.details}>Ano de Formação: {item.anoFormacao}</Text>
              <Text style={styles.details}>Universidade: {item.universidade}</Text>
              <Text style={styles.details}>Campus: {item.campus}</Text>
              <TouchableOpacity 
                style={[styles.button, friends.includes(item.id) ? styles.buttonDisabled : styles.buttonEnabled]} 
                onPress={() => handleAddContact(item.id)}
                disabled={friends.includes(item.id)}
              >
                <Text style={styles.buttonText}>{friends.includes(item.id) ? 'Amigo' : 'Adicionar contato'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 20,
    color: '#000',
    backgroundColor: 'white'
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 35,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 16,
    color: 'gray',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: 'gray',
  },
  buttonEnabled: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  dropdown: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
  clearButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 5,
  }
});

export default Home;

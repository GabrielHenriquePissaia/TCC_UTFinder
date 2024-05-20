import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Modal } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';
import { serverTimestamp } from 'firebase/firestore';

const Home = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState(200);
  const navigation = useNavigation();
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  const haversineDistance = (coords1, coords2) => {
    const R = 6371; // Radio da terra
    const lat1 = coords1.latitude * Math.PI / 180;
    const lat2 = coords2.latitude * Math.PI / 180;
    const deltaLat = (coords2.latitude - coords1.latitude) * Math.PI / 180;
    const deltaLon = (coords2.longitude - coords1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia em km
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (user && user.location) { // Verifica se user existe e tem uma localização definida
        const querySnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          distance: haversineDistance(user.location, doc.data().location || { latitude: 0, longitude: 0 })
        })).filter(user => user.distance <= distanceFilter);
  
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } else {
        console.log("Usuário deslogado ou localização do usuário não disponível");
        setUsers([]);
        setFilteredUsers([]);
      }
    };
  
    fetchUsers();
  }, [user, user?.location, distanceFilter]);

  useEffect(() => {
    if (user) {
        const unsubscribe = onSnapshot(collection(db, "friendRequests", user.uid, "requests"), (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            if (requests.length > 0) {
              setCurrentRequest(requests[0]); // Assume que você só lida com uma por vez
              setIsRequestModalVisible(true); // Mostra o modal
          }
        });
        return () => unsubscribe();
    }
}, [user]);

  const applyFilters = () => {
    const filtered = users.filter(user =>
      (!selectedCourse || user.curso === selectedCourse) &&
      (!selectedYear || user.anoFormacao === selectedYear)
    );
    setFilteredUsers(filtered);
    setIsFilterModalVisible(false);
  };

  const handleIconClick = () => {
    setIsFilterModalVisible(true);
  };

  const handleAddContact = async (targetUserId) => {
    try {
        // Adiciona a solicitação de amizade no Firestore
        await setDoc(doc(db, "friendRequests", targetUserId, "requests", user.uid), {
            requesterId: user.uid,
            requesterName: user.displayName,
            status: "pending",
            timestamp: serverTimestamp(),
        });
        console.log("Solicitação enviada com sucesso!");
      } catch (error) {
          console.error("Erro ao enviar solicitação de amizade:", error);
      }
  };

  const handleAcceptRequest = async (requestId, requesterId) => {
    // Obter os detalhes do usuário solicitante
    const userDoc = await getDoc(doc(db, "users", requesterId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
  
      // Adiciona ambos os usuários à lista de amigos um do outro com detalhes adicionais
      await setDoc(doc(db, "friends", user.uid, "userFriends", requesterId), {
        friendId: requesterId,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      });
  
      // Também adiciona o usuário atual à lista de amigos do solicitante
      await setDoc(doc(db, "friends", requesterId, "userFriends", user.uid), {
        friendId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
  
      // Criar documento de conversa
      const conversationId = [user.uid, requesterId].sort().join('_');
      await setDoc(doc(db, "conversations", conversationId), {
        participants: [user.uid, requesterId],
        lastMessage: {},
      });
  
      // Remover a solicitação após aceita
      await deleteDoc(doc(db, "friendRequests", user.uid, "requests", requestId));
      setIsRequestModalVisible(false);
    } else {
      console.error("Não foi possível encontrar os dados do usuário solicitante.");
    }
  };

  const courseData = [
    { label: 'Engenharia de Software', value: 'Engenharia de Software' },
    { label: 'Engenharia de Computação', value: 'Engenharia de Computação' },
    { label: 'Engenharia Mecânica', value: 'Engenharia Mecânica' },
    { label: 'Engenharia Elétrica', value: 'Engenharia Elétrica' },
    { label: 'Engenharia de Controle e Automação', value: 'Engenharia de Controle e Automação' },
    { label: 'Engenharia Eletrônica', value: 'Engenharia Eletrônica' },
    { label: 'Licenciatura em Matemática', value: 'Licenciatura em Matemática' },
  ];

  const yearData = [
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

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="chevron-back-outline" size={34} color="#FF5864" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Modal")}>
          <Image style={tw.style("h-10 w-10 rounded-full")} source={{ uri: "https://img.freepik.com/free-icon/user_318-159711.jpg" }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Location")}>
          <Ionicons name="location" size={30} color={"#000000"}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Pedidos")}>
          <Ionicons name="people" size={24} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Bloqueios")}>
          <Ionicons name="ban-sharp" size={24} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color={"#000000"}/>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Todos os contatos no raio de {distanceFilter} KM</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Slider
          style={{width: 200, height: 40}}
          minimumValue={10}
          maximumValue={500}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          step={10}
          value={distanceFilter}
          onValueChange={setDistanceFilter}
        />
      </View>
      <TouchableOpacity onPress={handleIconClick}>
        <Ionicons name="filter-circle" size={40} color="#007bff" />
      </TouchableOpacity>
      <FlatList
        data={filteredUsers.filter(u => user && u.id !== user.uid)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image style={styles.avatar} source={{ uri: item.photoURL }} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.details}>Curso: {item.curso}</Text>
              <Text style={styles.details}>Ano de Formação: {item.anoFormacao}</Text>
              <Text style={styles.details}>Campus: {item.campus}</Text>
              <TouchableOpacity style={styles.button} onPress={() => handleAddContact(item.id)}>
                <Text style={styles.buttonText}>Adicionar contato</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Dropdown
              style={styles.dropdown}
              data={courseData}
              labelField="label"
              valueField="value"
              placeholder="Selecione um curso"
              value={selectedCourse}
              onChange={item => setSelectedCourse(item.value)}
            />
            <Dropdown
              style={styles.dropdown}
              data={yearData}
              labelField="label"
              valueField="value"
              placeholder="Selecione um ano"
              value={selectedYear}
              onChange={item => setSelectedYear(item.value)}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={applyFilters}
            >
              <Text style={styles.buttonText}>Procurar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRequestModalVisible}
        onRequestClose={() => setIsRequestModalVisible(false)}
    >
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={styles.modalText}>Você tem uma solicitação de amizade de {currentRequest?.requesterName}</Text>
                <TouchableOpacity
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => handleAcceptRequest(currentRequest.id, currentRequest.requesterId)}
                >
                    <Text style={styles.buttonText}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => handleRejectRequest(currentRequest.id)}
                >
                    <Text style={styles.buttonText}>Rejeitar</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
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
    width: 70,
    height: 70,
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
  buttonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  dropdown: {
    width: 250,
    height: 250,
    margin: 16,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: 300,
    height: 300,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
  },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  }
});

export default Home;

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from 'tailwind-react-native-classnames';

const Pedidos = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const navigation = useNavigation()

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(collection(db, "friendRequests", user.uid, "requests"), (snapshot) => {
        const loadedRequests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Loaded requests:", loadedRequests);  // Adicione esta linha para debugar
        setRequests(loadedRequests);
      });
      return () => unsubscribe();
    }
  }, [user]);

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

  const handleRejectRequest = async (requestId) => {
    try {
      // Simplesmente deleta o documento da solicitação de amizade do Firestore
      await deleteDoc(doc(db, "friendRequests", user.uid, "requests", requestId));
      // Atualiza a lista de solicitações para refletir a mudança na UI
      setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
      Alert.alert("Solicitação Rejeitada", "A solicitação de amizade foi rejeitada com sucesso.");
    } catch (error) {
      console.error("Erro ao rejeitar solicitação de amizade:", error);
      Alert.alert("Erro", "Não foi possível rejeitar a solicitação de amizade.");
    }
  };

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Ionicons name="chevron-back-outline" size={34} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Location")}>
          <Ionicons name="happy" size={30} color={"#000000"}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="search-circle-sharp" size={36} color="black"/>
        </TouchableOpacity>
          <Ionicons name="people-outline" size={30} color="black"/>
        <TouchableOpacity onPress={() => navigation.navigate("Bloqueios")}>
          <Ionicons name="person-remove" size={24} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color={"#000000"}/>
        </TouchableOpacity>
      </View>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={tw.style("flex-row items-center justify-between p-4 bg-white m-2 rounded-lg shadow")}>
            <Image
              style={tw.style("rounded-full h-12 w-12 mr-4")}
              source={{ uri: item.requesterPhotoURL }}
            />
            <Text style={tw.style("flex-1 text-lg font-semibold")}>{item.requesterName}</Text>
            <TouchableOpacity
              style={tw.style("bg-green-500 px-4 py-2 rounded")}
              onPress={() => handleAcceptRequest(item.id, item.requesterId)}
            >
              <Text style={tw.style("text-white text-sm")}>Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw.style("bg-red-500 px-4 py-2 ml-2 rounded")}
              onPress={() => handleRejectRequest(item.id)}
            >
              <Text style={tw.style("text-white text-sm")}>Recusar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

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
})

export default Pedidos;

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'tailwind-react-native-classnames';
import Header from '../components/Header';
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';

const Pedidos = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

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
    <SafeAreaView style={tw.style("flex-1")}>
      <Header title={"Pedidos de Amizade"} />
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

export default Pedidos;

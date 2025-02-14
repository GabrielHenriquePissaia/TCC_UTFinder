import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from 'tailwind-react-native-classnames';

const Pedidos = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const navigation = useNavigation();

  //obter solicitações de amizade em tempo real
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(collection(db, "friendRequests", user.uid, "requests"), (snapshot) => {
        const loadedRequests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRequests(loadedRequests);
      });
      return () => unsubscribe();
    }
  }, [user]);

//   Escuta mudanças em friendRequests/{user.uid}/requests:
// Obtém todas as solicitações de amizade do usuário.
// Atualiza o estado requests com os dados recebidos.
// Retorno do useEffect:
// Cancela a assinatura (unsubscribe) ao desmontar o componente.

//para aceitar uma solicitação de amizade
  const handleAcceptRequest = async (requestId, requesterId) => {
    const userDoc = await getDoc(doc(db, "users", requesterId));
    if (userDoc.exists()) {
      const userData = userDoc.data();

      await setDoc(doc(db, "friends", user.uid, "userFriends", requesterId), {
        friendId: requesterId,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      });

      await setDoc(doc(db, "friends", requesterId, "userFriends", user.uid), {
        friendId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      const conversationId = [user.uid, requesterId].sort().join('_');
      await setDoc(doc(db, "conversations", conversationId), {
        participants: [user.uid, requesterId],
        lastMessage: {},
      });

      await deleteDoc(doc(db, "friendRequests", user.uid, "requests", requestId));
      Alert.alert("Solicitação Aceita", "Você aceitou a solicitação de amizade!");
    } else {
      console.error("Não foi possível encontrar os dados do usuário solicitante.");
    }
  };

//   Obtém os dados do usuário solicitante (requesterId).
// Adiciona a amizade nos dois perfis (userFriends):
// O usuário logado adiciona requesterId à sua lista de amigos.
// requesterId também adiciona o usuário logado à sua lista de amigos.
// Cria uma conversa entre os dois usuários (conversations/{conversationId}):
// conversationId é um identificador único formado pelos uid dos participantes.
// Remove a solicitação de amizade do Firestore (deleteDoc()).
// Exibe um alerta informando que a solicitação foi aceita.

//para rejeitar uma solicitação de amizade
  const handleRejectRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "friendRequests", user.uid, "requests", requestId));
      setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
      Alert.alert("Solicitação Rejeitada", "A solicitação de amizade foi rejeitada com sucesso.");
    } catch (error) {
      console.error("Erro ao rejeitar solicitação de amizade:", error);
      Alert.alert("Erro", "Não foi possível rejeitar a solicitação de amizade.");
    }
  };

//   Remove a solicitação de amizade do Firestore (deleteDoc()).
// Atualiza a lista de solicitações no estado (setRequests()).
// Exibe um alerta informando que a solicitação foi rejeitada.
// Captura e exibe erros caso a remoção falhe.

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Ionicons name="home" size={34} color="black" />
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
      <View style={tw.style("flex-1")}>
        {requests.length > 0 ? (
          <FlatList
            data={requests}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={tw.style("flex-row items-center justify-between p-4 bg-white m-2 rounded-lg shadow")}>
                <Image
                  style={tw.style("rounded-full h-12 w-12 mr-4")}
                  source={item.requesterPhotoURL ? { uri: item.requesterPhotoURL } : require("../assets/perfil.jpg")}
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
        ) : (
          <View style={tw.style("p-5")}>
            <Text style={tw.style("text-center text-lg")}>
              Sem solicitações de amizade no momento.
            </Text>
          </View>
        )}
      </View>
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

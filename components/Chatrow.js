import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import useAuth from '../hooks/useAuth'; // Importe seu hook de autenticação
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Certifique-se de importar as funções necessárias do Firestore
import { db } from '../firebase'; // Certifique-se de que db está corretamente importado

const ChatRow = ({ friendDetails }) => {
  const navigation = useNavigation();
  const { user } = useAuth(); // Obtenha o usuário autenticado

  // Função para bloquear um usuário
  const handleBlockUser = async (userId) => {
    if (!user) return; // Verifica se o usuário está definido
    const blockerId = user.uid; // ID do usuário que está bloqueando
    const userRef = doc(db, "users", blockerId, "blockedUsers", userId);

    try {
      await setDoc(userRef, { blockedAt: serverTimestamp() }); // Armazena a data de bloqueio
      Alert.alert("Bloquear", "Usuário bloqueado com sucesso!");
    } catch (error) {
      console.error("Erro ao bloquear usuário:", error);
      Alert.alert("Erro", "Não foi possível bloquear o usuário.");
    }
  };

  return (
    <View style={tw.style("flex-row items-center justify-between py-3 px-5 bg-white mx-3 my-1 rounded-lg shadow-lg")}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Message", { userId: friendDetails.friendId })}
        style={tw.style("flex-row items-center")}
      >
        <Image
          style={tw.style("rounded-full h-16 w-16 mr-4")}
          source={{ uri: friendDetails.photoURL || "https://img.freepik.com/free-icon/user_318-159711.jpg" }}
        />
        <Text style={tw.style("text-lg font-semibold")}>
          {friendDetails.displayName || "No name"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={tw.style("bg-red-500 p-2 rounded-md")}
        onPress={() => handleBlockUser(friendDetails.friendId)}
      >
        <Text style={tw.style("text-white text-sm font-semibold")}>Bloquear</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatRow;

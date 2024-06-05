import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import useAuth from '../hooks/useAuth'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { db } from '../firebase';

const ChatRow = ({ friendDetails }) => {
  const navigation = useNavigation();
  const { user } = useAuth(); 

  const handleBlockUser = async (friendDetails) => {
    if (!user || !user.uid || !friendDetails) {
      Alert.alert("Erro", "Detalhes do usuário não disponíveis.");
      return;
    }

    const { friendId, displayName, photoURL } = friendDetails;
    if (!friendId || !displayName || !photoURL) {
      Alert.alert("Erro", "Informações incompletas do amigo para bloquear.");
      return;
    }

    const blockerId = user.uid;
    const blockData = {
      blockedAt: serverTimestamp(),
      displayName: displayName,
      photoURL: photoURL,
    };

    const blockedByData = {
      blockedAt: serverTimestamp(),
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    try {
      const userRef = doc(db, "users", blockerId, "blockedUsers", friendId);
      await setDoc(userRef, blockData);

      const targetRef = doc(db, "users", friendId, "blockedByUser", blockerId);
      await setDoc(targetRef, blockedByData);

      Alert.alert("Bloquear", "Usuário bloqueado com sucesso!");
    } catch (error) {
      console.error("Erro ao bloquear usuário:", error);
      Alert.alert("Erro ao bloquear usuário", error.message);
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
        onPress={() => handleBlockUser(friendDetails)}
      >
        <Text style={tw.style("text-white text-sm font-semibold")}>Bloquear</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatRow;

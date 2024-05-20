import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

const ChatRow = ({ friendDetails }) => {
  const navigation = useNavigation();

  // Função para bloquear um usuário
  const handleBlockUser = (userId) => {
    // Aqui você pode adicionar a lógica para bloquear o usuário
    Alert.alert("Bloquear", "Usuário bloqueado com sucesso!"); // Exemplo de feedback
    // Implemente a lógica de bloqueio no seu Firebase ou outro backend
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

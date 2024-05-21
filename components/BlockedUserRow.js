import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

const BlockedUserRow = ({ userDetails, onUnblock }) => {
  const { displayName, photoURL, userId } = userDetails;

  return (
    <View style={tw.style("flex-row items-center justify-between py-3 px-5 bg-white mx-3 my-1 rounded-lg shadow-lg")}>
      <View style={tw.style("flex-row items-center")}>
        <Image
          style={tw.style("rounded-full h-16 w-16 mr-4")}
          source={{ uri: photoURL || "https://img.freepik.com/free-icon/user_318-159711.jpg" }}
        />
        <Text style={tw.style("text-lg font-semibold")}>
          {displayName || "Anônimo"}
        </Text>
      </View>
      <TouchableOpacity
        style={tw.style("bg-blue-500 p-2 rounded-md")}
        onPress={() => {
          Alert.alert(
            "Desbloquear Usuário",
            "Você tem certeza que deseja desbloquear este usuário?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Desbloquear", onPress: () => onUnblock(userId) },
            ]
          );
        }}
      >
        <Text style={tw.style("text-white text-sm font-semibold")}>Desbloquear</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BlockedUserRow;

import React from 'react';
import { View, Text, TouchableOpacity, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

const ChatRow = ({ friendDetails }) => {
  const navigation = useNavigation();

  console.log("Rendering friend:", friendDetails);

  return (
    <TouchableOpacity
      style={tw.style("flex-row items-center py-3 px-5 bg-white mx-3 my-1 rounded-lg shadow-lg")}
      onPress={() => navigation.navigate("Message", { userId: friendDetails.friendId })}
    >
      <Image
        style={tw.style("rounded-full h-16 w-16 mr-4")}
        source={{ uri: friendDetails.photoURL || "https://img.freepik.com/free-icon/user_318-159711.jpg" }}
      />
      <View>
        <Text style={tw.style("text-lg font-semibold")}>
          {friendDetails.displayName || "No name"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatRow;
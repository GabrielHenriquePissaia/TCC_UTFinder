import { View, Text, Image } from 'react-native'
import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import tw from 'tailwind-react-native-classnames';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Match = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { loggedInProfile, userSwiped } = route.params;
  return (

    <View style={tw.style("h-full bg-yellow-500 pt-20", { opacity: 0.79 })}>
      <View style={tw.style("justify-center px-5 pt-20")}>
        <Image 
          source={
            require("../assets/encontro-de-mentes.png")
          }
          style={tw.style("h-11 w-full")}
        />
        <Text style={tw.style("text-center mt-5")}>
          Você e {userSwiped.displayName} tiveram um emparelhamento profissional
        </Text>
        <View style={tw.style("flex-row justify-evenly mt-5")}>
          <Image
          style={tw.style("h-32 w-32 rounded-full")}
          source={{
            uri: loggedInProfile.photoURL,
          }}
          />
          <Image
          style={tw.style("h-32 w-32 rounded-full")}
          source={{
            uri: userSwiped.photoURL,
          }}
          />
        </View>
      </View>
      <TouchableOpacity style={tw.style("bg-white m-5 px-10 py-8 rounded-full mt-20")}
        onPress={()=>{
          navigation.goBack();
          navigation.navigate("Chat");
        }}
        >
        <Text style={tw.style("text-center")}>Ir para o chat</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Match
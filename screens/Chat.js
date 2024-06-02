import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Chatlist from '../components/Chatlist';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import tw from 'tailwind-react-native-classnames';

const Chat = () => {
  const navigation = useNavigation();

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
        <TouchableOpacity onPress={() => navigation.navigate("Pedidos")}>
          <Ionicons name="people" size={30} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Bloqueios")}>
          <Ionicons name="person-remove" size={24} color="black"/>
        </TouchableOpacity>
          <Ionicons name="chatbubbles-outline" size={30} color={"#000000"}/>
      </View>
      <View style={tw.style("flex-1")}>
        <Chatlist />
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

export default Chat;

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import BlockedUserRow from '../components/BlockedUserRow';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import tw from 'tailwind-react-native-classnames';

const Bloqueios = () => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      const blockedRef = collection(db, "users", user.uid, "blockedUsers");
      const unsubscribe = onSnapshot(blockedRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          userId: doc.id,
          ...doc.data(),
        }));
        setBlockedUsers(users);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleUnblockUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "blockedUsers", userId));
      await deleteDoc(doc(db, "users", userId, "blockedByUser", user.uid));
      Alert.alert("Desbloquear", "Usuário desbloqueado com sucesso!");
    } catch (error) {
      console.error("Erro ao desbloquear usuário:", error);
      Alert.alert("Erro", "Não foi possível desbloquear o usuário.");
    }
  };

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Ionicons name="home" size={34} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Location")}>
          <Ionicons name="happy" size={30} color={"#000000"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="search-circle-sharp" size={36} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Pedidos")}>
          <Ionicons name="people" size={30} color="black" />
        </TouchableOpacity>
        <Ionicons name="person-remove-outline" size={24} color="black" />
        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color={"#000000"} />
        </TouchableOpacity>
      </View>
      <View style={tw.style("flex-1")}>
        {blockedUsers.length > 0 ? (
          <FlatList
            data={blockedUsers}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => <BlockedUserRow userDetails={item} onUnblock={handleUnblockUser} />}
          />
        ) : (
          <View style={tw.style("p-5")}>
            <Text style={tw.style("text-center text-lg")}>
              Nenhum usuário bloqueado no momento.
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
});

export default Bloqueios;

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
  const { user } = useAuth(); // Obtém o usuário autenticado do contexto
  const [blockedUsers, setBlockedUsers] = useState([]); // Estado para armazenar a lista de usuários bloqueados
  const navigation = useNavigation(); // Hook para navegação entre telas

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

  // Esse `useEffect` é responsável por buscar em tempo real a lista de usuários bloqueados do usuário autenticado.
  // Ele se conecta ao Firestore e escuta mudanças, atualizando o estado `blockedUsers` sempre que um bloqueio é adicionado ou removido.
  // Caso o usuário deslogue, esse efeito não será executado.
  // O listener é removido automaticamente quando o componente deixa de ser renderizado, evitando vazamento de memória.

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

  // Essa função é chamada quando o usuário clica para desbloquear outra pessoa.
  // Primeiro, ela remove o usuário da lista "blockedUsers" do usuário autenticado no Firestore.
  // Em seguida, remove o usuário autenticado da lista "blockedByUser" do outro usuário.
  // Se a operação for bem-sucedida, um alerta de sucesso é exibido.
  // Caso ocorra um erro (como falha de conexão ou permissão no Firestore), o erro é registrado no console e um alerta é exibido.

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

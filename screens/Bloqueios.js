import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'tailwind-react-native-classnames';
import Header from '../components/Header';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from "../firebase";
import useAuth from '../hooks/useAuth';
import BlockedUserRow from '../components/BlockedUserRow';

const Bloqueios = () => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    if (user) {
      const blockedRef = collection(db, "users", user.uid, "blockedUsers");
      getDocs(blockedRef).then(snapshot => {
        const users = snapshot.docs.map(doc => ({
          userId: doc.id,
          ...doc.data(),
        }));
        setBlockedUsers(users);
      }).catch(error => {
        console.error("Erro ao carregar usuários bloqueados:", error);
      });
    }
  }, [user]);

  const handleUnblockUser = async (userId) => {
    try {
      // Remover o usuário da lista de bloqueados do usuário atual
      await deleteDoc(doc(db, "users", user.uid, "blockedUsers", userId));
      // Remover o usuário atual da lista de 'bloqueado por' do usuário desbloqueado
      await deleteDoc(doc(db, "users", userId, "blockedByUser", user.uid));
  
      // Atualizar a lista de bloqueados localmente para refletir a mudança
      setBlockedUsers(prev => prev.filter(u => u.userId !== userId));
  
      Alert.alert("Desbloquear", "Usuário desbloqueado com sucesso!");
    } catch (error) {
      console.error("Erro ao desbloquear usuário:", error);
      Alert.alert("Erro", "Não foi possível desbloquear o usuário.");
    }
  };

  return (
    <SafeAreaView style={tw.style("flex-1")}>
      <Header title={"Contatos Bloqueados"} />
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

export default Bloqueios;

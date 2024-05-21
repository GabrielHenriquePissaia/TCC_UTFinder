import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import useAuth from '../hooks/useAuth';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from "../firebase";
import ChatRow from '../components/Chatrow';
import tw from "tailwind-react-native-classnames";

const Chatlist = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);

  useEffect(() => {
    if (user) {
      const blockedRef = collection(db, "users", user.uid, "blockedUsers");
      const blockedByRef = collection(db, "users", user.uid, "blockedByUser");
  
      // Buscar usuários que bloquearam o usuário logado
      getDocs(blockedByRef).then(snapshot => {
        const blockedBy = snapshot.docs.map(doc => doc.id);
        setBlockedByUsers(blockedBy);
      });
  
      // Buscar usuários que o usuário logado bloqueou
      getDocs(blockedRef).then(snapshot => {
        const blocked = snapshot.docs.map(doc => doc.id);
        setBlockedUsers([...blockedUsers, ...blocked]); // Combinar as duas listas
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      const friendsRef = collection(db, "friends", user.uid, "userFriends");
      const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
        const friendList = snapshot.docs.map(doc => {
          const friendData = { friendId: doc.id, ...doc.data() };
          return friendData;
        }).filter(friend => !blockedUsers.includes(friend.friendId) && !blockedByUsers.includes(friend.friendId)); // Excluir amigos bloqueados e quem o bloqueou
        setFriends(friendList);
      });
  
      return () => unsubscribe();
    }
  }, [user, blockedUsers, blockedByUsers]); // Dependência de blockedUsers adicionada

  console.log("Friends list:", friends);

  return (
    <View style={tw.style("flex-1")}>
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.friendId}
          renderItem={({ item }) => <ChatRow friendDetails={item} />}
        />
      ) : (
        <View style={tw.style("p-5")}>
          <Text style={tw.style("text-center text-lg")}>
            Sem conexões no momento
          </Text>
        </View>
      )}
    </View>
  );
};

export default Chatlist;

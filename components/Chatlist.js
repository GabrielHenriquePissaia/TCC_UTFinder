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

  useEffect(() => {
    // Carregar usuários bloqueados
    if (user) {
      const blockedRef = collection(db, "users", user.uid, "blockedUsers");
      getDocs(blockedRef).then(snapshot => {
        const blockedIds = snapshot.docs.map(doc => doc.id); // Obter IDs de usuários bloqueados
        setBlockedUsers(blockedIds);
      }).catch(error => {
        console.error("Erro ao carregar usuários bloqueados:", error);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const friendsRef = collection(db, "friends", user.uid, "userFriends");
      const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
        if (snapshot.empty) {
          console.log("No friends found.");
        }
        const friendList = snapshot.docs.map(doc => {
          const friendData = { friendId: doc.id, ...doc.data() };
          return friendData;
        }).filter(friend => !blockedUsers.includes(friend.friendId)); // Filtrar amigos não bloqueados
        setFriends(friendList);
      }, error => {
        console.error("Error fetching friends:", error);
      });

      return () => unsubscribe();
    }
  }, [user, blockedUsers]); // Dependência de blockedUsers adicionada

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

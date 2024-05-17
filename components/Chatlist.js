import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import useAuth from '../hooks/useAuth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from "../firebase";
import ChatRow from '../components/Chatrow';
import tw from "tailwind-react-native-classnames";

const Chatlist = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (user) {
      const friendsRef = collection(db, "friends", user.uid, "userFriends");
      const unsubscribe = onSnapshot(friendsRef, (snapshot) => {
        if (snapshot.empty) {
          console.log("No friends found.");
        }
        const friendList = snapshot.docs.map(doc => {
          const friendData = { friendId: doc.id, ...doc.data() };
          console.log("Friend data:", friendData);
          return friendData;
        });
        setFriends(friendList);
      }, error => {
        console.error("Error fetching friends:", error);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const conversationsRef = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
      const unsubscribe = onSnapshot(conversationsRef, (snapshot) => {
        const loadedConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(loadedConversations);
      }, error => {
        console.error("Erro ao carregar conversas:", error);
      });
  
      return () => unsubscribe();
    }
  }, [user]);

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

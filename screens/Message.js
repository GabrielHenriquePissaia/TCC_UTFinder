import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { doc, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';

const Message = () => {
  const { user } = useAuth();
  const route = useRoute();
  const { userId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const messagesRef = collection(db, 'messages', userId, 'userMessages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      try {
        await addDoc(collection(db, 'messages', userId, 'userMessages'), {
          text: newMessage,
          senderId: user.uid,
          timestamp: serverTimestamp()
        });
        setNewMessage('');
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    }
  };

  return (
    <SafeAreaView>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <TextInput
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Digite sua mensagem..."
      />
      <Button title="Enviar" onPress={handleSend} />
    </SafeAreaView>
  );
};

export default Message;

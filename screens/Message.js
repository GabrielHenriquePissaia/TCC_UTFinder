import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, FlatList } from "react-native";
import tw from "tailwind-react-native-classnames";
import { collection, onSnapshot, orderBy, query, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import useAuth from '../hooks/useAuth';
import SenderMessage from "../components/Sendermenssage";
import ReceiverMessage from "../components/Recivermenssage";
import { SafeAreaView } from 'react-native-safe-area-context';


const Message = ({ route }) => {
  const { user } = useAuth();
  const { conversationId } = route.params; // Agora usamos conversationId passado pela navegação
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = onSnapshot(
        query(collection(db, "conversations", conversationId, "messages"), orderBy("timestamp", "desc")),
        (snapshot) => setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      );
      return unsubscribe;
    }
  }, [conversationId]);

  const sendMessage = async () => {
    if (input.trim()) {
      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        timestamp: serverTimestamp(),
        userId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL, // Certifique-se de que essa informação é passada corretamente
        message: input
      });
      setInput("");
    }
  };

  return (
    <SafeAreaView style={tw.style("pt-5 flex-1")}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={tw.style("flex-1")}
        keyboardVerticalOffset={10}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            data={messages}
            style={tw.style("pl-4")}
            keyExtractor={(item) => item.id}
            inverted
            renderItem={({ item: message }) =>
              message.userId === user.uid ? (
                <SenderMessage key={message.id} message={message} />
              ) : (
                <ReceiverMessage key={message.id} message={message} />
              )
            }
          />
        </TouchableWithoutFeedback>
        <View style={tw.style("flex-row justify-between items-center bg-white border-t border-gray-200 px-5 py-2")}>
          <TextInput
            style={tw.style("h-10 text-lg")}
            placeholder="Send a message..."
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            value={input}
          />
          <Button onPress={sendMessage} title="Send" color="#FF5864" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Message;

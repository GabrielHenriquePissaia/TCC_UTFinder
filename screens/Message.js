import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import SenderMessage from '../components/Sendermenssage';
import ReceiverMessage from '../components/Recivermenssage';
import tw from 'tailwind-react-native-classnames';
import { Ionicons } from '@expo/vector-icons';

const MessageScreen = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const route = useRoute();
  const { conversationId } = route.params;
  const navigation = useNavigation();

  // para carregar mensagens em tempo real

  useEffect(() => {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return unsubscribe;
  }, [conversationId]);

//   Cria uma consulta (query) ao Firestore:
// Acessa a coleção messages dentro de conversations/{conversationId}.
// Ordena as mensagens pelo timestamp em ordem decrescente (desc), ou seja, mais recentes primeiro.
// onSnapshot:
// Escuta em tempo real mudanças na coleção.
// Atualiza messages sempre que uma nova mensagem for adicionada.
// Retorno do useEffect:
// Desinscreve (unsubscribe) o listener ao desmontar o componente.
// Objetivo:
// Atualizar mensagens em tempo real sem precisar recarregar a tela.

// Função para enviar mensagem
  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageData = {
      message: input,
      senderId: user.uid,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);

    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: messageData,
    });

    setInput('');
  };

// Verifica se a mensagem contém texto:
// if (!input.trim()) return;
// Se o usuário tentar enviar uma mensagem vazia, a função é interrompida.
// Cria um objeto messageData:
// message: Contém o texto digitado pelo usuário.
// senderId: Identifica o remetente com user.uid.
// timestamp: Usa serverTimestamp() para registrar a data/hora da mensagem no Firestore.
// Adiciona a mensagem ao Firestore:
// addDoc(collection(db, 'conversations', conversationId, 'messages'), messageData);
// Insere a mensagem na subcoleção messages dentro da conversa correspondente (conversationId).
// Atualiza o último envio na conversa:
// updateDoc(doc(db, 'conversations', conversationId), { lastMessage: messageData });
// Define a última mensagem enviada na coleção conversations.
// Limpa o campo de entrada (input) após envio:
// setInput('');
// Assim, o usuário pode digitar uma nova mensagem sem precisar apagar a anterior.

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Ionicons name="home" size={34} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Location")}>
          <Ionicons name="happy" size={30} color={"#000000"}/>
        </TouchableOpacity>
        <Ionicons name="search-circle" size={36} color="black"/>
        <TouchableOpacity onPress={() => navigation.navigate("Pedidos")}>
          <Ionicons name="people" size={30} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Bloqueios")}>
          <Ionicons name="person-remove" size={24} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color={"#000000"}/>
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item: message }) =>
          message.senderId === user.uid ? (
            <SenderMessage key={message.id} message={message} />
          ) : (
            <ReceiverMessage key={message.id} message={message} />
          )
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Digite sua mensagem..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <Button title="Enviar" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  textInput: {
    flex: 1,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default MessageScreen;

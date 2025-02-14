import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

//para buscar pedidos de amizade
export const fetchFriendRequests = async (userId) => {
  try {
    const snapshot = await getDocs(collection(db, 'friendRequests', userId, 'requests'));
    const friendRequests = snapshot.docs.map(doc => doc.data());
    console.log('Pedidos de amizade:', friendRequests);
    return friendRequests;
  } catch (error) {
    console.error('Erro ao buscar pedidos de amizade:', error);
    return [];
  }
};

// Objetivo: Obtém todas as solicitações de amizade recebidas pelo usuário (userId).
// getDocs(): Busca os documentos na coleção friendRequests/{userId}/requests.
// Transformação dos dados: Converte os documentos em um array de objetos contendo os dados das solicitações.
// Retorno: Retorna a lista de solicitações de amizade.
// Tratamento de erro: Caso ocorra um erro ao buscar os dados, retorna um array vazio.

//para buscar mensagens de chat
export const fetchChatMessages = async (userId) => {
  try {
    const snapshot = await getDocs(collection(db, 'messages', userId, 'chats'));
    const chatMessages = snapshot.docs.map(doc => doc.data());
    console.log('Mensagens de chat:', chatMessages);
    return chatMessages;
  } catch (error) {
    console.error('Erro ao buscar mensagens de chat:', error);
    return [];
  }
};

// Objetivo: Obtém todas as mensagens de chat do usuário (userId).
// getDocs(): Busca os documentos na coleção messages/{userId}/chats.
// Transformação dos dados: Converte os documentos em um array de objetos contendo as mensagens.
// Retorno: Retorna a lista de mensagens de chat.
// Tratamento de erro: Caso ocorra um erro, retorna um array vazio.

//para escutar atualizações em pedidos de amizade
export const listenToFriendRequests = (userId, callback) => {
  const requestsRef = collection(db, 'friendRequests', userId, 'requests');
  return onSnapshot(requestsRef, (snapshot) => {
    const friendRequests = snapshot.docs.map(doc => doc.data());
    callback(friendRequests);
  });
};

// Objetivo: Permite escutar mudanças em tempo real nos pedidos de amizade.
// onSnapshot():
// Configura um listener para escutar mudanças na coleção friendRequests/{userId}/requests.
// Sempre que um pedido de amizade for adicionado ou removido, a função será chamada automaticamente.
// Callback: Chama a função callback passando a lista atualizada de solicitações de amizade.
// Retorno: Retorna a função de cancelamento do listener.

// para escutar mensagens de chat em tempo real
export const listenToChatMessages = (userId, callback) => {
  const chatsRef = collection(db, 'messages', userId, 'chats');
  return onSnapshot(chatsRef, (snapshot) => {
    const chatMessages = snapshot.docs.map(doc => doc.data());
    callback(chatMessages);
  });
};

// Objetivo: Permite escutar mudanças em tempo real nas mensagens de chat do usuário (userId).
// onSnapshot():
// Configura um listener para escutar mudanças na coleção messages/{userId}/chats.
// Sempre que uma nova mensagem for adicionada, a função será chamada automaticamente.
// Callback: Chama a função callback passando a lista atualizada de mensagens.
// Retorno: Retorna a função de cancelamento do listener.

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

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

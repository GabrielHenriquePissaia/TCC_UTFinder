import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import useAuth from '../hooks/useAuth';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ChatRow from './Chatrow';
import tw from 'tailwind-react-native-classnames';

const ChatList = () => {
  const { user } = useAuth(); // Obtém o usuário autenticado
  const [friends, setFriends] = useState([]); // Estado que armazena a lista de amigos
  const [blockedUsers, setBlockedUsers] = useState([]); // Estado para usuários bloqueados pelo usuário logado
  const [blockedByUsers, setBlockedByUsers] = useState([]); // Estado para usuários que bloquearam o usuário logado

  useEffect(() => {
    if (user) {
      const blockedRef = collection(db, 'users', user.uid, 'blockedUsers');
      const blockedByRef = collection(db, 'users', user.uid, 'blockedByUser');

      const unsubscribeBlocked = onSnapshot(blockedRef, snapshot => {
        const blocked = snapshot.docs.map(doc => doc.id);
        setBlockedUsers(blocked);
      });

      const unsubscribeBlockedBy = onSnapshot(blockedByRef, snapshot => {
        const blockedBy = snapshot.docs.map(doc => doc.id);
        setBlockedByUsers(blockedBy);
      });

      return () => {
        unsubscribeBlocked();
        unsubscribeBlockedBy();
      };
    }
  }, [user]);

  // useEffect responsável por monitorar mudanças na lista de usuários bloqueados.
  // Ele escuta alterações nas coleções "blockedUsers" e "blockedByUser" do usuário logado no Firestore.
  // blockedUsers contém IDs dos usuários que o usuário logado bloqueou.
  // blockedByUsers contém IDs dos usuários que bloquearam o usuário logado.
  // O efeito é acionado quando o estado do usuário (`user`) muda.
  // Quando há mudanças nos documentos dessas coleções, as listas de bloqueios são atualizadas no estado.

  useEffect(() => {
    if (user) {
      const friendsRef = collection(db, 'friends', user.uid, 'userFriends');
      const unsubscribe = onSnapshot(friendsRef, snapshot => {
        const friendList = snapshot.docs
          .map(doc => {
            const friendData = { friendId: doc.id, ...doc.data() };
            return friendData;
          })
          .filter(friend => friend.friendId && !blockedUsers.includes(friend.friendId) && !blockedByUsers.includes(friend.friendId));
        setFriends(friendList);
      });

      return () => unsubscribe();
    }
  }, [user, blockedUsers, blockedByUsers]);

  // useEffect responsável por buscar a lista de amigos do usuário logado.
  // Ele monitora mudanças na coleção "userFriends" dentro do Firestore, na subcoleção do usuário logado.
  // Ao obter os dados, ele filtra os amigos removendo aqueles que estão na lista de bloqueados (blockedUsers e blockedByUsers).
  // Isso garante que o usuário não visualize contatos bloqueados, mantendo a privacidade.
  // O efeito é acionado sempre que o estado de `user`, `blockedUsers` ou `blockedByUsers` for alterado.

  return (
    <View style={tw.style('flex-1')}>
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          keyExtractor={item => item.friendId}
          renderItem={({ item }) => <ChatRow friendDetails={item} />}
        />
      ) : (
        <View style={tw.style('p-5')}>
          <Text style={tw.style('text-center text-lg')}>Sem conexões no momento</Text>
        </View>
      )}
    </View>
  );
};

export default ChatList;

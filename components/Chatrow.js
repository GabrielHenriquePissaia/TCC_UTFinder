import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import useAuth from '../hooks/useAuth'; 
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'; 
import { db } from '../firebase';

const ChatRow = ({ friendDetails }) => {
  const navigation = useNavigation();
  const { user } = useAuth(); 
  const [friendData, setFriendData] = useState(friendDetails);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", friendDetails.friendId), (doc) => {
      setFriendData({ friendId: friendDetails.friendId, ...doc.data() });
    });

    return () => unsubscribe();
  }, [friendDetails.friendId]);

  const handleBlockUser = async (friendDetails) => {
    if (!user || !user.uid || !friendDetails) {
      Alert.alert("Erro", "Detalhes do usuário não disponíveis.");
      return;
    }

    const { friendId, displayName, photoURL } = friendDetails;
    if (!friendId || !displayName || !photoURL) {
      Alert.alert("Erro", "Informações incompletas do amigo para bloquear.");
      return;
    }

    const blockerId = user.uid;
    const blockData = {
      blockedAt: serverTimestamp(),
      displayName: displayName,
      photoURL: photoURL,
    };

    const blockedByData = {
      blockedAt: serverTimestamp(),
      displayName: user.displayName,
      photoURL: user.photoURL,
    };

    try {
      const userRef = doc(db, "users", blockerId, "blockedUsers", friendId);
      await setDoc(userRef, blockData);

      const targetRef = doc(db, "users", friendId, "blockedByUser", blockerId);
      await setDoc(targetRef, blockedByData);

      Alert.alert("Bloquear", "Usuário bloqueado com sucesso!");
    } catch (error) {
      console.error("Erro ao bloquear usuário:", error);
      Alert.alert("Erro ao bloquear usuário", error.message);
    }
  };

  const handleUnfriend = async (friendDetails) => {
    if (!user || !user.uid || !friendDetails || !friendDetails.friendId) {
      Alert.alert("Erro", "Detalhes do usuário não disponíveis.");
      return;
    }

    const { friendId } = friendDetails;

    try {
      // Remover da subcoleção de amigos do usuário logado
      await deleteDoc(doc(db, "friends", user.uid, "userFriends", friendId));

      // Remover da subcoleção de amigos do amigo
      await deleteDoc(doc(db, "friends", friendId, "userFriends", user.uid));

      Alert.alert("Desfazer Amizade", "Amizade desfeita com sucesso!");
    } catch (error) {
      console.error("Erro ao desfazer amizade:", error);
      Alert.alert("Erro ao desfazer amizade", error.message);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Message", { userId: friendData.friendId })}
        style={styles.userInfo}
      >
        <Image
          style={styles.avatar}
          source={{ uri: friendData.photoURL || "https://img.freepik.com/free-icon/user_318-159711.jpg" }}
        />
        <Text style={styles.name}>
          {friendData.displayName || "No name"}
        </Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.blockButton]}
          onPress={() => handleBlockUser(friendData)}
        >
          <Text style={styles.buttonText}>Bloquear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.unfriendButton]}
          onPress={() => handleUnfriend(friendData)}
        >
          <Text style={styles.buttonText}>Desfazer Amizade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  blockButton: {
    backgroundColor: '#f44336',
  },
  unfriendButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ChatRow;

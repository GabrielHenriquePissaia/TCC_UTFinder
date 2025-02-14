import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import tw from "tailwind-react-native-classnames";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const ReceiverMessage = ({ message }) => {
  const [friendPhoto, setFriendPhoto] = useState(
    "https://img.freepik.com/free-icon/user_318-159711.jpg" // Imagem padrão
  );

  useEffect(() => {
    const senderId = message.senderId;

    if (senderId) {
      const unsubscribe = onSnapshot(doc(db, "users", senderId), (doc) => {
        if (doc.exists) {
          const userData = doc.data();
          setFriendPhoto(
            userData.photoURL && userData.photoURL.trim() !== ""
              ? userData.photoURL
              : "https://img.freepik.com/free-icon/user_318-159711.jpg" // Imagem padrão
          );
        }
      });

      return () => unsubscribe();
    }
  }, [message.senderId]);

   // useEffect responsável por buscar a foto do remetente da mensagem no Firestore.
  // 1. Obtém o `senderId` da mensagem.
  // 2. Se `senderId` existir, cria um listener no Firestore para o documento do usuário remetente.
  // 3. Quando há uma atualização no documento do usuário remetente, a foto de perfil (`photoURL`) é atualizada no estado `friendPhoto`.
  // 4. Se o usuário não tiver uma foto definida, usa uma imagem padrão.
  // 5. Retorna uma função de limpeza para remover o listener ao desmontar o componente ou quando `message.senderId` muda.

  return (
    <View
      style={tw.style(
        "bg-red-400 rounded-lg rounded-tl-none px-5 py-3 mx-3 my-2 ml-14",
        { alignSelf: "flex-start" }
      )}
    >
      <Image
        style={tw.style("h-12 w-12 rounded-full absolute top-0 -left-14")}
        source={{
          uri: friendPhoto,
        }}
      />
      <Text style={tw.style("text-white mt-1")}>{message.message || "Mensagem vazia"}</Text>
    </View>
  );
};

export default ReceiverMessage;

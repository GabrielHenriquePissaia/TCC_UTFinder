import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const updateUserLocation = async (userId, location) => {
  // Verifica se o usuário está autenticado antes de continuar
  if (!userId) {
    console.warn("Tentativa de atualizar localização sem usuário autenticado.");
    return;
  }

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // Se o usuário não existir no Firestore, não tenta atualizar
    if (!userSnap.exists()) {
      console.warn("Usuário não encontrado no Firestore. Cancelando atualização.");
      return;
    }

    const userData = userSnap.data();

    // Verifica se a localização deve ser atualizada
    if (userData && (userData.location !== null || location === null)) {
      await setDoc(userRef, { location: location || null }, { merge: true });
      console.log("Localização atualizada com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao atualizar localização:", error.message);
  }

//   Atualiza ou remove a localização:
// Se location for um objeto válido ({ latitude, longitude }), ele será salvo no Firestore.
// Se location === null, a localização será removida do Firestore (null).
// { merge: true }:
// Mantém outros dados do usuário inalterados e apenas altera a localização.
// Log de sucesso:
// Exibe uma mensagem no console indicando que a atualização foi bem-sucedida.
};

export default updateUserLocation;

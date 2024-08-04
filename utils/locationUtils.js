import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const updateUserLocation = async (userId, location) => {
  if (!userId) return;

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    // Verifica se a localização deve ser atualizada
    if (userData.location !== null || location === null) {
      await setDoc(userRef, { location: location || null }, { merge: true });
    }
  } catch (error) {
    console.error("Erro ao atualizar localização:", error);
  }
};

export default updateUserLocation;

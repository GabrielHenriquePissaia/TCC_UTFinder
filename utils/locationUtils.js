import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const updateUserLocation = async (userId, location) => {
  if (!userId || !location) return;

  try {
    await setDoc(doc(db, "users", userId), { location }, { merge: true });
  } catch (error) {
    console.error("Erro ao atualizar localização:", error);
  }
};

export default updateUserLocation;
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                // Buscar detalhes adicionais do usuário do Firestore
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    // Combinar dados do Auth com dados do Firestore
                    setUser({ uid: firebaseUser.uid, ...firebaseUser, ...userDoc.data() });
                } else {
                    // Apenas informações básicas do Auth se não houver documento Firestore
                    setUser(firebaseUser);
                }
            } else {
                setUser(null);
            }
            setLoadingInitial(false);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = () => {
        signOut(auth).then(() => {
            setUser(null);
        });
    };

    const memoedValue = useMemo(() => ({
        user, setUser, loading, setLoading, logout
    }), [user, loading]);

    return (
        <AuthContext.Provider value={memoedValue}>
            {!loadingInitial && children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}

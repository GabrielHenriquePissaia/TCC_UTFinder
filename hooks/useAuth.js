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
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUser({ uid: firebaseUser.uid, ...firebaseUser, ...userDoc.data() });
                } else {
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

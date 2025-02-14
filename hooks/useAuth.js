import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(); // Estado para armazenar o usuário autenticado
    const [loadingInitial, setLoadingInitial] = useState(true); // Estado para controlar o carregamento inicial
    const [loading, setLoading] = useState(false); // Estado para indicar se alguma operação está em andamento

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

    // useEffect:
    // 1. O `onAuthStateChanged` escuta mudanças na autenticação do Firebase.
    // 2. Se um usuário estiver autenticado (`firebaseUser`), tenta buscar seus dados no Firestore.
    // 3. Se existir um documento no Firestore, ele mescla os dados do Firestore com os do Firebase Auth.
    // 4. Caso contrário, apenas armazena os dados do Firebase Auth.
    // 5. Se `firebaseUser` for `null`, define `user` como `null`, indicando que ninguém está logado.
    // 6. `setLoadingInitial(false)` indica que o carregamento inicial foi concluído.
    // 7. `setLoading(false)` finaliza qualquer estado de carregamento.

    const logout = () => {
        signOut(auth).then(() => {
            setUser(null);
        });
    };

    // Função `logout`:
    // 1. Chama `signOut(auth)` para deslogar o usuário do Firebase Authentication.
    // 2. Após o logout, define `user` como `null`, garantindo que o estado seja atualizado corretamente.

    const memoedValue = useMemo(() => ({
        user, setUser, loading, setLoading, logout
    }), [user, loading]);

    // useMemo:
    // 1. Otimiza o desempenho evitando recriações desnecessárias do contexto quando `user` ou `loading` mudam.
    // 2. Retorna um objeto contendo `user`, `setUser`, `loading`, `setLoading` e `logout`.

    return (
        <AuthContext.Provider value={memoedValue}>
            {!loadingInitial && children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}

// Hook `useAuth`:
// 1. Retorna o contexto `AuthContext`, permitindo que qualquer componente acesse os dados de autenticação sem precisar importar o contexto diretamente.
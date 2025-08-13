import { useEffect, useState, useContext, createContext } from "react";
import {
  onAuthStateChanged,
  signOut,
  getIdToken as firebaseGetIdToken,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase"; // 🔁 db = getFirestore(app)

// Cria contexto
const AuthContext = createContext();

// Provedor de autenticação
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // agora conterá também `role`
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Escuta mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const profile = userSnap.data();
            
            // Verificar campos obrigatórios e corrigir se necessário
            const needsUpdate = !profile.role || profile.is_active === undefined;
            
            if (needsUpdate) {
              console.log("Usuário precisa de atualização:", { 
                hasRole: !!profile.role, 
                hasIsActive: profile.is_active !== undefined 
              });
              
              const updateData = {
                ...profile,
                role: profile.role || "advogado_redator",
                is_active: profile.is_active !== undefined ? profile.is_active : true,
                display_name: profile.display_name || firebaseUser.displayName || "",
                updated_at: new Date().toISOString()
              };
              
              await updateDoc(userRef, {
                role: updateData.role,
                is_active: updateData.is_active,
                display_name: updateData.display_name,
                updated_at: updateData.updated_at
              });
              
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...updateData
              });
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...profile, // inclui role, display_name, etc
              });
            }
          } else {
            // Criar documento mínimo para usuário que não existe no Firestore
            const userData = {
              display_name: firebaseUser.displayName || "",
              email: firebaseUser.email,
              role: "advogado_redator", // Role padrão
              is_active: true, // Usuário ativo por padrão
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            await setDoc(userRef, userData);
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData
            });
          }
        } catch (err) {
          console.error("Erro ao buscar dados do usuário:", err);
          setError(err);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const getIdToken = async () => {
    const token = await firebaseGetIdToken(auth.currentUser);
    return token;
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useAuth() {
  return useContext(AuthContext);
}

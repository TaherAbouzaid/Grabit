// AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { syncLocalWishlistToFirestore } from "../Store/Slices/wishlistSlice";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
    const dispatch = useDispatch(); 


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          setCurrentUser({ uid: user.uid, ...userDoc.data() });
          dispatch(syncLocalWishlistToFirestore(user.uid));

        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [dispatch]);

   const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  return (
<AuthContext.Provider value={{ user: currentUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook
// export const useAuth = () => useContext(AuthContext);
export function useAuth() {
  return useContext(AuthContext);
}


import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { fetchUserWishlist } from "../Store/Slices/wishlistSlice";
import { fetchCart } from "../Store/Slices/cartSlice";
import { fetchUserData } from "../Store/Slices/userSlice";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            const userData = { uid: user.uid, ...userDoc.data() };
            setCurrentUser(userData);
            await dispatch(fetchUserWishlist(user.uid)).unwrap();
            await dispatch(fetchCart(user.uid)).unwrap();
            await dispatch(fetchUserData(user.uid)).unwrap();
          } else {
            console.error("User document not found for uid:", user.uid);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error.message);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [dispatch]);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, loading, logout, setCurrentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
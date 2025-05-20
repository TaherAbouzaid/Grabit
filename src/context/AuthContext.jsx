// // AuthContext.js
// import { createContext, useContext, useEffect, useState } from "react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth, db } from "../firebase/config";
// import { doc, getDoc } from "firebase/firestore";
// import { useDispatch } from "react-redux";
// import { syncLocalWishlistToFirestore } from "../Store/Slices/wishlistSlice";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//     const dispatch = useDispatch(); 


//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         const docRef = doc(db, "users", user.uid);
//         const userDoc = await getDoc(docRef);
//         if (userDoc.exists()) {
//           setCurrentUser({ uid: user.uid, ...userDoc.data() });
//           dispatch(syncLocalWishlistToFirestore(user.uid));

//         }
//       } else {
//         setCurrentUser(null);
//       }
//       setLoading(false);
//     });

//     return () => unsub();
//   }, [dispatch]);

//    const logout = async () => {
//     await signOut(auth);
//     setCurrentUser(null);
//   };

//   return (
// <AuthContext.Provider value={{ user: currentUser, loading, logout }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// // Custom Hook
// // export const useAuth = () => useContext(AuthContext);
// export function useAuth() {
//   return useContext(AuthContext);
// }

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { syncLocalWishlistToFirestore, fetchUserWishlist } from "../Store/Slices/wishlistSlice";
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
          console.log("Auth state changed, user:", user.uid);
          const docRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            const userData = { uid: user.uid, ...userDoc.data() };
            console.log("Fetched user data from Firestore:", userData);
            setCurrentUser(userData);
            // Sync local wishlist and fetch updated wishlist
            await dispatch(syncLocalWishlistToFirestore(user.uid)).unwrap();
            await dispatch(fetchUserWishlist(user.uid)).unwrap();
            await dispatch(fetchCart(user.uid)).unwrap();
            await dispatch(fetchUserData(user.uid)).unwrap();
          } else {
            console.error("User document not found for uid:", user.uid);
            setCurrentUser(null);
          }
        } else {
          console.log("No user logged in");
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
      console.log("Logging out user");
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
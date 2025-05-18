import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

// Utility function to convert Firestore Timestamps to strings
const convertTimestamps = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Object && "toDate" in obj) {
    return obj.toDate().toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestamps(item));
  }
  const result = {};
  for (const key in obj) {
    result[key] = convertTimestamps(obj[key]);
  }
  return result;
};


// Fetch user data from Firestore
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("Fetching user data for userId:", userId);
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef, { cache: "no-cache" });
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        console.log("Raw Firestore data:", JSON.stringify(rawData, null, 2));
        const userData = { id: docSnap.id, ...convertTimestamps(rawData) };
        console.log("Processed user data:", JSON.stringify(userData, null, 2));
        if (!userData.address) {
          console.warn("Address field is missing or undefined in userData:", userData);
        }
        return userData;
      } else {
        console.error("User data not found for userId:", userId);
        return rejectWithValue("User data not found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user by ID
export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (userId) => {
    const docRef = doc(db, 'Users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('User not found');
    }
  }
);

// Add new user
export const addUser = createAsyncThunk(
  'user/addUser',
  async ({ userId, userData }) => {
    const docRef = doc(db, 'Users', userId);
    await setDoc(docRef, userData); // ينشئ أو يستبدل المستند
    return { id: userId, ...userData };
  }
);

// Update existing user
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, userData }) => {
    const docRef = doc(db, 'Users', userId);
    await updateDoc(docRef, userData); // يحدث الحقول الموجودة فقط
    return { id: userId, ...userData };
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
  },
   reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    resetUserState: (state) => {
      state.userData = null;
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
          .addCase(fetchUserData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchUserById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(addUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
  },
});

export const {logoutUser, setCurrentUser, resetUserState } = userSlice.actions;
export default userSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { auth, db } from "../../firebase/config";
// import { doc, getDoc, setDoc, updateDoc, signOut } from "firebase/firestore";
// import { syncLocalWishlistToFirestore } from "./wishlistSlice";

// // Utility function to convert Firestore Timestamps to strings
// const convertTimestamps = (obj) => {
//   if (!obj || typeof obj !== "object") return obj;
//   if (obj instanceof Object && "toDate" in obj) {
//     return obj.toDate().toISOString();
//   }
//   if (Array.isArray(obj)) {
//     return obj.map((item) => convertTimestamps(item));
//   }
//   const result = {};
//   for (const key in obj) {
//     result[key] = convertTimestamps(obj[key]);
//   }
//   return result;
// };

// // Async thunk to sync authentication state
// export const syncAuthState = createAsyncThunk(
//   "user/syncAuthState",
//   async (_, { dispatch, rejectWithValue }) => {
//     try {
//       return new Promise((resolve) => {
//         const unsub = auth.onAuthStateChanged(async (user) => {
//           if (user) {
//             const docRef = doc(db, "users", user.uid);
//             const userDoc = await getDoc(docRef);
//             if (userDoc.exists()) {
//               const userData = { uid: user.uid, ...convertTimestamps(userDoc.data()) };
//               dispatch(syncLocalWishlistToFirestore(user.uid));
//               resolve(userData);
//             } else {
//               resolve(null); // User exists but no Firestore doc
//             }
//           } else {
//             resolve(null); // No user logged in
//           }
//         });
//         // Cleanup not needed here as we resolve immediately
//       });
//     } catch (error) {
//       console.error("Error syncing auth state:", error.message);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Async thunk to handle logout
// export const logoutUser = createAsyncThunk(
//   "user/logoutUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       await signOut(auth);
//       return null;
//     } catch (error) {
//       console.error("Error logging out:", error.message);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Fetch user data from Firestore
// export const fetchUserData = createAsyncThunk(
//   "user/fetchUserData",
//   async (userId, { rejectWithValue }) => {
//     try {
//       console.log("Fetching user data for userId:", userId);
//       const docRef = doc(db, "users", userId);
//       const docSnap = await getDoc(docRef, { cache: "no-cache" });
//       if (docSnap.exists()) {
//         const rawData = docSnap.data();
//         console.log("Raw Firestore data:", JSON.stringify(rawData, null, 2));
//         const userData = { id: docSnap.id, ...convertTimestamps(rawData) };
//         console.log("Processed user data:", JSON.stringify(userData, null, 2));
//         if (!userData.address) {
//           console.warn("Address field is missing or undefined in userData:", userData);
//         }
//         return userData;
//       } else {
//         console.error("User data not found for userId:", userId);
//         return rejectWithValue("User data not found");
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error.message);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Fetch user by ID
// export const fetchUserById = createAsyncThunk(
//   "user/fetchById",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const docRef = doc(db, "users", userId);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         return { id: docSnap.id, ...convertTimestamps(docSnap.data()) };
//       } else {
//         return rejectWithValue("User not found");
//       }
//     } catch (error) {
//       console.error("Error fetching user by ID:", error.message);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Add new user
// export const addUser = createAsyncThunk(
//   "user/addUser",
//   async ({ userId, userData }, { rejectWithValue }) => {
//     try {
//       const docRef = doc(db, "users", userId);
//       await setDoc(docRef, userData);
//       return { id: userId, ...userData };
//     } catch (error) {
//       console.error("Error adding user:", error.message);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Update existing user
// export const updateUser = createAsyncThunk(
//   "user/updateUser",
//   async ({ userId, userData }, { rejectWithValue }) => {
//     try {
//       const docRef = doc(db, "users", userId);
//       await updateDoc(docRef, userData);
//       return { id: userId, ...userData };
//     } catch (error) {
//       console.error("Error updating user:", error.message);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     currentUser: null,
//     userData: null,
//     loading: true,
//     error: null,
//     authError: null,
//   },
//   reducers: {
//     resetUserState: (state) => {
//       state.currentUser = null;
//       state.userData = null;
//       state.loading = false;
//       state.error = null;
//       state.authError = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Sync Auth State
//       .addCase(syncAuthState.pending, (state) => {
//         state.loading = true;
//         state.authError = null;
//       })
//       .addCase(syncAuthState.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentUser = action.payload;
//       })
//       .addCase(syncAuthState.rejected, (state, action) => {
//         state.loading = false;
//         state.authError = action.payload || "Failed to sync auth state";
//       })
//       // Logout
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.currentUser = null;
//         state.userData = null;
//         state.authError = null;
//       })
//       .addCase(logoutUser.rejected, (state, action) => {
//         state.authError = action.payload || "Failed to logout";
//       })
//       // Fetch User Data
//       .addCase(fetchUserData.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchUserData.fulfilled, (state, action) => {
//         state.loading = false;
//         state.userData = action.payload;
//       })
//       .addCase(fetchUserData.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || "Failed to fetch user data";
//       })
//       // Fetch User by ID
//       .addCase(fetchUserById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchUserById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentUser = action.payload;
//       })
//       .addCase(fetchUserById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || "Failed to fetch user by ID";
//       })
//       // Add User
//       .addCase(addUser.fulfilled, (state, action) => {
//         state.currentUser = action.payload;
//         state.userData = action.payload;
//       })
//       .addCase(addUser.rejected, (state, action) => {
//         state.error = action.payload || "Failed to add user";
//       })
//       // Update User
//       .addCase(updateUser.fulfilled, (state, action) => {
//         state.currentUser = action.payload;
//         state.userData = action.payload;
//       })
//       .addCase(updateUser.rejected, (state, action) => {
//         state.error = action.payload || "Failed to update user";
//       });
//   },
// });

// export const { resetUserState } = userSlice.actions;
// export default userSlice.reducer;
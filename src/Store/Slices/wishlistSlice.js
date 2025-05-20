


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { db } from "../../firebase/config";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   query,
//   doc,
//   deleteDoc,
// } from "firebase/firestore";
// import { increment, updateDoc, doc as docRef } from "firebase/firestore";

// // ✅ إضافة منتج إلى Firestore مع منع التكرار
// export const addToWishlist = createAsyncThunk(
//   "wishlist/addToWishlist",
//   async ({ product, userId }, thunkAPI) => {
//     try {
//       const wishlistRef = collection(db, "users", userId, "wishlist");
//       const q = query(wishlistRef);
//       const snapshot = await getDocs(q);
//       const exists = snapshot.docs.some(doc => doc.data().id === product.id);

//       if (exists) {
//         return thunkAPI.rejectWithValue("Product already in wishlist");
//       }

//       await addDoc(wishlistRef, product);

//       const productDocRef = docRef(db, "allproducts", product.id);
//       await updateDoc(productDocRef, {
//         wishlistCount: increment(1),
//       });

//       return product;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.message);
//     }
//   }
// );

// // ✅ مزامنة localStorage إلى Firestore عند تسجيل الدخول
// export const syncLocalWishlistToFirestore = createAsyncThunk(
//   "wishlist/syncLocal",
//   async (userId, thunkAPI) => {
//     try {
//       const localItems = JSON.parse(localStorage.getItem("wishlist")) || [];
//       const wishlistRef = collection(db, "users", userId, "wishlist");
//       const existingItems = await getDocs(wishlistRef);
//       const existingIds = existingItems.docs.map(doc => doc.data().id);

//       const newItems = localItems.filter(item => !existingIds.includes(item.id));

//       for (const product of newItems) {
//         await addDoc(wishlistRef, product);
//         const productDocRef = docRef(db, "allproducts", product.id);
//         await updateDoc(productDocRef, {
//           wishlistCount: increment(1),
//         });
//       }

//       localStorage.removeItem("wishlist");
//       return newItems;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.message);
//     }
//   }
// );

// // ✅ تحميل الـ wishlist من Firestore بعد تسجيل الدخول
// export const fetchUserWishlist = createAsyncThunk(
//   "wishlist/fetchUserWishlist",
//   async (userId, thunkAPI) => {
//     try {
//       const wishlistRef = collection(db, "users", userId, "wishlist");
//       const q = query(wishlistRef);
//       const snapshot = await getDocs(q);
//       const wishlist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       return wishlist;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.message);
//     }
//   }
// );

// // ✅ إزالة منتج من الـ wishlist
// export const removeFromWishlist = createAsyncThunk(
//   "wishlist/removeFromWishlist",
//   async ({ productId, userId }, thunkAPI) => {
//     try {
//       const wishlistRef = collection(db, "users", userId, "wishlist");
//       const snapshot = await getDocs(wishlistRef);

//       const targetDoc = snapshot.docs.find(doc => doc.data().id === productId);
//       if (targetDoc) {
//         await deleteDoc(doc(db, "users", userId, "wishlist", targetDoc.id));
//         const productDocRef = docRef(db, "allproducts", productId);
//         await updateDoc(productDocRef, {
//           wishlistCount: increment(-1),
//         });
//       }

//       return productId;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.message);
//     }
//   }
// );

// // ✅ الـ Slice نفسه
// const wishlistSlice = createSlice({
//   name: "wishlist",
//   initialState: {
//     items: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     // ✅ لو المستخدم مش عامل login مع منع التكرار
//     addToLocalWishlist(state, action) {
//       const exists = state.items.find(item => item.id === action.payload.id);
//       if (exists) {
//         state.error = "Product already in wishlist";
//       } else {
//         state.items.push(action.payload);
//         localStorage.setItem("wishlist", JSON.stringify(state.items));
//         state.error = null;
//       }
//     },
//     // ✅ تحميل wishlist من localStorage عند بداية التطبيق
//     loadLocalWishlist(state) {
//       const localItems = JSON.parse(localStorage.getItem("wishlist")) || [];
//       state.items = localItems;
//       state.error = null;
//     },
//     // ✅ إزالة منتج من localStorage
//     removeFromLocalWishlist(state, action) {
//       state.items = state.items.filter(item => item.id !== action.payload);
//       localStorage.setItem("wishlist", JSON.stringify(state.items));
//       state.error = null;
//     },
//     // ✅ تصفير الـ wishlist
//     clearWishlist(state) {
//       state.items = [];
//       localStorage.removeItem("wishlist");
//       state.error = null;
//     },
//   },
//   extraReducers: builder => {
//     builder
//       // ➕ إضافة ل Firestore
//       .addCase(addToWishlist.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addToWishlist.fulfilled, (state, action) => {
//         state.loading = false;
//         const exists = state.items.find(item => item.id === action.payload.id);
//         if (!exists) {
//           state.items.push(action.payload);
//         }
//         state.error = null;
//       })
//       .addCase(addToWishlist.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || action.error.message;
//       })
//       // 🔁 مزامنة localStorage إلى Firestore
//       .addCase(syncLocalWishlistToFirestore.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(syncLocalWishlistToFirestore.fulfilled, (state, action) => {
//         state.loading = false;
//         const newItems = action.payload.filter(
//           newItem => !state.items.find(item => item.id === newItem.id)
//         );
//         state.items.push(...newItems);
//         state.error = null;
//       })
//       .addCase(syncLocalWishlistToFirestore.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || action.error.message;
//       })
//       // 📥 تحميل wishlist من Firestore
//       .addCase(fetchUserWishlist.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchUserWishlist.fulfilled, (state, action) => {
//         state.loading = false;
//         state.items = action.payload;
//         state.error = null;
//       })
//       .addCase(fetchUserWishlist.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || action.error.message;
//       })
//       // 🗑️ إزالة من Firestore
//       .addCase(removeFromWishlist.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(removeFromWishlist.fulfilled, (state, action) => {
//         state.loading = false;
//         state.items = state.items.filter(item => item.id !== action.payload);
//         state.error = null;
//       })
//       .addCase(removeFromWishlist.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || action.error.message;
//       });
//   },
// });

// // ✅ Export actions
// export const {
//   addToLocalWishlist,
//   loadLocalWishlist,
//   removeFromLocalWishlist,
//   clearWishlist,
// } = wishlistSlice.actions;

// export default wishlistSlice.reducer;



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { increment, updateDoc, doc as docRef } from "firebase/firestore";

// Add product to Firestore wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ product, userId }, { rejectWithValue }) => {
    try {
      console.log("Adding to wishlist: userId=", userId, "productId=", product.id);
      const wishlistRef = collection(db, "users", userId, "wishlist");
      const q = query(wishlistRef);
      const snapshot = await getDocs(q);
      const exists = snapshot.docs.some(doc => doc.data().id === product.id);

      if (exists) {
        console.log("Product already in wishlist:", product.id);
        return rejectWithValue("Product already in wishlist");
      }

      const docRef = await addDoc(wishlistRef, product);
      console.log("Product added to wishlist, docId:", docRef.id);

      const productDocRef = docRef(db, "allproducts", product.id);
      await updateDoc(productDocRef, {
        wishlistCount: increment(1),
      });
      console.log("Incremented wishlistCount for product:", product.id);

      return { id: docRef.id, ...product };
    } catch (error) {
      console.error("Error adding to wishlist:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Sync localStorage wishlist to Firestore
export const syncLocalWishlistToFirestore = createAsyncThunk(
  "wishlist/syncLocal",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("Syncing local wishlist to Firestore for userId:", userId);
      const localItems = JSON.parse(localStorage.getItem("wishlist")) || [];
      const wishlistRef = collection(db, "users", userId, "wishlist");
      const existingItems = await getDocs(wishlistRef);
      const existingIds = existingItems.docs.map(doc => doc.data().id);

      const newItems = localItems.filter(item => !existingIds.includes(item.id));
      console.log("New items to sync:", newItems);

      for (const product of newItems) {
        const docRef = await addDoc(wishlistRef, product);
        console.log("Synced product to wishlist, docId:", docRef.id);
        const productDocRef = docRef(db, "allproducts", product.id);
        await updateDoc(productDocRef, {
          wishlistCount: increment(1),
        });
        console.log("Incremented wishlistCount for product:", product.id);
      }

      localStorage.removeItem("wishlist");
      console.log("Cleared localStorage wishlist");
      return newItems.map(item => ({ id: item.id, ...item }));
    } catch (error) {
      console.error("Error syncing wishlist:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch wishlist from Firestore
export const fetchUserWishlist = createAsyncThunk(
  "wishlist/fetchUserWishlist",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("Fetching wishlist for userId:", userId);
      const wishlistRef = collection(db, "users", userId, "wishlist");
      const q = query(wishlistRef);
      const snapshot = await getDocs(q);
      const wishlist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched wishlist:", wishlist);
      return wishlist;
    } catch (error) {
      console.error("Error fetching wishlist:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Remove product from Firestore wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ productId, userId }, { rejectWithValue }) => {
    try {
      console.log("Removing from wishlist: userId=", userId, "productId=", productId);
      const wishlistRef = collection(db, "users", userId, "wishlist");
      const snapshot = await getDocs(wishlistRef);

      const targetDoc = snapshot.docs.find(doc => doc.data().id === productId);
      if (targetDoc) {
        await deleteDoc(doc(db, "users", userId, "wishlist", targetDoc.id));
        console.log("Removed product from wishlist, docId:", targetDoc.id);
        const productDocRef = docRef(db, "allproducts", productId);
        await updateDoc(productDocRef, {
          wishlistCount: increment(-1),
        });
        console.log("Decremented wishlistCount for product:", productId);
      } else {
        console.log("Product not found in wishlist:", productId);
      }

      return productId;
    } catch (error) {
      console.error("Error removing from wishlist:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Wishlist slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    addToLocalWishlist(state, action) {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (exists) {
        state.error = "Product already in wishlist";
      } else {
        state.items.push(action.payload);
        localStorage.setItem("wishlist", JSON.stringify(state.items));
        state.error = null;
      }
    },
    loadLocalWishlist(state) {
      const localItems = JSON.parse(localStorage.getItem("wishlist")) || [];
      state.items = localItems;
      state.error = null;
    },
    removeFromLocalWishlist(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
      localStorage.setItem("wishlist", JSON.stringify(state.items));
      state.error = null;
    },
    clearWishlist(state) {
      state.items = [];
      localStorage.removeItem("wishlist");
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addToWishlist.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.items.find(item => item.id === action.payload.id);
        if (!exists) {
          state.items.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(syncLocalWishlistToFirestore.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncLocalWishlistToFirestore.fulfilled, (state, action) => {
        state.loading = false;
        const newItems = action.payload.filter(
          newItem => !state.items.find(item => item.id === newItem.id)
        );
        state.items.push(...newItems);
        state.error = null;
      })
      .addCase(syncLocalWishlistToFirestore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchUserWishlist.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchUserWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(removeFromWishlist.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  addToLocalWishlist,
  loadLocalWishlist,
  removeFromLocalWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
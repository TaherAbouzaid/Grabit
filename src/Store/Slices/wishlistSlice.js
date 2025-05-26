import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { incrementWishlistCount } from "../../services/productStatsService";

// دالة لتحويل كائنات Timestamp إلى تنسيق قابل للتسلسل
const convertTimestamps = (obj) => {
  if (!obj) return obj;

  // إذا كان كائن Timestamp
  if (obj && typeof obj.toDate === "function") {
    return obj.toDate().toISOString();
  }

  // إذا كان مصفوفة
  if (Array.isArray(obj)) {
    return obj.map((item) => convertTimestamps(item));
  }

  // إذا كان كائن عادي
  if (typeof obj === "object" && obj !== null) {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      // Check for Firebase Timestamp object specifically
      if (value && typeof value === "object" && value.toDate) {
        newObj[key] = value.toDate().toISOString();
      } else {
        newObj[key] = convertTimestamps(value);
      }
    });
    return newObj;
  }

  return obj;
};

// استرجاع قائمة المفضلة للمستخدم
export const fetchUserWishlist = createAsyncThunk(
  "wishlist/fetchUserWishlist",
  async (userId, { rejectWithValue }) => {
    try {
      const wishlistRef = doc(db, "wishlist", userId);
      const wishlistSnap = await getDoc(wishlistRef);

      if (wishlistSnap.exists()) {
        const items = wishlistSnap.data().items || [];
        return convertTimestamps(items); // تحويل كل عناصر المفضلة
      } else {
        await setDoc(wishlistRef, { items: [] });
        return [];
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return rejectWithValue(error.message);
    }
  }
);

// إضافة منتج إلى المفضلة
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ product, userId }, { rejectWithValue }) => {
    try {
      // تحويل المنتج قبل إضافته
      const serializedProduct = convertTimestamps(product);

      const wishlistRef = doc(db, "wishlist", userId);
      const wishlistSnap = await getDoc(wishlistRef);

      if (wishlistSnap.exists()) {
        const wishlistData = wishlistSnap.data();
        const isProductInWishlist = wishlistData.items.some(
          (item) => item.id === product.id
        );

        if (isProductInWishlist) {
          return rejectWithValue("Product already in wishlist");
        }

        await updateDoc(wishlistRef, {
          items: arrayUnion(serializedProduct),
        });
      } else {
        await setDoc(wishlistRef, {
          items: [serializedProduct],
        });
      }

      // زيادة عدد الإضافات للمفضلة
      await incrementWishlistCount(product.id);

      return serializedProduct;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// إزالة منتج من المفضلة
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ productId, userId }, { rejectWithValue }) => {
    try {
      const wishlistRef = doc(db, "wishlist", userId);
      // Fetch the current wishlist to get the exact object
      const wishlistSnap = await getDoc(wishlistRef);

      if (!wishlistSnap.exists()) {
        console.warn("Wishlist document not found for user:", userId);
        return rejectWithValue("Wishlist not found");
      }

      const wishlistData = wishlistSnap.data();
      const itemToRemove = wishlistData.items.find(
        (item) => item.id === productId
      );

      if (!itemToRemove) {
        console.warn("Product not found in wishlist for removal:", productId);
        return rejectWithValue("Product not found in wishlist");
      }

      console.log(
        "Attempting to remove item from Firestore array:",
        itemToRemove,
        "for user:",
        userId
      );

      await updateDoc(wishlistRef, {
        items: arrayRemove(itemToRemove),
      });

      console.log("Firestore arrayRemove triggered.");

      return productId;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return rejectWithValue(error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUserWishlist
      .addCase(fetchUserWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = convertTimestamps(action.payload);
        state.error = null;
      })
      .addCase(fetchUserWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addToWishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // Find index to avoid adding duplicate if somehow added during pending state
        const existingIndex = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (existingIndex === -1) {
          state.items.push(convertTimestamps(action.payload));
        }
        state.error = null;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // removeFromWishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default wishlistSlice.reducer;

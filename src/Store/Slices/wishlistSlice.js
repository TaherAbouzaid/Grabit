import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../firebase/config";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
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

// استرجاع قائمة المفضلة للمستخدم من users collection
export const fetchUserWishlist = createAsyncThunk(
  "wishlist/fetchUserWishlist",
  async (userId, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const wishlist = userSnap.data().wishlist || [];
        return convertTimestamps(wishlist);
      } else {
        return rejectWithValue("User document not found");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return rejectWithValue(error.message);
    }
  }
);

// إضافة منتج إلى المفضلة في users collection
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ product, userId }, { rejectWithValue }) => {
    try {
      // تنسيق المنتج ليتوافق مع الهيكلية المطلوبة
      const wishlistItem = {
        id: product.id,
        imageUrl: product.mainImage || product.imageUrl,
        price: product.price,
        title: {
          ar: product.title?.ar || product.title,
          en: product.title?.en || product.title
        }
      };

      const serializedItem = convertTimestamps(wishlistItem);

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const wishlist = userSnap.data().wishlist || [];
        const isProductInWishlist = wishlist.some(
          (item) => item.id === product.id
        );

        if (isProductInWishlist) {
          return rejectWithValue("Product already in wishlist");
        }

        await updateDoc(userRef, {
          wishlist: arrayUnion(serializedItem)
        });

        await incrementWishlistCount(product.id);

        return serializedItem;
      } else {
        return rejectWithValue("User document not found");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return rejectWithValue(error.message);
    }
  }
);

// إزالة منتج من المفضلة في users collection
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ productId, userId }, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return rejectWithValue("User document not found");
      }

      const wishlist = userSnap.data().wishlist || [];
      const itemToRemove = wishlist.find((item) => item.id === productId);

      if (!itemToRemove) {
        return rejectWithValue("Product not found in wishlist");
      }

      await updateDoc(userRef, {
        wishlist: arrayRemove(itemToRemove)
      });

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
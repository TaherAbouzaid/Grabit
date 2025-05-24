import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { incrementWishlistCount } from "../../services/productStatsService";

// دالة لتحويل كائنات Timestamp إلى تنسيق قابل للتسلسل
const convertTimestamps = (obj) => {
  if (!obj) return obj;
  
  // إذا كان كائن Timestamp
  if (obj && typeof obj.toDate === 'function') {
    return obj.toDate().toISOString();
  }
  
  // إذا كان مصفوفة
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestamps(item));
  }
  
  // إذا كان كائن عادي
  if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      newObj[key] = convertTimestamps(obj[key]);
    });
    return newObj;
  }
  
  return obj;
};

// استرجاع قائمة المفضلة للمستخدم
export const fetchUserWishlist = createAsyncThunk(
  'wishlist/fetchUserWishlist',
  async (userId, { rejectWithValue }) => {
    try {
      const wishlistRef = doc(db, 'wishlist', userId);
      const wishlistSnap = await getDoc(wishlistRef);
      
      if (wishlistSnap.exists()) {
        const items = wishlistSnap.data().items || [];
        return items.map(item => convertTimestamps(item)); // تحويل كل عناصر المفضلة
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
  'wishlist/addToWishlist',
  async ({ product, userId }, { rejectWithValue }) => {
    try {
      // تحويل المنتج قبل إضافته
      const serializedProduct = convertTimestamps(product);
      
      const wishlistRef = doc(db, 'wishlist', userId);
      const wishlistSnap = await getDoc(wishlistRef);
      
      if (wishlistSnap.exists()) {
        const wishlistData = wishlistSnap.data();
        const isProductInWishlist = wishlistData.items.some(item => item.id === product.id);
        
        if (isProductInWishlist) {
          return rejectWithValue("Product already in wishlist");
        }
        
        await updateDoc(wishlistRef, {
          items: arrayUnion(product)
        });
      } else {
        await setDoc(wishlistRef, {
          items: [product]
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
  'wishlist/removeFromWishlist',
  async ({ productId, userId }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const productToRemove = state.wishlist.items.find(item => item.id === productId);
      
      if (!productToRemove) {
        return rejectWithValue("Product not found in wishlist");
      }
      
      const wishlistRef = doc(db, 'wishlist', userId);
      
      await updateDoc(wishlistRef, {
        items: arrayRemove(productToRemove)
      });
      
      return productId;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return rejectWithValue(error.message);
    }
  }
);

// تحميل المفضلة المحلية (للمستخدمين غير المسجلين)
export const loadLocalWishlist = createAsyncThunk(
  'wishlist/loadLocalWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const localWishlist = localStorage.getItem('wishlist');
      return localWishlist ? JSON.parse(localWishlist) : [];
    } catch (error) {
      console.error("Error loading local wishlist:", error);
      return rejectWithValue(error.message);
    }
  }
);

// إضافة منتج إلى المفضلة المحلية
export const addToLocalWishlist = createAsyncThunk(
  'wishlist/addToLocalWishlist',
  async(product) => {
    try {
      // تحويل المنتج إلى كائن قابل للتسلسل
      const serializedProduct = convertTimestamps(product);
      
      // الحصول على المفضلة الحالية من localStorage
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      // التحقق مما إذا كان المنتج موجودًا بالفعل
      const isProductInWishlist = currentWishlist.some(item => item.id === product.id);
      
      if (!isProductInWishlist) {
        // إضافة المنتج إلى المفضلة
        const updatedWishlist = [...currentWishlist, serializedProduct];
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      }
      
      return serializedProduct;
    } catch (error) {
      console.error("Error adding to local wishlist:", error);
      throw error;
    }
  }
);

// إزالة منتج من المفضلة المحلية
export const removeFromLocalWishlist = createAsyncThunk(
  'wishlist/removeFromLocalWishlist',
  async (productId) => {
    try {
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const updatedWishlist = currentWishlist.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      return productId;
    } catch (error) {
      console.error("Error removing from local wishlist:", error);
      throw error;
    }
  }
);

// مزامنة المفضلة المحلية مع Firestore عند تسجيل الدخول
export const syncLocalWishlistToFirestore = createAsyncThunk(
  'wishlist/syncLocalWishlistToFirestore',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const localWishlist = state.wishlist.items;
      
      // إذا كانت المفضلة المحلية فارغة، لا داعي للمزامنة
      if (!localWishlist || localWishlist.length === 0) {
        return [];
      }
      
      const wishlistRef = doc(db, 'wishlist', userId);
      const wishlistSnap = await getDoc(wishlistRef);
      
      if (wishlistSnap.exists()) {
        // دمج المفضلة المحلية مع المفضلة في Firestore
        const firestoreWishlist = wishlistSnap.data().items || [];
        
        // إضافة المنتجات التي ليست موجودة بالفعل في Firestore
        const productsToAdd = localWishlist.filter(localItem => 
          !firestoreWishlist.some(firestoreItem => firestoreItem.id === localItem.id)
        );
        
        if (productsToAdd.length > 0) {
          // إضافة المنتجات الجديدة إلى Firestore
          for (const product of productsToAdd) {
            await updateDoc(wishlistRef, {
              items: arrayUnion(product)
            });
          }
        }
        
        // الحصول على المفضلة المحدثة من Firestore
        const updatedWishlistSnap = await getDoc(wishlistRef);
        const updatedWishlist = updatedWishlistSnap.data().items || [];
        
        // مسح المفضلة المحلية بعد المزامنة
        localStorage.removeItem('wishlist');
        
        return updatedWishlist;
      } else {
        // إنشاء وثيقة جديدة بالمفضلة المحلية
        await setDoc(wishlistRef, {
          items: localWishlist
        });
        
        // مسح المفضلة المحلية بعد المزامنة
        localStorage.removeItem('wishlist');
        
        return localWishlist;
      }
    } catch (error) {
      console.error("Error syncing local wishlist to Firestore:", error);
      return rejectWithValue(error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null
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
        state.items = action.payload;
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
        state.items.push(action.payload);
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
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // loadLocalWishlist
      .addCase(loadLocalWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLocalWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadLocalWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // addToLocalWishlist
      .addCase(addToLocalWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToLocalWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // التحقق مما إذا كان المنتج موجودًا بالفعل
        const isProductInWishlist = state.items.some(item => item.id === action.payload.id);
        if (!isProductInWishlist) {
          state.items.push(action.payload);
        }
      })
      .addCase(addToLocalWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // removeFromLocalWishlist
      .addCase(removeFromLocalWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromLocalWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(removeFromLocalWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // syncLocalWishlistToFirestore
      .addCase(syncLocalWishlistToFirestore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncLocalWishlistToFirestore.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(syncLocalWishlistToFirestore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default wishlistSlice.reducer;

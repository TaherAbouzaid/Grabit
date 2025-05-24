

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDocs, setDoc, updateDoc, addDoc, collection, query, where, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { incrementCartAdds } from "../../services/productStatsService";

// Fetch cart for a user
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        console.error("fetchCart: userId is undefined");
        return rejectWithValue("User ID is required");
      }
      const q = query(collection(db, "Cart"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { cartId: doc.id, ...doc.data() };
      } else {
        return { cartId: null, userId, products: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }
    } catch (error) {
      console.error("Error fetching cart:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Add product to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, price }, { getState, rejectWithValue }) => {
    try {
      // إذا كان المستخدم غير مسجل، استخدم التخزين المحلي
      if (!userId) {
        const localCart = getLocalCart();
        
        // التحقق من وجود المنتج في السلة المحلية
        const existingProduct = localCart.products.find(p => p.productId === productId);
        
        if (existingProduct) {
          // زيادة الكمية إذا كان المنتج موجود بالفعل
          const updatedProducts = localCart.products.map(p =>
            p.productId === productId
              ? {
                  ...p,
                  itemQuantity: p.itemQuantity + 1,
                  ItemsPrice: (p.itemQuantity + 1) * (p.ItemsPrice / p.itemQuantity),
                }
              : p
          );
          
          const updatedCart = {
            ...localCart,
            products: updatedProducts,
            updatedAt: new Date().toISOString(),
          };
          
          saveLocalCart(updatedCart);
          return updatedCart;
        } else {
          // إضافة منتج جديد
          const newProduct = {
            productId,
            itemQuantity: 1,
            ItemsPrice: price,
          };
          
          const updatedCart = {
            ...localCart,
            products: [...localCart.products, newProduct],
            updatedAt: new Date().toISOString(),
          };
          
          saveLocalCart(updatedCart);
          return updatedCart;
        }
      }
      
      // الكود الأصلي للمستخدمين المسجلين
      const state = getState();
      let cart = state.cart.items;
      let cartId = state.cart.items?.cartId;

      // Check if cart exists in Firestore
      if (!cartId) {
        const q = query(collection(db, "Cart"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          cartId = doc.id;
          cart = { cartId, ...doc.data() };
        }
      }

      // If no cart exists, initialize a new one
      if (!cart) {
        cart = { userId, products: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }

      // Check for duplicate product
      const existingProduct = cart.products.find(p => p.productId === productId);
      if (existingProduct) {
        const updatedProducts = cart.products.map(p =>
          p.productId === productId
            ? {
                ...p,
                itemQuantity: p.itemQuantity + 1,
                ItemsPrice: (p.itemQuantity + 1) * (p.ItemsPrice / p.itemQuantity),
              }
            : p
        );

        // Update existing cart
        const docRef = doc(db, "Cart", cartId);
        await setDoc(
          docRef,
          {
            userId,
            products: updatedProducts,
            createdAt: cart.createdAt,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return { cartId, userId, products: updatedProducts, createdAt: cart.createdAt, updatedAt: new Date().toISOString() };
      }

      // Add new product
      const newProduct = {
        productId,
        itemQuantity: 1,
        ItemsPrice: price,
      };
      const updatedProducts = [...cart.products, newProduct];

      if (!cartId) {
        // Create new cart document
        const docRef = await addDoc(collection(db, "Cart"), {
          userId,
          products: updatedProducts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        cartId = docRef.id;
      } else {
        // Update existing cart
        const docRef = doc(db, "Cart", cartId);
        await setDoc(
          docRef,
          {
            userId,
            products: updatedProducts,
            createdAt: cart.createdAt,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      // زيادة عدد الإضافات للسلة
      await incrementCartAdds(productId);

      return { cartId, userId, products: updatedProducts, createdAt: cart.createdAt, updatedAt: new Date().toISOString() };
    } catch (error) {
      console.error("Error adding to cart:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Update product quantity in cart
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ userId, productId, change }, { getState, rejectWithValue }) => {
    try {
      // إذا كان المستخدم غير مسجل، استخدم التخزين المحلي
      if (!userId) {
        const localCart = getLocalCart();
        
        const productIndex = localCart.products.findIndex(p => p.productId === productId);
        if (productIndex === -1) {
          return rejectWithValue("Product not found in cart");
        }
        
        const product = localCart.products[productIndex];
        const newQuantity = Math.max(1, product.itemQuantity + change);
        
        const updatedProducts = [...localCart.products];
        updatedProducts[productIndex] = {
          ...product,
          itemQuantity: newQuantity,
          ItemsPrice: (newQuantity * (product.ItemsPrice / product.itemQuantity)),
        };
        
        const updatedCart = {
          ...localCart,
          products: updatedProducts,
          updatedAt: new Date().toISOString(),
        };
        
        saveLocalCart(updatedCart);
        return updatedCart;
      }
      
      // الكود الأصلي للمستخدمين المسجلين
      if (!userId) {
        console.error("updateCartQuantity: userId is undefined");
        return rejectWithValue("User ID is required");
      }
      const state = getState();
      const cart = state.cart.items;
      const cartId = state.cart.items?.cartId;

      if (!cart || !cartId) {
        console.error("Cart not found for userId:", userId);
        return rejectWithValue("Cart not found");
      }

      const productIndex = cart.products.findIndex(p => p.productId === productId);
      if (productIndex === -1) {
        console.error("Product not found in cart:", productId);
        return rejectWithValue("Product not found in cart");
      }

      const product = cart.products[productIndex];
      const newQuantity = Math.max(1, product.itemQuantity + change);

      const updatedProducts = [...cart.products];
      updatedProducts[productIndex] = {
        ...product,
        itemQuantity: newQuantity,
        ItemsPrice: (newQuantity * (product.ItemsPrice / product.itemQuantity)),
      };

      const docRef = doc(db, "Cart", cartId);
      await updateDoc(docRef, {
        products: updatedProducts,
        updatedAt: new Date().toISOString(),
      });

      return { cartId, userId, products: updatedProducts, createdAt: cart.createdAt, updatedAt: new Date().toISOString() };
    } catch (error) {
      console.error("Error updating cart quantity:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Remove product from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ userId, productId }, { getState, rejectWithValue }) => {
    try {
      // إذا كان المستخدم غير مسجل، استخدم التخزين المحلي
      if (!userId) {
        const localCart = getLocalCart();
        
        const updatedProducts = localCart.products.filter(p => p.productId !== productId);
        
        const updatedCart = {
          ...localCart,
          products: updatedProducts,
          updatedAt: new Date().toISOString(),
        };
        
        saveLocalCart(updatedCart);
        return updatedCart;
      }
      
      // الكود الأصلي للمستخدمين المسجلين
      if (!userId) {
        console.error("removeFromCart: userId is undefined");
        return rejectWithValue("User ID is required");
      }
      const state = getState();
      const cart = state.cart.items;
      const cartId = state.cart.items?.cartId;

      if (!cart || !cartId) {
        console.error("Cart not found for userId:", userId);
        return rejectWithValue("Cart not found");
      }

      const updatedProducts = cart.products.filter(p => p.productId !== productId);

      const docRef = doc(db, "Cart", cartId);
      await updateDoc(docRef, {
        products: updatedProducts,
        updatedAt: new Date().toISOString(),
      });

      return { cartId, userId, products: updatedProducts, createdAt: cart.createdAt, updatedAt: new Date().toISOString() };
    } catch (error) {
      console.error("Error removing from cart:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Clear cart after order
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue }) => {
    const maxRetries = 3;
    let attempt = 1;

    while (attempt <= maxRetries) {
      try {
        const q = query(collection(db, "Cart"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const cartDoc = querySnapshot.docs[0];
          const cartRef = doc(db, "Cart", cartDoc.id);
          
          await updateDoc(cartRef, {
            products: [],
            updatedAt: new Date().toISOString(),
          });

          // Verify the update
          const updatedCartDoc = await getDoc(cartRef, { source: "server" });
          
          if (updatedCartDoc.exists() && updatedCartDoc.data().products?.length === 0) {
            return { userId, products: [], cartId: cartDoc.id };
          } else {
            throw new Error("Failed to clear cart products");
          }
        } else {
          const docRef = await addDoc(collection(db, "Cart"), {
            userId,
            products: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return { userId, products: [], cartId: docRef.id };
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          console.error("Max retries reached, failing clearCart");
          return rejectWithValue(`Failed to clear cart products: ${error.message}`);
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
);

// إضافة دوال للتعامل مع السلة المحلية
const getLocalCart = () => {
  try {
    const localCart = localStorage.getItem('localCart');
    return localCart ? JSON.parse(localCart) : { products: [] };
  } catch (error) {
    console.error("Error getting local cart:", error);
    return { products: [] };
  }
};

const saveLocalCart = (cart) => {
  try {
    localStorage.setItem('localCart', JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving local cart:", error);
  }
};

// إضافة دالة fetchLocalCart
export const fetchLocalCart = createAsyncThunk(
  "cart/fetchLocalCart",
  async (_, { rejectWithValue }) => {
    try {
      const localCart = getLocalCart();
      return localCart;
    } catch (error) {
      console.error("Error fetching local cart:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: null,
    loading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addToCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateCartQuantity.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(removeFromCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(clearCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = { ...state.items, ...action.payload };
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default cartSlice.reducer;

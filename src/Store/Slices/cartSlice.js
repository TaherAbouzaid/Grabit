

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDocs, setDoc, updateDoc, addDoc, collection, query, where, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

// Fetch cart for a user
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        console.log("fetchCart: userId is undefined");
        return rejectWithValue("User ID is required");
      }
      console.log("Fetching cart for userId:", userId);
      const q = query(collection(db, "Cart"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        console.log("Cart found with cartId:", doc.id);
        return { cartId: doc.id, ...doc.data() };
      } else {
        console.log("No cart found for userId:", userId);
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
      if (!userId) {
        console.log("addToCart: userId is undefined");
        return rejectWithValue("User ID is required");
      }
      console.log("Adding to cart: userId=", userId, "productId=", productId, "price=", price);
      const state = getState();
      let cart = state.cart.items;
      let cartId = state.cart.items?.cartId;

      // Check if cart exists in Firestore
      if (!cartId) {
        console.log("Checking for existing cart in Firestore for userId:", userId);
        const q = query(collection(db, "Cart"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          cartId = doc.id;
          cart = { cartId, ...doc.data() };
          console.log("Existing cart found with cartId:", cartId);
        }
      }

      // If no cart exists, initialize a new one
      if (!cart) {
        cart = { userId, products: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }

      // Check for duplicate product
      const existingProduct = cart.products.find(p => p.productId === productId);
      if (existingProduct) {
        console.log("Product already in cart, incrementing quantity:", productId);
        const updatedProducts = cart.products.map(p =>
          p.productId === productId
            ? {
                ...p,
                itemQuantity: p.itemQuantity + 1,
                ItemsPrice: (p.itemQuantity + 1) * (p.ItemsPrice / p.itemQuantity),
              }
            : p
        );
        console.log("Updated products with incremented quantity:", updatedProducts);

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
        console.log("Cart updated with incremented quantity, cartId:", cartId);

        return { cartId, userId, products: updatedProducts, createdAt: cart.createdAt, updatedAt: new Date().toISOString() };
      }

      // Add new product
      const newProduct = {
        productId,
        itemQuantity: 1,
        ItemsPrice: price,
      };
      const updatedProducts = [...cart.products, newProduct];
      console.log("Updated products with new product:", updatedProducts);

      if (!cartId) {
        // Create new cart document
        console.log("Creating new cart for userId:", userId);
        const docRef = await addDoc(collection(db, "Cart"), {
          userId,
          products: updatedProducts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        cartId = docRef.id;
        console.log("New cart created with cartId:", cartId);
      } else {
        // Update existing cart
        console.log("Updating existing cart with cartId:", cartId);
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
        console.log("Cart updated with new product, cartId:", cartId);
      }

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
      if (!userId) {
        console.log("updateCartQuantity: userId is undefined");
        return rejectWithValue("User ID is required");
      }
      console.log("Updating quantity: userId=", userId, "productId=", productId, "change=", change);
      const state = getState();
      const cart = state.cart.items;
      const cartId = state.cart.items?.cartId;

      if (!cart || !cartId) {
        console.log("Cart not found for userId:", userId);
        return rejectWithValue("Cart not found");
      }

      const product = cart.products.find(p => p.productId === productId);
      if (!product) {
        console.log("Product not found in cart:", productId);
        return rejectWithValue("Product not found in cart");
      }

      const newQuantity = Math.max(product.itemQuantity + change, 1);
      const updatedProducts = cart.products.map(p =>
        p.productId === productId
          ? { ...p, itemQuantity: newQuantity, ItemsPrice: newQuantity * (p.ItemsPrice / p.itemQuantity) }
          : p
      );

      console.log("Updating cart with cartId:", cartId, "New products:", updatedProducts);
      const docRef = doc(db, "Cart", cartId);
      await updateDoc(docRef, {
        products: updatedProducts,
        updatedAt: new Date().toISOString(),
      });

      return { cartId, userId, products: updatedProducts, createdAt: cart.createdAt, updatedAt: new Date().toISOString() };
    } catch (error) {
      console.error("Error updating quantity:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Remove product from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ userId, productId }, { getState, rejectWithValue }) => {
    try {
      if (!userId) {
        console.log("removeFromCart: userId is undefined");
        return rejectWithValue("User ID is required");
      }
      console.log("Removing from cart: userId=", userId, "productId=", productId);
      const state = getState();
      const cart = state.cart.items;
      const cartId = state.cart.items?.cartId;

      if (!cart || !cartId) {
        console.log("Cart not found for userId:", userId);
        return rejectWithValue("Cart not found");
      }

      const updatedProducts = cart.products.filter(p => p.productId !== productId);

      console.log("Updating cart with cartId:", cartId, "New products:", updatedProducts);
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

// clear after order
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue }) => {
    const maxRetries = 3;
    let attempt = 1;

    while (attempt <= maxRetries) {
      try {
        console.log(`Attempt ${attempt}: Clearing cart products for userId: ${userId}`);
        const q = query(collection(db, "Cart"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const cartDoc = querySnapshot.docs[0];
          const cartRef = doc(db, "Cart", cartDoc.id);
          console.log("Cart reference path:", cartRef.path);
          const cartSnap = await getDoc(cartRef, { source: "server" });
          console.log("Cart before clearing (from server):", JSON.stringify(cartSnap.exists() ? cartSnap.data() : null, null, 2));
          
          console.log("Updating cart to clear products for userId:", userId);
          await updateDoc(cartRef, {
            products: [],
            updatedAt: new Date().toISOString(),
          });
          console.log("Cart products cleared successfully for userId:", userId);

          // Verify the update
          const updatedCartDoc = await getDoc(cartRef, { source: "server" });
          console.log("Cart after clearing (from server):", JSON.stringify(updatedCartDoc.exists() ? updatedCartDoc.data() : null, null, 2));
          
          if (updatedCartDoc.exists() && updatedCartDoc.data().products?.length === 0) {
            return { userId, products: [], cartId: cartDoc.id };
          } else {
            throw new Error("Failed to clear cart products");
          }
        } else {
          console.log("No cart document found, creating empty cart for userId:", userId);
          const docRef = await addDoc(collection(db, "Cart"), {
            userId,
            products: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log("Empty cart created with cartId:", docRef.id);
          return { userId, products: [], cartId: docRef.id };
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          console.error("Max retries reached, failing clearCart");
          return rejectWithValue(`Failed to clear cart products: ${error.message}`);
        }
        attempt++;
        console.log(`Waiting 1 second before retry ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
);





// export const clearCart = createAsyncThunk(
//   "cart/clearCart",
//   async (userId, { rejectWithValue }) => {
//     const maxRetries = 3;
//     let attempt = 1;

//     while (attempt <= maxRetries) {
//       try {
//         console.log(`Attempt ${attempt}: Clearing cart for userId: ${userId}`);
//         const q = query(collection(db, "Cart"), where("userId", "==", userId));
//         const querySnapshot = await getDocs(q);
        
//         if (!querySnapshot.empty) {
//           const cartDoc = querySnapshot.docs[0];
//           const cartRef = doc(db, "Cart", cartDoc.id);
//           console.log("Cart reference path:", cartRef.path);
//           console.log("Cart before clearing (from server):", JSON.stringify(cartDoc.data(), null, 2));
          
//           console.log("Deleting cart document for userId:", userId);
//           await deleteDoc(cartRef);
//           console.log("Cart document deleted successfully for userId:", userId);

//           // Verify the deletion
//           const updatedCartDoc = await getDoc(cartRef, { source: "server" });
//           console.log("Cart after clearing (from server):", JSON.stringify(updatedCartDoc.exists() ? updatedCartDoc.data() : null, null, 2));
          
//           if (!updatedCartDoc.exists()) {
//             return { userId, products: [], cartId: null };
//           } else {
//             throw new Error("Failed to delete cart document");
//           }
//         } else {
//           console.log("No cart document found for userId:", userId);
//           return { userId, products: [], cartId: null };
//         }
//       } catch (error) {
//         console.error(`Attempt ${attempt} failed:`, error.message);
//         if (attempt === maxRetries) {
//           console.error("Max retries reached, failing clearCart");
//           return rejectWithValue(`Failed to clear cart: ${error.message}`);
//         }
//         attempt++;
//         console.log(`Waiting 1 second before retry ${attempt}...`);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//     }
//   }
// );




const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: null,
    loading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Add to cart
      .addCase(addToCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update quantity
      .addCase(updateCartQuantity.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Remove from cart
      .addCase(removeFromCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
        // Clear car
    .addCase(clearCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, state => {
        state.loading = false;
        state.items = { ...state.items, products: [] };
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
  },
});

export default cartSlice.reducer;
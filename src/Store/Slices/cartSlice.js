import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  doc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { incrementCartAdds } from "../../services/productStatsService";

// دالة شاملة لتحويل جميع كائنات Timestamp في أي مستوى من التداخل
const serializeTimestamps = (data) => {
  if (!data) return data;

  // تحويل كائن Timestamp
  if (data && typeof data.toDate === "function") {
    return data.toDate().toISOString();
  }

  // تحويل كائن Timestamp بتنسيق Firestore (seconds, nanoseconds)
  if (
    data &&
    typeof data === "object" &&
    "seconds" in data &&
    "nanoseconds" in data
  ) {
    return new Date(
      data.seconds * 1000 + data.nanoseconds / 1000000
    ).toISOString();
  }

  // تحويل المصفوفات
  if (Array.isArray(data)) {
    return data.map((item) => serializeTimestamps(item));
  }

  // تحويل الكائنات
  if (typeof data === "object" && data !== null) {
    const result = {};
    for (const key in data) {
      result[key] = serializeTimestamps(data[key]);
    }
    return result;
  }

  return data;
};

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
        const cartData = doc.data();
        // Ensure products array and each product has necessary numeric fields
        const products = cartData.products
          ? cartData.products.map((item) => ({
              ...item,
              ItemsPrice:
                typeof item.ItemsPrice === "number" ? item.ItemsPrice : 0, // Default to 0 if missing or not a number
              itemQuantity:
                typeof item.itemQuantity === "number" && item.itemQuantity > 0
                  ? item.itemQuantity
                  : 1, // Default to 1 if missing, not a number, or zero
            }))
          : [];
        return serializeTimestamps({ cartId: doc.id, ...cartData, products });
      } else {
        return {
          cartId: null,
          userId,
          products: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
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
  async (cartItem, { getState, rejectWithValue }) => {
    try {
      // تحويل البيانات بالكامل قبل استخدامها
      const serializedCartItem = serializeTimestamps(cartItem);

      // استخدام البيانات المحولة
      const { userId, productId, variantId } = serializedCartItem;

      // إذا كان المستخدم غير مسجل، استخدم التخزين المحلي
      if (!userId) {
        const localCart = getLocalCart();

        // التحقق من وجود المنتج في السلة المحلية بناءً على productId و variantId
        const existingProductIndex = localCart.products.findIndex(
          (p) =>
            p.productId === productId &&
            (variantId ? p.variantId === variantId : !p.variantId)
        );

        if (existingProductIndex > -1) {
          // زيادة الكمية إذا كان المنتج موجود بالفعل
          const existingProduct = localCart.products[existingProductIndex];
          const updatedProducts = [...localCart.products];
          updatedProducts[existingProductIndex] = {
            ...existingProduct,
            itemQuantity: existingProduct.itemQuantity + 1,
            // Keep the existing ItemsPrice calculation logic
            ItemsPrice:
              (existingProduct.itemQuantity + 1) *
              (existingProduct.ItemsPrice / existingProduct.itemQuantity),
          };

          // Clean up undefined values before saving to local storage and replace the old product
          const cleanedUpdatedProductLocal = Object.fromEntries(
            Object.entries(updatedProducts[existingProductIndex]).filter(
              ([, v]) => v !== undefined
            )
          );
          const finalProductsLocal = updatedProducts.map((product, index) =>
            index === existingProductIndex
              ? cleanedUpdatedProductLocal
              : product
          );

          const updatedCart = {
            ...localCart,
            products: finalProductsLocal,
            updatedAt: new Date().toISOString(),
          };

          saveLocalCart(updatedCart);
          return updatedCart;
        } else {
          // إضافة منتج جديد مع جميع تفاصيله (بما في ذلك تفاصيل المتغير إن وجدت)
          const newProduct = {
            ...cartItem, // Include all properties from the incoming cartItem
            itemQuantity: 1,
            ItemsPrice: cartItem.price, // Use the price from cartItem for initial addition
            title: cartItem.title,
            // Ensure variantId and variantAttributes are null if undefined
            variantId: cartItem.variantId || null,
            variantAttributes: cartItem.variantAttributes || null,
            quantity: cartItem.quantity || 0, // Ensure quantity is included
            originalPrice: cartItem.originalPrice || cartItem.price, // Ensure originalPrice is included
          };

          // Clean up undefined values before saving to local storage
          const cleanedNewProductLocal = Object.fromEntries(
            Object.entries(newProduct).filter(([, v]) => v !== undefined)
          );

          const updatedCart = {
            ...localCart,
            products: [...localCart.products, cleanedNewProductLocal],
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
        cart = {
          userId,
          products: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Check for duplicate product (based on productId and variantId)
      const existingProductIndex = cart.products.findIndex(
        (p) =>
          p.productId === productId &&
          (variantId ? p.variantId === variantId : !p.variantId)
      );

      if (existingProductIndex > -1) {
        // Update existing product quantity
        const existingProduct = cart.products[existingProductIndex];
        const updatedProducts = [...cart.products];
        updatedProducts[existingProductIndex] = {
          ...existingProduct,
          itemQuantity: existingProduct.itemQuantity + 1,
          // Keep the existing ItemsPrice calculation logic
          ItemsPrice:
            (existingProduct.itemQuantity + 1) *
            (existingProduct.ItemsPrice / existingProduct.itemQuantity),
        };

        // Clean up undefined values before saving to Firestore and replace the old product
        const cleanedUpdatedProductFirestore = Object.fromEntries(
          Object.entries(updatedProducts[existingProductIndex]).filter(
            ([, v]) => v !== undefined
          )
        );
        const finalProductsFirestore = updatedProducts.map((product, index) =>
          index === existingProductIndex
            ? cleanedUpdatedProductFirestore
            : product
        );

        // Update existing cart
        const docRef = doc(db, "Cart", cartId);
        await setDoc(
          docRef,
          {
            userId,
            products: finalProductsFirestore,
            createdAt: cart.createdAt,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        return {
          cartId,
          userId,
          products: finalProductsFirestore,
          createdAt: cart.createdAt,
          updatedAt: new Date().toISOString(),
        };
      }

      // Add new product with all its details (including variant details if any)
      const newProduct = {
        ...cartItem, // Include all properties from the incoming cartItem
        itemQuantity: 1,
        ItemsPrice: cartItem.price, // Use the price from cartItem for initial addition
        title: cartItem.title,
        // Ensure variantId and variantAttributes are null if undefined
        variantId: cartItem.variantId || null,
        variantAttributes: cartItem.variantAttributes || null,
        quantity: cartItem.quantity || 0, // Ensure quantity is included
        originalPrice: cartItem.originalPrice || cartItem.price, // Ensure originalPrice is included
      };
      const updatedProducts = [...cart.products, newProduct];

      // Clean up undefined values before saving to Firestore
      const cleanedNewProductFirestore = Object.fromEntries(
        Object.entries(newProduct).filter(([, v]) => v !== undefined)
      );

      if (!cartId) {
        // Create new cart document
        const docRef = await addDoc(collection(db, "Cart"), {
          userId,
          products: [cleanedNewProductFirestore],
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
            products: [
              ...cart.products.map((product) =>
                Object.fromEntries(
                  Object.entries(product).filter(([, v]) => v !== undefined)
                )
              ),
              cleanedNewProductFirestore,
            ],
            createdAt: cart.createdAt,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      // زيادة عدد الإضافات للسلة
      await incrementCartAdds(productId);

      return {
        cartId,
        userId,
        products: updatedProducts,
        createdAt: cart.createdAt,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error adding to cart:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Update product quantity in cart
export const updateCartQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (
    { userId, productId, variantId, change },
    { getState, rejectWithValue }
  ) => {
    try {
      // إذا كان المستخدم غير مسجل، استخدم التخزين المحلي
      if (!userId) {
        const localCart = getLocalCart();

        // Find product index based on productId and variantId
        const productIndex = localCart.products.findIndex(
          (p) =>
            p.productId === productId &&
            (variantId ? p.variantId === variantId : !p.variantId)
        );

        if (productIndex === -1) {
          return rejectWithValue("Product not found in cart");
        }

        const product = localCart.products[productIndex];
        const newQuantity = Math.max(1, product.itemQuantity + change);

        const updatedProducts = [...localCart.products];
        updatedProducts[productIndex] = {
          ...product,
          itemQuantity: newQuantity,
          ItemsPrice: newQuantity * (product.ItemsPrice / product.itemQuantity),
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

      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId === productId &&
          (variantId ? p.variantId === variantId : !p.variantId)
      );
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
        ItemsPrice: newQuantity * (product.ItemsPrice / product.itemQuantity),
      };

      const docRef = doc(db, "Cart", cartId);
      await updateDoc(docRef, {
        products: updatedProducts,
        updatedAt: new Date().toISOString(),
      });

      return {
        cartId,
        userId,
        products: updatedProducts,
        createdAt: cart.createdAt,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error updating cart quantity:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Remove product from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ userId, productId, variantId }, { getState, rejectWithValue }) => {
    try {
      // إذا كان المستخدم غير مسجل، استخدم التخزين المحلي
      if (!userId) {
        const localCart = getLocalCart();

        // Filter products based on productId and variantId
        const updatedProducts = localCart.products.filter(
          (p) =>
            !(
              p.productId === productId &&
              (variantId ? p.variantId === variantId : !p.variantId)
            )
        );

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

      const updatedProducts = cart.products.filter(
        (p) =>
          !(
            p.productId === productId &&
            (variantId ? p.variantId === variantId : !p.variantId)
          )
      );

      const docRef = doc(db, "Cart", cartId);
      await updateDoc(docRef, {
        products: updatedProducts,
        updatedAt: new Date().toISOString(),
      });

      return {
        cartId,
        userId,
        products: updatedProducts,
        createdAt: cart.createdAt,
        updatedAt: new Date().toISOString(),
      };
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

          if (
            updatedCartDoc.exists() &&
            updatedCartDoc.data().products?.length === 0
          ) {
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
          return rejectWithValue(
            `Failed to clear cart products: ${error.message}`
          );
        }
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
);

// إضافة دوال للتعامل مع السلة المحلية
const getLocalCart = () => {
  try {
    const localCart = localStorage.getItem("localCart");
    return localCart ? JSON.parse(localCart) : { products: [] };
  } catch (error) {
    console.error("Error getting local cart:", error);
    return { products: [] };
  }
};

const saveLocalCart = (cart) => {
  try {
    localStorage.setItem("localCart", JSON.stringify(cart));
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = serializeTimestamps(action.payload);
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = serializeTimestamps(action.payload);
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = serializeTimestamps(action.payload);
        state.error = null;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = serializeTimestamps(action.payload);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = {
          ...state.items,
          ...serializeTimestamps(action.payload),
        };
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default cartSlice.reducer;

// دالة مساعدة لتحويل جميع كائنات Timestamp
function convertAllTimestamps(obj) {
  if (!obj) return obj;

  // إذا كان الكائن نفسه هو Timestamp
  if (obj && typeof obj.toDate === "function") {
    return obj.toDate().toISOString();
  }

  // إذا كان مصفوفة
  if (Array.isArray(obj)) {
    return obj.map((item) => convertAllTimestamps(item));
  }

  // إذا كان كائن عادي
  if (typeof obj === "object" && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = convertAllTimestamps(obj[key]);
    }
    return newObj;
  }

  // إرجاع القيمة كما هي إذا لم تكن كائن
  return obj;
}

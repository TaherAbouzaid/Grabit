// features/products/productsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config"; 


// Utility function to convert Firestore Timestamps to strings
const convertTimestamps = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Object && "toDate" in obj) {
    return obj.toDate().toISOString(); // Convert Timestamp to ISO string
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




// Fetch all products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching all products from allproducts collection");
      const querySnapshot = await getDocs(collection(db, "allproducts"));
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data()),
      }));
      console.log("Fetched products:", products);
      return products;
    } catch (error) {
      console.error("Error fetching products:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch product by ID
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId, { rejectWithValue }) => {
    try {
      console.log("Fetching product with ID:", productId);
      const docRef = doc(db, "allproducts", productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const product = { id: docSnap.id, ...convertTimestamps(docSnap.data()) };
        console.log("Fetched product:", product);
        return product;
      } else {
        console.error("Product not found for ID:", productId);
        return rejectWithValue("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error.message);
      return rejectWithValue(error.message);
    }
  }
);



export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchByCategory',
  async (categoryId) => {
    const productsRef = collection(db, "allproducts"); 
    const querySnapshot = await getDocs(productsRef);
    
    const filteredProducts = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product => product.categoryId?.categoryId === categoryId); // ✅ تعديل هنا
    
    return filteredProducts;
  }
);


const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductsByCategory.pending, state => {
        state.loading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
        // Fetch product by ID
      .addCase(fetchProductById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
        // Add to items if not already present
        if (!state.items.find(item => item.id === action.payload.id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });



  },
});

export default productsSlice.reducer;

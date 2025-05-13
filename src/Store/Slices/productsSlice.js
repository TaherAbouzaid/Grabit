// features/products/productsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/config"; 

export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  const snapshot = await getDocs(collection(db, "allproducts"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

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
      });



  },
});

export default productsSlice.reducer;

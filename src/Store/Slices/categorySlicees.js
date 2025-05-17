// src/Store/Slices/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const fetchCategoriesWithSub = createAsyncThunk(
  'categories/fetchAll',
  async () => {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const subcategoriesObj = {};
    for (const category of categoriesData) {
      const subSnapshot = await getDocs(
        query(collection(db, 'subcategories'), where('parentCategoryId', '==', category.id))
      );
      subcategoriesObj[category.id] = subSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return { categories: categoriesData, subcategories: subcategoriesObj };
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    subcategories: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesWithSub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesWithSub.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.subcategories = action.payload.subcategories;
        state.loading = false;
      })
      .addCase(fetchCategoriesWithSub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categorySlice.reducer;

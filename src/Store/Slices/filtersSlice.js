
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  category: null,
  subcategory: null,
  priceRange: [0, 1000],
  tags: [],
  searchQuery: '',
};

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
      state.subcategory = null;
    },
    setSubcategory: (state, action) => {
      state.subcategory = action.payload;
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    toggleTag: (state, action) => {
      const tag = action.payload;
      if (state.tags.includes(tag)) {
        state.tags = state.tags.filter((t) => t !== tag);
      } else {
        state.tags.push(tag);
      }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setCategory, setSubcategory, setPriceRange, toggleTag, setSearchQuery } = filterSlice.actions;
export default filterSlice.reducer;
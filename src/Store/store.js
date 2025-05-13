import { configureStore } from "@reduxjs/toolkit";
import filterReducer from './Slices/filtersSlice';
import productReducer from './Slices/productsSlice';

const store = configureStore({
  reducer: {
    filter: filterReducer,
    products: productReducer,
  },
});

export default store;
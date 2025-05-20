import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from './Slices/categorySlicees';
import cartReducer from './Slices/cartSlice';
import wishlistReducer from './Slices/wishlistSlice';
import authReducer from './Slices/authSlice';

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
  },
}); 
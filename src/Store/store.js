import { configureStore } from "@reduxjs/toolkit";
import filterReducer from './Slices/filtersSlice';
import productReducer from './Slices/productsSlice';
import userReducer from '../store/Slices/userSlice';
import wishlistReducer from '../store/Slices/wishlistSlice';
import cartReducer from './Slices/cartSlice';
import categoryReducer from './Slices/categorySlicees';
import reviewReducer from './Slices/reviewSlice';
import offerReducer from './Slices/offerSlice';

const store = configureStore({
  reducer: {
    filter: filterReducer,
    products: productReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    categories: categoryReducer,
    reviews: reviewReducer,
    offers: offerReducer
  },
});
export default store;

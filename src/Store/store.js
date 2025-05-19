import { configureStore } from "@reduxjs/toolkit";
import filterReducer from './Slices/filtersSlice';
import productReducer from './Slices/productsSlice';
import userReducer from './Slices/userSlice';
import wishlistReducer from './Slices/wishlistSlice';
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
console.log("Redux store initialized:", store.getState());
export default store;
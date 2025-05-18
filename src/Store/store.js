import { configureStore } from "@reduxjs/toolkit";
import filterReducer from './Slices/filtersSlice';
import productReducer from './Slices/productsSlice';
import userReducer from './Slices/userSlice';
import wishlistReducer from './Slices/wishlistSlice';
import cartReducer from './Slices/cartSlice';
import categoryReducer from './Slices/categorySlicees';



const store = configureStore({
  reducer: {
    filter: filterReducer,
    products: productReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    categories: categoryReducer,



  },
});
console.log("Redux store initialized:", store.getState());
export default store;
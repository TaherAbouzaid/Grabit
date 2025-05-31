import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "../Store/Slices/filtersSlice";
import productReducer from "../Store/Slices/productsSlice";
import userReducer from "../Store/Slices/userSlice";
import wishlistReducer from "../Store/Slices/wishlistSlice";
import cartReducer from "../Store/Slices/cartSlice";
import categoryReducer from "../Store/Slices/categorySlicees";
import reviewReducer from "../Store/Slices/reviewSlice";
import offerReducer from "./Slices/offerSlice";

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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // تجاهل الإجراءات المتعلقة بالسلة
        ignoredActions: [
          'cart/addToCart/fulfilled',
          'cart/fetchCart/fulfilled'
        ],
        // تجاهل المسارات المحددة التي تحتوي على Timestamps
        ignoredPaths: [
          'cart.items.products.*.brandId.createdAt',
          'cart.items.products.*.brandId.updatedAt',
          'cart.items.products.*.subCategoryId.createdAt',
          'cart.items.products.*.subCategoryId.updatedAt',
          // إضافة مسارات أخرى قد تحتوي على Timestamps
          'products.*.brandId.createdAt',
          'products.*.brandId.updatedAt',
          'products.*.subCategoryId.createdAt',
          'products.*.subCategoryId.updatedAt'
        ],
      },
    }),
});
export default store;

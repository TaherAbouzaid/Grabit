import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "../Slices/filtersSlice";
import productReducer from "../Slices/productsSlice";
import userReducer from "../Slices/userSlice";
import wishlistReducer from "../Slices/wishlistSlice";
import cartReducer from "../Slices/cartSlice";
import categoryReducer from "../Slices/categorySlicees";
import reviewReducer from "../Slices/reviewSlice";
import offerReducer from "../Slices/offerSlice";

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

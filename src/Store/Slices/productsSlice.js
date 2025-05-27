// features/products/productsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";

// Utility function to convert Firestore Timestamps to strings
const convertTimestamps = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Object && "toDate" in obj) {
    return obj.toDate().toISOString(); // Convert Timestamp to ISO string
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertTimestamps(item));
  }
  const result = {};
  for (const key in obj) {
    result[key] = convertTimestamps(obj[key]);
  }
  return result;
};

// Fetch all products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const querySnapshot = await getDocs(collection(db, "allproducts"));
      const products = querySnapshot.docs.map((doc) => {
        const productData = convertTimestamps(doc.data());

        // Process variants to ensure they have necessary fields
        if (productData.productType === "variant" && productData.variants) {
          productData.variants = productData.variants.map((variant) => ({
            ...variant,
            // Ensure title and mainImage are present on variant object if not directly from Firestore
            title: variant.title.en || productData.title.en, // Fallback to product title
            mainImage: variant.mainImage || productData.mainImage, // Fallback to product image
          }));
        }

        return {
          id: doc.id,
          ...productData,
        };
      });
      return products;
    } catch (error) {
      console.error("Error fetching products:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch product by ID
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const docRef = doc(db, "allproducts", productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const product = {
          id: docSnap.id,
          ...convertTimestamps(docSnap.data()),
        };
        return product;
      } else {
        console.error("Product not found for ID:", productId);
        return rejectWithValue("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (categoryId) => {
    // 1. جلب كل الفئات الفرعية التي parentCategoryId يساوي categoryId
    const subcategoriesRef = collection(db, "subcategories");
    const subcategoriesSnapshot = await getDocs(subcategoriesRef);
    const subcategoryIds = subcategoriesSnapshot.docs
      .filter((doc) => doc.data().parentCategoryId === categoryId)
      .map((doc) => doc.id);

    // 2. جلب كل المنتجات
    const productsRef = collection(db, "allproducts");
    const querySnapshot = await getDocs(productsRef);

    // 3. تصفية المنتجات بحيث تكون:
    //    - categoryId.categoryId === categoryId
    //    - أو subCategoryId.subcategoryId موجودة في قائمة subcategoryIds
    const filteredProducts = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => {
        // المنتج مرتبط بالفئة الرئيسية مباشرة
        if (product.categoryId?.categoryId === categoryId) return true;

        // المنتج مرتبط بفئة فرعية تابعة للفئة الرئيسية
        if (
          product.subCategoryId?.subcategoryId &&
          subcategoryIds.includes(product.subCategoryId.subcategoryId) &&
          product.subCategoryId?.parentCategoryId === categoryId
        ) {
          return true;
        }

        // غير ذلك لا يظهر
        return false;
      });

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
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
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
        // Add to items if not already present
        if (!state.items.find((item) => item.id === action.payload.id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default productsSlice.reducer;

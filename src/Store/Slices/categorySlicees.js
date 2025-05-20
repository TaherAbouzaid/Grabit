// // src/Store/Slices/categorySlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { db } from '../../firebase/config';

// export const fetchCategoriesWithSub = createAsyncThunk(
//   'categories/fetchAll',
//   async () => {
//     const categoriesSnapshot = await getDocs(collection(db, 'categories'));
//     const categoriesData = categoriesSnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     const subcategoriesObj = {};
//     for (const category of categoriesData) {
//       const subSnapshot = await getDocs(
//         query(collection(db, 'subcategories'), where('parentCategoryId', '==', category.id))
//       );
//       subcategoriesObj[category.id] = subSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//     }

//     return { categories: categoriesData, subcategories: subcategoriesObj };
//   }
// );

// const categorySlice = createSlice({
//   name: 'categories',
//   initialState: {
//     categories: [],
//     subcategories: {},
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCategoriesWithSub.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchCategoriesWithSub.fulfilled, (state, action) => {
//         state.categories = action.payload.categories;
//         state.subcategories = action.payload.subcategories;
//         state.loading = false;
//       })
//       .addCase(fetchCategoriesWithSub.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message;
//       });
//   },
// });

// export default categorySlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

// دالة لتحويل الـ Timestamps لصيغة نصية
const convertTimestamps = (data) => {
  return Object.keys(data).reduce((acc, key) => {
    if (data[key] && data[key].toDate) {
      // تحويل الـ Timestamp لنص ISO
      acc[key] = data[key].toDate().toISOString();
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      // لو في أوبجكتس متداخلة، هنحولها كمان
      acc[key] = convertTimestamps(data[key]);
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {});
};

export const fetchCategoriesWithSub = createAsyncThunk(
  'categories/fetchAll',
  async () => {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...convertTimestamps(data), // تحويل الـ Timestamps في بيانات الكاتيجوري
      };
    });

    const subcategoriesObj = {};
    for (const category of categoriesData) {
      const subSnapshot = await getDocs(
        query(collection(db, 'subcategories'), where('parentCategoryId', '==', category.id))
      );
      subcategoriesObj[category.id] = subSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...convertTimestamps(data), // تحويل الـ Timestamps في بيانات الصب كاتيجوري
        };
      });
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
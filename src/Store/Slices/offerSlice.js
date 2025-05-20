import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Fetch all products with discount price
export const fetchOffers = createAsyncThunk(
  'offers/fetchOffers',
  async () => {
    try {
      const now = Timestamp.now();
      const productsQuery = query(
        collection(db, 'allproducts'),
        where('discountPrice', '!=', null)
      );
      
      const querySnapshot = await getDocs(productsQuery);
      const offers = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title?.en || data.title?.ar || 'No Title',
            description: data.description?.en || data.description?.ar || 'No Description',
            image: data.mainImage || data.images?.[0] || '',
            discountPercentage: Math.round(((data.price - data.discountPrice) / data.price) * 100),
            price: data.price,
            discountPrice: data.discountPrice,
            endDate: data.discountEndDate?.toMillis() || null,
            // Add both languages for flexibility
            titleAr: data.title?.ar,
            titleEn: data.title?.en,
            descriptionAr: data.description?.ar,
            descriptionEn: data.description?.en,
            // Add additional product info
            brand: data.brandId?.name?.en || data.brandId?.name?.ar,
            category: data.categoryId?.name?.en || data.categoryId?.name?.ar,
            subcategory: data.subCategoryId?.name?.en || data.subCategoryId?.name?.ar
          };
        })
        // Filter expired offers in memory
        .filter(offer => !offer.endDate || offer.endDate > now)
        // Sort by discount percentage
        .sort((a, b) => b.discountPercentage - a.discountPercentage);

      return offers;
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  }
);

const offerSlice = createSlice({
  name: 'offers',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default offerSlice.reducer; 
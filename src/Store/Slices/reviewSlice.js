import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';

// Add review
export const addReview = createAsyncThunk(
  'reviews/addReview',
  async ({ productId, userId, userName, rating, comment }) => {
    const now = Timestamp.now();
    const reviewData = {
      productId,
      userId,
      userName,
      rating,
      comment,
      createdAt: now,
      updatedAt: now
    };

    // Add the review
    const docRef = await addDoc(collection(db, 'reviews'), reviewData);

    // Update product's RatingSummary
    const productRef = doc(db, 'allproducts', productId);
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      const productData = productDoc.data();
      const currentRatingSummary = productData.ratingSummary || { average: 0, count: 0 };
      
      // Calculate new average and count
      const newCount = currentRatingSummary.count + 1;
      const newAverage = ((currentRatingSummary.average * currentRatingSummary.count) + rating) / newCount;

      // Update product document
      await updateDoc(productRef, {
        ratingSummary: {
          average: newAverage,
          count: newCount
        }
      });
    }

    return { 
      id: docRef.id, 
      ...reviewData,
      createdAt: now.toMillis(),
      updatedAt: now.toMillis()
    };
  }
);

// Get reviews for a product
export const getProductReviews = createAsyncThunk(
  'reviews/getProductReviews',
  async (productId) => {
    try {
      console.log('Getting reviews for product ID:', productId);
      
      const q = query(collection(db, 'reviews'), where('productId', '==', productId));
      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now()
        };
      });

      console.log('Fetched reviews:', reviews);

      // Calculate RatingSummary
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        console.log('Calculated RatingSummary:', {
          average: averageRating,
          count: reviews.length
        });

        // Update product's RatingSummary
        const productRef = doc(db, 'allproducts', productId);
        console.log('Attempting to update product:', productId);
        
        const productDoc = await getDoc(productRef);
        console.log('Product exists:', productDoc.exists());
        
        if (productDoc.exists()) {
          console.log('Current product data:', productDoc.data());
          
          await updateDoc(productRef, {
            ratingSummary: {
              average: averageRating,
              count: reviews.length
            }
          });

          console.log('Updated RatingSummary in product');
        } else {
          console.log('Product not found with ID:', productId);
          // Try to get all products to check if the ID exists
          const productsSnapshot = await getDocs(collection(db, 'allproducts'));
          const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('Available product IDs:', products.map(p => p.id));
        }
      } else {
        console.log('No reviews found for this product');
      }

      return reviews;
    } catch (error) {
      console.error('Error in getProductReviews:', error);
      throw error;
    }
  }
);

// Delete review
export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ reviewId, productId, rating }) => {
    // Delete the review
    await deleteDoc(doc(db, 'reviews', reviewId));

    // Update product's RatingSummary
    const productRef = doc(db, 'allproducts', productId);
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      const productData = productDoc.data();
      const currentRatingSummary = productData.ratingSummary || { average: 0, count: 0 };
      
      // Calculate new average and count
      const newCount = currentRatingSummary.count - 1;
      const newAverage = newCount > 0 
        ? ((currentRatingSummary.average * currentRatingSummary.count) - rating) / newCount
        : 0;

      // Update product document
      await updateDoc(productRef, {
        ratingSummary: {
          average: newAverage,
          count: newCount
        }
      });
    }

    return reviewId;
  }
);

// Update review
export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, productId, oldRating, newRating, comment }) => {
    const now = Timestamp.now();
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      rating: newRating,
      comment,
      updatedAt: now
    });

    // Update product's RatingSummary
    const productRef = doc(db, 'allproducts', productId);
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      const productData = productDoc.data();
      const currentRatingSummary = productData.ratingSummary || { average: 0, count: 0 };
      
      // Calculate new average considering the rating change
      const newAverage = ((currentRatingSummary.average * currentRatingSummary.count) - oldRating + newRating) / currentRatingSummary.count;

      // Update product document
      await updateDoc(productRef, {
        ratingSummary: {
          average: newAverage,
          count: currentRatingSummary.count
        }
      });
    }

    return { 
      id: reviewId, 
      rating: newRating, 
      comment,
      updatedAt: now.toMillis()
    };
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Get reviews
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.items = state.items.filter(review => review.id !== action.payload);
      })
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.items.findIndex(review => review.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      });
  }
});

export default reviewSlice.reducer; 
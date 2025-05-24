import { incrementSoldCount } from "../../services/productStatsService";

// إنشاء طلب جديد
// eslint-disable-next-line no-undef
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      // إنشاء الطلب
      // eslint-disable-next-line no-undef
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        // eslint-disable-next-line no-undef
        createdAt: Timestamp.now(),
        status: 'pending'
      });
      
      // زيادة عدد المبيعات لكل منتج في الطلب
      for (const item of orderData.items) {
        await incrementSoldCount(item.productId, item.quantity);
      }
      
      return {
        id: orderRef.id,
        ...orderData
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
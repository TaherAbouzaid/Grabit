import { incrementSoldCount } from "../../services/productStatsService";
import { decrementStock } from "../../componant/Checkout/Checkout"; // استيراد وظيفة تخفيض المخزون

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
      
      // تخفيض المخزون لكل منتج في الطلب
      await decrementStock(orderData.items);
      
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

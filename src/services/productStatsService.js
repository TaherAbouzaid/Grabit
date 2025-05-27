import { doc, updateDoc, increment, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// تحديث عدد المشاهدات للمنتج
export const incrementProductViews = async (productId) => {
  try {
    const productRef = doc(db, "allproducts", productId);
    
    // تحديث عدد المشاهدات وحساب درجة الشعبية
    await updateDoc(productRef, {
      views: increment(1),
      lastTrendingUpdate: Timestamp.now()
    });
    
    // تحديث درجة الشعبية
    await updateTrendingScore(productId);
    
    return true;
  } catch (error) {
    console.error("Error incrementing product views:", error);
    return false;
  }
};

// تحديث عدد مرات الإضافة للمفضلة
export const incrementWishlistCount = async (productId) => {
  try {
    const productRef = doc(db, "allproducts", productId);
    
    // تحديث عدد مرات الإضافة للمفضلة
    await updateDoc(productRef, {
      wishlistCount: increment(1),
      lastTrendingUpdate: Timestamp.now()
    });
    
    // تحديث درجة الشعبية
    await updateTrendingScore(productId);
    
    return true;
  } catch (error) {
    console.error("Error incrementing wishlist count:", error);
    return false;
  }
};

// تحديث عدد مرات الإضافة للسلة
export const incrementCartAdds = async (productId) => {
  try {
    const productRef = doc(db, "allproducts", productId);
    
    // تحديث عدد مرات الإضافة للسلة
    await updateDoc(productRef, {
      cartAdds: increment(1),
      lastTrendingUpdate: Timestamp.now()
    });
    
    // تحديث درجة الشعبية
    await updateTrendingScore(productId);
    
    return true;
  } catch (error) {
    console.error("Error incrementing cart adds:", error);
    return false;
  }
};

// تحديث عدد المبيعات
export const incrementSoldCount = async (productId, quantity = 1) => {
  try {
    console.log(`Starting incrementSoldCount for product ${productId} with quantity ${quantity}`);
    const productRef = doc(db, "allproducts", productId);
    
    // تحديث عدد المبيعات
    await updateDoc(productRef, {
      soldCount: increment(quantity),
      lastTrendingUpdate: Timestamp.now()
    });
    console.log(`Successfully updated soldCount for product ${productId}`);
    
    // تحديث درجة الشعبية
    await updateTrendingScore(productId);
    
    return true;
  } catch (error) {
    console.error(`Error incrementing sold count for product ${productId}:`, error);
    return false;
  }
};

// تحديث درجة الشعبية بناءً على المعادلة
export const updateTrendingScore = async (productId) => {
  try {
    const productRef = doc(db, "allproducts", productId);
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      const productData = productDoc.data();
      
      // استخراج القيم مع التأكد من وجودها كأرقام (0 بدلاً من null)
      const views = productData.views || 0;
      const wishlistCount = productData.wishlistCount || 0;
      const cartAdds = productData.cartAdds || 0;
      const soldCount = productData.soldCount || 0;
      
      // حساب درجة الشعبية باستخدام المعادلة
      const trendingScore = views * 1 + wishlistCount * 2 + cartAdds * 2 + soldCount * 3;
      
      // تحديث درجة الشعبية في قاعدة البيانات
      await updateDoc(productRef, {
        trendingScore: trendingScore,
        // تأكد من تحديث القيم الأخرى إذا كانت null
        views: views,
        wishlistCount: wishlistCount,
        cartAdds: cartAdds,
        soldCount: soldCount
      });
      
      return trendingScore;
    }
    
    return 0;
  } catch (error) {
    console.error("Error updating trending score:", error);
    return 0;
  }
};



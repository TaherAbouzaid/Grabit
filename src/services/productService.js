import { collection, getDocs, doc, getDoc, getDocs as getSubDocs, updateDoc, increment, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// تحديث عدد المشاهدات للمنتج
export const incrementProductViews = async (productId) => {
  try {
    const productRef = doc(db, "allproducts", productId);
    
    // تحديث عدد المشاهدات
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

export const fetchProducts = async () => {
  try {
    console.log("Fetching products from database...");
    const querySnapshot = await getDocs(collection(db, "allproducts"));
    const products = [];
    
    console.log("Total products in database:", querySnapshot.docs.length);
    
    for (const doc of querySnapshot.docs) {
      const productData = { id: doc.id, ...doc.data() };
      
      // If it's a variant product, fetch its variants
      if (productData.productType === "variant") {
        const variantsSnapshot = await getSubDocs(collection(db, `allproducts/${doc.id}/variants`));
        const variants = [];
        variantsSnapshot.forEach((variantDoc) => {
          variants.push({ id: variantDoc.id, ...variantDoc.data() });
        });
        productData.variants = variants;
      }
      
      products.push(productData);
    }
    
    console.log("Products processed:", products.length);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const fetchProductById = async (productId) => {
  const docRef = doc(db, "allproducts", productId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const productData = { id: docSnap.id, ...docSnap.data() };
  
  // If it's a variant product, fetch its variants
  if (productData.productType === "variant") {
    const variantsSnapshot = await getSubDocs(collection(db, `allproducts/${productId}/variants`));
    const variants = [];
    variantsSnapshot.forEach((variantDoc) => {
      variants.push({ id: variantDoc.id, ...variantDoc.data() });
    });
    productData.variants = variants;
  }
  
  return productData;
};

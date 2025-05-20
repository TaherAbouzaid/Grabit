import { collection, getDocs, doc, getDoc, getDocs as getSubDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export const fetchProducts = async () => {
  const querySnapshot = await getDocs(collection(db, "allproducts"));
  const products = [];
  
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
  
  return products;
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

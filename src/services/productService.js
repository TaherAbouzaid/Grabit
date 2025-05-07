import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export const fetchProducts = async () => {
  const querySnapshot = await getDocs(collection(db, "allproducts"));
  const products = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
};

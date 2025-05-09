
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhvxS9hLyt0X6ONOUTyxSonj40YGcMLBo",
  authDomain: "cvcv-bc6f0.firebaseapp.com",
  databaseURL: "https://cvcv-bc6f0-default-rtdb.firebaseio.com",
  projectId: "cvcv-bc6f0",
  storageBucket: "cvcv-bc6f0.appspot.com",
  messagingSenderId: "777105913510",
  appId: "1:777105913510:web:3f2c7df5df7d0b113c6667",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
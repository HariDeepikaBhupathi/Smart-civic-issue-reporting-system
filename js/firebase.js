import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* 🔑 FIREBASE CONFIG (YOUR REAL PROJECT) */
const firebaseConfig = {
  apiKey: "AIzaSyAeQF7ED6tR1VbVKET7_UXpAifwTvI0byI",
  authDomain: "smart-civic-portal-6e6d9.firebaseapp.com",
  projectId: "smart-civic-portal-6e6d9",
  storageBucket: "smart-civic-portal-6e6d9.firebasestorage.app",
  messagingSenderId: "689342834550",
  appId: "1:689342834550:web:227080895516a80af9bc57"
};

/* 🚀 INITIALIZE FIREBASE */
const app = initializeApp(firebaseConfig);

/* 🗄️ INITIALIZE FIRESTORE */
const db = getFirestore(app);

/* 📤 EXPORT */
export {
  db,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
};

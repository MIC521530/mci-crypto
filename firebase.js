// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcEpUozOV05aq2sZwW39VZEH7-omZ1wpE",
  authDomain: "mci-crypto.firebaseapp.com",
  projectId: "mci-crypto",
  storageBucket: "mci-crypto.firebasestorage.app",
  messagingSenderId: "117447785397",
  appId: "1:117447785397:web:a98f828433cb0fe796f7fc"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

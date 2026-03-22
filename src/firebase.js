import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPILIsKhV238JtzjgRPTdc_xR6KhiA03M",
  authDomain: "campuslifeai.firebaseapp.com",
  projectId: "campuslifeai",
  storageBucket: "campuslifeai.firebasestorage.app",
  messagingSenderId: "1033886822629",
  appId: "1:1033886822629:web:bf8e059966a1cb556a240c",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
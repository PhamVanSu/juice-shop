// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCctHyJ7oQjSwNiroVtBh39VhnMzr_r5XQ",
  authDomain: "juice-shop-f4b51.firebaseapp.com",
  projectId: "juice-shop-f4b51",
  storageBucket: "juice-shop-f4b51.firebasestorage.app",
  messagingSenderId: "664488992894",
  appId: "1:664488992894:web:18493a959bd1f9f362b82f",
  measurementId: "G-8YL52GY4T4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// const analytics = getAnalytics(app);

// tránh init nhiều lần (quan trọng với Next.js)

const db = getFirestore(app);

const auth = getAuth(app)

export { db, auth };
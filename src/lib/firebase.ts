import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbI1rxxl5nYWldH7zQXeaqWvHREoqS7Yo",
  authDomain: "connect-auditions.firebaseapp.com",
  projectId: "connect-auditions",
  storageBucket: "connect-auditions.appspot.com",
  messagingSenderId: "666788359184",
  appId: "1:666788359184:web:342927be193d5db254ae95"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };

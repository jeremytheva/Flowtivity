// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: "studio-2615913698-17c08",
  appId: "1:709307375131:web:ef682319693ea2b9dca2be",
  apiKey: "AIzaSyBUABjFDR3oROvRvY2h7xWihsqNrypj19c",
  authDomain: "studio-2615913698-17c08.firebaseapp.com",
  messagingSenderId: "709307375131",
  storageBucket: "studio-2615913698-17c08.appspot.com"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };

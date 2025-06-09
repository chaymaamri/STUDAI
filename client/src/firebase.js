// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAIisERM_TD11PsLJfa_ZgNzVkypUwhh8w",
  authDomain: "aitudiant-3bb67.firebaseapp.com",
  projectId: "aitudiant-3bb67",
  storageBucket: "aitudiant-3bb67.firebasestorage.app",
  messagingSenderId: "386447830276",
  appId: "1:386447830276:web:e2b694745cd3cbd500f451"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
// firebase.js
import { getApps, initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, EmailAuthProvider } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import messaging from '@react-native-firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBPJ4jjmcKLfBVACvJs-kdIsgffdeHApgk",
  authDomain: "egrechat.firebaseapp.com",
  projectId: "egrechat",
  storageBucket: "egrechat.appspot.com",
  messagingSenderId: "317472946743",
  appId: "1:317472946743:web:3e330b3615a7b3b3a8ddb2",
  measurementId: "G-Y6T7RGKBCB"
};

// Initialize Firebase
let app, auth;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    console.log("erro ao iniciar o app:" + error);
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

const analytics = getAnalytics(app);
const provider = new EmailAuthProvider();
const db = getFirestore();
const timestamp = serverTimestamp();

export { app, auth, provider, db, timestamp, messaging };
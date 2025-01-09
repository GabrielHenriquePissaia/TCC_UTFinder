// Import the necessary functions from the Firebase SDKs
import { getApps, initializeApp, getApp } from "firebase/app";
import { getAuth, EmailAuthProvider } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import messaging from '@react-native-firebase/messaging';

// Your web app's Firebase configuration
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
    console.log("Erro ao iniciar o app: " + error);
  }
} else {
  app = getApp();
  auth = getAuth(app);
}

const db = getFirestore(app);
const timestamp = serverTimestamp();

export { app, auth, db, timestamp, messaging };
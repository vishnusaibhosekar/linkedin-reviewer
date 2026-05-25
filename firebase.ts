// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6Jp_oxizrMbZmPCBzm-iBZU5cYApyucw",
    authDomain: "linkedin-reviewer.firebaseapp.com",
    projectId: "linkedin-reviewer",
    storageBucket: "linkedin-reviewer.firebasestorage.app",
    messagingSenderId: "1088552255073",
    appId: "1:1088552255073:web:584a9da57c6e36027e3420",
    measurementId: "G-0QRYR75Y0M"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { app, auth };

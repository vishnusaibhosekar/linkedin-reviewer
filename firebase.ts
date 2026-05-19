// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC5KsSYw7YYSmEL8DkiIH7HjzalEZN9H94",
    authDomain: "notes-app-40b02.firebaseapp.com",
    projectId: "notes-app-40b02",
    storageBucket: "notes-app-40b02.firebasestorage.app",
    messagingSenderId: "839183819110",
    appId: "1:839183819110:web:cd78900764ae5f312ca8a7"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { app, auth };

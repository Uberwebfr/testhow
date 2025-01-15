// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1wiu60JIEsp6gZWILKRu24PwIiYVk9ZA",
  authDomain: "ma-prep-1c7b9.firebaseapp.com",
  projectId: "ma-prep-1c7b9",
  storageBucket: "ma-prep-1c7b9.firebasestorage.app",
  messagingSenderId: "587620763178",
  appId: "1:587620763178:web:0b0b49392daffec8072553",
  measurementId: "G-7DL9ZEL6MF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

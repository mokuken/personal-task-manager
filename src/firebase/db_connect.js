// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjIuOIpEXF-GmWjgsAWGRgywpIe9_9dQI",
  authDomain: "personal-task-manager-a026d.firebaseapp.com",
  projectId: "personal-task-manager-a026d",
  storageBucket: "personal-task-manager-a026d.firebasestorage.app",
  messagingSenderId: "232191638334",
  appId: "1:232191638334:web:a994657cdb561577f80a6f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
initializeFirestore(app, {localCache: persistentLocalCache(/*settings*/{})});
export const db = getFirestore(app);
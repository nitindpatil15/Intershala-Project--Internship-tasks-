import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import getStorage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAskESV3XX0lZe9EsUEkmFsqc4H378v17g",
  authDomain: "intern-shala-cee25.firebaseapp.com",
  projectId: "intern-shala-cee25",
  storageBucket: "intern-shala-cee25.appspot.com", // Corrected the storage bucket URL
  messagingSenderId: "564138674408",
  appId: "1:564138674408:web:2623c369fe8498af86a15d",
  measurementId: "G-END26CRLP4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, provider, storage, db };

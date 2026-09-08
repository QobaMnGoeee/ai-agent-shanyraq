import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCP_qa-SVPJ4jhNn29yzeJtLJae0eQkieA",
  authDomain: "bozorcha-f3475.firebaseapp.com",
  databaseURL: "https://bozorcha-f3475-default-rtdb.firebaseio.com",
  projectId: "bozorcha-f3475",
  storageBucket: "bozorcha-f3475.firebasestorage.app",
  messagingSenderId: "333480505903",
  appId: "1:333480505903:web:b01b5cfc7bbe50deeaccda",
  measurementId: "G-GZYPG8FEXZ"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

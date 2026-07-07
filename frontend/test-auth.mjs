import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAB2tkEMpxF7TRCsO_cKiWh3q2YLdJWJ1g",
  authDomain: "sunlo-39ef9.firebaseapp.com",
  projectId: "sunlo-39ef9",
  storageBucket: "sunlo-39ef9.firebasestorage.app",
  messagingSenderId: "1085441004816",
  appId: "1:1085441004816:web:2134827942cb440faac195",
  databaseURL: "https://sunlo-39ef9-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
console.log("config", firebaseConfig);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("auth init");

try {
  const cred = await signInWithEmailAndPassword(auth, "test@example.com", "password123");
  console.log("signed in", cred.user.uid);
} catch (err) {
  console.log("error code", err.code, "message", err.message);
}

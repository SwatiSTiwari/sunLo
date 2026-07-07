import { initializeApp } from "firebase/app";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyAB2tkEMpxF7TRCsO_cKiWh3q2YLdJWJ1g",
  authDomain: "sunlo-39ef9.firebaseapp.com",
  projectId: "sunlo-39ef9",
  storageBucket: "sunlo-39ef9.firebasestorage.app",
  messagingSenderId: "1085441004816",
  appId: "1:1085441004816:web:2134827942cb440faac195",
  databaseURL: "https://sunlo-39ef9-default-rtdb.asia-southeast1.firebasedatabase.app/"
});
const db = getFirestore(app);
try {
  const snap = await getDoc(doc(db, "users", "test"));
  console.log("firestore ok", snap.exists());
} catch (err) {
  console.log("firestore err", err.code, err.message);
}

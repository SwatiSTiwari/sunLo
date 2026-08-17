"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && db) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setUserData(snap.exists() ? snap.data() : null);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = (email, password) => {
    if (!auth) throw new Error("Firebase Auth not configured");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    if (!auth) throw new Error("Firebase Auth not configured");
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const createUserDoc = async (uid, data) => {
    if (!db) throw new Error("Firebase Firestore not configured");
    if (!auth) throw new Error("Firebase Auth not configured");
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
    }
    await setDoc(doc(db, "users", uid), {
      ...data,
      createdAt: new Date().toISOString(),
      profileComplete: false,
    });
    setUserData(data);
  };

  const logout = () => {
    if (!auth) throw new Error("Firebase Auth not configured");
    return signOut(auth);
  };

  const refreshUserData = async () => {
    if (!user || !db) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    setUserData(snap.exists() ? snap.data() : null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, login, signup, createUserDoc, logout, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

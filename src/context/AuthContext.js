"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, isDemoMode } from "@/firebase/config";
import { authService } from "@/firebase/authService";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshUser: () => {},
  isDemoMode: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    let unsubscribeFirestore = null;

    if (isDemoMode) {
      // LocalStorage Auth sync
      const localUser = localStorage.getItem("linknest_current_user");
      if (localUser) {
        setUser(JSON.parse(localUser));
      }
      setLoading(false);
    } else {
      // Firebase Auth sync
      const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Listen to changes in the user's Firestore document
          unsubscribeFirestore = onSnapshot(
            doc(db, "users", firebaseUser.uid),
            (docSnap) => {
              if (docSnap.exists()) {
                setUser({ ...docSnap.data(), email: firebaseUser.email });
              } else {
                console.error("User doc not found in Firestore.");
                setUser(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error("Firestore user sync error:", error);
              setLoading(false);
            }
          );
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => {
        unsubscribeAuth();
        if (unsubscribeFirestore) unsubscribeFirestore();
      };
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = await authService.login(email, password);
      setUser(u);
      return u;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const register = async (email, password, username, name) => {
    setLoading(true);
    try {
      const u = await authService.register(email, password, username, name);
      setUser(u);
      return u;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const u = await authService.loginWithGoogle();
      setUser(u);
      return u;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const updateProfile = async (updatedFields) => {
    if (!user) throw new Error("Not authenticated");
    const updated = await authService.updateProfile(user.uid, updatedFields);
    setUser(updated);
    return updated;
  };

  const refreshUser = () => {
    if (isDemoMode) {
      const localUser = localStorage.getItem("linknest_current_user");
      if (localUser) {
        setUser(JSON.parse(localUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      resetPassword,
      updateProfile,
      refreshUser,
      isDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, loginWithGoogle, logout as firebaseLogout } from "../../firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const user = await loginWithGoogle();
      return user;
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    logout,
  };
};

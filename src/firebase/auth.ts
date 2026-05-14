import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    console.log("User:", user);

    return user;
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
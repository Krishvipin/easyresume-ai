import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./config";

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: number;
}

export interface ProjectData {
  uid: string;
  companyName: string;
  jobTitle: string;
  date: number;
  note: string;
  localProjectId?: string; // Links back to local IndexedDB
}

/**
 * Logs a user to the Firestore "users" collection when they sign in.
 */
export const logUserToFirestore = async (user: UserData) => {
  try {
    const userRef = doc(db, "users", user.uid);
    // Use merge to update existing user data without overwriting completely
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    console.error("Error logging user to Firestore:", error);
    throw error;
  }
};

/**
 * Creates a new project document in the Firestore "projects" collection.
 */
export const createProjectInFirestore = async (project: ProjectData) => {
  try {
    const projectsRef = collection(db, "projects");
    const docRef = await addDoc(projectsRef, project);
    console.log(docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating project in Firestore:", error);
    throw error;
  }
};

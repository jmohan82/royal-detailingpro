import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase/config";
import type { AppUser, UserRole } from "@/types/user";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Incorrect email or password.");
    this.name = "InvalidCredentialsError";
  }
}

export class ProfileNotFoundError extends Error {
  constructor() {
    super("No profile found for this account. Contact your administrator.");
    this.name = "ProfileNotFoundError";
  }
}

export class InactiveAccountError extends Error {
  constructor() {
    super("This account is not active. Contact your administrator.");
    this.name = "InactiveAccountError";
  }
}

interface UserDocument {
  businessId: string;
  name: string;
  email?: string;
  role: UserRole;
  active: boolean;
}

export async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<AppUser> {
  const snapshot = await getDoc(doc(db, "users", firebaseUser.uid));
  if (!snapshot.exists()) {
    throw new ProfileNotFoundError();
  }

  const data = snapshot.data() as UserDocument;
  if (!data.active) {
    throw new InactiveAccountError();
  }

  return {
    uid: firebaseUser.uid,
    businessId: data.businessId,
    name: data.name,
    email: data.email ?? firebaseUser.email ?? "",
    role: data.role,
    active: data.active,
  };
}

export async function loginWithEmail(email: string, password: string): Promise<AppUser> {
  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch {
    throw new InvalidCredentialsError();
  }

  try {
    return await fetchUserProfile(credential.user);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
}

export function logout(): Promise<void> {
  return signOut(auth);
}

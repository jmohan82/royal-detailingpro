import { deleteApp, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { collection, doc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";

import { db, firebaseConfig } from "@/lib/firebase/config";
import type { AppUser, UserRole } from "@/types/user";
import type { CreateUserInput } from "@/validation/user";

export class EmailInUseError extends Error {
  constructor() {
    super("An account with this email already exists.");
    this.name = "EmailInUseError";
  }
}

export function subscribeUsers(
  businessId: string,
  onChange: (users: AppUser[]) => void,
  onError: (error: Error) => void,
): () => void {
  const usersQuery = query(collection(db, "users"), where("businessId", "==", businessId));

  return onSnapshot(
    usersQuery,
    (snapshot) => {
      const users = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as Omit<AppUser, "uid">;
          return { uid: docSnap.id, ...data };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      onChange(users);
    },
    onError,
  );
}

/**
 * Creates the new user's Firebase Auth login on a throwaway secondary app instance so it doesn't
 * sign the admin out of their own session, then writes the Firestore profile as the admin.
 */
export async function createUser(businessId: string, input: CreateUserInput): Promise<void> {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    let uid: string;
    try {
      const credential = await createUserWithEmailAndPassword(secondaryAuth, input.email, input.password);
      uid = credential.user.uid;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "auth/email-already-in-use") throw new EmailInUseError();
      throw new Error("Couldn't create the login. Check the details and try again.");
    }

    await setDoc(doc(db, "users", uid), {
      businessId,
      name: input.name.trim(),
      email: input.email.trim(),
      role: input.role,
      active: true,
    });
  } finally {
    await signOut(secondaryAuth).catch(() => {});
    await deleteApp(secondaryApp).catch(() => {});
  }
}

export async function updateUser(
  userId: string,
  businessId: string,
  input: { name: string; role: UserRole; active: boolean },
): Promise<void> {
  await updateDoc(doc(db, "users", userId), {
    businessId,
    name: input.name.trim(),
    role: input.role,
    active: input.active,
  });
}

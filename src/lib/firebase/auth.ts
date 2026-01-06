import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User } from '@/types';

const googleProvider = new GoogleAuthProvider();

// Helper to ensure auth is initialized
function getAuth() {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Make sure to configure your Firebase credentials.');
  }
  return auth;
}

// Helper to ensure db is initialized
function getDb() {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized. Make sure to configure your Firebase credentials.');
  }
  return db;
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
  await updateLastLogin(userCredential.user.uid);
  return userCredential.user;
}

// Register with email and password
export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
) {
  const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
  const user = userCredential.user;

  // Update display name if provided
  if (displayName) {
    await updateProfile(user, { displayName });
  }

  // Create user document in Firestore
  await createUserDocument(user, displayName);

  return user;
}

// Sign in with Google
export async function signInWithGoogle() {
  const userCredential = await signInWithPopup(getAuth(), googleProvider);
  const user = userCredential.user;

  // Check if user document exists, if not create it
  const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(user);
  } else {
    await updateLastLogin(user.uid);
  }

  return user;
}

// Sign out
export async function signOut() {
  await firebaseSignOut(getAuth());
}

// Send password reset email
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getAuth(), email);
}

// Create user document in Firestore
async function createUserDocument(firebaseUser: FirebaseUser, displayName?: string) {
  const userRef = doc(getDb(), 'users', firebaseUser.uid);
  const userData: Partial<User> = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: displayName || firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || '',
    preferences: {
      theme: 'system',
      defaultView: 'grid',
      promptsPerPage: 20,
    },
    createdAt: serverTimestamp() as any,
    lastLoginAt: serverTimestamp() as any,
  };

  await setDoc(userRef, userData);
}

// Update last login timestamp
async function updateLastLogin(userId: string) {
  const userRef = doc(getDb(), 'users', userId);
  await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
}

// Get user data from Firestore
export async function getUserData(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(getDb(), 'users', userId));
  if (userDoc.exists()) {
    return { ...userDoc.data(), uid: userDoc.id } as User;
  }
  return null;
}

// Auth state observer
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  const authInstance = auth;
  if (!authInstance) {
    // If auth is not initialized, call callback with null immediately
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
}

// Get current user
export function getCurrentUser() {
  return auth?.currentUser ?? null;
}

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export { onAuthStateChanged };
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';

// Read Firebase configuration from generated config file
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: firebaseConfigData.projectId,
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with databaseId from config and multi-tab local persistence
export const db: Firestore = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  },
  firebaseConfig.firestoreDatabaseId
);

export type { FirebaseUser };

/**
 * Sign in with Google (Popup)
 */
export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign out from Firebase
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Sync or load user-isolated data from Firestore:
 * Users' cloud records are isolated under their user document path:
 * `users/{userEmailOrUid}/cloud_data/school_state`
 */
export async function saveUserCloudData(
  userKey: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!userKey) return;
  // Normalize email or UID for doc ID
  const sanitizedDocId = userKey.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const userDocRef = doc(db, 'user_cloud_stores', sanitizedDocId);
  await setDoc(
    userDocRef,
    {
      ...data,
      lastUpdated: new Date().toISOString(),
      ownerEmail: userKey,
    },
    { merge: true }
  );
}

export async function getUserCloudData(
  userKey: string
): Promise<Record<string, unknown> | null> {
  if (!userKey) return null;
  const sanitizedDocId = userKey.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const userDocRef = doc(db, 'user_cloud_stores', sanitizedDocId);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { ClassElection } from '../types';

const ELECTIONS_COLLECTION = 'class_elections';

/**
 * Clean and sanitize document ID from gradeClass string
 * Example: "الصف العاشر / 1" -> "class_10_1"
 */
export function generateElectionDocId(gradeClass: string): string {
  return (
    'election_' +
    gradeClass
      .replace(/[^0-9a-zA-Z\u0600-\u06FF]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
  );
}

/**
 * Save or update Class Election document in Firebase Firestore
 */
export async function saveElectionToFirestore(
  election: ClassElection
): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const docId = election.id || generateElectionDocId(election.gradeClass);
    const electionDocRef = doc(db, ELECTIONS_COLLECTION, docId);

    const dataToSave = {
      ...election,
      id: docId,
      updatedAtFirestore: new Date().toISOString(),
    };

    await setDoc(electionDocRef, dataToSave, { merge: true });

    // Also persist in local backup so it's always accessible offline
    try {
      const localBackups = JSON.parse(localStorage.getItem('sarh_elections_backup') || '{}');
      localBackups[docId] = dataToSave;
      localStorage.setItem('sarh_elections_backup', JSON.stringify(localBackups));
    } catch {
      // Ignore local storage quota errors
    }

    return { success: true, id: docId };
  } catch (error: any) {
    console.error('Error saving election to Firestore:', error);

    // Save to local backup as fallback
    try {
      const docId = election.id || generateElectionDocId(election.gradeClass);
      const localBackups = JSON.parse(localStorage.getItem('sarh_elections_backup') || '{}');
      localBackups[docId] = {
        ...election,
        id: docId,
        isLocalFallback: true,
      };
      localStorage.setItem('sarh_elections_backup', JSON.stringify(localBackups));
      return { success: true, id: docId, error: 'تم الحفظ محلياً (وضع عدم الاتصال)' };
    } catch {
      return { success: false, id: '', error: error?.message || 'فشل الحفظ في قاعدة البيانات' };
    }
  }
}

/**
 * Fetch all Class Elections from Firestore
 */
export async function fetchClassElections(): Promise<ClassElection[]> {
  try {
    const colRef = collection(db, ELECTIONS_COLLECTION);
    const snap = await getDocs(colRef);
    const results: ClassElection[] = [];

    snap.forEach((docSnap) => {
      if (docSnap.exists()) {
        results.push(docSnap.data() as ClassElection);
      }
    });

    // Merge with any local storage backups
    try {
      const localBackups = JSON.parse(localStorage.getItem('sarh_elections_backup') || '{}');
      for (const key of Object.keys(localBackups)) {
        if (!results.some((r) => r.id === key)) {
          results.push(localBackups[key]);
        }
      }
    } catch {
      // Ignore
    }

    return results;
  } catch (error) {
    console.warn('Firestore fetch failed, checking local backup:', error);
    try {
      const localBackups = JSON.parse(localStorage.getItem('sarh_elections_backup') || '{}');
      return Object.values(localBackups) as ClassElection[];
    } catch {
      return [];
    }
  }
}

/**
 * Real-time subscription to class elections
 */
export function subscribeToClassElections(
  onUpdate: (elections: ClassElection[]) => void
): () => void {
  try {
    const colRef = collection(db, ELECTIONS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: ClassElection[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ClassElection);
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('Elections onSnapshot error, falling back to manual fetch:', err);
      }
    );
  } catch {
    return () => {};
  }
}

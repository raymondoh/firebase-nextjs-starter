// firebase/client/firestore.ts
"use client";

import { db } from "./firebase-client-init";
import {
  DocumentData,
  WithFieldValue as FirestoreWithFieldValue,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  UpdateData,
  onSnapshot,
  type QueryConstraint,
  type DocumentReference
  //type WithFieldValue
} from "firebase/firestore";

/**
 * Convert a JavaScript Date to a Firestore Timestamp
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Convert a Firestore Timestamp to a JavaScript Date
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Get a server timestamp
 */
export function getServerTimestamp() {
  return serverTimestamp();
}

/**
 * Get a document by ID
 */
export async function getDocument<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T & { id: string }) : null;
}

/**
 * Get documents from a collection with optional query constraints
 */
export async function getDocuments<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
}

/**
 * Create or update a document
 */
export async function setDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: FirestoreWithFieldValue<T>
): Promise<void> {
  const docRef = doc(db, collectionName, docId) as DocumentReference<T, T>;
  await setDoc(docRef, data);
}

/**
 * Update fields of a document in Firestore
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: UpdateData<T> // 🔥 Use Firestore's actual expected type
): Promise<void> {
  const docRef = doc(db, collectionName, docId) as DocumentReference<T, T>;
  await updateDoc(docRef, data);
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

/**
 * Subscribe to a document
 */
export function subscribeToDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: (T & { id: string }) | null) => void
) {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, docSnap => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as T & { id: string });
    } else {
      callback(null);
    }
  });
}

/**
 * Subscribe to a query
 */
export function subscribeToQuery<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: (T & { id: string })[]) => void
) {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  return onSnapshot(q, querySnapshot => {
    const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T & { id: string }));
    callback(documents);
  });
}

// Export query constraint helpers
export { where, orderBy, limit, startAfter };

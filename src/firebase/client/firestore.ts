// firebase/client/firestore.ts
"use client";

import { db } from "./index";
import {
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
  onSnapshot,
  type QueryConstraint
} from "firebase/firestore";

/**
 * Convert a JavaScript Date to a Firestore Timestamp
 * @param date - The date to convert
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Convert a Firestore Timestamp to a JavaScript Date
 * @param timestamp - The timestamp to convert
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
 * @param collectionName - The collection name
 * @param docId - The document ID
 */
export async function getDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

/**
 * Get documents from a collection with optional query constraints
 * @param collectionName - The collection name
 * @param constraints - Optional query constraints
 */
export async function getDocuments(collectionName: string, constraints: QueryConstraint[] = []) {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Create or update a document
 * @param collectionName - The collection name
 * @param docId - The document ID
 * @param data - The document data
 */
export async function setDocument(collectionName: string, docId: string, data: any) {
  const docRef = doc(db, collectionName, docId);
  return setDoc(docRef, data);
}

/**
 * Update a document
 * @param collectionName - The collection name
 * @param docId - The document ID
 * @param data - The data to update
 */
export async function updateDocument(collectionName: string, docId: string, data: any) {
  const docRef = doc(db, collectionName, docId);
  return updateDoc(docRef, data);
}

/**
 * Delete a document
 * @param collectionName - The collection name
 * @param docId - The document ID
 */
export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  return deleteDoc(docRef);
}

/**
 * Subscribe to a document
 * @param collectionName - The collection name
 * @param docId - The document ID
 * @param callback - The callback to call when the document changes
 */
export function subscribeToDocument(collectionName: string, docId: string, callback: (data: any) => void) {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, doc => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
}

/**
 * Subscribe to a query
 * @param collectionName - The collection name
 * @param constraints - Query constraints
 * @param callback - The callback to call when the query results change
 */
export function subscribeToQuery(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: any[]) => void
) {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  return onSnapshot(q, querySnapshot => {
    const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(documents);
  });
}

// Export query constraint helpers
export { where, orderBy, limit, startAfter };

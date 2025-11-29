'use client';

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  orderBy,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import type { Mountain, InfoItem, Reservation, InfoCategory, Feedback, Tour } from './definitions';
import { slugify } from './utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// --- Mountain Actions ---

export async function fetchMountains(db: Firestore): Promise<Mountain[]> {
  const mountainsCol = collection(db, 'mountains');
  const mountainSnapshot = await getDocs(query(mountainsCol, orderBy('name', 'asc')));
  const mountainList = mountainSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mountain));
  return mountainList;
}

export async function getMountainData(db: Firestore, mountainSlug: string): Promise<Mountain | null> {
    const q = query(collection(db, "mountains"), where("slug", "==", mountainSlug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Mountain;
}

export async function createOrUpdateMountain(db: Firestore, mountain: Omit<Mountain, 'id' | 'slug'>, id?: string): Promise<void> {
  const mountainSlug = slugify(mountain.name);
  const mountainData: Partial<Mountain> = { 
      ...mountain, 
      slug: mountainSlug,
  };
  
  Object.keys(mountainData).forEach(key => {
      const itemKey = key as keyof typeof mountainData;
      if (mountainData[itemKey] === '' || mountainData[itemKey] === undefined || mountainData[itemKey] === null) {
          delete mountainData[itemKey];
      }
  });

  if (id) {
    const mountainDoc = doc(db, 'mountains', id);
    updateDoc(mountainDoc, mountainData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: mountainDoc.path,
            operation: 'update',
            requestResourceData: mountainData
        }))
    });
  } else {
    const mountainsCol = collection(db, 'mountains');
    addDoc(mountainsCol, mountainData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: mountainsCol.path,
            operation: 'create',
            requestResourceData: mountainData
        }))
    });
  }
}

export async function deleteMountain(db: Firestore, id: string): Promise<void> {
  const mountainDoc = doc(db, 'mountains', id);
  deleteDoc(mountainDoc).catch(error => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: mountainDoc.path,
        operation: 'delete'
    }))
  });

  const infoItemsSnapshot = await getDocs(query(collection(db, 'infoItems'), where('mountainId', '==', id)));
  const deletePromises = infoItemsSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

// --- Info Item Actions ---

export async function fetchAllInfoItems(db: Firestore): Promise<InfoItem[]> {
  const infoItemsCol = collection(db, 'infoItems');
  const infoItemSnapshot = await getDocs(infoItemsCol);
  const infoItemList = infoItemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InfoItem));
  return infoItemList;
}

export async function getItemsForMountain(db: Firestore, mountainSlug: string): Promise<InfoItem[]> {
  const q = query(collection(db, 'infoItems'), where('mountainSlug', '==', mountainSlug));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InfoItem));
}

export async function getInfoItems(db: Firestore, mountainSlug: string, category: InfoCategory): Promise<InfoItem[]> {
  const q = query(collection(db, 'infoItems'), where('mountainSlug', '==', mountainSlug), where('category', '==', category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InfoItem));
}

export async function getInfoItemById(db: Firestore, itemId: string): Promise<InfoItem | null> {
  const itemDocRef = doc(db, 'infoItems', itemId);
  const itemDoc = await getDoc(itemDocRef);
  if (itemDoc.exists()) {
    const data = itemDoc.data();
    return { id: itemDoc.id, ...data } as InfoItem;
  }
  return null;
}

export async function getInfoItemByName(db: Firestore, name: string): Promise<InfoItem | null> {
    const q = query(collection(db, "infoItems"), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as InfoItem;
}

export async function createOrUpdateInfoItem(db: Firestore, item: Partial<InfoItem>, id?: string): Promise<string> {
  if (id) {
    const itemDoc = doc(db, 'infoItems', id);
    await updateDoc(itemDoc, item).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: itemDoc.path,
            operation: 'update',
            requestResourceData: item
        }))
        throw error;
    });
    return id;
  } else {
    const infoItemsCol = collection(db, 'infoItems');
    const docRef = await addDoc(infoItemsCol, item).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: infoItemsCol.path,
            operation: 'create',
            requestResourceData: item
        }))
        throw error;
    });
    return docRef.id;
  }
}

export async function deleteInfoItem(db: Firestore, id: string): Promise<void> {
  const itemDoc = doc(db, 'infoItems', id);
  deleteDoc(itemDoc).catch(error => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: itemDoc.path,
        operation: 'delete'
    }))
  });
}


// --- Reservation Actions ---

export async function addReservation(db: Firestore, reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<void> {
  const reservationsCol = collection(db, 'reservations');
  addDoc(reservationsCol, {
    ...reservation,
    createdAt: serverTimestamp()
  }).then(docRef => {
    console.log("Reservation added with ID: ", docRef.id);
  }).catch(error => {
    console.error("Error adding reservation: ", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: reservationsCol.path,
        operation: 'create',
        requestResourceData: reservation
    }))
  });
}

export async function getReservations(db: Firestore): Promise<Reservation[]> {
    const reservationsCol = collection(db, 'reservations');
    const q = query(reservationsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        mountainSlug: data.mountainSlug,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      } as Reservation;
    });
}

// --- Feedback Actions ---

export async function addFeedback(db: Firestore, feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<void> {
  const feedbackCol = collection(db, 'feedback');
  addDoc(feedbackCol, {
    ...feedback,
    createdAt: serverTimestamp()
  }).then(docRef => {
    console.log("Feedback added with ID: ", docRef.id);
  }).catch(error => {
    console.error("Error adding feedback: ", error);
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: feedbackCol.path,
        operation: 'create',
        requestResourceData: feedback
    }))
  });
}

export async function getFeedback(db: Firestore): Promise<Feedback[]> {
    const feedbackCol = collection(db, 'feedback');
    const q = query(feedbackCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      } as Feedback;
    });
}


// --- Tour Actions ---

export async function startTour(db: Firestore, userId: string, mountainId: string, mountainName: string, userName: string | null): Promise<string> {
    const tourData: Omit<Tour, 'id'> = {
        userId,
        mountainId,
        mountainName,
        distance: 0,
        status: 'active',
        startTime: serverTimestamp(),
        userName: userName || `User ${userId.substring(0, 6)}`,
    };
    const toursCol = collection(db, 'tours');
    try {
        const docRef = await addDoc(toursCol, tourData);
        return docRef.id;
    } catch (error) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: toursCol.path,
            operation: 'create',
            requestResourceData: tourData,
        }));
        // Re-throw the error so the calling function can catch it and show a toast.
        throw error;
    }
}


export async function updateTour(db: Firestore, tourId: string, data: Partial<Tour>): Promise<void> {
    const tourDoc = doc(db, 'tours', tourId);
    await updateDoc(tourDoc, data).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: tourDoc.path,
            operation: 'update',
            requestResourceData: data,
        }));
        throw error;
    });
}

export async function endTour(db: Firestore, tourId: string): Promise<void> {
    await updateTour(db, tourId, {
        status: 'completed',
        endTime: serverTimestamp(),
    });
}


export async function fetchTours(db: Firestore): Promise<Tour[]> {
  const toursCol = collection(db, 'tours');
  const q = query(toursCol, where('status', '==', 'completed'), orderBy('distance', 'desc'));
  const tourSnapshot = await getDocs(q);
  const tourList = tourSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
          id: doc.id, 
          ...data,
          startTime: data.startTime?.toDate ? data.startTime.toDate().toISOString() : null,
          endTime: data.endTime?.toDate ? data.endTime.toDate().toISOString() : null,
      } as Tour;
  });
  return tourList;
}

export async function fetchActiveTours(db: Firestore): Promise<Tour[]> {
    const toursCol = collection(db, 'tours');
    const q = query(toursCol, where('status', '==', 'active'), orderBy('startTime', 'desc'));
    const tourSnapshot = await getDocs(q);
    return tourSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
}

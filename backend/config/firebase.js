import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from './logger.js';

let firebaseApp = null;
let auth = null;
let db = null;

const initializeFirebase = () => {
  try {
    if (firebaseApp) {
      return { auth, db };
    }

    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
    };

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);

    logger.info('✅ Firebase initialized successfully');

    return { auth, db };
  } catch (error) {
    logger.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

// Helper functions for Firebase Auth
const verifyFirebaseToken = async (token) => {
  try {
    if (!auth) {
      initializeFirebase();
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    logger.error('Firebase token verification failed:', error);
    throw error;
  }
};

const createFirebaseUser = async (userData) => {
  try {
    if (!auth) {
      initializeFirebase();
    }

    const userRecord = await auth.createUser(userData);
    return userRecord;
  } catch (error) {
    logger.error('Firebase user creation failed:', error);
    throw error;
  }
};

const updateFirebaseUser = async (uid, userData) => {
  try {
    if (!auth) {
      initializeFirebase();
    }

    const userRecord = await auth.updateUser(uid, userData);
    return userRecord;
  } catch (error) {
    logger.error('Firebase user update failed:', error);
    throw error;
  }
};

const deleteFirebaseUser = async (uid) => {
  try {
    if (!auth) {
      initializeFirebase();
    }

    await auth.deleteUser(uid);
    logger.info(`Firebase user ${uid} deleted successfully`);
  } catch (error) {
    logger.error('Firebase user deletion failed:', error);
    throw error;
  }
};

// Helper functions for Firestore
const getFirestoreDoc = async (collection, docId) => {
  try {
    if (!db) {
      initializeFirebase();
    }

    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    logger.error('Firestore document retrieval failed:', error);
    throw error;
  }
};

const setFirestoreDoc = async (collection, docId, data) => {
  try {
    if (!db) {
      initializeFirebase();
    }

    await db.collection(collection).doc(docId).set(data);
    return { id: docId, ...data };
  } catch (error) {
    logger.error('Firestore document creation failed:', error);
    throw error;
  }
};

export {
  initializeFirebase,
  verifyFirebaseToken,
  createFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser,
  getFirestoreDoc,
  setFirestoreDoc,
  auth,
  db,
};
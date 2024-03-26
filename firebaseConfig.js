import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  REACT_NATIVE_FIREBASE_EXTENSION_API_KEY,
  REACT_NATIVE_FIREBASE_EXTENSION_AUTH_DOMAIN,
  REACT_NATIVE_FIREBASE_EXTENSION_PROJECT_ID,
  REACT_NATIVE_FIREBASE_EXTENSION_STORAGE_BUCKET,
  REACT_NATIVE_FIREBASE_EXTENSION_MESSAGING_SENDER_ID,
  REACT_NATIVE_FIREBASE_EXTENSION_APP_ID,
  REACT_NATIVE_FIREBASE_EXTENSION_MEASUREMENT_ID
} from '@env';
import {
  REACT_NATIVE_FIREBASE_TEST_API_KEY,
  REACT_NATIVE_FIREBASE_TEST_AUTH_DOMAIN,
  REACT_NATIVE_FIREBASE_TEST_PROJECT_ID,
  REACT_NATIVE_FIREBASE_TEST_STORAGE_BUCKET,
  REACT_NATIVE_FIREBASE_TEST_MESSAGING_SENDER_ID,
  REACT_NATIVE_FIREBASE_TEST_APP_ID,
  REACT_NATIVE_FIREBASE_TEST_MEASUREMENT_ID
} from '@env';
// Configuration for Firebase project 1
const firebaseConfigTest = {

  apiKey: REACT_NATIVE_FIREBASE_TEST_API_KEY,
  authDomain: REACT_NATIVE_FIREBASE_TEST_AUTH_DOMAIN,
  projectId: REACT_NATIVE_FIREBASE_TEST_PROJECT_ID,
  storageBucket: REACT_NATIVE_FIREBASE_TEST_STORAGE_BUCKET,
  messagingSenderId: REACT_NATIVE_FIREBASE_TEST_MESSAGING_SENDER_ID,
  appId: REACT_NATIVE_FIREBASE_TEST_APP_ID,
  measurementId: REACT_NATIVE_FIREBASE_TEST_MEASUREMENT_ID,
};



// Configuration for Firebase project 2
const firebaseConfigExtension = {
  // Replace with your project 2 configuration
  apiKey: REACT_NATIVE_FIREBASE_EXTENSION_API_KEY,
  authDomain: REACT_NATIVE_FIREBASE_EXTENSION_AUTH_DOMAIN,
  projectId: REACT_NATIVE_FIREBASE_EXTENSION_PROJECT_ID,
  storageBucket: REACT_NATIVE_FIREBASE_EXTENSION_STORAGE_BUCKET,
  messagingSenderId: REACT_NATIVE_FIREBASE_EXTENSION_MESSAGING_SENDER_ID,
  appId: REACT_NATIVE_FIREBASE_EXTENSION_APP_ID,
  measurementId: REACT_NATIVE_FIREBASE_EXTENSION_MEASUREMENT_ID,
};




// Initialize Firebase for project 1
export const projectTestFirebase = initializeApp(firebaseConfigTest, 'projectTestServer');
export const projectTestAuth = getAuth(projectTestFirebase);
export const projectTestFirestore = getFirestore(projectTestFirebase);

// Initialize Firebase for project 2

export const projectExtensionFirebase = initializeApp(firebaseConfigExtension);
export const projectExtensionAuth = getAuth(projectExtensionFirebase);
export const projectExtensionFirestore = getFirestore(projectExtensionFirebase);
export const projectExtensionStorage = getStorage(projectExtensionFirebase);
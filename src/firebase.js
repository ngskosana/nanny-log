import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZn0PXv44l7-nKplR2rR5zKC5Sru92coA",
  authDomain: "nanny-log-a70dd.firebaseapp.com",
  projectId: "nanny-log-a70dd",
  storageBucket: "nanny-log-a70dd.firebasestorage.app",
  messagingSenderId: "90984245825",
  appId: "1:90984245825:web:f6f178c69a19755091f4c0",
  measurementId: "G-H1ZT2JSZ4X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { db };

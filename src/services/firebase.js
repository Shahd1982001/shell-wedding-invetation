import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAUgFY_pwlVYPdHTzsIRaCMvhR2FGY8234',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wedding-invitations-181a3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wedding-invitations-181a3',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wedding-invitations-181a3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '468811674178',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:468811674178:web:42026ddb7c8a56a76e73db',
}

const app = initializeApp(config)
export const db = getFirestore(app)

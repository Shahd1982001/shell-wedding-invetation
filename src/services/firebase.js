// إعدادات Firebase للويب ليست سرّية — الحماية الحقيقية في firestore.rules
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAUgFY_pwlVYPdHTzsIRaCMvhR2FGY8234',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wedding-invitations-181a3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wedding-invitations-181a3',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wedding-invitations-181a3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '468811674178',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:468811674178:web:42026ddb7c8a56a76e73db',
}

// Firebase يُحمَّل فقط عند الاقتراب من نموذج تأكيد الحضور، حتى تفتح الدعوة أسرع
let ready = null
export function loadFirestore() {
  ready ||= Promise.all([import('firebase/app'), import('firebase/firestore')])
    .then(([app, fs]) => ({ fs, db: fs.getFirestore(app.initializeApp(config)) }))
    .catch((e) => { ready = null; throw e })
  return ready
}

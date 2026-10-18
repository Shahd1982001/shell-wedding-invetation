import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'

export async function submitRsvp({ name, attending, companions }) {
  const safeCompanions = attending ? companions : 0
  const totalGuests = attending ? 1 + safeCompanions : 0
  const response = {
    name,
    attending,
    companions: safeCompanions,
    totalGuests,
    createdAt: serverTimestamp(),
  }

  const saved = await addDoc(collection(db, 'rsvps'), response)
  return { ok: true, saved: true, id: saved.id }
}

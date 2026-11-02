import { loadFirestore } from './firebase.js'

// كل جهاز يحفظ رقم ردّه، فـ«تعديل الرد» يحدّث نفس الرد بدل ما يضيف ردًّا مكررًا
const KEY = 'nm-rsvp'
const TIMEOUT = 15000

export function getSavedRsvp() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
export function forgetSavedRsvp() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
export function warmupRsvp() {
  loadFirestore().catch(() => {})
}

const newId = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Date.now().toString(36) + Math.random().toString(36).slice(2, 12))
const withTimeout = (p) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), TIMEOUT))])

export async function submitRsvp({ name, attending, companions }) {
  const { db, fs } = await withTimeout(loadFirestore())
  const safeCompanions = attending ? companions : 0
  const response = {
    name,
    attending,
    companions: safeCompanions,
    totalGuests: attending ? 1 + safeCompanions : 0,
    createdAt: fs.serverTimestamp(),
  }

  const saved = getSavedRsvp()
  let id = saved?.id || newId()
  try {
    await withTimeout(fs.setDoc(fs.doc(db, 'rsvps', id), response))
  } catch (e) {
    // لو قواعد قاعدة البيانات القديمة لا تسمح بالتعديل، نحفظ الرد الجديد كرد مستقل
    if (!saved?.id || e?.code !== 'permission-denied') throw e
    id = newId()
    await withTimeout(fs.setDoc(fs.doc(db, 'rsvps', id), response))
  }

  try {
    localStorage.setItem(KEY, JSON.stringify({ id, name, attending, companions: safeCompanions, at: Date.now() }))
  } catch { /* ignore */ }
  return { ok: true, saved: true, id }
}

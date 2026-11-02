// موسيقى الدعوة — تبدأ مع الضغط على اللؤلؤة (لازم تكون بعد لمسة من الضيف حتى تسمح بها المتصفحات)
import { wedding } from '../config/wedding.js'
import { asset } from '../config/assets.js'

const cfg = wedding.music || {}
const PREF = 'nm-sound'
const START = Math.max(0, +cfg.start || 0)
const VOLUME = Math.min(1, Math.max(0, cfg.volume ?? 0.75))

let audio = null
let wantPlaying = false
let fadeTimer = 0
let loopFading = false
let enabled = (() => { try { return localStorage.getItem(PREF) !== 'off' } catch { return true } })()
let snapshot = { available: !!cfg.src, enabled }
const listeners = new Set()

function update(patch) {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((fn) => fn())
}
export const subscribeSound = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
export const getSoundState = () => snapshot
export const isSoundEnabled = () => enabled

function ensureAudio() {
  if (audio || !cfg.src) return audio
  audio = new Audio()
  audio.preload = 'auto'
  audio.loop = false // نعيد التشغيل يدويًا من ثانية البداية مع تلاشي ناعم
  audio.addEventListener('error', () => { wantPlaying = false; update({ available: false }) })
  audio.addEventListener('timeupdate', () => {
    const d = audio.duration
    if (!d || !isFinite(d) || loopFading || audio.paused) return
    if (audio.currentTime > d - 1.8) { loopFading = true; fadeTo(0, 1500) }
  })
  audio.addEventListener('ended', () => {
    loopFading = false
    if (!wantPlaying || !enabled) return
    seekStart(); play(); fadeTo(VOLUME, 1500)
  })
  audio.src = asset(cfg.src)
  return audio
}

function seekStart() {
  if (!START) { try { audio.currentTime = 0 } catch { /* ignore */ } return }
  if (audio.readyState >= 1) { try { audio.currentTime = START } catch { /* ignore */ } }
  else audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = START } catch { /* ignore */ } }, { once: true })
}

function play() {
  const p = audio.play()
  if (p && p.catch) p.catch(() => {})
}

// تغيير الصوت تدريجيًا (في آيفون الصوت ثابت من النظام، فيبدأ ويقف مباشرة بدون تلاشي)
function fadeTo(target, ms, done) {
  clearInterval(fadeTimer)
  const from = audio.volume, t0 = Date.now()
  fadeTimer = setInterval(() => {
    const k = Math.min(1, (Date.now() - t0) / ms)
    try { audio.volume = from + (target - from) * k } catch { /* ignore */ }
    if (k >= 1) { clearInterval(fadeTimer); done && done() }
  }, 40)
}

export function preloadMusic() {
  if (ensureAudio()) audio.load()
}

// تُستدعى داخل حدث الضغط على اللؤلؤة
export function startMusic() {
  if (!snapshot.available || !ensureAudio()) return
  wantPlaying = true
  if (!enabled) return
  loopFading = false
  seekStart()
  try { audio.volume = 0 } catch { /* ignore */ }
  play()
  fadeTo(VOLUME, 2800)
}

export function stopMusic() {
  wantPlaying = false
  if (!audio || audio.paused) return
  fadeTo(0, 1200, () => audio.pause())
}

export function setSoundEnabled(on) {
  enabled = on
  try { localStorage.setItem(PREF, on ? 'on' : 'off') } catch { /* ignore */ }
  update({ enabled: on })
  if (!audio) return
  if (!on) { fadeTo(0, 500, () => audio.pause()); return }
  if (wantPlaying) { play(); fadeTo(VOLUME, 1200) }
}

// إيقاف الموسيقى مؤقتًا لما الضيف يطلع من الصفحة (واتساب مثلًا) واستئنافها عند الرجوع
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!audio || !wantPlaying || !enabled) return
    if (document.hidden) audio.pause()
    else play()
  })
}

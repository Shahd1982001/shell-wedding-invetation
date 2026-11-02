// دوال التاريخ والتقويم — بدون أي اعتماد على المتصفح (تُستخدم أيضًا وقت البناء في vite.config.js)
import { wedding } from '../config/wedding.js'

export const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
export const pad = (n) => String(n).padStart(2, '0')

export function partsOf(date, tz = wedding.timeZone) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(date).map((x) => [x.type, x.value]))
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute }
}

export const eventStart = () => new Date(wedding.dateTime)
export const eventEnd = () => new Date(eventStart().getTime() + (wedding.durationHours || 3) * 3600e3)
// بعد هذا الوقت تظهر رسالة «تمّ الحفل» بدل «حان موعد الحفل»
export const eventOver = () => new Date(eventStart().getTime() + 12 * 3600e3)

// «الجمعة 25 ديسمبر 2026»
export function dateLabel(date = eventStart(), withDay = true) {
  const t = partsOf(date)
  const day = DAYS[new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay()]
  return `${withDay ? day + ' ' : ''}${t.d} ${MONTHS[t.m - 1]} ${t.y}`
}

// { clock: '8:00', period: 'مساءً' }
export function timeLabel(date = eventStart()) {
  const t = partsOf(date)
  return { clock: `${t.h % 12 || 12}:${pad(t.min)}`, period: t.h >= 12 ? 'مساءً' : 'صباحًا' }
}

// تاريخ بصيغة 'YYYY-MM-DD' (مثل آخر موعد للرد) ← «15 ديسمبر 2026»
export function plainDateLabel(ymd) {
  const [y, m, d] = String(ymd).split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export const eventTitle = () => `حفل زفاف ${wedding.bride} و${wedding.groom}`
export const eventLocation = () => [wedding.venueName, wedding.venueCity].filter(Boolean).join('، ')
const utcStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

export function googleCalendarUrl() {
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + `&text=${encodeURIComponent(eventTitle())}`
    + `&dates=${utcStamp(eventStart())}/${utcStamp(eventEnd())}`
    + `&details=${encodeURIComponent(wedding.subtitle)}`
    + `&location=${encodeURIComponent(eventLocation())}`
}

// ملف تقويم (ics) لأجهزة آيفون/ماك — يُنشأ وقت البناء كـ /wedding.ics
export function icsContent() {
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
  const start = eventStart()
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding-invitation//AR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${utcStamp(start)}@${String(wedding.siteUrl || 'invitation').replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(eventEnd())}`,
    `SUMMARY:${esc(eventTitle())}`,
    `DESCRIPTION:${esc(wedding.subtitle)}`,
    `LOCATION:${esc(eventLocation())}`,
    ...(wedding.siteUrl ? [`URL:${wedding.siteUrl}`] : []),
    'END:VEVENT', 'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

// RFC 5545: لا يتجاوز السطر 75 بايت (UTF-8)، وتبدأ الأسطر المكمّلة بمسافة
function fold(line) {
  const enc = new TextEncoder()
  const out = []
  let cur = '', bytes = 0
  for (const ch of line) {
    const b = enc.encode(ch).length
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0 }
    cur += ch; bytes += b
  }
  out.push(cur)
  return out.join('\r\n ')
}

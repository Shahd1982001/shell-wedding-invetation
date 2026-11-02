import { googleCalendarUrl } from './event.js'

// آيفون/آيباد/ماك ← ملف ics يفتح تقويم Apple مباشرة، وباقي الأجهزة ← Google Calendar
const isApple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)

export function calendarLink() {
  if (isApple()) return { href: `${import.meta.env.BASE_URL}wedding.ics`, external: false }
  return { href: googleCalendarUrl(), external: true }
}

export const externalProps = { target: '_blank', rel: 'noopener noreferrer' }

import { useEffect, useMemo, useState } from 'react'
import { wedding } from '../config/wedding.js'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const WEEK = ['سبت','أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة'] // الأسبوع يبدأ بالسبت
const pad = (n) => String(n).padStart(2, '0')

function partsOf(date, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(date).map((x) => [x.type, x.value]))
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute }
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const diff = Math.max(0, target - now)
  const s = Math.floor(diff / 1000)
  return { over: target - now <= 0, days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, mins: Math.floor(s / 60) % 60, secs: s % 60 }
}

export default function CalendarCountdown() {
  const date = useMemo(() => new Date(wedding.dateTime), [])
  const endDate = useMemo(() => new Date(date.getTime() + 3 * 60 * 60 * 1000), [date])
  const t = useMemo(() => partsOf(date, wedding.timeZone), [date])
  const cd = useCountdown(date.getTime())
  const lead = (new Date(Date.UTC(t.y, t.m - 1, 1)).getUTCDay() + 1) % 7
  const total = new Date(Date.UTC(t.y, t.m, 0)).getUTCDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  const h12 = t.h % 12 || 12, ampm = t.h >= 12 ? 'مساءً' : 'صباحًا'
  const calendarDate = (value) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`حفل زفاف ${wedding.bride} و${wedding.groom}`)}&dates=${calendarDate(date)}/${calendarDate(endDate)}&details=${encodeURIComponent(wedding.subtitle)}&location=${encodeURIComponent(`${wedding.venueName}، ${wedding.venueCity}`)}`

  return (
    <section className="layer cal" aria-label="موعد الحفل">
      <div className="calbox">
        <h2 className="month">{MONTHS[t.m - 1]} {t.y}</h2>
        <div className="grid" role="grid" aria-label={`تقويم ${MONTHS[t.m - 1]}`}>
          {WEEK.map((w) => <span key={w} className="wd">{w}</span>)}
          {cells.map((d, i) => (
            <span key={i} className={`day${d === t.d ? ' on' : ''}`} aria-current={d === t.d ? 'date' : undefined}>{d}</span>
          ))}
        </div>
        <p className="time">تبدأ السهرة عند الساعة <b>{h12}:{pad(t.min)}</b> {ampm}</p>
        {cd.over ? (
          <p className="over" role="status">حان موعد الحفل — أهلًا بكم</p>
        ) : (
          <div className="count" role="timer" aria-label="العدّاد التنازلي">
            {[['يوم', cd.days], ['ساعة', cd.hours], ['دقيقة', cd.mins], ['ثانية', cd.secs]].map(([l, n]) => (
              <div key={l}><strong>{pad(n)}</strong><small>{l}</small></div>
            ))}
          </div>
        )}
        <a className="calendar-link" href={calendarUrl} target="_blank" rel="noopener noreferrer">إضافة الموعد للتقويم</a>
      </div>
    </section>
  )
}

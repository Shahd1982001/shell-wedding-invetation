import { useEffect, useMemo, useState } from 'react'
import { wedding } from '../config/wedding.js'
import { MONTHS, pad, partsOf, eventStart, eventOver, timeLabel } from '../utils/event.js'
import { calendarLink, externalProps } from '../utils/links.js'

const WEEK = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'] // الأسبوع يبدأ بالسبت

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const diff = Math.max(0, target - now)
  const s = Math.floor(diff / 1000)
  return { now, over: target - now <= 0, days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, mins: Math.floor(s / 60) % 60, secs: s % 60 }
}

export default function CalendarCountdown() {
  const date = useMemo(eventStart, [])
  const t = useMemo(() => partsOf(date), [date])
  const cd = useCountdown(date.getTime())
  const lead = (new Date(Date.UTC(t.y, t.m - 1, 1)).getUTCDay() + 1) % 7
  const total = new Date(Date.UTC(t.y, t.m, 0)).getUTCDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  const { clock, period } = timeLabel(date)
  const cal = useMemo(calendarLink, [])

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
        <p className="time">تبدأ السهرة عند الساعة <b>{clock}</b> {period}</p>
        {cd.over ? (
          <p className="over" role="status">{cd.now > eventOver().getTime() ? wedding.afterEvent : 'حان موعد الحفل — أهلًا بكم'}</p>
        ) : (
          <div className="count" role="timer" aria-label="العدّاد التنازلي">
            {[['يوم', cd.days], ['ساعة', cd.hours], ['دقيقة', cd.mins], ['ثانية', cd.secs]].map(([l, n]) => (
              <div key={l}><strong>{pad(n)}</strong><small>{l}</small></div>
            ))}
          </div>
        )}
        <a className="calendar-link" href={cal.href} {...(cal.external ? externalProps : {})}>إضافة الموعد للتقويم</a>
        <div className="cal-location">
          <p className="eyebrow">مكان الحفل</p>
          <p className="cal-venue">{wedding.venueName}</p>
          <p className="cal-city">{wedding.venueCity}</p>
          <a className="btn-gold" href={wedding.mapsUrl} {...externalProps}>عرض موقع الصالة</a>
        </div>
      </div>
    </section>
  )
}

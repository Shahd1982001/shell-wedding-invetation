import { useMemo } from 'react'
import { wedding } from '../config/wedding.js'
import { dateLabel, timeLabel } from '../utils/event.js'
import { calendarLink, externalProps } from '../utils/links.js'

// بطاقة ثابتة بالموعد والمكان — يرجع لها الضيف في أي وقت (مثلًا يوم الحفل لفتح الخريطة)
export default function EventDetails() {
  const { clock, period } = timeLabel()
  const cal = useMemo(calendarLink, [])
  return (
    <section className="details" aria-labelledby="details-t">
      <h2 id="details-t" className="sec-title">موعدنا</h2>
      <p className="details-date">{dateLabel()}</p>
      <p className="time">تبدأ السهرة عند الساعة <b>{clock}</b> {period}</p>
      <div className="details-venue">
        <p className="eyebrow">مكان الحفل</p>
        <p className="cal-venue">{wedding.venueName}</p>
        <p className="cal-city">{wedding.venueCity}</p>
      </div>
      <a className="btn-gold" href={wedding.mapsUrl} {...externalProps}>عرض موقع الصالة</a>
      <a className="calendar-link" href={cal.href} {...(cal.external ? externalProps : {})}>إضافة الموعد للتقويم</a>
    </section>
  )
}

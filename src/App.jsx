import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { wedding } from './config/wedding.js'
import IntroShell from './components/IntroShell.jsx'
import Story from './components/Story.jsx'
import PersonalNote from './components/PersonalNote.jsx'
import RSVPForm from './components/RSVPForm.jsx'
import ClosingShell from './components/ClosingShell.jsx'
import useReducedMotion from './hooks/useReducedMotion.js'

gsap.registerPlugin(ScrollTrigger)

function EventSummary() {
  const when = new Date(wedding.dateTime)
  const weekday = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(when)
  const date = new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(when)
  const time = new Intl.DateTimeFormat('ar-EG', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(when)

  return (
    <section className="event-summary" aria-label="معلومات الحفل">
      <div className="event-card">
        <p className="eyebrow">الموعد والمكان</p>
        <h2>{weekday}</h2>
        <p className="summary-date">{date}</p>
        <p className="summary-time">{time}</p>
        <p className="summary-venue">{wedding.venueName} — {wedding.venueCity}</p>
        <div className="summary-actions">
          <a className="btn-gold" href={wedding.mapsUrl} target="_blank" rel="noopener noreferrer">عرض الموقع</a>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [stage, setStage] = useState('intro')
  const [run, setRun] = useState(0)
  const veil = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    document.body.style.overflow = stage === 'intro' ? 'hidden' : ''
    if (stage !== 'story') return
    const t = gsap.to(veil.current, { opacity: 0, duration: reduce ? 0.6 : 2.4, delay: 0.35, ease: 'power2.inOut' })
    const r = setTimeout(() => ScrollTrigger.refresh(), 250)
    return () => { t.kill(); clearTimeout(r) }
  }, [stage, reduce])

  const enter = () => {
    window.scrollTo(0, 0)
    setStage('story')
  }
  const replay = () => {
    gsap.to(veil.current, {
      opacity: 1, duration: 1.4, ease: 'power2.inOut',
      onComplete: () => {
        window.scrollTo(0, 0); setRun((n) => n + 1); setStage('intro')
        gsap.to(veil.current, { opacity: 0, duration: 1.6, delay: 0.3 })
      },
    })
  }

  return (
    <>
      <div className="bg" aria-hidden="true" />
      {stage === 'intro' ? (
        <IntroShell key={run} veilRef={veil} reduce={reduce} onDone={enter} />
      ) : (
        <main>
          <Story reduce={reduce} />
          <EventSummary />
          <section className="notice-box" aria-label="ملاحظات مهمة">
            <h2 className="sec-title">ملاحظات مهمة</h2>
            <ul>
              <li>يرجى عدم اصطحاب الأطفال.</li>
              <li>نرجو عدم التصوير أثناء الحفل.</li>
              <li>شكرًا لتفهمكم ولطفكم.</li>
            </ul>
          </section>
          <RSVPForm />
          <ClosingShell onReplay={replay} />
        </main>
      )}
      <div className="veil" ref={veil} aria-hidden="true" />
    </>
  )
}

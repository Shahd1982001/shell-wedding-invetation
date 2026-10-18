import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import IntroShell from './components/IntroShell.jsx'
import Story from './components/Story.jsx'
import PersonalNote from './components/PersonalNote.jsx'
import RSVPForm from './components/RSVPForm.jsx'
import ClosingShell from './components/ClosingShell.jsx'
import useReducedMotion from './hooks/useReducedMotion.js'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [stage, setStage] = useState('intro')
  const [run, setRun] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [pauseReason, setPauseReason] = useState('')
  const veil = useRef(null)
  const autoPlayRef = useRef(false)
  const pauseTarget = useRef('')
  const skippedTargets = useRef(new Set())
  const programmaticScroll = useRef(false)
  const autoplayTimer = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    document.body.style.overflow = stage === 'intro' ? 'hidden' : ''
    if (stage !== 'story') return
    const t = gsap.to(veil.current, { opacity: 0, duration: reduce ? 0.6 : 2.4, delay: 0.35, ease: 'power2.inOut' })
    const r = setTimeout(() => ScrollTrigger.refresh(), 250)
    return () => { t.kill(); clearTimeout(r) }
  }, [stage, reduce])

  useEffect(() => () => clearTimeout(autoplayTimer.current), [])

  useEffect(() => {
    if (stage !== 'story' || reduce) return undefined

    let frame
    let previous = performance.now()
    const targets = {
      venue: () => document.querySelector('.venue'),
      note: () => document.querySelector('.note'),
      rsvp: () => document.querySelector('.rsvp'),
    }

    const isVisible = (element) => {
      if (!element) return false
      const style = window.getComputedStyle(element)
      if (style.visibility === 'hidden' || Number(style.opacity) < 0.5) return false
      const rect = element.getBoundingClientRect()
      return rect.top < window.innerHeight * 0.72 && rect.bottom > 80
    }

    const stopAtTarget = (key) => {
      if (skippedTargets.current.has(key)) return
      if (pauseTarget.current === key) return
      pauseTarget.current = key
      autoPlayRef.current = false
      setAutoPlay(false)
      setPauseReason(key)
    }

    const tick = (now) => {
      const elapsed = Math.min(now - previous, 80)
      previous = now
      const activeTarget = Object.keys(targets).find((key) => isVisible(targets[key]()))

      if (pauseTarget.current && !isVisible(targets[pauseTarget.current]())) {
        skippedTargets.current.delete(pauseTarget.current)
        pauseTarget.current = ''
      }
      if (autoPlayRef.current && activeTarget && pauseTarget.current !== activeTarget) stopAtTarget(activeTarget)
      if (autoPlayRef.current && !activeTarget) {
        programmaticScroll.current = true
        window.scrollBy(0, elapsed * 0.11)
        window.setTimeout(() => { programmaticScroll.current = false }, 0)
      }
      frame = requestAnimationFrame(tick)
    }

    const stopOnManualScroll = () => {
      if (programmaticScroll.current || !autoPlayRef.current) return
      autoPlayRef.current = false
      setAutoPlay(false)
      setPauseReason('manual')
    }

    window.addEventListener('wheel', stopOnManualScroll, { passive: true })
    window.addEventListener('touchstart', stopOnManualScroll, { passive: true })
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', stopOnManualScroll)
      window.removeEventListener('touchstart', stopOnManualScroll)
    }
  }, [stage, reduce])

  const changeAutoPlay = (next, reason = '') => {
    if (next && pauseReason !== 'manual') {
      skippedTargets.current.add(pauseReason)
      pauseTarget.current = ''
    }
    autoPlayRef.current = next
    setAutoPlay(next)
    if (next) setPauseReason('')
    else if (!reason) setPauseReason('manual')
  }

  const enter = () => {
    window.scrollTo(0, 0)
    skippedTargets.current.clear()
    setStage('story')
    clearTimeout(autoplayTimer.current)
    autoplayTimer.current = setTimeout(() => changeAutoPlay(true), 2600)
  }
  const replay = () => {
    gsap.to(veil.current, {
      opacity: 1, duration: 1.4, ease: 'power2.inOut',
      onComplete: () => {
        window.scrollTo(0, 0); skippedTargets.current.clear(); clearTimeout(autoplayTimer.current); setRun((n) => n + 1); setStage('intro'); changeAutoPlay(false)
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
          <PersonalNote
            reduce={reduce}
            onOpen={(action) => {
              if (action === 'continue') {
                pauseTarget.current = ''
                skippedTargets.current.add('note')
                changeAutoPlay(true)
              } else {
                changeAutoPlay(false)
              }
            }}
          />
          <RSVPForm />
          <ClosingShell onReplay={replay} />
        </main>
      )}
      {stage === 'story' && !reduce && (
        <div className="auto-controls" aria-live="polite">
          {pauseReason === 'venue' && <span>توقّف عند الصالة — يمكنك فتح الخريطة</span>}
          {pauseReason === 'note' && <span>افتحي الظرف لقراءة الملاحظات</span>}
          {pauseReason === 'rsvp' && <span>توقّف لتأكيد الحضور</span>}
          {pauseReason === 'manual' && <span>تم إيقاف التشغيل للقراءة</span>}
          <button type="button" onClick={() => changeAutoPlay(!autoPlay)}>
            {autoPlay ? 'إيقاف مؤقت' : 'متابعة الدعوة'}
          </button>
        </div>
      )}
      <div className="veil" ref={veil} aria-hidden="true" />
    </>
  )
}

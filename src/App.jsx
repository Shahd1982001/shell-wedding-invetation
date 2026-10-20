import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import IntroShell from './components/IntroShell.jsx'
import Story from './components/Story.jsx'
import PersonalNote from './components/PersonalNote.jsx'
import ClosingShell from './components/ClosingShell.jsx'
import useReducedMotion from './hooks/useReducedMotion.js'

gsap.registerPlugin(ScrollTrigger)

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
          <PersonalNote reduce={reduce} />
          <ClosingShell onReplay={replay} />
        </main>
      )}
      <div className="veil" ref={veil} aria-hidden="true" />
    </>
  )
}

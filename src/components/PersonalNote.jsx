import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { wedding } from '../config/wedding.js'
import RSVPForm from './RSVPForm.jsx'

export default function PersonalNote({ reduce }) {
  const sec = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (reduce) return
      gsap.fromTo('.note-paper, .note-rsvp',
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec.current,
            start: 'top 82%',
            once: true,
          },
        })
    }, sec)
    return () => ctx.revert()
  }, [reduce])

  return (
    <section className="note" ref={sec} aria-label="الملاحظات وتأكيد الحضور">
      <article className="note-paper">
        <h2>{wedding.notes.title}</h2>
        <ul>{wedding.notes.items.map((text) => <li key={text}>{text}</li>)}</ul>
        <p>{wedding.notes.closing}</p>
      </article>
      <div className="note-rsvp">
        <RSVPForm />
      </div>
    </section>
  )
}

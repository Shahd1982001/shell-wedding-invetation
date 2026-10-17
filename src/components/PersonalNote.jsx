import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { wedding } from '../config/wedding.js'

// ظرف مقفل ثلاثي الأبعاد؛ الضغط على الشريط يفتح الغطاء وتخرج الورقة بالملاحظات
export default function PersonalNote({ reduce }) {
  const sec = useRef(null), tlRef = useRef(null)
  const [open, setOpen] = useState(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(sec.current)
      if (!reduce) {
        gsap.fromTo(q('.env3d'), { rotationX: 58, rotationY: -22, y: 90, autoAlpha: 0.1 },
          { rotationX: 6, rotationY: 0, y: 0, autoAlpha: 1, ease: 'none',
            scrollTrigger: { trigger: sec.current, start: 'top 85%', end: 'center 55%', scrub: 1.2 } })
      }
      const parts = q('.env-back, .env-front')
      tlRef.current = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } })
        .to(q('.ribbon'), { autoAlpha: 0, scale: 1.08, duration: 0.5 })
        .to(q('.flap'), { rotationX: 180, duration: reduce ? 0.3 : 1 }, 0.3)
        .set(q('.flap'), { zIndex: 1 }, 0.8)
        .to(q('.paper'), { yPercent: -62, duration: reduce ? 0.3 : 1.1, ease: 'power2.out' }, 1.0)
        .to(parts.concat(q('.flap')), { autoAlpha: 0, y: 50, duration: 0.9 }, 2.1)
        .to(q('.paper'), { yPercent: -6, scale: 1.06, duration: 0.9 }, 2.1)
    }, sec)
    return () => ctx.revert()
  }, [reduce])

  const toggle = () => { const t = tlRef.current; if (!t) return; open ? t.reverse() : t.play(); setOpen(!open) }

  return (
    <section className="note" ref={sec} aria-label={wedding.notes.title}>
      <h2 className="sec-title">{wedding.notes.title}</h2>
      <div className="noteStage">
        <div className="env3d">
          <div className="env">
            <div className="env-back" />
            <div className="paper">
              <h3>{wedding.notes.title}</h3>
              <ul>{wedding.notes.items.map((t) => <li key={t}>{t}</li>)}</ul>
              <p className="thanks">{wedding.notes.closing}</p>
            </div>
            <div className="env-front" />
            <div className="flap" />
            <button className="ribbon" onClick={toggle} aria-expanded={open} aria-label="فتح الظرف لقراءة الملاحظات">
              <span className="wax-seal" aria-hidden="true">
                <img className="seal-logo" src="/assets/logo copy.webp" alt="" />
              </span>
            </button>
          </div>
        </div>
      </div>
      <p className="tap">{open ? '' : 'اضغطي على الشريط لفتح الظرف'}</p>
      {open && <button className="link" onClick={toggle}>إغلاق الظرف</button>}
    </section>
  )
}

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WeddingScene from './WeddingScene.jsx'
import WelcomeScene from './WelcomeScene.jsx'
import CalendarCountdown from './CalendarCountdown.jsx'

// مشهد واحد مثبّت: الأسماء ← تكبير الفستان ← الترحيب ← التقويم والموعد والمكان
// كل مرحلة تختفي كاملًا قبل أن تبدأ التالية، والتقويم يثبت لحظة واضحًا قبل أن يتلاشى تدريجيًا.
export default function Story({ reduce }) {
  const root = useRef(null)
  const refresh = useRef(() => ScrollTrigger.refresh())

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current)
      const wrap = q('.zoomwrap')[0], stage = q('.stage')[0]
      const S = reduce ? 1 : 2.6
      const toDress = () => ({
        x: stage.clientWidth / 2 - (wrap.offsetLeft + wrap.offsetWidth * 0.33),
        y: stage.clientHeight / 2 - (wrap.offsetTop + wrap.offsetHeight * 0.68),
      })
      const from = { autoAlpha: 0, y: 30 }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => '+=' + window.innerHeight * 5.4, pin: true, scrub: 1.2, anticipatePin: 1, invalidateOnRefresh: true },
      })
      tl.to(q('.hero'), { autoAlpha: 0, y: -40, duration: 1.2 }, 0)
        .to(q('.hint'), { autoAlpha: 0, duration: 0.4 }, 0)
        .to(wrap, { scale: S, x: () => (reduce ? 0 : toDress().x), y: () => (reduce ? 0 : toDress().y), duration: 1.25, ease: 'power1.inOut' }, 0.2)
        .to(q('.dim'), { opacity: 1, duration: 0.5 }, 0.9)
        // الترحيب
        .fromTo(q('.welcome'), from, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.3)
        .to(q('.welcome'), { autoAlpha: 0, y: -30, duration: 0.65 }, 2.9)
        // التقويم: يظهر بعد اختفاء الترحيب تمامًا، يثبت واضحًا، ثم يتلاشى تدريجيًا
        .fromTo(q('.cal'), from, { autoAlpha: 1, y: 0, duration: 0.8 }, 3.6)
        .to(q('.cal'), { autoAlpha: 0, y: -24, duration: 0.8, ease: 'power1.inOut' }, 5.0)
        .to(q('.couple.main'), { autoAlpha: 0, scale: 1.04, duration: reduce ? 0.35 : 0.6 }, 5.1)
        .to(q('.dim'), { opacity: 0, duration: reduce ? 0.5 : 0.8, ease: 'power1.inOut' }, 5.1)
    }, root)
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => { window.removeEventListener('load', onLoad); ctx.revert() }
  }, [reduce])

  return (
    <section className="story" ref={root} aria-label="قصتنا">
      <div className="stage">
        <WeddingScene onImageLoad={() => refresh.current()} />
        <div className="dim" aria-hidden="true" />
        <WelcomeScene />
        <CalendarCountdown />
      </div>
    </section>
  )
}

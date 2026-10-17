import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import gsap from 'gsap'

const R = 3.35, AMAX = 1.15, D = 0.72, HINGE = -1.55

// نصف صدفة (مروحة بأضلاع) — sign=-1 للنصف السفلي، +1 للغطاء
function halfGeometry(sign) {
  const nu = 96, nv = 36, pos = [], col = [], idx = []
  const deep = new THREE.Color('#063c45'), teal = new THREE.Color('#11757d')
  const light = new THREE.Color('#59c5c0'), gold = new THREE.Color('#f0d49a'), c = new THREE.Color()
  for (let i = 0; i <= nu; i++) {
    const a = (i / nu * 2 - 1) * AMAX
    const w = 1 - (a / AMAX) ** 2
    const ph = (a / AMAX) * 6.5 * Math.PI
    const crest = 0.5 + 0.5 * Math.cos(ph)
    for (let j = 0; j <= nv; j++) {
      const v = j / nv
      const r = R * v * (1 + 0.025 * v ** 4 * Math.cos(ph))
      const y = sign * (D * w * Math.pow(Math.sin(Math.PI * v), 0.8) + 0.07 * crest * Math.pow(v, 1.2))
      pos.push(r * Math.sin(a), y, r * Math.cos(a))
      const ridge = 0.78 + crest * 0.22
      c.copy(deep).lerp(teal, Math.min(1, v * 1.5)).lerp(light, crest * 0.38 * v)
      c.multiplyScalar(ridge)
      const rim = Math.max(0, (v - 0.93) / 0.07), hinge = Math.max(0, (0.12 - v) / 0.12)
      c.lerp(gold, Math.min(1, rim * 0.9 + hinge * 0.8))
      col.push(c.r, c.g, c.b)
    }
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const A = i * (nv + 1) + j, B = A + 1, C = A + nv + 1, E = C + 1
    idx.push(A, B, C, B, E, C)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setIndex(idx); g.computeVertexNormals()
  return g
}

function glowTexture() {
  const s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s
  const x = cv.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,248,225,1)'); g.addColorStop(0.35, 'rgba(255,236,190,.45)'); g.addColorStop(1, 'rgba(255,236,190,0)')
  x.fillStyle = g; x.fillRect(0, 0, s, s)
  return new THREE.CanvasTexture(cv)
}

export default function IntroShell({ onDone, veilRef, reduce }) {
  const mount = useRef(null), btn = useRef(null), go = useRef(() => {})
  const soundRef = useRef(true)
  const [phase, setPhase] = useState('closed') // closed | ready | going | fallback
  const [soundOn, setSoundOn] = useState(true)

  useEffect(() => {
    const el = mount.current, b = btn.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }) }
    catch { setPhase('fallback'); go.current = () => gsap.to(veilRef.current, { opacity: 1, duration: 1.2, onComplete: onDone }); return }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pm = new THREE.PMREMGenerator(renderer)
    const envRT = pm.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture
    const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100)

    const shellMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true, roughness: 0.24, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.16,
      sheen: 1, sheenColor: new THREE.Color('#ffe9b0'), sheenRoughness: 0.2,
      side: THREE.DoubleSide, envMapIntensity: 1.15,
    })
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: '#fbf8f0', roughness: 0.12, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.3,
      sheen: 1, sheenColor: new THREE.Color('#bff3ee'), emissive: new THREE.Color('#fff2d4'), emissiveIntensity: 0,
    })
    const geoLow = halfGeometry(-1), geoUp = halfGeometry(1), geoPearl = new THREE.SphereGeometry(0.54, 48, 48)
    const group = new THREE.Group(); scene.add(group)
    const lower = new THREE.Mesh(geoLow, shellMat); lower.position.z = HINGE
    const lid = new THREE.Group(); lid.position.z = HINGE; lid.add(new THREE.Mesh(geoUp, shellMat))
    const pearl = new THREE.Mesh(geoPearl, pearlMat); pearl.position.set(0, -0.3, 0)
    const tongueMat = new THREE.MeshPhysicalMaterial({
      color: '#dc7b83', roughness: 0.3, clearcoat: 0.8, sheen: 1, sheenColor: new THREE.Color('#ffd4c9'),
    })
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 20), tongueMat)
    tongue.scale.set(2.45, 0.62, 0.94); tongue.position.set(0, -0.67, 0.34)
    const glowTex = glowTexture()
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, depthTest: false, blending: THREE.AdditiveBlending }))
    glow.position.set(0, -0.2, 0.1); glow.renderOrder = 2
    group.add(lower, lid, pearl, tongue, glow)

    scene.add(new THREE.HemisphereLight('#d9ffff', '#031c23', 0.7))
    const key = new THREE.DirectionalLight('#fff1d6', 2.5); key.position.set(3, 6, 4); scene.add(key)
    const rim = new THREE.DirectionalLight('#5fd6d0', 1.5); rim.position.set(-4, 2, -3); scene.add(rim)
    const pl = new THREE.PointLight('#fff2cf', 0, 7); pl.position.set(0, 0.5, 0.3); scene.add(pl)

    const st = { open: 0, glow: 0, dolly: 0, pscale: 1, emis: 0 }
    const camBase = new THREE.Vector3(), camEnd = new THREE.Vector3(0, 0.15, 1.9)
    const lookA = new THREE.Vector3(0, 0.7, 0), lookB = new THREE.Vector3(0, -0.3, 0), look = new THREE.Vector3()
    let w = 1, h = 1
    const resize = () => {
      w = el.clientWidth; h = el.clientHeight
      renderer.setSize(w, h); cam.aspect = w / h
      const d = Math.max(8.5, 5.9 / (2 * Math.tan((cam.fov * Math.PI) / 360) * cam.aspect))
      camBase.set(0, d * 0.55, d * 0.85); cam.updateProjectionMatrix()
    }
    resize(); window.addEventListener('resize', resize)

    const clock = new THREE.Clock(), tmp = new THREE.Vector3()
    let raf
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const t = clock.getElapsedTime()
      lid.rotation.x = -st.open * 1.1
      pearl.scale.setScalar(st.pscale * (1 + Math.sin(t * 2.2) * 0.025 * st.emis))
      pearlMat.emissiveIntensity = st.emis * 0.85
      pl.intensity = st.emis * 30
      glow.material.opacity = Math.min(1, st.glow * 0.8 + st.emis)
      glow.scale.setScalar(1.6 + st.emis * 6)
      cam.position.lerpVectors(camBase, camEnd, st.dolly)
      cam.lookAt(look.lerpVectors(lookA, lookB, st.dolly))
      renderer.render(scene, cam)
      pearl.getWorldPosition(tmp)
      const dist = cam.position.distanceTo(tmp)
      const px = (0.68 * st.pscale / (2 * Math.tan((cam.fov * Math.PI) / 360) * dist)) * h
      tmp.project(cam)
      b.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px,${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%,-50%)`
      b.style.width = b.style.height = `${Math.max(64, px * 1.6)}px`
    }
    frame()

    // الافتتاح التلقائي البطيء
    const open = gsap.timeline({ delay: reduce ? 0.2 : 0.9 })
    open.to(st, { open: 1, duration: reduce ? 0.8 : 3.6, ease: 'power2.inOut' })
      .add(() => setPhase('ready'))

    // الضغط على اللؤلؤة
    let zoom
    go.current = () => {
      if (soundRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
          const audio = new AudioContext()
          const gain = audio.createGain()
          gain.gain.setValueAtTime(0.0001, audio.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.1, audio.currentTime + 0.05)
          gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 1.5)
          gain.connect(audio.destination)
          const notes = [392, 494, 587, 784]
          notes.forEach((frequency, index) => {
            const osc = audio.createOscillator()
            const noteGain = audio.createGain()
            osc.type = index === 0 ? 'sine' : 'triangle'
            osc.frequency.setValueAtTime(frequency, audio.currentTime)
            osc.detune.setValueAtTime(index * 3, audio.currentTime)
            noteGain.gain.setValueAtTime(index === 0 ? 0.55 : 0.22, audio.currentTime)
            noteGain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 1.45)
            osc.connect(noteGain).connect(gain)
            osc.start(audio.currentTime + index * 0.06)
            osc.stop(audio.currentTime + 1.5)
          })
          window.setTimeout(() => audio.close(), 1700)
        }
      }
      const d = reduce ? 0.9 : 2.8
      zoom = gsap.timeline({ onComplete: onDone })
      zoom.to(st, { pscale: 1.85, duration: d, ease: 'power2.inOut' }, 0)
        .to(st, { glow: 1, duration: d * 0.55, ease: 'power1.out' }, 0)
        .to(st, { emis: 1, duration: d * 0.8, ease: 'power1.in' }, 0)
        .to(veilRef.current, { opacity: 1, duration: d * 0.45, ease: 'power1.in' }, d * 0.6)
    }

    return () => {
      open.kill(); zoom && zoom.kill(); cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      ;[geoLow, geoUp, geoPearl, tongue.geometry, shellMat, pearlMat, tongueMat, glow.material, glowTex, envRT, pm].forEach((o) => o.dispose && o.dispose())
      renderer.dispose(); renderer.domElement.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const click = () => {
    if (phase !== 'ready' && phase !== 'fallback') return
    setPhase('going'); go.current()
  }

  return (
    <section className="intro" aria-label="افتتاحية الدعوة">
      <div className="intro-canvas" ref={mount} aria-hidden="true" />
      <div className="bubbles" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>
      <button className="sound-toggle" onClick={() => setSoundOn((value) => { soundRef.current = !value; return !value })} aria-label={soundOn ? 'كتم صوت الافتتاحية' : 'تشغيل صوت الافتتاحية'}>
        {soundOn ? '♪' : '×'} <span>{soundOn ? 'الصوت' : 'صامت'}</span>
      </button>
      <button ref={btn} className={`pearl-hit ${phase}`} onClick={click}
        disabled={phase === 'closed' || phase === 'going'} aria-label="اضغطي على اللؤلؤة لفتح الدعوة" />
      <p className={`intro-hint ${phase === 'ready' || phase === 'fallback' ? 'show' : ''}`} aria-live="polite">اضغطي على اللؤلؤة لفتح دعوتنا</p>
    </section>
  )
}

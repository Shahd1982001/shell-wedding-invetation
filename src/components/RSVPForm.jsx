import { useRef, useState } from 'react'
import { wedding } from '../config/wedding.js'
import { submitRsvp } from '../services/rsvpService.js'

export default function RSVPForm() {
  const max = wedding.rsvp.maxCompanions
  const [f, setF] = useState({ name: '', attend: '', companions: 0 })
  const [err, setErr] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const nameRef = useRef(null)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (f.name.trim().length < 3) e.name = 'يرجى كتابة الاسم (٣ أحرف على الأقل).'
    if (!f.attend) e.attend = 'يرجى اختيار الحضور أو الاعتذار.'
    if (f.attend === 'yes' && (f.companions < 0 || f.companions > max)) e.companions = `الحد الأقصى للمرافقين ${max}.`
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const e = validate(); setErr(e)
    if (Object.keys(e).length) { if (e.name) nameRef.current?.focus(); return }
    setStatus('sending')
    try { await submitRsvp({ name: f.name.trim(), attending: f.attend === 'yes', companions: f.attend === 'yes' ? +f.companions : 0 }); setStatus('done') }
    catch { setStatus('error') }
  }

  return (
    <section className="rsvp" aria-labelledby="rsvp-t">
      <h2 id="rsvp-t" className="sec-title">تأكيد الحضور</h2>
      {status === 'done' ? (
        <div className="done" role="status">
          <p>{f.attend === 'yes' ? 'تم تسجيل حضوركم، ننتظركم بكل محبة.' : 'تم تسجيل اعتذاركم، شكرًا لكم على اهتمامكم.'}</p>
          <p className="demo">تم حفظ ردكم بنجاح.</p>
          <button className="link" onClick={() => setStatus('idle')}>تعديل الرد</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="g-name">الاسم الكريم</label>
            <input id="g-name" ref={nameRef} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name"
              aria-invalid={!!err.name} aria-describedby={err.name ? 'e-name' : undefined} />
            {err.name && <p className="err" id="e-name" role="alert">{err.name}</p>}
          </div>
          <fieldset className="field" aria-describedby={err.attend ? 'e-att' : undefined}>
            <legend>هل ستتشرفون بالحضور؟</legend>
            <div className="choices">
              <label className={f.attend === 'yes' ? 'on' : ''}><input type="radio" name="att" value="yes" checked={f.attend === 'yes'} onChange={() => set('attend', 'yes')} />سأحضر بإذن الله</label>
              <label className={f.attend === 'no' ? 'on' : ''}><input type="radio" name="att" value="no" checked={f.attend === 'no'} onChange={() => set('attend', 'no')} />أعتذر عن الحضور</label>
            </div>
            {err.attend && <p className="err" id="e-att" role="alert">{err.attend}</p>}
          </fieldset>
          <div className={`field companions-field${f.attend === 'yes' ? ' visible' : ''}`} aria-hidden={f.attend !== 'yes'}>
            <label htmlFor="g-comp">عدد المرافقين (حتى {max})</label>
            <select id="g-comp" value={f.companions} disabled={f.attend !== 'yes'} onChange={(e) => set('companions', Number(e.target.value))}>
              {Array.from({ length: max + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}
            </select>
            {err.companions && <p className="err" role="alert">{err.companions}</p>}
          </div>
          <button className="btn-gold" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'جارٍ الإرسال…' : 'إرسال الرد'}</button>
          {status === 'error' && <p className="err" role="alert">تعذّر الإرسال، يرجى المحاولة مرة أخرى.</p>}
        </form>
      )}
    </section>
  )
}

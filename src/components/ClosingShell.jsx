import { wedding } from '../config/wedding.js'
export default function ClosingShell({ onReplay }) {
  return (
    <section className="closing" aria-label="الختام">
      <p className="ayah-thanks">{wedding.thanks}</p>
      <p className="signoff">{wedding.bride} <i>&amp;</i> {wedding.groom}</p>
      <button className="pearl-btn" onClick={onReplay}>
        <span className="pearl" aria-hidden="true" />
        <span className="lbl">انقر هنا لإعادة المشهد</span>
      </button>
    </section>
  )
}

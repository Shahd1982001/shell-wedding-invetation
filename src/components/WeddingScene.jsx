import { wedding } from '../config/wedding.js'
import { asset } from '../config/assets.js'

const hide = (e) => { e.currentTarget.style.visibility = 'hidden' }
const COUPLE_ALT = 'العروسان نسرين ومنصور يمسكان بأيدي بعضهما'

// المشهد الأول: الأسماء + صورة العروسين (تكبر نحو الفستان مع التمرير)
export default function WeddingScene({ onImageLoad }) {
  return (
    <>
      <div className="zoomwrap">
        <img className="couple main" src={asset('couples.webp')} alt={COUPLE_ALT} onLoad={onImageLoad} onError={hide} />
      </div>
      <header className="hero">
        <img className="logo" src={asset('logo.webp')} alt="شعار الحرفين M و N" onError={hide} />
        <h1 className="names">
          <span>{wedding.bride}</span><i aria-hidden="true">&amp;</i><span>{wedding.groom}</span>
        </h1>
        <p className="sub">{wedding.subtitle}</p>
      </header>
      <div className="hint" aria-hidden="true">
        <span className="swipe-hand">👆</span>
        <span>اسحبوا للأعلى للمتابعة</span>
        <b />
      </div>
    </>
  )
}

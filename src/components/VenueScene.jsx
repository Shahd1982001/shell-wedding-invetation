import { wedding } from '../config/wedding.js'
export default function VenueScene() {
  return (
    <div className="venue">
      <p className="eyebrow">مكان الحفل</p>
      <h2>{wedding.venueName}</h2>
      <p className="city">{wedding.venueCity}</p>
      <div className="venue-actions">
        <a className="btn-gold" href={wedding.mapsUrl} target="_blank" rel="noopener noreferrer">عرض موقع الصالة</a>
      </div>
    </div>
  )
}

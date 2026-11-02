import { useSyncExternalStore } from 'react'
import { getSoundState, setSoundEnabled, subscribeSound } from '../services/music.js'

// زر الصوت: يظهر في الافتتاحية دائمًا، وبعدها يبقى ثابتًا طوال الدعوة إذا كانت الأغنية موجودة
export default function SoundToggle({ stage }) {
  const { available, enabled } = useSyncExternalStore(subscribeSound, getSoundState)
  if (stage !== 'intro' && !available) return null
  return (
    <button
      className={`sound-toggle${enabled ? '' : ' off'}`}
      onClick={() => setSoundEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? 'كتم الصوت' : 'تشغيل الصوت'}
    >
      {enabled ? '♪' : '×'} <span>{enabled ? 'الصوت' : 'صامت'}</span>
    </button>
  )
}

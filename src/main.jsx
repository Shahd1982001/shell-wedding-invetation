import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

const css = document.documentElement.style
css.setProperty('--hall-image', `url(${import.meta.env.BASE_URL}assets/hall.webp)`)
// نسخة طولية عالية الدقة للجوال
css.setProperty('--hall-image-portrait', `url(${import.meta.env.BASE_URL}assets/hall-portrait.webp)`)

createRoot(document.getElementById('root')).render(<App />)

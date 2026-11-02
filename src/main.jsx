import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

document.documentElement.style.setProperty('--hall-image', `url(${import.meta.env.BASE_URL}assets/hall.webp)`)

createRoot(document.getElementById('root')).render(<App />)

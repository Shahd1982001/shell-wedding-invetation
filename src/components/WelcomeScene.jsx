import { wedding } from '../config/wedding.js'
export default function WelcomeScene() {
  return (
    <div className="layer welcome">
      <div className="welcome-content">
        <p className="lead">{wedding.welcome}</p>
        <blockquote>
          <p className="ayah" lang="ar">﴿ {wedding.verse.text} ﴾</p>
          <footer>{wedding.verse.ref}</footer>
        </blockquote>
      </div>
    </div>
  )
}

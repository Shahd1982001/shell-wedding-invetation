import { wedding } from '../config/wedding.js'
export default function WelcomeScene() {
  return (
    <>
      <div className="layer welcome"><p className="lead">{wedding.welcome}</p></div>
      <div className="layer verse">
        <blockquote>
          <p className="ayah" lang="ar">﴿ {wedding.verse.text} ﴾</p>
          <footer>{wedding.verse.ref}</footer>
        </blockquote>
      </div>
    </>
  )
}

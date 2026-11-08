import { wedding } from '../config/wedding.js'
export default function WelcomeScene() {
  return (
    <div className="layer welcome">
      <div className="welcome-content">
        <p className="lead">{wedding.welcome}</p>
      </div>
    </div>
  )
}

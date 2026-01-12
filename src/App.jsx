import './App.css'
import { useState, useEffect } from 'react'
import ValidationForm from './components/ValidationForm'
import { encodeAccessToken, decodeAccessToken, validateAccessWindow } from './utils/accessTokenManager'

function App() {
  const [accessValidation, setAccessValidation] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      try {
        const decoded = decodeAccessToken(token)
        const validation = validateAccessWindow(decoded.date, decoded.time, decoded.duration)
        return validation
      } catch {
        return {
          isValid: false,
          message: 'Invalid or expired access token',
          timeRemaining: 0
        }
      }
    }
    return null
  })

  // Handle access token redirect and validation interval
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const email = params.get('email')
    const date = params.get('date')
    const time = params.get('time')
    const duration = params.get('duration')

    // If unencoded parameters exist, encode and redirect
    if (email && date && time && duration && !token) {
      try {
        const encodedToken = encodeAccessToken(email, date, time, duration)
        window.location.replace(`?token=${encodedToken}`)
        return
      } catch {
        // Silent fail
      }
    }

    // If token exists, set up interval for periodic validation
    if (token) {
      try {
        const decoded = decodeAccessToken(token)

        // Set interval to update validation every 30 seconds for frequent checks
        // This ensures the form becomes visible as soon as the access window starts
        const interval = setInterval(() => {
          const validation = validateAccessWindow(decoded.date, decoded.time, decoded.duration)
          setAccessValidation(validation)
        }, 30000)

        return () => clearInterval(interval)
      } catch {
        // Silent fail
      }
    }
  }, [])

  const getTimeDisplay = () => {
    if (!accessValidation || !accessValidation.timeRemaining) {
      return ''
    }

    const hours = Math.floor(accessValidation.timeRemaining / 60)
    const minutes = accessValidation.timeRemaining % 60

    return `${hours}h ${minutes}m`
  }

  const getAccessStatus = () => {
    if (!accessValidation) {
      return 'valid' // No access token = no restriction
    }

    if (accessValidation.message.includes('not yet available')) {
      return 'early'
    }

    if (accessValidation.message.includes('expired')) {
      return 'late'
    }

    return accessValidation.isValid ? 'valid' : 'invalid'
  }

  const getHeaderContent = () => {
    const status = getAccessStatus()

    if (status === 'early' && accessValidation) {
      const match = accessValidation.message.match(/Starts in (\d+) minute\(s\)\./)
      const minutesUntilStart = match ? match[1] : '0'
      return (
        <>
          <h1>QA Home Assignment</h1>
          <p>This assignment will be available in {minutesUntilStart} minute(s).</p>
        </>
      )
    }

    if (status === 'late') {
      return (
        <>
          <h1>QA Home Assignment</h1>
          <p>This assignment is no longer available.</p>
        </>
      )
    }

    return (
      <>
        <h1>QA Home Assignment</h1>
        <p>Explore the form below, try every interesting value!</p>
        <p>You have {getTimeDisplay() || 'unlimited time'} to finish the assignment.</p>
      </>
    )
  }

  const status = getAccessStatus()
  const isAccessValid = status === 'valid'

  return (
    <div className="app-container">
      <header className="app-header">
        {getHeaderContent()}
      </header>
      {isAccessValid && (
        <main className="app-main">
          <ValidationForm accessValidation={accessValidation} />
        </main>
      )}
    </div>
  )
}

export default App

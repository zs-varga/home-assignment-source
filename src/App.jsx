import './App.css'
import { useState, useEffect } from 'react'
import ValidationForm from './components/ValidationForm'
import { encodeAccessToken, decodeAccessToken, validateAccessWindow } from './utils/accessTokenManager'

function App() {
  const [accessValidation, setAccessValidation] = useState(() => {
    let token = null

    // Try to get token from path (e.g., /MTpjYW5k...)
    const pathMatch = window.location.pathname.match(/\/([A-Za-z0-9+/=]+)$/)
    if (pathMatch) {
      token = pathMatch[1]
    }

    // If not found in path, try query parameter without 'token=' prefix
    if (!token) {
      const search = window.location.search.substring(1) // Remove leading ?
      const params = new URLSearchParams(search)
      token = params.get('token')

      // If still no token, check if the entire query string is the token (no parameter names)
      if (!token && search && !search.includes('=')) {
        token = search
      }
    }

    if (token) {
      try {
        const decoded = decodeAccessToken(token)
        const validation = validateAccessWindow(decoded.date, decoded.time, decoded.duration)
        if (!validation.isValid && !validation.message.includes('not yet available') && !validation.message.includes('expired')) {
          return {
            isValid: false,
            message: 'Invalid token',
            timeRemaining: 0,
            status: 'invalid'
          }
        }
        return validation
      } catch {
        return {
          isValid: false,
          message: 'Invalid token',
          timeRemaining: 0,
          status: 'invalid'
        }
      }
    }
    return {
      isValid: false,
      message: 'Invalid token',
      timeRemaining: 0,
      status: 'invalid'
    }
  })

  // Handle access token redirect and validation interval
  useEffect(() => {
    let token = null

    // Try to get token from path
    const pathMatch = window.location.pathname.match(/\/([A-Za-z0-9+/=]+)$/)
    if (pathMatch) {
      token = pathMatch[1]
    }

    // If not found in path, try query string
    if (!token) {
      const search = window.location.search.substring(1)
      const params = new URLSearchParams(search)
      token = params.get('token')

      // If still no token, check if entire query string is the token
      if (!token && search && !search.includes('=')) {
        token = search
      }
    }

    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    const date = params.get('date')
    const time = params.get('time')
    const duration = params.get('duration')

    // If unencoded parameters exist, encode and redirect
    if (email && date && time && duration && !token) {
      try {
        const encodedToken = encodeAccessToken(email, date, time, duration)
        window.location.replace(`/${encodedToken}`)
        return
      } catch {
        // Silent fail
      }
    }

    // If token exists, set up interval for periodic validation
    if (token) {
      try {
        const decoded = decodeAccessToken(token)

        // Set interval to update validation every second for live timer updates
        const interval = setInterval(() => {
          const validation = validateAccessWindow(decoded.date, decoded.time, decoded.duration)
          setAccessValidation(validation)
        }, 1000)

        return () => clearInterval(interval)
      } catch {
        // Silent fail
      }
    }
  }, [])

  const getTimeDisplay = () => {
    if (!accessValidation || accessValidation.timeRemainingSeconds === undefined) {
      return ''
    }

    const totalSeconds = accessValidation.timeRemainingSeconds
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    return `${minutes}m ${seconds}s`
  }

  const getAccessStatus = () => {
    if (accessValidation.status === 'invalid') {
      return 'invalid'
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

    if (status === 'invalid') {
      return (
        <>
          <h1>QA Home Assignment</h1>
          <p>This assignment is not available. Check your link.</p>
        </>
      )
    }

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

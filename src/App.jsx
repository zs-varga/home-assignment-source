import './App.css'
import { useState, useEffect } from 'react'
import ValidationForm from './components/ValidationForm'
import Timer from './components/Timer'
import StartForm from './components/StartForm'
import { encodeAccessToken, decodeAccessToken, validateAccessWindow } from './utils/accessTokenManager'
import { extractVerifiedData } from './utils/checksumUtils'

const STORAGE_KEY = 'session'

const readBadgeCountFromStorage = () => {
  try {
    const accomplishments = extractVerifiedData(JSON.parse(localStorage.getItem('detector_accomplishments'))) || {}
    const formAccomplishments = extractVerifiedData(JSON.parse(localStorage.getItem('detector_form_accomplishments'))) || []
    return Object.values(accomplishments).reduce((sum, arr) => sum + arr.length, 0) + formAccomplishments.length
  } catch {
    return 0
  }
}

function App() {
  const [badgeCount, setBadgeCount] = useState(readBadgeCountFromStorage)
  const [accessValidation, setAccessValidation] = useState(() => {
    // Check for unencoded parameters first
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    const date = params.get('date')
    const time = params.get('time')
    const duration = params.get('duration')

    // If unencoded parameters exist, don't process token yet (useEffect will handle redirect)
    if (email && date && time && duration) {
      return { isValid: false, message: '', timeRemaining: 0, status: 'redirecting' }
    }

    // Only accept raw query string as token (no parameter names like key=value)
    const search = window.location.search.substring(1)
    const knownParams = ['email', 'name', 'date', 'time', 'duration', 'token']
    const hasKnownParam = knownParams.some(param => search.startsWith(param + '='))

    if (search && !hasKnownParam) {
      // There is a raw token in the URL
      try {
        const decoded = decodeAccessToken(search)
        const validation = validateAccessWindow(decoded.iso8601DateTime, decoded.duration)
        if (!validation.isValid && !validation.message.includes('not yet available') && !validation.message.includes('expired')) {
          // Malformed / bad checksum — redirect to base URL
          return { isValid: false, message: '', timeRemaining: 0, status: 'redirect_to_base' }
        }
        return { ...validation, email: decoded.email, name: decoded.name }
      } catch {
        return { isValid: false, message: '', timeRemaining: 0, status: 'redirect_to_base' }
      }
    }

    // No URL params — check localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { token } = JSON.parse(stored)
        const decoded = decodeAccessToken(token)
        const validation = validateAccessWindow(decoded.iso8601DateTime, decoded.duration)
        if (validation.isValid) {
          return { isValid: false, message: '', timeRemaining: 0, status: 'redirect_to_stored', token }
        }
        if (validation.message.includes('expired')) {
          return { isValid: false, message: 'Access window has expired', timeRemaining: 0 }
        }
      }
    } catch {
      // Corrupted storage — fall through to start form
    }

    return { isValid: false, message: '', timeRemaining: 0, status: 'start_form' }
  })

  // Handle redirects and periodic access window checks
  useEffect(() => {
    const basePath = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : `${window.location.pathname}/`

    // Redirect to base URL for invalid tokens
    if (accessValidation.status === 'redirect_to_base') {
      window.location.href = basePath
      return
    }

    // Redirect to stored valid token
    if (accessValidation.status === 'redirect_to_stored') {
      window.location.href = `${basePath}?${accessValidation.token}`
      return
    }

    // Handle unencoded parameters — encode and redirect
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    const name = params.get('name')
    const date = params.get('date')
    const time = params.get('time')
    const duration = params.get('duration')

    if (email && date && time && duration) {
      try {
        const encodedToken = encodeAccessToken(email, name || '', date, time, duration)
        window.location.href = `${basePath}?${encodedToken}`
        return
      } catch {
        // Silent fail
      }
    }

    // If a raw token is in the URL, set up interval to recheck access window
    const search = window.location.search.substring(1)
    const knownParams = ['email', 'name', 'date', 'time', 'duration', 'token']
    const hasKnownParam = knownParams.some(param => search.startsWith(param + '='))

    if (search && !hasKnownParam) {
      try {
        const decoded = decodeAccessToken(search)
        const interval = setInterval(() => {
          const validation = validateAccessWindow(decoded.iso8601DateTime, decoded.duration)
          setAccessValidation({ ...validation, email: decoded.email, name: decoded.name })
        }, 5000)
        return () => clearInterval(interval)
      } catch {
        // Silent fail
      }
    }
  }, [])


  const getAccessStatus = () => {
    if (accessValidation.status === 'start_form') return 'start_form'
    if (accessValidation.status === 'redirect_to_base') return 'redirecting'
    if (accessValidation.status === 'redirect_to_stored') return 'redirecting'
    if (accessValidation.status === 'redirecting') return 'redirecting'

    if (accessValidation.message && accessValidation.message.includes('not yet available')) return 'early'
    if (accessValidation.message && accessValidation.message.includes('expired')) return 'late'

    return accessValidation.isValid ? 'valid' : 'start_form'
  }

  const getHeaderContent = () => {
    const status = getAccessStatus()

    if (status === 'early' && accessValidation) {
      const match = accessValidation.message.match(/Starts in (\d+) minute\(s\)\./)
      const minutes = match ? parseInt(match[1], 10) : 0

      // Format time into human-readable units
      const timeParts = []
      let remaining = minutes
      const MINUTES_PER_HOUR = 60
      const HOURS_PER_DAY = 24
      const DAYS_PER_MONTH = 30
      const MONTHS_PER_YEAR = 12

      const totalMinutesPerYear = MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_MONTH * MONTHS_PER_YEAR
      const years = Math.floor(remaining / totalMinutesPerYear)
      if (years > 0) {
        timeParts.push(`${years} year${years === 1 ? '' : 's'}`)
        remaining -= years * totalMinutesPerYear
      }

      const totalMinutesPerMonth = MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_MONTH
      const months = Math.floor(remaining / totalMinutesPerMonth)
      if (months > 0) {
        timeParts.push(`${months} month${months === 1 ? '' : 's'}`)
        remaining -= months * totalMinutesPerMonth
      }

      const totalMinutesPerDay = MINUTES_PER_HOUR * HOURS_PER_DAY
      const days = Math.floor(remaining / totalMinutesPerDay)
      if (days > 0) {
        timeParts.push(`${days} day${days === 1 ? '' : 's'}`)
        remaining -= days * totalMinutesPerDay
      }

      const hours = Math.floor(remaining / MINUTES_PER_HOUR)
      if (hours > 0) {
        timeParts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
        remaining -= hours * MINUTES_PER_HOUR
      }

      if (remaining > 0) {
        timeParts.push(`${remaining} minute${remaining === 1 ? '' : 's'}`)
      }

      const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })
      const formattedTime = formatter.format(timeParts) || '0 minutes'

      return (
        <>
          <h1>QA Home Assignment</h1>
          <p>This assignment will be available in {formattedTime}.</p>
        </>
      )
    }

    if (status === 'late') {
      return (
        <>
          <h1>QA Home Assignment</h1>
          <p>This assignment is no longer available.</p>
          <p>You have achieved {badgeCount} / 210 score.</p>
        </>
      )
    }

    return (
      <>
        <h1>QA Home Assignment</h1>
        <p>Explore the form below, try every interesting value!</p>
        <p>You have <Timer totalSeconds={accessValidation.timeRemainingSeconds} /> to finish the assignment. Your progress is automatically saved.</p>
      </>
    )
  }

  const status = getAccessStatus()
  const isAccessValid = status === 'valid'

  if (status === 'start_form') {
    return (
      <div className="app-container">
        <StartForm />
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        {getHeaderContent()}
      </header>
      {isAccessValid && (
        <main className="app-main">
          <ValidationForm accessValidation={accessValidation} onBadgeCountChange={setBadgeCount} />
        </main>
      )}
    </div>
  )
}

export default App

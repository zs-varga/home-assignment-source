import './App.css'
import { useState, useEffect } from 'react'
import ValidationForm from './components/ValidationForm'
import Timer from './components/Timer'
import { encodeAccessToken, decodeAccessToken, validateAccessWindow } from './utils/accessTokenManager'

function App() {
  const [accessValidation, setAccessValidation] = useState(() => {
    let token = null

    // Check for unencoded parameters first
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    const date = params.get('date')
    const time = params.get('time')
    const duration = params.get('duration')

    // If unencoded parameters exist, don't process token yet (useEffect will handle redirect)
    if (email && date && time && duration) {
      return {
        isValid: false,
        message: 'Invalid token',
        timeRemaining: 0,
        status: 'invalid'
      }
    }

    // Only accept raw query string as token (no parameter names like key=value)
    const search = window.location.search.substring(1) // Remove leading ?
    // Check if this looks like parameter format by checking for known parameter names
    const knownParams = ['email', 'date', 'time', 'duration', 'token']
    const hasKnownParam = knownParams.some(param => search.startsWith(param + '='))

    if (search && !hasKnownParam) {
      token = search
    }

    if (token) {
      try {
        const decoded = decodeAccessToken(token)
        const validation = validateAccessWindow(decoded.iso8601DateTime, decoded.duration)
        if (!validation.isValid && !validation.message.includes('not yet available') && !validation.message.includes('expired')) {
          return {
            isValid: false,
            message: 'Invalid token',
            timeRemaining: 0,
            status: 'invalid'
          }
        }
        return {
          ...validation,
          email: decoded.email
        }
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

  // Handle access token redirect and check when access expires
  useEffect(() => {
    let token = null

    // Only accept raw query string as token (no parameter names like key=value)
    const search = window.location.search.substring(1)
    const knownParams = ['email', 'date', 'time', 'duration', 'token']
    const hasKnownParam = knownParams.some(param => search.startsWith(param + '='))

    if (search && !hasKnownParam) {
      token = search
    }

    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    const date = params.get('date')
    const time = params.get('time')
    const duration = params.get('duration')

    // If unencoded parameters exist, encode and redirect to raw query format
    if (email && date && time && duration && !token) {
      try {
        const encodedToken = encodeAccessToken(email, date, time, duration)
        const currentPath = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`
        window.location.href = `${currentPath}?${encodedToken}`
        return
      } catch {
        // Silent fail
      }
    }

    // If token exists, set up interval to check when access expires
    if (token) {
      try {
        const decoded = decodeAccessToken(token)

        // Check every 5 seconds if access has expired (instead of every second)
        const interval = setInterval(() => {
          const validation = validateAccessWindow(decoded.iso8601DateTime, decoded.duration)
          // Only update state if access status changed (expired)
          if (!validation.isValid) {
            setAccessValidation({
              ...validation,
              email: decoded.email
            })
          }
        }, 5000)

        return () => clearInterval(interval)
      } catch {
        // Silent fail
      }
    }
  }, [])


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

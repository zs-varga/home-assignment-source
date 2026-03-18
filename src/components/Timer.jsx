import { useState, useEffect } from 'react'

function Timer({ totalSeconds }) {
  const [displaySeconds, setDisplaySeconds] = useState(totalSeconds)

  useEffect(() => {
    setDisplaySeconds(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplaySeconds(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const hours = Math.floor(displaySeconds / 3600)
  const minutes = Math.floor((displaySeconds % 3600) / 60)
  const seconds = displaySeconds % 60

  const text = hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : `${minutes}m ${seconds}s`

  const isLow = displaySeconds < 300

  return <span style={isLow ? { color: '#d60000', fontWeight: 400 } : undefined}>{text}</span>
}

export default Timer

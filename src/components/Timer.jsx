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

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  return `${minutes}m ${seconds}s`
}

export default Timer

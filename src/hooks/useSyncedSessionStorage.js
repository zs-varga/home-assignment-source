import { useState, useEffect } from 'react'
import { extractVerifiedData, createChecksumPackage } from '../utils/checksumUtils'

/**
 * Custom hook for localStorage that syncs across tabs
 * Automatically updates state when other tabs modify the same storage key
 * @param {string} key - The key to store the value under in localStorage
 * @param {any} initialValue - The initial value if nothing is in localStorage
 * @returns {[any, Function]} - Returns the state value and a setter function
 */
export function useSyncedSessionStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)

      if (item) {
        const pkg = JSON.parse(item)
        const verifiedData = extractVerifiedData(pkg)

        if (verifiedData !== null) {
          return verifiedData
        } else {
          return initialValue
        }
      }
      return initialValue
    } catch {
      return initialValue
    }
  })

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          if (event.newValue) {
            const pkg = JSON.parse(event.newValue)
            const verifiedData = extractVerifiedData(pkg)

            if (verifiedData !== null) {
              // Update state with data from other tab
              setStoredValue(verifiedData)
            } else {
              // Checksum failed, revert to initial value
              setStoredValue(initialValue)
            }
          } else {
            // Storage was cleared
            setStoredValue(initialValue)
          }
        } catch {
          // Silent fail
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [key, initialValue])

  // Return a wrapped version of useState's setter function that persists to storage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to local storage with checksum
      if (typeof window !== 'undefined') {
        const pkg = createChecksumPackage(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(pkg))
      }
    } catch {
      // Silent fail
    }
  }

  return [storedValue, setValue]
}

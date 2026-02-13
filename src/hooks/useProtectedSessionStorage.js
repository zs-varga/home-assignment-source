import { useState } from 'react'
import { createChecksumPackage, extractVerifiedData } from '../utils/checksumUtils'
import { deepFreeze } from '../utils/readOnlyState'

/**
 * Custom hook for protected localStorage with checksum validation and read-only state
 * @param {string} key - The key to store the value under in localStorage
 * @param {any} initialValue - The initial value if nothing is in localStorage
 * @returns {[any, Function]} - Returns the read-only state value and a setter function
 */
export function useProtectedSessionStorage(key, initialValue) {
  // State to store our value (will be frozen as read-only)
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return deepFreeze(structuredClone(initialValue))
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)

      if (item) {
        const pkg = JSON.parse(item)
        const verifiedData = extractVerifiedData(pkg)

        if (verifiedData !== null) {
          // Data passed checksum verification
          return deepFreeze(verifiedData)
        } else {
          // Checksum failed - data was tampered with, use initial value
          return deepFreeze(structuredClone(initialValue))
        }
      }
      return deepFreeze(structuredClone(initialValue))
    } catch {
      return deepFreeze(structuredClone(initialValue))
    }
  })

  // Return a wrapped version of useState's setter function that:
  // 1. Validates data with a checksum before storing
  // 2. Freezes the state to make it read-only
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Deep freeze the new value to make it read-only
      const frozenValue = deepFreeze(structuredClone(valueToStore))

      // Save state
      setStoredValue(frozenValue)

      // Create checksum package and save to local storage
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

import { useState } from 'react'

/**
 * Custom hook for persisting state to sessionStorage
 * @param {string} key - The key to store the value under in sessionStorage
 * @param {any} initialValue - The initial value if nothing is in sessionStorage
 * @returns {[any, Function]} - Returns the state value and a setter function
 */
export function useSessionStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Get from session storage by key
      const item = window.sessionStorage.getItem(key)

      // Parse stored json or return initialValue
      if (item) {
        return JSON.parse(item)
      }
      return initialValue
    } catch {
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to sessionStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to session storage
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch {
      // Silent fail
    }
  }

  return [storedValue, setValue]
}

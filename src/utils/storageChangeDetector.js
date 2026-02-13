import { extractVerifiedData, createChecksumPackage } from './checksumUtils'

/**
 * Storage change detector
 * Monitors localStorage for tampering and integrity violations
 * Maintains in-memory backups for restoration on tampering
 */

// Array to store registered listeners
const listeners = new Set()

// Tampering callback (called when tampering is detected)
let tamperingCallback = null

// Multi-window callback (called when storage changes from another window/tab)
let multiWindowCallback = null

// Flag to track if we're currently restoring from tampering (to avoid false concurrent_session detection)
let isRestoringFromTampering = false

// Sync callbacks (called when storage data should be synced to React state)
const syncCallbacks = {}

// In-memory backups (not persisted to localStorage, safe from tampering)
const backups = {
  detector_accomplishments: null,
  detector_previous_accomplishments: null,
  detector_form_accomplishments: null,
  detector_last_submission: null
}

/**
 * Subscribe to storage integrity violations
 * @param {Function} callback - Called with (key, data, isValid) when storage changes
 * @returns {Function} - Unsubscribe function
 */
export function onStorageChange(callback) {
  listeners.add(callback)

  // Return unsubscribe function
  return () => {
    listeners.delete(callback)
  }
}

/**
 * Register a callback to be called when tampering is detected
 * @param {Function} callback - Called when tampering is detected
 */
export function setTamperingCallback(callback) {
  tamperingCallback = callback
}

/**
 * Register a callback to be called when storage changes from another window/tab
 * @param {Function} callback - Called when multi-window activity is detected
 */
export function setMultiWindowCallback(callback) {
  multiWindowCallback = callback
}

/**
 * Register a sync callback for a specific storage key
 * Called when that key's data is updated in another tab/window
 * @param {string} key - The storage key to sync
 * @param {Function} callback - Called with the new data when storage changes
 */
export function registerSyncCallback(key, callback) {
  syncCallbacks[key] = callback
}

/**
 * Call sync callback for a specific key
 * @param {string} key - The storage key
 * @param {any} data - The data to pass to the callback
 */
function callSyncCallback(key, data) {
  if (syncCallbacks[key]) {
    try {
      syncCallbacks[key](data)
    } catch {
      // Silent fail
    }
  }
}

/**
 * Check if storage already contains data (indicates other tabs/windows may be open)
 * Returns true if any accomplishment data is found in localStorage
 * @returns {boolean} - True if storage has existing data
 */
export function hasExistingStorageData() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const accomplishmentsData = window.localStorage.getItem('detector_accomplishments')
    const previousData = window.localStorage.getItem('detector_previous_accomplishments')
    const formData = window.localStorage.getItem('detector_form_accomplishments')

    // Check if any of the keys have data
    return !!(accomplishmentsData || previousData || formData)
  } catch {
    return false
  }
}

/**
 * Validate a specific key in localStorage
 * @param {string} key - The storage key to validate
 * @returns {object} - { isValid: boolean, data: any, tampered: boolean }
 */
export function validateStorageKey(key) {
  try {
    const item = window.localStorage.getItem(key)

    if (!item) {
      // If key is missing but we have a backup, it was deleted (tampering)
      const backup = restoreFromBackup(key)
      if (backup !== null) {
        return { isValid: false, data: null, tampered: true }
      }
      return { isValid: true, data: null, tampered: false }
    }

    const pkg = JSON.parse(item)
    const verifiedData = extractVerifiedData(pkg)

    if (verifiedData !== null) {
      return { isValid: true, data: verifiedData, tampered: false }
    } else {
      return { isValid: false, data: null, tampered: true }
    }
  } catch {
    return { isValid: false, data: null, tampered: true }
  }
}

/**
 * Validate all accomplishment keys in localStorage
 * @returns {object} - { allValid: boolean, results: {key: validation} }
 */
export function validateAllAccomplishments() {
  const accomplishmentKeys = [
    'detector_accomplishments',
    'detector_previous_accomplishments',
    'detector_form_accomplishments'
  ]

  const results = {}
  let allValid = true

  accomplishmentKeys.forEach((key) => {
    results[key] = validateStorageKey(key)
    if (!results[key].isValid) {
      allValid = false
    }
  })

  return { allValid, results }
}

/**
 * Initialize storage change detection using the 'storage' event
 * This fires when localStorage is modified in OTHER tabs/windows
 * To detect changes in the SAME tab, we need to monitor direct modifications
 */
export function initializeStorageChangeDetection() {
  if (typeof window === 'undefined') {
    return () => {}
  }

  // Listen for storage changes from other tabs/windows
  const handleStorageChange = (event) => {
    if (
      event.key === 'detector_accomplishments' ||
      event.key === 'detector_previous_accomplishments' ||
      event.key === 'detector_form_accomplishments' ||
      event.key === 'detector_last_submission'
    ) {
      const validation = validateStorageKey(event.key)

      // Call multi-window callback - indicates another window/tab modified storage
      // Skip if we're currently restoring from tampering OR if the data is invalid (tampering detected)
      if (multiWindowCallback && !isRestoringFromTampering && validation.isValid) {
        multiWindowCallback()
      }

      // Sync the data to React state via callback
      if (validation.isValid && validation.data !== null) {
        callSyncCallback(event.key, validation.data)
      }

      notifyListeners(event.key, validation.data, validation.isValid)
    }
  }

  window.addEventListener('storage', handleStorageChange)

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

/**
 * Notify all registered listeners of a storage change
 * @param {string} key - The key that changed
 * @param {any} data - The validated data
 * @param {boolean} isValid - Whether the data passed validation
 */
function notifyListeners(key, data, isValid) {
  listeners.forEach((callback) => {
    try {
      callback({
        key,
        data,
        isValid,
        tampered: !isValid,
        timestamp: new Date().toISOString()
      })
    } catch {
      // Silent fail
    }
  })
}

/**
 * Save a backup of valid data in memory
 * Called after successful validation and update
 * @param {string} key - The storage key
 * @param {any} data - The valid data to backup
 */
export function saveBackup(key, data) {
  if (Object.prototype.hasOwnProperty.call(backups, key)) {
    // Never overwrite a non-null backup with null (prevents loss of backup on deletion)
    if (data !== null || backups[key] === null) {
      backups[key] = data
    }
  }
}

/**
 * Restore data from the in-memory backup
 * Called when tampering is detected
 * @param {string} key - The storage key
 * @returns {any|null} - The backed up data, or null if no backup exists
 */
export function restoreFromBackup(key) {
  if (Object.prototype.hasOwnProperty.call(backups, key)) {
    return backups[key]
  }
  return null
}

/**
 * Monitor a specific storage key for changes (including same-tab modifications)
 * Works by periodically checking if the value has changed
 * @param {string} key - The storage key to monitor
 * @param {number} interval - Check interval in milliseconds (default: 1000)
 * @returns {Function} - Cleanup function to stop monitoring
 */
export function monitorStorageKey(key, interval = 1000) {
  let lastValue = null
  let lastValidation = null
  let timeoutId = null

  const check = () => {
    try {
      const currentItem = window.localStorage.getItem(key)

      if (currentItem !== lastValue) {
        lastValue = currentItem
        const validation = validateStorageKey(key)

        // If tampering detected, restore from backup
        if (!validation.isValid && validation.tampered) {
          const backupData = restoreFromBackup(key)
          if (backupData !== null) {
            // Call tampering callback instead of console.log
            if (tamperingCallback) {
              tamperingCallback()
            }
            // Restore the backup to localStorage
            try {
              isRestoringFromTampering = true
              const pkg = createChecksumPackage(backupData)
              window.localStorage.setItem(key, JSON.stringify(pkg))
              lastValue = JSON.stringify(pkg)
              isRestoringFromTampering = false
            } catch {
              // Silent fail - don't log errors
              isRestoringFromTampering = false
            }
          }
        }

        // Only notify listeners if validation result actually changed
        const validationChanged = !lastValidation ||
          lastValidation.isValid !== validation.isValid ||
          JSON.stringify(lastValidation.data) !== JSON.stringify(validation.data)

        if (validationChanged) {
          lastValidation = validation
          notifyListeners(key, validation.data, validation.isValid)
        }
      }
    } catch {
      // Silent fail
    }

    timeoutId = setTimeout(check, interval)
  }

  // Start monitoring
  check()

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

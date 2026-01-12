/**
 * Access Token Manager
 * Handles encoding/decoding candidate access tokens with email, date, time, and duration
 */

const TOKEN_VERSION = '1'

/**
 * Encodes candidate access parameters into a token
 * @param {string} email - Candidate email
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {string} duration - Duration (e.g., "3h", "2h", "4h")
 * @returns {string} Encoded token
 */
export function encodeAccessToken(email, date, time, duration) {
  if (!email || !date || !time || !duration) {
    throw new Error('All parameters (email, date, time, duration) are required')
  }

  // Create data string with pipe separators
  const data = `${email}|${date}|${time}|${duration}`

  // Generate checksum before encoding
  const checksum = generateChecksum(data)

  // Combine version, data, and checksum separated by colons
  const tokenData = `${TOKEN_VERSION}:${data}:${checksum}`

  // Simple Base64 encoding
  return btoa(tokenData)
}

/**
 * Decodes a token back to candidate access parameters
 * @param {string} token - Encoded token
 * @returns {Object} Decoded parameters {email, date, time, duration}
 * @throws {Error} If token is invalid or checksum doesn't match
 */
export function decodeAccessToken(token) {
  try {
    // Decode from Base64
    const tokenData = atob(token)

    // Split by first two colons only (in case email contains colons, though unlikely)
    const lastColonIndex = tokenData.lastIndexOf(':')
    const checksumSection = tokenData.substring(lastColonIndex + 1)
    const beforeChecksum = tokenData.substring(0, lastColonIndex)

    const firstColonIndex = beforeChecksum.indexOf(':')
    const version = beforeChecksum.substring(0, firstColonIndex)
    const data = beforeChecksum.substring(firstColonIndex + 1)

    if (version !== TOKEN_VERSION) {
      throw new Error('Invalid token version')
    }

    // Verify checksum BEFORE parsing data
    const expectedChecksum = generateChecksum(data)
    if (checksumSection !== expectedChecksum) {
      throw new Error(`Token checksum validation failed (got ${checksumSection}, expected ${expectedChecksum})`)
    }

    // Now parse the data
    const [email, date, time, duration] = data.split('|')

    if (!email || !date || !time || !duration) {
      throw new Error('Invalid token format')
    }

    return { email, date, time, duration }
  } catch (error) {
    throw new Error(`Failed to decode token: ${error.message}`)
  }
}

/**
 * Validates if current time is within the access window
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {string} duration - Duration (e.g., "3h", "2h")
 * @returns {Object} {isValid: boolean, message: string, timeRemaining: number}
 */
export function validateAccessWindow(date, time, duration) {
  try {
    // Parse the start datetime
    const startDateTime = new Date(`${date}T${time}:00`)

    if (isNaN(startDateTime.getTime())) {
      return {
        isValid: false,
        message: 'Invalid date or time format',
        timeRemaining: 0
      }
    }

    // Parse duration (e.g., "3h" -> 3 hours)
    const durationMatch = duration.match(/^(\d+)h$/)
    if (!durationMatch) {
      return {
        isValid: false,
        message: 'Invalid duration format (use format like "3h")',
        timeRemaining: 0
      }
    }

    const durationHours = parseInt(durationMatch[1], 10)
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000)

    // Check current time
    const now = new Date()

    if (now < startDateTime) {
      const minutesUntilStart = Math.ceil((startDateTime - now) / (1000 * 60))
      return {
        isValid: false,
        message: `Access not yet available. Starts in ${minutesUntilStart} minute(s).`,
        timeRemaining: 0
      }
    }

    if (now > endDateTime) {
      return {
        isValid: false,
        message: 'Access window has expired',
        timeRemaining: 0
      }
    }

    const timeRemainingMs = endDateTime - now
    const timeRemainingSeconds = Math.floor(timeRemainingMs / 1000) // in seconds
    const timeRemaining = Math.ceil(timeRemainingMs / (1000 * 60)) // in minutes

    return {
      isValid: true,
      message: `Access valid. Time remaining: ${timeRemaining} minute(s).`,
      timeRemaining,
      timeRemainingSeconds
    }
  } catch (error) {
    return {
      isValid: false,
      message: `Validation error: ${error.message}`,
      timeRemaining: 0
    }
  }
}

/**
 * Simple checksum function to prevent accidental URL tampering
 * Uses a stable hash based on character codes
 * @param {string} data - Data to checksum
 * @returns {string} Hex checksum
 */
function generateChecksum(data) {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & 0xFFFFFFFF // Convert to 32-bit integer
  }
  // Ensure positive number and convert to hex
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * Generates a shareable link for HR to send to candidates
 * @param {string} baseUrl - Base URL of the app (e.g., "https://yoursite.com")
 * @param {string} email - Candidate email
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {string} duration - Duration (e.g., "3h")
 * @returns {string} Full URL with encoded token
 */
export function generateAccessLink(baseUrl, email, date, time, duration) {
  const token = encodeAccessToken(email, date, time, duration)
  return `${baseUrl}?token=${token}`
}

/**
 * Generates a temporary unencoded URL for HR to use (for easy sharing)
 * This URL should redirect to the encoded version
 * @param {string} baseUrl - Base URL of the app
 * @param {string} email - Candidate email
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {string} duration - Duration (e.g., "3h")
 * @returns {string} Full URL with unencoded parameters
 */
export function generateTemporaryAccessUrl(baseUrl, email, date, time, duration) {
  const params = new URLSearchParams({
    email,
    date,
    time,
    duration
  })
  return `${baseUrl}?${params.toString()}`
}

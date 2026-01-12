/**
 * Checksum utilities for validating data integrity
 * Prevents casual tampering with stored accomplishments
 */

const CHECKSUM_SECRET = 'detector_v1_security_key'

/**
 * Generate a checksum for data using a simple hash algorithm
 * Note: This is NOT cryptographically secure, but sufficient for preventing casual tampering
 * @param {any} data - The data to checksum
 * @returns {string} - A checksum string
 */
export function generateChecksum(data) {
  const dataString = JSON.stringify(data)
  const combined = dataString + CHECKSUM_SECRET

  // Simple hash function (not cryptographically secure, but good enough for this use case)
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16)
}

/**
 * Verify that data matches its checksum
 * @param {any} data - The data to verify
 * @param {string} checksum - The checksum to verify against
 * @returns {boolean} - True if checksum matches, false if tampering detected
 */
export function verifyChecksum(data, checksum) {
  const calculatedChecksum = generateChecksum(data)
  return calculatedChecksum === checksum
}

/**
 * Create a package with data and its checksum
 * @param {any} data - The data to package
 * @returns {object} - Object with data and checksum
 */
export function createChecksumPackage(data) {
  return {
    data,
    checksum: generateChecksum(data)
  }
}

/**
 * Extract and verify data from a checksum package
 * @param {object} package - The package with data and checksum
 * @returns {any|null} - The data if valid, null if tampering detected
 */
export function extractVerifiedData(pkg) {
  if (!pkg || typeof pkg !== 'object' || !('data' in pkg) || !('checksum' in pkg)) {
    return null
  }

  if (verifyChecksum(pkg.data, pkg.checksum)) {
    return pkg.data
  }

  return null
}

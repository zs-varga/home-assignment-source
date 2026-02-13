// Detector for date of birth field-specific testing patterns
import { getAge } from '../utils/ageCalculator'

// Helper function to check if a year is a leap year
const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

// Helper function to get days in a month
const getDaysInMonth = (month, year) => {
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2 && isLeapYear(year)) {
    return 29
  }
  return daysInMonths[month - 1]
}

// Helper function to parse date in YYYY-MM-DD format
const parseDate = (dateString) => {
  const trimmed = dateString.trim()

  // Try YYYY-MM-DD format
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number)
    return { month, day, year, isValid: true }
  }

  return { isValid: false }
}

export const dateOfBirthDetector = (value, allValues = {}) => {
  const detections = []

  // Only check for patterns if not empty
  if (!value || value.trim() === '') {
    return detections
  }

  const trimmedValue = value.trim()
  const MAX_LENGTH = 20
  const TOTAL_MAX_LENGTH = 100

  // Detect: Boundary length values (at max allowed)
  if (trimmedValue.length === MAX_LENGTH) {
    detections.push('boundary_length_max')
  }

  // Detect: Above max length (between max and total max)
  if (trimmedValue.length > MAX_LENGTH && trimmedValue.length < TOTAL_MAX_LENGTH) {
    detections.push('boundary_length_above_max')
  }

  // Detect: At total max length
  if (trimmedValue.length === TOTAL_MAX_LENGTH) {
    detections.push('boundary_length_total_max')
  }

  // Detect: Invalid date format
  const datePattern = /^\d{4}-\d{1,2}-\d{1,2}$/
  if (!datePattern.test(trimmedValue)) {
    detections.push('invalid_format')
    return detections
  }

  // Parse date
  const dateInfo = parseDate(trimmedValue)

  if (!dateInfo.isValid) {
    return detections
  }

  const { month, day, year } = dateInfo

  // Detect: Invalid month (outside 1-12)
  if (month < 1 || month > 12) {
    detections.push('invalid_month')
  }

  // Detect: Invalid day (outside 1-31)
  if (day < 1 || day > 31) {
    detections.push('invalid_day')
  }

  // If month is valid, check if day is valid for that month
  if (month >= 1 && month <= 12) {
    const maxDaysInMonth = getDaysInMonth(month, year)
    if (day > maxDaysInMonth) {
      // Detect: Invalid day for month (30-31 day months)
      if (month === 4 || month === 6 || month === 9 || month === 11) {
        detections.push('invalid_day_for_30day_month')
      }
      // Detect: Invalid day for February
      if (month === 2) {
        detections.push('invalid_february_day')
        // Detect: Invalid day for leap year February
        if (isLeapYear(year)) {
          detections.push('invalid_leap_year_february')
        }
      }
    }
  }

  // Detect: Future date (birth date is in the future)
  const today = new Date()
  const birthDate = new Date(year, month - 1, day)
  if (birthDate > today) {
    // Check medication-specific patterns for future dates
    const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
    if (medication === 'aspirin') {
      detections.push('aspirin_above_max')
    } else if (medication === 'ibuprofen') {
      detections.push('ibuprofen_above_max')
    }
    return detections
  }

  // Detect: Age-related patterns (boundary ages and age-based categories)
  if (month >= 1 && month <= 12 && day >= 1 && day <= getDaysInMonth(month, year)) {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const ageObj = getAge(dateString)

    // Detect: Age-related patterns
    if (ageObj === null) {
      // Check medication-specific patterns for null age (future date or other issues)
      const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
      if (medication === 'aspirin') {
        detections.push('aspirin_below_min')
      } else if (medication === 'ibuprofen') {
        detections.push('ibuprofen_below_min')
      } else {
        detections.push('below_min')
      }
    } else {
      const { years, months, days } = ageObj

      if (years > 150 || (years === 150 && (months > 0 || days > 0))) {
        // Below minimum valid age (extremely old, unrealistically aged)
        // Check medication-specific patterns
        const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
        if (medication === 'aspirin') {
          detections.push('aspirin_below_min')
        } else if (medication === 'ibuprofen') {
          detections.push('ibuprofen_below_min')
        } else if (medication === 'naproxen') {
          detections.push('naproxen_below_min')
        } else if (medication === 'paracetamol') {
          detections.push('paracetamol_below_min')
        } else {
          detections.push('below_min')
        }
      } else if (years === 150 && months === 0 && days === 0) {
        // Boundary minimum: age is exactly 150 years 0 months 0 days (oldest valid)
        // Check medication-specific patterns for this boundary
        let hasMedicationDetection = false
        const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''

        if (medication === 'aspirin') {
          detections.push('aspirin_nominal')
          detections.push('aspirin_boundary_min')
          hasMedicationDetection = true
        } else if (medication === 'ibuprofen') {
          detections.push('ibuprofen_nominal')
          detections.push('ibuprofen_boundary_min')
          hasMedicationDetection = true
        } else if (medication === 'paracetamol') {
          detections.push('paracetamol_nominal')
          detections.push('paracetamol_boundary_min')
          hasMedicationDetection = true
        } else if (medication === 'naproxen') {
          detections.push('naproxen_nominal')
          detections.push('naproxen_boundary_min')
          hasMedicationDetection = true
        }

        if (!hasMedicationDetection) {
          detections.push('boundary_min')
          detections.push('nominal_value')
        }
      } else if (years === 0 && months === 0 && days === 0) {
        // Boundary maximum: age is exactly 0 (born today)
        // Check medication-specific patterns for newborns
        let hasMedicationDetection = false
        const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''

        if (medication === 'ibuprofen') {
          detections.push('ibuprofen_boundary_max')
          detections.push('ibuprofen_nominal')
          hasMedicationDetection = true
        }

        if (!hasMedicationDetection) {
          detections.push('boundary_max')
          detections.push('nominal_value')
        }
      } else {
        // Medication-specific age detection patterns (only if age is realistic)
        let hasMedicationDetection = false // Track if any medication-specific pattern was detected

        if (years >= 0 && years <= 150) {
          const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''

          // Aspirin-specific age detection patterns (minimum age > 12)
          if (medication === 'aspirin') {
            if (years < 12) {
              // Age < 12: date is above (more recent than) the max valid date
              detections.push('aspirin_above_max')
              hasMedicationDetection = true
            } else if (years === 12 && months === 0 && days === 0) {
              // Age exactly 12: boundary maximum date (youngest person who can take aspirin)
              detections.push('aspirin_boundary_max')
              detections.push('aspirin_nominal')
              hasMedicationDetection = true
            } else if (years === 12) {
              // Age 12 with months or days: still valid, nominal
              detections.push('aspirin_nominal')
              hasMedicationDetection = true
            } else if (years > 12) {
              // Age > 12: date is below (older than) the minimum valid date
              detections.push('aspirin_below_min')
              hasMedicationDetection = true
            }
          }

          // Ibuprofen-specific age detection patterns (minimum age 6 months)
          if (medication === 'ibuprofen') {
            if (years === 0 && months === 0) {
              // Age 0 months: newborn, too young for ibuprofen
              detections.push('ibuprofen_above_max')
              hasMedicationDetection = true
            } else if (years === 0 && months > 0 && months < 6) {
              // Age 1-5 months: still too young
              detections.push('ibuprofen_above_max')
              hasMedicationDetection = true
            } else if (years === 0 && months === 6 && days === 0) {
              // Age exactly 6 months 0 days: boundary where medication becomes allowed
              detections.push('ibuprofen_boundary_max')
              detections.push('ibuprofen_nominal')
              hasMedicationDetection = true
            } else if (years === 0 && months >= 6) {
              // Age > 6 months: nominal
              detections.push('ibuprofen_nominal')
              hasMedicationDetection = true
            } else if (years > 0) {
              // Age > 1 year: nominal
              detections.push('ibuprofen_nominal')
              hasMedicationDetection = true
            }
          }

          // Paracetamol-specific age detection patterns (minimum age 3 months)
          if (medication === 'paracetamol') {
            if (years === 0 && months < 3) {
              // Age < 3 months (too young): above_max
              detections.push('paracetamol_above_max')
              hasMedicationDetection = true
            } else if (years === 0 && months === 3 && days === 0) {
              // Age exactly 3 months: boundary_max (just became eligible)
              detections.push('paracetamol_boundary_max')
              detections.push('paracetamol_nominal')
              hasMedicationDetection = true
            } else if (years === 0 && months === 3) {
              // Age 3 months with days: nominal
              detections.push('paracetamol_nominal')
              hasMedicationDetection = true
            } else if (years > 0) {
              // Age > 1 year: nominal
              detections.push('paracetamol_nominal')
              hasMedicationDetection = true
            }
          }

          // Naproxen-specific age detection patterns (minimum age > 12, adults only)
          if (medication === 'naproxen') {
            if (years < 12) {
              // Age < 12 (date is above/more recent than max allowed date): above_max
              detections.push('naproxen_above_max')
              hasMedicationDetection = true
            } else if (years === 12 && months === 0 && days === 0) {
              // Age exactly 12 years 0 months 0 days: boundary maximum
              detections.push('naproxen_boundary_max')
              detections.push('naproxen_nominal')
              hasMedicationDetection = true
            } else if (years === 12) {
              // Age 12 with months/days (still > 12 in total): nominal
              detections.push('naproxen_nominal')
              hasMedicationDetection = true
            } else if (years > 12) {
              // Age > 12 (date is below/older than min valid date): below_min
              detections.push('naproxen_below_min')
              hasMedicationDetection = true
            }
          }
        }

        // Only add nominal_value if no medication-specific pattern was detected
        if (!hasMedicationDetection) {
          detections.push('nominal_value')
        }
      }
    }

  }

  return detections
}

// Descriptions for detected patterns
export const detectionDescriptions = {
  invalid_format: 'Wrong format',
  invalid_month: 'Wrong month',
  invalid_day: 'Wrong day',
  invalid_day_for_30day_month: '31 day',
  invalid_february_day: 'Feb 30/31',
  invalid_leap_year_february: 'Leap day',
  future_date: 'Future',
  below_min: 'Below Lower Boundary',
  boundary_min: 'Lower Boundary',
  boundary_max: 'Upper Boundary',
  boundary_length_max: 'Length Max',
  boundary_length_above_max: 'Length Above Max',
  boundary_length_total_max: 'Length Total Max',
  nominal_value: 'Nominal',
  aspirin_below_min: 'Aspirin Below Lower Boundary',
  aspirin_boundary_min: 'Aspirin Lower Boundary',
  aspirin_nominal: 'Aspirin Nominal',
  aspirin_boundary_max: 'Aspirin Upper Boundary',
  aspirin_above_max: 'Aspirin Above Upper Boundary',
  ibuprofen_below_min: 'Ibuprofen Below Lower Boundary',
  ibuprofen_boundary_min: 'Ibuprofen Lower Boundary',
  ibuprofen_nominal: 'Ibuprofen Nominal',
  ibuprofen_boundary_max: 'Ibuprofen Upper Boundary',
  ibuprofen_above_max: 'Ibuprofen Above Upper Boundary',
  paracetamol_below_min: 'Paracetamol Below Lower Boundary',
  paracetamol_boundary_min: 'Paracetamol Lower Boundary',
  paracetamol_nominal: 'Paracetamol Nominal',
  naproxen_below_min: 'Naproxen Below Lower Boundary',
  naproxen_boundary_min: 'Naproxen Lower Boundary',
  naproxen_nominal: 'Naproxen Nominal',
}

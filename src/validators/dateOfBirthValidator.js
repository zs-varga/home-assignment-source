import { validationRules } from '../config/validationRules'
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


export const validateDateOfBirth = (value, allValues = {}) => {
  const errors = []

  // Required field validation
  if (!value || value.trim() === '') {
    errors.push(validationRules.dateOfBirth.required.message)
    return errors
  }

  // Parse date
  const dateInfo = parseDate(value)

  // Check if date format is valid
  if (!dateInfo.isValid) {
    errors.push('Date of Birth must be in YYYY-MM-DD format')
    return errors
  }

  const { month, day, year } = dateInfo

  // Check month validity (1-12)
  if (month < 1 || month > 12) {
    errors.push('Month must be between 1 and 12')
  }

  // Check day validity (1-31)
  if (day < 1 || day > 31) {
    errors.push('Day must be between 1 and 31')
  }

  // If month is valid, check if day is valid for that month
  if (month >= 1 && month <= 12) {
    const maxDaysInMonth = getDaysInMonth(month, year)
    if (day > maxDaysInMonth) {
      if (month === 2) {
        errors.push(`February has a maximum of ${maxDaysInMonth} days${isLeapYear(year) ? ' in leap year' : ''}`)
      } else if (month === 4 || month === 6 || month === 9 || month === 11) {
        errors.push(`Month ${month} has a maximum of 30 days`)
      } else {
        errors.push(`Day is invalid for month ${month}`)
      }
    }
  }

  // Validate: Future date check
  if (month >= 1 && month <= 12 && day >= 1 && day <= getDaysInMonth(month, year)) {
    const today = new Date()
    const birthDate = new Date(year, month - 1, day)

    if (birthDate > today) {
      errors.push('Date of Birth cannot be in the future')
    }

    // Validate: Age must be realistic (0-150)
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const ageObj = getAge(dateString)
    if (ageObj !== null && (ageObj.years > 150 || (ageObj.years === 150 && (ageObj.months > 0 || ageObj.days > 0)))) {
      errors.push('Date of Birth must result in a realistic age between 0 and 150 years')
    }

    // Aspirin-specific validation: Children (age < 12) cannot take aspirin
    const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
    if (medication === 'aspirin' && ageObj !== null && ageObj.years < 12) {
      errors.push('Children (age 12 and under) cannot take aspirin')
    }

    // Ibuprofen-specific validation: Must be older than 6 months
    if (medication === 'ibuprofen' && ageObj !== null && (ageObj.years === 0 && ageObj.months < 6)) {
      errors.push('Infants (under 6 months old) cannot take ibuprofen')
    }

    // Paracetamol-specific validation: Must be older than 3 months
    if (medication === 'paracetamol' && ageObj !== null && (ageObj.years === 0 && ageObj.months < 3)) {
      errors.push('Infants (under 3 months old) cannot take paracetamol')
    }

    // Naproxen-specific validation: Only for adults (age > 12)
    if (medication === 'naproxen' && ageObj !== null && ageObj.years < 12) {
      errors.push('Children (age 12 and under) cannot take naproxen')
    }
  }

  return errors
}

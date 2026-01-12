import { validationRules } from '../config/validationRules'
import { getAge } from '../utils/ageCalculator'

// Helper function to check if a value contains a decimal point
const hasDecimalPoint = (valueString) => {
  return /\./.test(valueString)
}

export const validateFrequency = (value, allValues = {}) => {
  const errors = []

  // Required field validation
  if (!value || value.trim() === '') {
    errors.push(validationRules.frequency.required.message)
    return errors
  }

  const trimmedValue = value.trim()

  // Numeric validation
  const numericValue = parseFloat(trimmedValue)
  if (isNaN(numericValue)) {
    errors.push('Frequency must be a valid number')
    return errors
  }

  // Decimal validation (frequency must be integer only)
  if (hasDecimalPoint(trimmedValue)) {
    errors.push('Frequency must be an integer (no decimal values)')
    return errors
  }

  // Min value validation (min 1)
  if (numericValue < 1) {
    errors.push('Frequency must be at least 1')
  }

  // Max value validation (max 5)
  if (numericValue > 5) {
    errors.push('Frequency must not exceed 5')
  }

  // Aspirin-specific validations
  const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
  if (medication === 'aspirin') {
    const age = getAge(allValues.dateOfBirth)

    // For aspirin, frequency must be less than 5
    if (age !== null && age > 12) {
      if (numericValue >= 5) {
        errors.push('Aspirin frequency for adults must be less than 5')
      }
    }
  }

  // Ibuprofen-specific validations
  if (medication === 'ibuprofen') {
    // For ibuprofen, frequency must be less than 5
    if (numericValue >= 5) {
      errors.push('Ibuprofen frequency must be less than 5')
    }
  }

  // Paracetamol-specific validations
  if (medication === 'paracetamol') {
    // For paracetamol, frequency must be less than 5
    if (numericValue >= 5) {
      errors.push('Paracetamol frequency must be less than 5')
    }
  }

  // Naproxen-specific validations
  if (medication === 'naproxen') {
    // For naproxen, frequency must not exceed 3
    if (numericValue > 3) {
      errors.push('Naproxen frequency must not exceed 3')
    }
  }

  return errors
}

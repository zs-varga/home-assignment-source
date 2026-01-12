import { validationRules } from '../config/validationRules'

// Helper function to check if a value contains a decimal point
const hasDecimalPoint = (valueString) => {
  return /\./.test(valueString)
}

export const validateWeight = (value, allValues = {}) => {
  const errors = []

  // Required field validation
  if (!value || value.trim() === '') {
    errors.push(validationRules.weight.required.message)
    return errors
  }

  const trimmedValue = value.trim()

  // Numeric validation
  const numericValue = parseFloat(trimmedValue)
  if (isNaN(numericValue)) {
    errors.push('Weight must be a valid number')
    return errors
  }

  // Decimal validation (weight accepts decimal values with dot as decimal point)
  if (!hasDecimalPoint(trimmedValue)) {
    // Value is integer, that's fine
  } else {
    // Value has decimal point, which is acceptable for weight
    // Could validate decimal format more strictly if needed (e.g., max decimal places)
  }

  // Min value validation (min 5)
  if (numericValue < 5) {
    errors.push('Weight must be at least 5')
  }

  // Max value validation (max 500)
  if (numericValue > 500) {
    errors.push('Weight must not exceed 500')
  }

  // Aspirin-specific validations
  const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
  if (medication === 'aspirin') {
    // For aspirin, weight must be > 40
    if (numericValue < 40) {
      errors.push('Aspirin requires weight greater than 40 kg')
    }
  }

  // Ibuprofen-specific validations
  if (medication === 'ibuprofen') {
    // For ibuprofen, weight must be > 5
    if (numericValue <= 5) {
      errors.push('Ibuprofen requires weight greater than 5 kg')
    }
  }

  // Paracetamol-specific validations
  if (medication === 'paracetamol') {
    // For paracetamol, weight must be greater than 5 kg
    if (numericValue <= 5) {
      errors.push('Paracetamol requires weight greater than 5 kg')
    }
  }

  // Naproxen-specific validations
  if (medication === 'naproxen') {
    // For naproxen, weight must be > 40
    if (numericValue < 40) {
      errors.push('Naproxen requires weight greater than 40 kg')
    }
  }

  return errors
}

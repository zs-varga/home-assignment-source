import { validationRules } from '../config/validationRules'


export const validateFrequency = (value, allValues = {}) => {
  const errors = []

  // Required field validation
  if (!value || value.trim() === '') {
    errors.push(validationRules.frequency.required.message)
    return errors
  }

  const trimmedValue = value.trim()

  // Length validation (max 10 characters)
  if (trimmedValue.length > 10) {
    errors.push(validationRules.frequency.maxLength.message)
  }

  // Numeric validation - strict format (integers only, optional +/- sign)
  const isValidInteger = /^[+-]?\d+$/.test(trimmedValue)
  if (!isValidInteger) {
    errors.push(validationRules.frequency.invalidNumber.message)
    return errors
  }

  const numericValue = parseFloat(trimmedValue)

  // Min value validation (min 1)
  if (numericValue < 1) {
    errors.push(validationRules.frequency.minValue.message)
  }

  // Max value validation (max 5)
  if (numericValue > 5) {
    errors.push(validationRules.frequency.maxValue.message)
  }

  // Aspirin-specific validations
  const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
  if (medication === 'aspirin') {
    // For aspirin, frequency must be <= 4
    if (numericValue > 4) {
      errors.push(validationRules.frequency.aspirin.maxValue)
    }
  }

  // Ibuprofen-specific validations
  if (medication === 'ibuprofen') {
    // For ibuprofen, frequency must be <= 4
    if (numericValue > 4) {
      errors.push(validationRules.frequency.ibuprofen.maxValue)
    }
  }

  // Paracetamol-specific validations
  if (medication === 'paracetamol') {
    // For paracetamol, frequency must be <= 4
    if (numericValue > 4) {
      errors.push(validationRules.frequency.paracetamol.maxValue)
    }
  }

  // Naproxen-specific validations
  if (medication === 'naproxen') {
    // For naproxen, frequency must not exceed 3
    if (numericValue > 3) {
      errors.push(validationRules.frequency.naproxen.maxValue)
    }
  }

  return errors
}

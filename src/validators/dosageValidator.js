import { validationRules } from '../config/validationRules'

// Helper function to check if a value contains a decimal point
const hasDecimalPoint = (valueString) => {
  return /\./.test(valueString)
}

export const validateDosage = (value, allValues = {}) => {
  const errors = []

  // Required field validation
  if (!value || value.trim() === '') {
    errors.push(validationRules.dosage.required.message)
    return errors
  }

  const trimmedValue = value.trim()

  // Length validation (max 10 characters)
  if (trimmedValue.length > 10) {
    errors.push(validationRules.dosage.maxLength.message)
  }

  // Numeric validation
  const numericValue = parseFloat(trimmedValue)
  if (isNaN(numericValue)) {
    errors.push(validationRules.dosage.invalidNumber.message)
  }

  // If there are errors from length or numeric checks, return now
  if (errors.length > 0) {
    return errors
  }

  // Decimal validation (dosage accepts decimal values with dot as decimal point)
  if (!hasDecimalPoint(trimmedValue)) {
    // Value is integer, that's fine
  } else {
    // Value has decimal point, which is acceptable for dosage
    // Could validate decimal format more strictly if needed (e.g., max decimal places)
  }

  // Min value validation (min 200)
  if (numericValue < 200) {
    errors.push(validationRules.dosage.minValue.message)
  }

  // Max value validation (max 1000)
  // For paracetamol, skip generic max validation as it's handled by medication-specific validation
  const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
  if (medication !== 'paracetamol' && numericValue > 1000) {
    errors.push(validationRules.dosage.maxValue.message)
  }
  if (medication === 'aspirin') {
    // Aspirin dosage must be between 325 and 1000
    if (numericValue < 325) {
      errors.push(validationRules.dosage.aspirin.minValue)
    }
    if (numericValue > 1000) {
      errors.push(validationRules.dosage.aspirin.maxValue)
    }
  }

  // Ibuprofen-specific validations (dosage range 200-800)
  if (medication === 'ibuprofen') {
    if (numericValue < 200) {
      errors.push(validationRules.dosage.ibuprofen.minValue)
    }
    if (numericValue > 800) {
      errors.push(validationRules.dosage.ibuprofen.maxValue)
    }

    // Ibuprofen total dosage formula: dosage * frequency < weight * 40
    const frequency = allValues.frequency ? parseFloat(allValues.frequency) : null
    const weight = allValues.weight ? parseFloat(allValues.weight) : null

    // Only validate formula if all required values are valid
    if (frequency !== null && !isNaN(frequency) && frequency > 0 && weight !== null && !isNaN(weight) && weight > 0) {
      const leftSide = numericValue * frequency
      const rightSide = weight * 40

      if (leftSide >= rightSide) {
        errors.push(validationRules.dosage.ibuprofen.totalDose)
      }
    }
  }

  // Paracetamol-specific validations (dosage range 500-1000)
  if (medication === 'paracetamol') {
    if (numericValue < 500) {
      errors.push(validationRules.dosage.paracetamol.minValue)
    }

    if (numericValue > 1000) {
      errors.push(validationRules.dosage.paracetamol.maxValue)
    }

    // Paracetamol total dosage formula: dosage * frequency < weight * 75
    const frequency = allValues.frequency ? parseFloat(allValues.frequency) : null
    const weight = allValues.weight ? parseFloat(allValues.weight) : null

    // Only validate formula if all required values are valid
    if (frequency !== null && !isNaN(frequency) && frequency > 0 && weight !== null && !isNaN(weight) && weight > 0) {
      const leftSide = numericValue * frequency
      const rightSide = weight * 75

      if (leftSide >= rightSide) {
        errors.push(validationRules.dosage.paracetamol.totalDose)
      }
    }
  }

  // Naproxen-specific validations (dosage range 220-550)
  if (medication === 'naproxen') {
    // Naproxen dosage range 220-550
    if (numericValue < 220) {
      errors.push(validationRules.dosage.naproxen.minValue)
    }

    if (numericValue > 550) {
      errors.push(validationRules.dosage.naproxen.maxValue)
    }
  }

  return errors
}

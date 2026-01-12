import { validationRules } from '../config/validationRules'

const ACCEPTED_MEDICATIONS = ['aspirin', 'ibuprofen', 'paracetamol', 'naproxen', 'placebo']

export const validateMedication = (value, _allValues) => {
  const errors = []

  // Required field validation
  if (!value || value.trim() === '') {
    errors.push(validationRules.medication.required.message)
    return errors
  }

  // Length validation (max 20)
  if (value.length > 20) {
    errors.push(validationRules.medication.maxLength.message)
  }

  // Accepted values validation
  const lowerValue = value.toLowerCase().trim()
  if (!ACCEPTED_MEDICATIONS.includes(lowerValue)) {
    errors.push(validationRules.medication.invalidValue.message)
  }

  return errors
}

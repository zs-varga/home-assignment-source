// Validation rules for all fields
export const validationRules = {
  medication: {
    required: {
      message: 'Medication is required'
    },
    maxLength: {
      message: 'Medication must not exceed 20 characters'
    },
    invalidValue: {
      message: 'Medication must be one of: placebo, aspirin, ibuprofen, paracetamol, naproxen'
    }
  },
  dateOfBirth: {
    required: {
      message: 'Date of Birth is required'
    }
  },
  weight: {
    required: {
      message: 'Weight is required'
    }
  },
  dosage: {
    required: {
      message: 'Dosage is required'
    }
  },
  frequency: {
    required: {
      message: 'Frequency is required'
    }
  }
}

// Form-level validation rules (cross-field)
export const formLevelRules = [
  // Will be added later
]

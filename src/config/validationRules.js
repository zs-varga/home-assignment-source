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
  dosage: {
    required: {
      message: 'Dosage is required'
    },
    maxLength: {
      message: 'Dosage must not exceed 10 characters'
    },
    invalidNumber: {
      message: 'Dosage must be a valid number'
    },
    minValue: {
      message: 'Dosage must be at least 200'
    },
    maxValue: {
      message: 'Dosage must not exceed 1000'
    },
    aspirin: {
      minValue: 'Aspirin dosage must be at least 325 mg',
      maxValue: 'Aspirin dosage must not exceed 1000 mg'
    },
    ibuprofen: {
      minValue: 'Ibuprofen dosage must be at least 200 mg',
      maxValue: 'Ibuprofen dosage must not exceed 800 mg',
      totalDose: 'Ibuprofen total dose must satisfy: dosage × frequency < weight × 40'
    },
    paracetamol: {
      minValue: 'Paracetamol dosage must be at least 500 mg',
      maxValue: 'Paracetamol dosage must not exceed 1000 mg',
      totalDose: 'Paracetamol total dose must satisfy: dosage × frequency < weight × 75'
    },
    naproxen: {
      minValue: 'Naproxen dosage must be at least 220 mg',
      maxValue: 'Naproxen dosage must not exceed 550 mg'
    }
  },
  frequency: {
    required: {
      message: 'Frequency is required'
    },
    maxLength: {
      message: 'Frequency must not exceed 10 characters'
    },
    invalidNumber: {
      message: 'Frequency must be a valid number'
    },
    notInteger: {
      message: 'Frequency must be an integer (no decimal values)'
    },
    minValue: {
      message: 'Frequency must be at least 1'
    },
    maxValue: {
      message: 'Frequency must not exceed 5'
    },
    aspirin: {
      maxValue: 'Aspirin frequency for adults must be less than 5'
    },
    ibuprofen: {
      maxValue: 'Ibuprofen frequency must be less than 5'
    },
    paracetamol: {
      maxValue: 'Paracetamol frequency must be less than 5'
    },
    naproxen: {
      maxValue: 'Naproxen frequency must not exceed 3'
    }
  },
  dateOfBirth: {
    required: {
      message: 'Date of Birth is required'
    },
    maxLength: {
      message: 'Date of Birth must not exceed 20 characters'
    },
    invalidFormat: {
      message: 'Date of Birth must be in YYYY-MM-DD format'
    },
    invalidMonth: {
      message: 'Month must be between 1 and 12'
    },
    invalidDay: {
      message: 'Day must be between 1 and 31'
    },
    invalidDayForMonth: (maxDaysInMonth, month, isLeap) => {
      if (month === 2) {
        return `February has a maximum of ${maxDaysInMonth} days${isLeap ? ' in leap year' : ''}`
      } else if (month === 4 || month === 6 || month === 9 || month === 11) {
        return `Month ${month} has a maximum of 30 days`
      }
      return `Day is invalid for month ${month}`
    },
    futureDate: {
      message: 'Date of Birth cannot be in the future'
    },
    invalidAge: {
      message: 'Date of Birth must result in age between 0 and 150 years'
    },
    aspirin: {
      childRestriction: 'Children (age 12 and under) cannot take aspirin'
    },
    ibuprofen: {
      infantRestriction: 'Infants (under 6 months old) cannot take ibuprofen'
    },
    paracetamol: {
      infantRestriction: 'Infants (under 3 months old) cannot take paracetamol'
    },
    naproxen: {
      childRestriction: 'Children (age 12 and under) cannot take naproxen'
    }
  },
  weight: {
    required: {
      message: 'Weight is required'
    },
    maxLength: {
      message: 'Weight must not exceed 10 characters'
    },
    invalidNumber: {
      message: 'Weight must be a valid number'
    },
    minValue: {
      message: 'Weight must be at least 5'
    },
    maxValue: {
      message: 'Weight must not exceed 500'
    },
    aspirin: {
      minValue: 'Aspirin requires weight greater than 40 kg'
    },
    ibuprofen: {
      minValue: 'Ibuprofen requires weight greater than 5 kg'
    },
    paracetamol: {
      minValue: 'Paracetamol requires weight greater than 5 kg'
    },
    naproxen: {
      minValue: 'Naproxen requires weight greater than 40 kg'
    }
  }
}

// Form-level validation rules (cross-field)
export const formLevelRules = [
  // Will be added later
]

// Detector for dosage field-specific testing patterns
const MIN_VALUE = 200
const MAX_VALUE = 1000
const ASPIRIN_MIN = 325
const ASPIRIN_MAX = 1000
const IBUPROFEN_MIN = 200
const IBUPROFEN_MAX = 800
const IBUPROFEN_TOTAL_DOSE_PER_KG = 40
const PARACETAMOL_MIN = 500
const PARACETAMOL_MAX = 1000
const PARACETAMOL_TOTAL_DOSE_PER_KG = 75
const NAPROXEN_MIN = 220
const NAPROXEN_MAX = 550

// Helper function to check if a value is a valid decimal (contains dot)
const isDecimal = (valueString) => {
  return /\./.test(valueString)
}

export const dosageDetector = (value, allValues = {}) => {
  const detections = []

  // Only check for patterns if not empty
  if (!value || value.trim() === '') {
    return detections
  }

  const trimmedValue = value.trim()
  const MAX_LENGTH = 10
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

  // Detect: Comma as decimal point (wrong decimal separator)
  if (/,/.test(trimmedValue)) {
    detections.push('comma_decimal')
  }

  // Detect: Multiple decimal points
  if ((trimmedValue.match(/\./g) || []).length > 1) {
    detections.push('multiple_decimals')
  }

  // Detect: Non-numeric value
  if (isNaN(parseFloat(trimmedValue))) {
    detections.push('non_numeric')
    return detections
  }

  const numericValue = parseFloat(trimmedValue)

  // Detect: Absolute minimum (0)
  if (!isNaN(numericValue) && numericValue === 0) {
    detections.push('absolute_minimum')
  }

  // Detect: Decimal value
  if (isDecimal(trimmedValue)) {
    detections.push('decimal_value')

    // Detect: Decimal precision too high (more than 3 decimal places)
    const decimalPart = trimmedValue.split('.')[1]
    if (decimalPart && decimalPart.length > 3) {
      detections.push('precision_high')
    }
  }

  // Detect: Negative value
  if (numericValue < 0) {
    detections.push('negative_value')
  }

  // Medication-specific detections
  const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
  let hasMedicationDetection = false

  if (medication === 'aspirin') {
    // Adult aspirin dosage detections (325-1000)
    // Detect: Below minimum adult dosage (325)
    if (numericValue > 0 && numericValue < ASPIRIN_MIN) {
      detections.push('aspirin_below_min')
      hasMedicationDetection = true
    }

    // Detect: Boundary minimum adult dosage (325)
    if (numericValue === ASPIRIN_MIN) {
      detections.push('aspirin_boundary_min')
      hasMedicationDetection = true
    }

    // Detect: Nominal adult aspirin dosage (325-1000)
    if (numericValue >= ASPIRIN_MIN && numericValue <= ASPIRIN_MAX) {
      detections.push('aspirin_nominal')
      hasMedicationDetection = true
    }

    // Detect: Boundary maximum dosage (1000)
    if (numericValue === ASPIRIN_MAX) {
      detections.push('aspirin_boundary_max')
      hasMedicationDetection = true
    }

    // Detect: Above maximum adult dosage (1000)
    if (numericValue > ASPIRIN_MAX) {
      detections.push('aspirin_above_max')
      hasMedicationDetection = true
    }
  } else if (medication === 'ibuprofen') {
    // Ibuprofen dosage detections (200-800)
    // Check total dose for nominal detection exclusion
    const frequency = allValues.frequency ? parseFloat(allValues.frequency) : 0
    const weight = allValues.weight ? parseFloat(allValues.weight) : 0
    let isTotalDoseAboveMax = false
    if (numericValue > 0 && frequency > 0 && weight > 0) {
      const totalDose = numericValue * frequency
      const maxTotalDose = weight * IBUPROFEN_TOTAL_DOSE_PER_KG
      isTotalDoseAboveMax = totalDose > maxTotalDose
    }

    // Detect: Below minimum dosage (200)
    if (numericValue > 0 && numericValue < IBUPROFEN_MIN) {
      detections.push('ibuprofen_below_min')
      hasMedicationDetection = true
    }

    // Detect: Boundary minimum dosage (200)
    if (numericValue === IBUPROFEN_MIN) {
      detections.push('ibuprofen_boundary_min')
      hasMedicationDetection = true
    }

    // Detect: Nominal ibuprofen dosage (200-800) - only if total dose is not above max
    if (numericValue >= IBUPROFEN_MIN && numericValue <= IBUPROFEN_MAX && !isTotalDoseAboveMax) {
      detections.push('ibuprofen_nominal')
      hasMedicationDetection = true
    }

    // Detect: Boundary maximum dosage (800)
    if (numericValue === IBUPROFEN_MAX) {
      detections.push('ibuprofen_boundary_max')
      hasMedicationDetection = true
    }

    // Detect: Above maximum ibuprofen dosage (800)
    if (numericValue > IBUPROFEN_MAX) {
      detections.push('ibuprofen_above_max')
      hasMedicationDetection = true
    }

    // Detect: Total ibuprofen dose detections (dosage * frequency vs weight * 40)
    if (numericValue > 0 && frequency > 0 && weight > 0) {
      const totalDose = numericValue * frequency
      const maxTotalDose = weight * IBUPROFEN_TOTAL_DOSE_PER_KG

      // Detect: Total dose at maximum boundary
      if (totalDose === maxTotalDose) {
        detections.push('ibuprofen_total_boundary_max')
      }

      // Detect: Total dose above maximum
      if (totalDose > maxTotalDose) {
        detections.push('ibuprofen_total_above_max')
      }
    }
  } else if (medication === 'paracetamol') {
    // Paracetamol dosage detections (500-1000)
    // Check total dose for nominal detection exclusion
    const frequency = allValues.frequency ? parseFloat(allValues.frequency) : 0
    const weight = allValues.weight ? parseFloat(allValues.weight) : 0
    let isTotalDoseAboveMax = false
    if (numericValue > 0 && frequency > 0 && weight > 0) {
      const totalDose = numericValue * frequency
      const maxTotalDose = weight * PARACETAMOL_TOTAL_DOSE_PER_KG
      isTotalDoseAboveMax = totalDose > maxTotalDose
    }

    // Detect: Below minimum dosage (500)
    if (numericValue > 0 && numericValue < PARACETAMOL_MIN) {
      detections.push('paracetamol_below_min')
      hasMedicationDetection = true
    }

    // Detect: Boundary minimum dosage (500)
    if (numericValue === PARACETAMOL_MIN) {
      detections.push('paracetamol_boundary_min')
      hasMedicationDetection = true
    }

    // Detect: Nominal paracetamol dosage (500-1000) - only if total dose is not above max
    if (numericValue >= PARACETAMOL_MIN && numericValue <= PARACETAMOL_MAX && !isTotalDoseAboveMax) {
      detections.push('paracetamol_nominal')
      hasMedicationDetection = true
    }

    // Detect: Boundary maximum dosage (1000)
    if (numericValue === PARACETAMOL_MAX) {
      detections.push('paracetamol_boundary_max')
      hasMedicationDetection = true
    }

    // Detect: Above maximum paracetamol dosage (1000)
    if (numericValue > PARACETAMOL_MAX) {
      detections.push('paracetamol_above_max')
      hasMedicationDetection = true
    }

    // Detect: Total paracetamol dose detections (dosage * frequency vs weight * 75)
    if (numericValue > 0 && frequency > 0 && weight > 0) {
      const totalDose = numericValue * frequency
      const maxTotalDose = weight * PARACETAMOL_TOTAL_DOSE_PER_KG

      // Detect: Total dose at maximum boundary
      if (totalDose === maxTotalDose) {
        detections.push('paracetamol_total_boundary_max')
      }

      // Detect: Total dose above maximum
      if (totalDose > maxTotalDose) {
        detections.push('paracetamol_total_above_max')
      }
    }
  } else if (medication === 'naproxen') {
    // Naproxen dosage detections (220-550, adults only)
    // Detect: Below minimum dosage (220)
    if (numericValue > 0 && numericValue < NAPROXEN_MIN) {
      detections.push('naproxen_below_min')
      hasMedicationDetection = true
    }

    // Detect: Boundary minimum dosage (220)
    if (numericValue === NAPROXEN_MIN) {
      detections.push('naproxen_boundary_min')
      hasMedicationDetection = true
    }

    // Detect: Nominal naproxen dosage (220-550)
    if (numericValue >= NAPROXEN_MIN && numericValue <= 550) {
      detections.push('naproxen_nominal')
      hasMedicationDetection = true
    }

    // Detect: Boundary maximum dosage (550)
    if (numericValue === 550) {
      detections.push('naproxen_boundary_max')
      hasMedicationDetection = true
    }

    // Detect: Above maximum naproxen dosage (> 550)
    if (numericValue > 550) {
      detections.push('naproxen_above_max')
      hasMedicationDetection = true
    }
  } else {
    // Non-medication-specific detections (original logic)
    // Detect: Below minimum value (0 to MIN_VALUE)
    if (numericValue >= 0 && numericValue < MIN_VALUE) {
      detections.push('below_min')
    }

    // Detect: Boundary values
    if (numericValue === MIN_VALUE) {
      detections.push('boundary_min')
    }
    if (numericValue === MAX_VALUE) {
      detections.push('boundary_max')
    }
    
    // Detect: Nominal value (within valid range and no other issues)
    if (numericValue >= MIN_VALUE && numericValue <= MAX_VALUE) {
      detections.push('nominal_value')
    }
  }

  // Generic boundary detections only trigger if no medication-specific detection
  if (!hasMedicationDetection) {
    if (numericValue === MIN_VALUE) {
      detections.push('boundary_min')
    }
    if (numericValue === MAX_VALUE) {
      detections.push('boundary_max')
    }
  }

  // Detect: Plus sign at start
  if (trimmedValue[0] === '+') {
    detections.push('starts_with_plus')
  }

  return detections
}

// Descriptions for detected patterns
export const detectionDescriptions = {
  absolute_minimum: 'Absolute Min',
  non_numeric: 'Non-numeric',
  negative_value: 'Minus Sign',
  decimal_value: 'Decimal',
  comma_decimal: 'Comma',
  multiple_decimals: 'Decimals',
  precision_high: 'High Precision',
  below_min: 'Below Lower Boundary',
  boundary_min: 'Lower Boundary',
  boundary_max: 'Upper Boundary',
  boundary_length_max: 'Length Max',
  boundary_length_above_max: 'Length Above Max',
  boundary_length_total_max: 'Length Total Max',
  above_max: 'Above Upper Boundary',
  nominal_value: 'Nominal',
  starts_with_plus: '+',
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
  paracetamol_boundary_max: 'Paracetamol Upper Boundary',
  paracetamol_above_max: 'Paracetamol Above Upper Boundary',
  naproxen_below_min: 'Naproxen Below Lower Boundary',
  naproxen_boundary_min: 'Naproxen Lower Boundary',
  naproxen_nominal: 'Naproxen Nominal',
  naproxen_boundary_max: 'Naproxen Upper Boundary',
  naproxen_above_max: 'Naproxen Above Upper Boundary',
  ibuprofen_total_boundary_max: 'Ibuprofen Total Upper Boundary',
  ibuprofen_total_above_max: 'Ibuprofen Total Above Upper Boundary',
  paracetamol_total_boundary_max: 'Paracetamol Total Upper Boundary',
  paracetamol_total_above_max: 'Paracetamol Total Above Upper Boundary'
}

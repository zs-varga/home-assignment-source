// Detector for frequency field-specific testing patterns
const MIN_VALUE = 1
const MAX_VALUE = 5
const ASPIRIN_MIN = 1
const ASPIRIN_MAX = 4
const IBUPROFEN_MIN = 1
const IBUPROFEN_MAX = 4
const PARACETAMOL_MIN = 1
const PARACETAMOL_MAX = 4
const NAPROXEN_MIN = 1
const NAPROXEN_MAX = 3

// Helper function to check if a value is a decimal (contains dot)
const isDecimal = (valueString) => {
  return /\./.test(valueString)
}

export const frequencyDetector = (value, allValues = {}) => {
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
  }

  // Detect: Decimal value (frequency must be integer only)
  if (isDecimal(trimmedValue)) {
    detections.push('decimal_value')

    // Detect: Decimal precision too high (more than 3 decimal places)
    const decimalPart = trimmedValue.split('.')[1]
    if (decimalPart && decimalPart.length > 3) {
      detections.push('precision_high')
    }
  }

  const numericValue = parseFloat(trimmedValue)

  // Detect: Negative value
  if (numericValue < 0) {
    detections.push('negative_value')
  }

  // Medication-specific detections
  const medication = allValues.medication ? allValues.medication.toLowerCase().trim() : ''
  let hasMedicationDetection = false

  if (medication === 'aspirin') {
    // Adult aspirin frequency detections (1-4)
    // Detect: Below min aspirin frequency
    if (numericValue >= 0 && numericValue < ASPIRIN_MIN) {
      detections.push('aspirin_below_min')
      hasMedicationDetection = true
    }

    // Detect: Boundary minimum aspirin frequency (1)
    if (numericValue === ASPIRIN_MIN) {
      detections.push('aspirin_boundary_min')
      hasMedicationDetection = true
    }

    // Detect: Below max adult aspirin frequency (1-3)
    if (numericValue >= ASPIRIN_MIN && numericValue < ASPIRIN_MAX) {
      detections.push('aspirin_nominal')
      hasMedicationDetection = true
    }

    // Detect: At max adult aspirin frequency boundary (4)
    if (numericValue === ASPIRIN_MAX) {
      detections.push('aspirin_boundary_max')
      detections.push('aspirin_nominal')
      hasMedicationDetection = true
    }

    // Detect: Above max aspirin frequency (> 4)
    if (numericValue > ASPIRIN_MAX) {
      detections.push('aspirin_above_max')
      hasMedicationDetection = true
    }
  } else if (medication === 'ibuprofen') {
    // Ibuprofen frequency detections (1-4)
    // Detect: Below min ibuprofen frequency
    if (numericValue >= 0 && numericValue < IBUPROFEN_MIN) {
      detections.push('ibuprofen_below_min')
      hasMedicationDetection = true
    }

    // Detect: Boundary minimum ibuprofen frequency (1)
    if (numericValue === IBUPROFEN_MIN) {
      detections.push('ibuprofen_boundary_min')
      hasMedicationDetection = true
    }

    // Detect: Below max ibuprofen frequency (1-3)
    if (numericValue >= IBUPROFEN_MIN && numericValue < IBUPROFEN_MAX) {
      detections.push('ibuprofen_nominal')
      hasMedicationDetection = true
    }

    // Detect: At max ibuprofen frequency boundary (4)
    if (numericValue === IBUPROFEN_MAX) {
      detections.push('ibuprofen_boundary_max')
      detections.push('ibuprofen_nominal')
      hasMedicationDetection = true
    }

    // Detect: Above max ibuprofen frequency (>= 5)
    if (numericValue > IBUPROFEN_MAX) {
      detections.push('ibuprofen_above_max')
      hasMedicationDetection = true
    }
  } else if (medication === 'paracetamol') {
    // Paracetamol frequency detections (1-4)
    // Detect: Below min paracetamol frequency
    if (numericValue >= 0 && numericValue < PARACETAMOL_MIN) {
      detections.push('paracetamol_below_min')
      hasMedicationDetection = true
    }

    // Detect: Boundary minimum paracetamol frequency (1)
    if (numericValue === PARACETAMOL_MIN) {
      detections.push('paracetamol_boundary_min')
      hasMedicationDetection = true
    }

    // Detect: Below max paracetamol frequency (1-3)
    if (numericValue >= PARACETAMOL_MIN && numericValue < PARACETAMOL_MAX) {
      detections.push('paracetamol_nominal')
      hasMedicationDetection = true
    }

    // Detect: At max paracetamol frequency boundary (4)
    if (numericValue === PARACETAMOL_MAX) {
      detections.push('paracetamol_boundary_max')
      detections.push('paracetamol_nominal')
      hasMedicationDetection = true
    }

    // Detect: Above max paracetamol frequency (> 4)
    if (numericValue > PARACETAMOL_MAX) {
      detections.push('paracetamol_above_max')
      hasMedicationDetection = true
    }
  } else if (medication === 'naproxen') {
    // Naproxen frequency detections (1-2)
    // Detect: Below minimum frequency (0 to MIN_VALUE)
    if (numericValue >= 0 && numericValue < NAPROXEN_MIN) {
      detections.push('naproxen_below_min')
      hasMedicationDetection = true
    }

    // Detect: Boundary minimum frequency (1)
    if (numericValue === NAPROXEN_MIN) {
      detections.push('naproxen_boundary_min')
      hasMedicationDetection = true
    }

    // Detect: Nominal naproxen frequency (1-2)
    if (numericValue >= NAPROXEN_MIN && numericValue <= NAPROXEN_MAX) {
      detections.push('naproxen_nominal')
      hasMedicationDetection = true
    }

    // Detect: Boundary maximum frequency (3)
    if (numericValue === 3) {
      detections.push('naproxen_boundary_max')
      detections.push('naproxen_nominal')
      hasMedicationDetection = true
    }

    // Detect: Above maximum naproxen frequency (> 2)
    if (numericValue > NAPROXEN_MAX) {
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

    // Detect: Above maximum value
    if (numericValue > MAX_VALUE) {
      // above_max detection removed
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
  starts_with_plus: 'Plus Sign',
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
  naproxen_boundary_max: 'Naproxen Upper Boundary',
  naproxen_nominal: 'Naproxen Nominal',
  naproxen_above_max: 'Naproxen Above Upper Boundary'
}

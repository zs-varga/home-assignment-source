// Detector for form-level testing patterns
export const formDetector = (submitEvent, fieldDetections = {}, formData = {}) => {
  const detections = []

  // Detect: Form submitted via Enter key
  // If the active element is an input and not the submit button, it's Enter key submission
  const target = submitEvent.target
  const activeElement = target.ownerDocument?.activeElement
  if (activeElement && activeElement.tagName === 'INPUT' && submitEvent.nativeEvent.submitter?.type === 'submit') {
    detections.push('enter_submit')
  }

  // Detect: Nominal form (all fields contain nominal_value detection)
  // All required fields must be present in fieldDetections and have nominal_value
  const requiredFields = ['medication', 'dateOfBirth', 'weight', 'dosage', 'frequency']
  const allFieldsPresent = requiredFields.every((field) => field in fieldDetections)

  if (allFieldsPresent) {
    const allHaveNominal = requiredFields.every((field) => {
      const fieldDets = fieldDetections[field]
      // Handle both array and non-array values
      const dets = Array.isArray(fieldDets) ? fieldDets : []
      // Field must have nominal_value detection (can have other detections)
      return dets.includes('nominal_value')
    })
    if (allHaveNominal) {
      detections.push('nominal_form')

      // Detect medication-specific nominal forms
      const medication = (formData.medication || '').toLowerCase().trim()
      const medicationSpecificTags = {
        'aspirin': 'nominal_form_aspirin',
        'ibuprofen': 'nominal_form_ibuprofen',
        'paracetamol': 'nominal_form_paracetamol',
        'naproxen': 'nominal_form_naproxen'
      }
      if (medicationSpecificTags[medication]) {
        detections.push(medicationSpecificTags[medication])
      }
    }
  }

  return detections
}

// Descriptions for detected patterns
export const detectionDescriptions = {
  enter_submit: 'Using Enter',
  nominal_form: 'Nominal',
  nominal_form_aspirin: 'Aspirin Nominal',
  nominal_form_ibuprofen: 'Ibuprofen Nominal',
  nominal_form_paracetamol: 'Paracetamol Nominal',
  nominal_form_naproxen: 'Naproxen Nominal',
  storage_tampering: 'Storage tampering',
  concurrent_session: 'Concurrent session'
}

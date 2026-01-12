// Detector for form-level testing patterns
export const formDetector = (submitEvent, fieldDetections = {}) => {
  const detections = []

  // Detect: Form submitted via Enter key
  // If the active element is an input and not the submit button, it's Enter key submission
  const target = submitEvent.target
  const activeElement = target.ownerDocument?.activeElement
  if (activeElement && activeElement.tagName === 'INPUT' && submitEvent.nativeEvent.submitter?.type === 'submit') {
    detections.push('enter_submit')
  }

  // Detect: Nominal form (all fields contain nominal_value detection)
  // Check if all fields have nominal_value detection (can have other detections too)
  const fieldValues = Object.values(fieldDetections)
  if (fieldValues.length > 0) {
    const allHaveNominal = fieldValues.every((fieldDets) => {
      // Handle both array and non-array values
      const dets = Array.isArray(fieldDets) ? fieldDets : []
      // Field must have nominal_value detection (can have other detections)
      return dets.includes('nominal_value')
    })
    if (allHaveNominal) {
      detections.push('nominal_form')
    }
  }

  return detections
}

// Descriptions for detected patterns
export const detectionDescriptions = {
  enter_submit: 'Using Enter',
  nominal_form: 'Nominal',
  storage_tampering: 'Storage tampering',
  concurrent_session: 'Concurrent session'
}

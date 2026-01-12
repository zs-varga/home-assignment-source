import { useState, useEffect } from 'react'
import './ValidationForm.css'
import FieldBadges from './Badges'
import { useSyncedSessionStorage } from '../hooks/useSyncedSessionStorage'
import { monitorStorageKey, saveBackup, setTamperingCallback, setMultiWindowCallback, initializeStorageChangeDetection } from '../utils/storageChangeDetector'
import { validateMedication } from '../validators/medicationValidator'
import { validateWeight } from '../validators/weightValidator'
import { validateDateOfBirth } from '../validators/dateOfBirthValidator'
import { validateDosage } from '../validators/dosageValidator'
import { validateFrequency } from '../validators/frequencyValidator'
import { medicationDetector } from '../detectors/medicationDetector'
import { dateOfBirthDetector } from '../detectors/dateOfBirthDetector'
import { weightDetector } from '../detectors/weightDetector'
import { dosageDetector } from '../detectors/dosageDetector'
import { frequencyDetector } from '../detectors/frequencyDetector'
import { fieldDetector } from '../detectors/fieldDetector'
import { formDetector } from '../detectors/formDetector'
import { submitAccomplishmentsToGoogleForms } from '../utils/googleFormsSubmission'

function ValidationForm({ accessValidation }) {
  const [formData, setFormData] = useState({
    medication: '',
    dateOfBirth: '',
    weight: '',
    dosage: '',
    frequency: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [formErrors, setFormErrors] = useState([])
  const [accomplishments, setAccomplishments] = useSyncedSessionStorage('detector_accomplishments', {})
  const [previousAccomplishments, setPreviousAccomplishments] = useSyncedSessionStorage('detector_previous_accomplishments', {})
  const [formAccomplishments, setFormAccomplishments] = useSyncedSessionStorage('detector_form_accomplishments', [])
  const [storageWasTampered, setStorageWasTampered] = useState(false)
  const [multiWindowDetected, setMultiWindowDetected] = useState(false)
  const [candidateEmail] = useState(() => {
    // Extract email from access token on mount
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token && accessValidation) {
      // Email is already decoded in App.jsx, we just need to extract it if available
      // For now, we'll use a default email
      return accessValidation.email || 'zsolt.varga@supercharge.io'
    }
    return null
  })

  // Set up storage change detection and monitoring
  useEffect(() => {
    // Set tampering callback to track when storage tampering is detected
    setTamperingCallback(() => {
      setStorageWasTampered(true)
    })

    // Set multi-window callback to track when another window/tab modifies storage
    setMultiWindowCallback(() => {
      setMultiWindowDetected(true)
    })

    // Initialize storage event listener for cross-window changes
    const unsubscribe = initializeStorageChangeDetection()

    // Monitor each storage key for changes (including same-tab modifications)
    const unmonitor1 = monitorStorageKey('detector_accomplishments', 500)
    const unmonitor2 = monitorStorageKey('detector_previous_accomplishments', 500)
    const unmonitor3 = monitorStorageKey('detector_form_accomplishments', 500)

    // Cleanup function
    return () => {
      unsubscribe()
      unmonitor1()
      unmonitor2()
      unmonitor3()
    }
  }, [])

  // Save backups whenever accomplishments change (needed for tampering detection and restoration)
  useEffect(() => {
    saveBackup('detector_accomplishments', accomplishments)
    saveBackup('detector_previous_accomplishments', previousAccomplishments)
    saveBackup('detector_form_accomplishments', formAccomplishments)
  }, [accomplishments, previousAccomplishments, formAccomplishments])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all fields
    const errors = {}
    const newAccomplishments = { ...accomplishments }

    // Validate medication field
    const medicationErrors = validateMedication(formData.medication, formData)
    if (medicationErrors.length > 0) {
      errors.medication = medicationErrors
    }

    // Validate dateOfBirth field
    const dateOfBirthErrors = validateDateOfBirth(formData.dateOfBirth, formData)
    if (dateOfBirthErrors.length > 0) {
      errors.dateOfBirth = dateOfBirthErrors
    }

    // Validate weight field
    const weightErrors = validateWeight(formData.weight, formData)
    if (weightErrors.length > 0) {
      errors.weight = weightErrors
    }

    // Validate dosage field
    const dosageErrors = validateDosage(formData.dosage, formData)
    if (dosageErrors.length > 0) {
      errors.dosage = dosageErrors
    }

    // Validate frequency field
    const frequencyErrors = validateFrequency(formData.frequency, formData)
    if (frequencyErrors.length > 0) {
      errors.frequency = frequencyErrors
    }

    // Detect testing patterns in all fields
    const fieldDetections = fieldDetector(formData.medication, formData)
    const medicationDetections = medicationDetector(formData.medication, formData)
    const allMedicationDetections = [...fieldDetections, ...medicationDetections]
    if (allMedicationDetections.length > 0) {
      const existingMedicationAccomplishments = accomplishments.medication || []
      newAccomplishments.medication = Array.from(new Set([...existingMedicationAccomplishments, ...allMedicationDetections]))
    }

    const fieldDateOfBirthDetections = fieldDetector(formData.dateOfBirth, formData)
    const specializedDateOfBirthDetections = dateOfBirthDetector(formData.dateOfBirth, formData)
    const allDateOfBirthDetections = [...fieldDateOfBirthDetections, ...specializedDateOfBirthDetections]
    if (allDateOfBirthDetections.length > 0) {
      const existingDateOfBirthAccomplishments = accomplishments.dateOfBirth || []
      newAccomplishments.dateOfBirth = Array.from(new Set([...existingDateOfBirthAccomplishments, ...allDateOfBirthDetections]))
    }

    const fieldWeightDetections = fieldDetector(formData.weight, formData)
    const specializedWeightDetections = weightDetector(formData.weight, formData)
    const allWeightDetections = [...fieldWeightDetections, ...specializedWeightDetections]
    if (allWeightDetections.length > 0) {
      const existingWeightAccomplishments = accomplishments.weight || []
      newAccomplishments.weight = Array.from(new Set([...existingWeightAccomplishments, ...allWeightDetections]))
    }

    const fieldDosageDetections = fieldDetector(formData.dosage, formData)
    const specializedDosageDetections = dosageDetector(formData.dosage, formData)
    const allDosageDetections = [...fieldDosageDetections, ...specializedDosageDetections]
    if (allDosageDetections.length > 0) {
      const existingDosageAccomplishments = accomplishments.dosage || []
      newAccomplishments.dosage = Array.from(new Set([...existingDosageAccomplishments, ...allDosageDetections]))
    }

    const fieldFrequencyDetections = fieldDetector(formData.frequency, formData)
    const specializedFrequencyDetections = frequencyDetector(formData.frequency, formData)
    const allFrequencyDetections = [...fieldFrequencyDetections, ...specializedFrequencyDetections]
    if (allFrequencyDetections.length > 0) {
      const existingFrequencyAccomplishments = accomplishments.frequency || []
      newAccomplishments.frequency = Array.from(new Set([...existingFrequencyAccomplishments, ...allFrequencyDetections]))
    }

    // Detect form-level patterns with collected field detections
    const formDetections = formDetector(e, newAccomplishments)
    let newFormAccomplishments = Array.from(new Set([...formAccomplishments, ...formDetections]))

    // Add storage tampering detection if tampering was detected
    if (storageWasTampered) {
      newFormAccomplishments = Array.from(new Set([...newFormAccomplishments, 'storage_tampering']))
      setStorageWasTampered(false) // Reset the flag after adding detection
    }

    // Add concurrent session detection if multi-window activity was detected
    if (multiWindowDetected) {
      newFormAccomplishments = Array.from(new Set([...newFormAccomplishments, 'concurrent_session']))
      setMultiWindowDetected(false) // Reset the flag after adding detection
    }

    setFieldErrors(errors)
    setFormErrors([]) // Will be populated with form-level errors later
    setPreviousAccomplishments(accomplishments)
    setAccomplishments(newAccomplishments)
    setFormAccomplishments(newFormAccomplishments)
  }

  const handleReset = () => {
    setFormData({
      medication: '',
      dateOfBirth: '',
      weight: '',
      dosage: '',
      frequency: ''
    })
    setFieldErrors({})
    setFormErrors([])
    setAccomplishments({})
    setPreviousAccomplishments({})
    setFormAccomplishments([])
    setStorageWasTampered(false)
    setMultiWindowDetected(false)
  }

  const handleSave = () => {
    submitAccomplishmentsToGoogleForms(accomplishments, formAccomplishments, candidateEmail || 'zsolt.varga@supercharge.io')
  }

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="validation-form">
        <fieldset>
          <legend>Medication Prescription</legend>

          <div className="form-group">
            <label htmlFor="medication">Medication</label>
            <input
              type="text"
              id="medication"
              name="medication"
              value={formData.medication}
              onChange={handleChange}
              placeholder="Medication name"
            />
            {fieldErrors.medication && (
              <div className="field-errors">
                {fieldErrors.medication.map((error, idx) => (
                  <p key={idx} className="error-message">{error}</p>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="text"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
            />
            {fieldErrors.dateOfBirth && (
              <div className="field-errors">
                {fieldErrors.dateOfBirth.map((error, idx) => (
                  <p key={idx} className="error-message">{error}</p>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="kg"
            />
            {fieldErrors.weight && (
              <div className="field-errors">
                {fieldErrors.weight.map((error, idx) => (
                  <p key={idx} className="error-message">{error}</p>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dosage">Dosage</label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              placeholder="mg"
            />
            {fieldErrors.dosage && (
              <div className="field-errors">
                {fieldErrors.dosage.map((error, idx) => (
                  <p key={idx} className="error-message">{error}</p>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="frequency">Frequency</label>
            <input
              type="text"
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              placeholder="daily frequency"
            />
            {fieldErrors.frequency && (
              <div className="field-errors">
                {fieldErrors.frequency.map((error, idx) => (
                  <p key={idx} className="error-message">{error}</p>
                ))}
              </div>
            )}
          </div>
        </fieldset>

        {formErrors.length > 0 && (
          <div className="form-errors">
            {formErrors.map((error, idx) => (
              <p key={idx} className="error-message">{error}</p>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Submit</button>
          <button type="button" className="btn btn-success" onClick={handleSave}>Save</button>
          <button type="reset" className="btn btn-secondary" onClick={handleReset}>Reset</button>
        </div>
      </form>

      <div className="badges-panel">
        <h3 className="badges-title">Already Covered</h3>
        <div className="all-badges">
          {['medication', 'dateOfBirth', 'weight', 'dosage', 'frequency'].map((fieldName) => (
            <div key={fieldName} className="field-accomplishment">
              <span className="field-label">{fieldName}</span>
              {accomplishments[fieldName] && accomplishments[fieldName].length > 0 && (
                <FieldBadges fieldName={fieldName} accomplishments={accomplishments} previousAccomplishments={previousAccomplishments} />
              )}
            </div>
          ))}
          <div className="form-accomplishment">
            <span className="field-label">form</span>
            {formAccomplishments.length > 0 && (
              <FieldBadges fieldName="form" accomplishments={{ form: formAccomplishments }} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValidationForm

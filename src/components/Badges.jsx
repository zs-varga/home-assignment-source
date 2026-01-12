import './Badges.css'
import { detectionDescriptions as medicationDescriptions } from '../detectors/medicationDetector'
import { detectionDescriptions as dateOfBirthDescriptions } from '../detectors/dateOfBirthDetector'
import { detectionDescriptions as weightDescriptions } from '../detectors/weightDetector'
import { detectionDescriptions as dosageDescriptions } from '../detectors/dosageDetector'
import { detectionDescriptions as frequencyDescriptions } from '../detectors/frequencyDetector'
import { detectionDescriptions as fieldDescriptions } from '../detectors/fieldDetector'
import { detectionDescriptions as formDescriptions } from '../detectors/formDetector'

function FieldBadges({ fieldName, accomplishments = {}, previousAccomplishments = {} }) {
  const fieldAccomplishments = accomplishments[fieldName] || []
  const previousFieldAccomplishments = previousAccomplishments[fieldName] || []

  // Identify newly added badges based on direct comparison
  const newBadges = new Set(
    fieldAccomplishments.filter(acc => !previousFieldAccomplishments.includes(acc))
  )

  if (fieldAccomplishments.length === 0) {
    return null
  }

  // Combine all description dictionaries for lookup
  const allDescriptions = { ...fieldDescriptions, ...medicationDescriptions, ...dateOfBirthDescriptions, ...weightDescriptions, ...dosageDescriptions, ...frequencyDescriptions, ...formDescriptions }

  return (
    <div className="field-badges">
      {fieldAccomplishments.map((accomplishment) => (
        <span
          key={accomplishment}
          className={`badge-text ${newBadges.has(accomplishment) ? 'badge-new' : ''}`}
        >
          {allDescriptions[accomplishment] || accomplishment}
        </span>
      ))}
    </div>
  )
}

export default FieldBadges

import './Badges.css'
import { badgeIcons } from '../config/badgeIcons'
import { badgeSortOrder } from '../config/badgeSortOrder'
import { detectionDescriptions as medicationDescriptions } from '../detectors/medicationDetector'
import { detectionDescriptions as dateOfBirthDescriptions } from '../detectors/dateOfBirthDetector'
import { detectionDescriptions as weightDescriptions } from '../detectors/weightDetector'
import { detectionDescriptions as dosageDescriptions } from '../detectors/dosageDetector'
import { detectionDescriptions as frequencyDescriptions } from '../detectors/frequencyDetector'
import { detectionDescriptions as fieldDescriptions } from '../detectors/fieldDetector'
import { detectionDescriptions as formDescriptions } from '../detectors/formDetector'

const MEDICATIONS = ['aspirin', 'ibuprofen', 'paracetamol', 'naproxen', 'placebo']

// Map medication-specific pattern names to base icon names
const PATTERN_MAPPING = {
  nominal: 'nominal_value',
  invalid: 'invalid_value'
}

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

  const getMedicationFromTag = (tag) => {
    for (const med of MEDICATIONS) {
      if (tag.startsWith(med + '_')) {
        let pattern = tag.substring(med.length + 1)
        // Map pattern names that don't match badge icon keys
        pattern = PATTERN_MAPPING[pattern] || pattern
        return { medication: med, pattern }
      }
    }
    return null
  }

  // Sort badges: non-medicine first, then by medicine order, using badgeSortOrder for consistency
  const medicineOrder = ['placebo', 'aspirin', 'ibuprofen', 'paracetamol', 'naproxen']

  const getPatternSortIndex = (pattern) => {
    const index = badgeSortOrder.indexOf(pattern)
    return index === -1 ? badgeSortOrder.length : index // Unknown patterns go to the end
  }

  const sortedAccomplishments = [...fieldAccomplishments].sort((a, b) => {
    const aMed = getMedicationFromTag(a)
    const bMed = getMedicationFromTag(b)

    // Non-medicine badges come first
    if (!aMed && bMed) return -1
    if (aMed && !bMed) return 1

    // Both are medicine or both are non-medicine
    if (!aMed && !bMed) {
      // Sort by badgeSortOrder
      const aSortIndex = getPatternSortIndex(a)
      const bSortIndex = getPatternSortIndex(b)
      return aSortIndex - bSortIndex
    }

    // Both are medicine-specific
    const aIndex = medicineOrder.indexOf(aMed.medication)
    const bIndex = medicineOrder.indexOf(bMed.medication)

    // First sort by medicine order
    if (aIndex !== bIndex) return aIndex - bIndex

    // Then sort by badgeSortOrder for the pattern within same medicine
    const aSortIndex = getPatternSortIndex(aMed.pattern)
    const bSortIndex = getPatternSortIndex(bMed.pattern)
    return aSortIndex - bSortIndex
  })

  return (
    <div className="field-badges">
      {sortedAccomplishments.map((accomplishment) => {
        const medPattern = getMedicationFromTag(accomplishment)
        const medicationClass = medPattern ? `badge-med-${medPattern.medication}` : ''

        // For medication-specific patterns, try to find the base icon
        let patternIcon
        if (medPattern) {
          patternIcon = badgeIcons[medPattern.pattern] || badgeIcons.default
        } else {
          patternIcon = badgeIcons[accomplishment] || badgeIcons.default
        }

        return (
          <span
            key={accomplishment}
            className={`badge-icon ${medicationClass} ${newBadges.has(accomplishment) ? 'badge-new' : ''}`}
            data-tooltip={allDescriptions[accomplishment] || accomplishment}
          >
            {patternIcon}
          </span>
        )
      })}
    </div>
  )
}

export default FieldBadges

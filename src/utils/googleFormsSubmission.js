/**
 * Google Forms Submission Utility
 * Handles posting accomplishments to Google Forms
 */

// Google Form configuration
const GOOGLE_FORM_CONFIG = {
  formId: '1FAIpQLSdftQ_NX3wxloFBc62lAZxwpWWaWpu0uTUKncGFwSRimfBG7w',
  endpoint: 'https://docs.google.com/forms/d/e/1FAIpQLSdftQ_NX3wxloFBc62lAZxwpWWaWpu0uTUKncGFwSRimfBG7w/formResponse',
  accomplishmentsFieldId: 'entry.2076330911',
  emailFieldId: 'emailAddress'
}

/**
 * Formats accomplishments object into a comma-separated string for form submission
 * Format: field_detection, field_detection, field_detection...
 * @param {Object} accomplishments - Object containing accomplishment arrays by field
 * @param {Array} formAccomplishments - Array of form-level accomplishments
 * @returns {string} Formatted accomplishments string
 */
export function formatAccomplishmentsForSubmission(accomplishments, formAccomplishments) {
  const items = []

  // Add field accomplishments in field_detection format
  Object.entries(accomplishments).forEach(([fieldName, badges]) => {
    if (badges && badges.length > 0) {
      badges.forEach(badge => {
        items.push(`${fieldName}_${badge}`)
      })
    }
  })

  // Add form accomplishments in form_detection format
  if (formAccomplishments && formAccomplishments.length > 0) {
    formAccomplishments.forEach(accomplishment => {
      items.push(`form_${accomplishment}`)
    })
  }

  return items.join(', ')
}

/**
 * Submits accomplishments to Google Forms
 * @param {Object} accomplishments - Field accomplishments object
 * @param {Array} formAccomplishments - Form-level accomplishments
 * @param {string} email - Optional email address for tracking responses
 * @returns {Promise<void>}
 */
export async function submitAccomplishmentsToGoogleForms(accomplishments, formAccomplishments, email = '') {
  try {
    const formattedAccomplishments = formatAccomplishmentsForSubmission(accomplishments, formAccomplishments)

    const formData = new FormData()
    formData.append(GOOGLE_FORM_CONFIG.accomplishmentsFieldId, formattedAccomplishments)

    // Include email if provided (helps with tracking and updating responses)
    if (email) {
      formData.append(GOOGLE_FORM_CONFIG.emailFieldId, email)
    }

    await fetch(GOOGLE_FORM_CONFIG.endpoint, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Google Forms doesn't support CORS, so we use no-cors mode
    })

    // Note: With no-cors mode, we can't read the response
  } catch {
    // Silent fail
  }
}

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
 * Formats accomplishments object into a readable string for form submission
 * @param {Object} accomplishments - Object containing accomplishment arrays by field
 * @param {Array} formAccomplishments - Array of form-level accomplishments
 * @returns {string} Formatted accomplishments string
 */
export function formatAccomplishmentsForSubmission(accomplishments, formAccomplishments) {
  const parts = []

  // Add field accomplishments
  Object.entries(accomplishments).forEach(([fieldName, badges]) => {
    if (badges && badges.length > 0) {
      parts.push(`${fieldName}: ${badges.join(', ')}`)
    }
  })

  // Add form accomplishments
  if (formAccomplishments && formAccomplishments.length > 0) {
    parts.push(`form: ${formAccomplishments.join(', ')}`)
  }

  return parts.join('\n')
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

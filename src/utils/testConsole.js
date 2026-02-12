/**
 * Test Console Utilities
 * Exposes fillAndSubmit function for testing form submission from the browser console
 * Usage: TEST.fillAndSubmit({medication: 'aspirin', dosage: 500, frequency: 2, dateOfBirth: '2000-01-01', weight: 70})
 */

/**
 * Fill form inputs with data and submit
 * @param {object} data - Object with field values {medication, dosage, frequency, dateOfBirth, weight}
 * @returns {boolean} - True if submission succeeded, false otherwise
 */
function fillAndSubmit(data) {
  if (typeof data !== 'object' || data === null) {
    console.error('❌ Argument must be an object with field values')
    return false
  }

  const form = document.querySelector('.validation-form')
  if (!form) {
    console.error('❌ Form not found. Make sure you have valid access.')
    return false
  }

  try {
    // Get all inputs by their id
    const inputs = {
      medication: form.querySelector('#medication'),
      dateOfBirth: form.querySelector('#dateOfBirth'),
      weight: form.querySelector('#weight'),
      dosage: form.querySelector('#dosage'),
      frequency: form.querySelector('#frequency')
    }

    // Fill each field
    Object.entries(inputs).forEach(([fieldName, input]) => {
      if (input && data[fieldName] !== undefined) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set

        nativeInputValueSetter.call(input, data[fieldName])

        // Trigger change and input events
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    // Submit form by clicking the submit button
    setTimeout(() => {
      const submitButton = form.querySelector('button[type="submit"]')
      if (submitButton) {
        // Dispatch click event which React properly handles
        submitButton.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }))
      }
    }, 300)

    return true
  } catch (error) {
    console.error('❌ Error filling form:', error)
    return false
  }
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.TEST = {
    fillAndSubmit
  }
}

export { fillAndSubmit }

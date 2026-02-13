// Detector for testing patterns in any field
export const fieldDetector = (value, _allValues) => {
  const detections = []

  // Detect: Empty value
  if (!value || value.trim() === '') {
    detections.push('empty_value')
    return detections
  }

  // Detect: Leading space
  if (value.length > 0 && value[0] === ' ') {
    detections.push('leading_space')
  }

  // Detect: Trailing space
  if (value.length > 0 && value[value.length - 1] === ' ') {
    detections.push('trailing_space')
  }

  // Detect: Middle space (any space between start and end, excluding leading/trailing)
  if (value.trim().includes(' ')) {
    detections.push('middle_space')
  }

  // Detect: Non-alphanumeric characters (excluding spaces)
  if (/[^0-9a-zA-Z -]/.test(value)) {
    detections.push('non_alphanumeric')
  }

  // Detect: Non-ASCII characters (charcode > 127)
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) > 127) {
      detections.push('non_ascii')
      break
    }
  }

  // Detect: Non-printable characters (charcode < 32 or === 127)
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i)
    if (charCode < 32 || charCode === 127) {
      detections.push('non_printable')
      break
    }
  }

  // Detect: HTML tags (pattern: <followed by non-whitespace and closing >)
  if (/<[^\s<>][^<>]*>/.test(value)) {
    detections.push('contains_html')
  }

  // Detect: XSS (script tags, case-insensitive)
  if (/<\s*script\b/i.test(value)) {
    detections.push('contains_xss')
  }

  // Detect: SQL injection (contains SQL keywords followed by space or common SQL patterns)
  if (/;[\s]*(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE|EXEC|EXECUTE)\b/i.test(value) || /^[\s]*;/i.test(value)) {
    detections.push('contains_sql_injection')
  }

  return detections
}

// Descriptions for detected patterns
export const detectionDescriptions = {
  empty_value: 'Empty',
  leading_space: ' Leading space',
  trailing_space: 'Trailing space ',
  middle_space: 'Middle space',
  non_alphanumeric: 'Non-alphanumeric',
  non_ascii: 'Non-ASCII',
  non_printable: 'Non-printable',
  contains_html: 'HTML',
  contains_xss: 'XSS',
  contains_sql_injection: 'SQL injection',
}

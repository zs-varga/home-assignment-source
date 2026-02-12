/**
 * Badge icon mapping for detection tags
 * Maps detection tags to unicode/emoji icons
 */
export const badgeIcons = {
  // Common across detectors
  nominal_value: '✓',
  invalid_value: '✗',
  boundary_min: '⬇',
  boundary_max: '⬆',
  below_min: '⬇−',
  above_max: '⬆+',

  // Numeric issues
  non_numeric: '#',
  negative_value: '−',
  decimal_value: '.',
  comma_decimal: ',',
  multiple_decimals: '..',
  precision_high: '≈',
  starts_with_plus: '+',

  // Date/Format issues
  invalid_format: '📅',
  invalid_month: '🗓13',
  invalid_day: '🗓32',
  invalid_day_for_30day_month: '🗓31',
  invalid_february_day: '📆30',
  invalid_leap_year_february: '📆29',
  future_date: '⏭',

  // Text/Field issues
  empty_value: '∅',
  leading_space: '←',
  trailing_space: '→',
  middle_space: '↔',
  non_alphanumeric: '@',
  non_ascii: '™',
  non_printable: '¶',
  contains_html: '⟨⟩',
  contains_xss: 'X⚠',
  contains_sql_injection: 'S⚠',
  boundary_length_min: '←',
  boundary_length_max: '→',
  total_boundary_max: '∑⬆',
  total_above_max: '∑⬆+',

  // Medication-specific (these use base pattern icons via extraction)
  aspirin_boundary_max: '⬆',
  aspirin_above_max: '⬆+',
  ibuprofen_boundary_max: '⬆',
  ibuprofen_above_max: '⬆+',
  ibuprofen_total_boundary_max: '∑⬆',
  ibuprofen_total_above_max: '∑⬆+',

  paracetamol_boundary_max: '⬆',
  paracetamol_above_max: '⬆+',
  paracetamol_total_boundary_max: '∑⬆',
  paracetamol_total_above_max: '∑⬆+',

  // Form-level detections
  enter_submit: '⏎',
  nominal_form: '✓',
  storage_tampering: '🔒',
  concurrent_session: '👥',

  // Fallback
  default: '•'
}

/**
 * Medication icons for dual-icon badges
 * Used to display medication-specific patterns
 */
export const medicationIcons = {
  aspirin: '💊',
  ibuprofen: '🩹',
  paracetamol: '🌡️',
  naproxen: '🧊',
  placebo: '⭕'
}

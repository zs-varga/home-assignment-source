/**
 * Badge icon mapping for detection tags
 * Maps detection tags to unicode/emoji icons
 */
export const badgeIcons = {
  // Common across detectors
  below_min: '⇊',
  boundary_length_min: '⇩',
  boundary_min: '↓',
  nominal_value: '✓',
  invalid_value: '✗',
  boundary_max: '↑',
  boundary_length_above_max: '⬆',
  above_max: '⇈',
  boundary_length_max: '⇧',
  total_above_max: '∑⇈',
  total_boundary_max: '∑↑',
  boundary_length_total_max: '∑⬆',

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
  invalid_month: '13',
  invalid_day: '32',
  invalid_day_for_30day_month: '31',
  invalid_february_day: '30',
  invalid_leap_year_february: '29',
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
  contains_xss: 'js',
  contains_sql_injection: ';−',

  // Form-level detections
  enter_submit: '⏎',
  nominal_form: '✓',
  nominal_form_aspirin: '✓',
  nominal_form_ibuprofen: '✓',
  nominal_form_paracetamol: '✓',
  nominal_form_naproxen: '✓',
  storage_tampering: '🔒',
  concurrent_session: '||',

  // Fallback
  default: '•'
}

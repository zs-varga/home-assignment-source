/**
 * Badge sort order configuration
 * Defines the exact order in which detection badges should be displayed
 * This order applies to both non-medicine and medicine-specific badges
 */

export const badgeSortOrder = [
  // String/format validations
  'empty_value',
  'leading_space',
  'middle_space',
  'trailing_space',
  'contains_html',
  'contains_sql_injection',
  'contains_xss',
  'non_alphanumeric',
  'non_ascii',
  'non_printable',

  // Numeric/decimal validations
  'non_numeric',
  'starts_with_plus',
  'negative_value',
  'decimal_value',
  'multiple_decimals',
  'comma_decimal',
  'precision_high',

  // Range/boundary validations
  'boundary_length_min',
  'below_min',
  'boundary_min',
  'nominal_value',
  'invalid_value',
  'boundary_max',
  'above_max',
  'boundary_length_max',
  'boundary_length_above_max',
  'boundary_length_total_max',

  // Date-specific validations
  'invalid_format',
  'invalid_month',
  'invalid_february_day',
  'invalid_leap_year_february',
  'invalid_day',
  'invalid_day_for_30day_month',

  // Value validations
  'enter_submit',
  'concurrent_session',
  'storage_tampering',
  'nominal_form',
]

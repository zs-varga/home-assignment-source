# Config Directory

## Purpose
Centralized configuration for validation rules and error messages. Provides a single source of truth for validation requirements across the application.

---

## validationRules.js

**Purpose**: Define validation requirements and error messages for all form fields.

### Structure

```javascript
export const validationRules = {
  medication: {
    required: { message: 'Medication is required' }
  },
  dateOfBirth: {
    required: { message: 'Date of Birth is required' }
  },
  weight: {
    required: { message: 'Weight is required' }
  },
  dosage: {
    required: { message: 'Dosage is required' }
  },
  frequency: {
    required: { message: 'Frequency is required' }
  }
}

export const formLevelRules = [
  // Will be added later
]
```

### Field Rules

#### medication
```javascript
{
  required: { message: 'Medication is required' }
}
```
- **Message used by**: `medicationValidator.js`
- **Additional validation**: max 20 chars, must be one of 4 options (hardcoded in validator)

#### dateOfBirth
```javascript
{
  required: { message: 'Date of Birth is required' }
}
```
- **Message used by**: `dateOfBirthValidator.js`
- **Additional validation**: YYYY-MM-DD format, valid date, age 0-150, no future dates

#### weight
```javascript
{
  required: { message: 'Weight is required' }
}
```
- **Message used by**: `weightValidator.js`
- **Additional validation**: numeric, 5-500 kg range

#### dosage
```javascript
{
  required: { message: 'Dosage is required' }
}
```
- **Message used by**: `dosageValidator.js`
- **Additional validation**: numeric, 200-1000 mg range

#### frequency
```javascript
{
  required: { message: 'Frequency is required' }
}
```
- **Message used by**: `frequencyValidator.js`
- **Additional validation**: integer only, 1-5 range

### Form-Level Rules

```javascript
export const formLevelRules = [
  // Placeholder for cross-field validation rules
  // Examples:
  // - Dosage should be appropriate for age
  // - Weight and frequency relationship validation
  // - Medication and dosage compatibility
]
```

Currently not used, but reserved for future cross-field validation rules.

---

## Usage in Validators

All validators import and use these rules:

```javascript
import { validationRules } from '../config/validationRules'

export const validateMedication = (value) => {
  const errors = []

  if (!value || value.trim() === '') {
    errors.push(validationRules.medication.required.message)
    return errors
  }

  // Additional validation...
  return errors
}
```

### Advantages of Centralized Rules

1. **Single Source of Truth**: Change message once, updates everywhere
2. **Consistency**: All error messages follow same format
3. **Easy Maintenance**: Modify rules without touching validator logic
4. **Easy Testing**: Mock rules easily in unit tests
5. **Localization Ready**: Can be extended for multi-language support

---

## Extending Configuration

### Adding New Field

1. Add to `validationRules`:
```javascript
export const validationRules = {
  // ... existing rules
  newField: {
    required: { message: 'New Field is required' },
    min: { value: 0, message: 'New Field must be at least 0' },
    max: { value: 100, message: 'New Field must not exceed 100' }
  }
}
```

2. Use in validator:
```javascript
import { validationRules } from '../config/validationRules'

export const validateNewField = (value) => {
  const errors = []

  if (!value) {
    errors.push(validationRules.newField.required.message)
  }

  if (value < validationRules.newField.min.value) {
    errors.push(validationRules.newField.min.message)
  }

  return errors
}
```

### Adding Form-Level Rules

1. Define rule:
```javascript
export const formLevelRules = [
  {
    name: 'dosageForAge',
    validator: (formData) => {
      // Complex validation involving multiple fields
    },
    message: 'Dosage should be appropriate for patient age'
  }
]
```

2. Use in form validation:
```javascript
const validateForm = (formData) => {
  const errors = []

  formLevelRules.forEach(rule => {
    if (!rule.validator(formData)) {
      errors.push(rule.message)
    }
  })

  return errors
}
```

---

## Current Validation Requirements

### By Field

| Field | Required | Format | Range | Notes |
|-------|----------|--------|-------|-------|
| Medication | Yes | String | 4 options | Case-insensitive |
| Date of Birth | Yes | YYYY-MM-DD | Valid dates only | Age 0-150, no future |
| Weight | Yes | Numeric | 5-500 kg | Decimals allowed |
| Dosage | Yes | Numeric | 200-1000 mg | Decimals allowed |
| Frequency | Yes | Integer | 1-5 | No decimals |

### Form-Level Validations

Currently none, but reserved for:
- Cross-field validation
- Conditional field requirements
- Complex business logic rules

---

## File Structure

```
config/
└── validationRules.js    # Single configuration file
```

**Rationale**: Small, focused configuration file that's easy to find and modify.

If configuration grows, consider:
- `medication.js` - Medication-specific rules
- `dateOfBirth.js` - Date-specific rules
- `numeric.js` - Rules for weight/dosage/frequency
- Each imported and combined in main config file

---

## Version History

### Current Version
- 5 field-specific required rules
- Placeholder for form-level rules
- All rules use `{ message: '...' }` format

### Recent Changes
None to this file structure; rules remain consistent.

All numeric validations (ranges, decimals) are handled by validators, not in config.
This keeps config focused on messages and high-level requirements.

---

## Best Practices

1. **Keep Messages User-Friendly**: Write for end users, not developers
2. **Be Specific**: "Medication must be one of: aspirin, ibuprofen, paracetamol, naproxen"
3. **Avoid Technical Jargon**: Don't say "invalid regex match"
4. **Provide Guidance**: "Weight must be between 5 and 500 kg"
5. **Don't Duplicate**: Use config, don't hardcode messages in validators

---

## Testing Config

Test configuration by:
1. Verifying validators use correct messages
2. Checking messages display correctly in UI
3. Ensuring messages are consistent across similar rules
4. Testing validation with messages disabled (config not breaking validators)

```javascript
// Example test
import { validationRules } from '../config/validationRules'
import { validateMedication } from '../validators/medicationValidator'

it('should use configured message for required field', () => {
  const errors = validateMedication('')
  expect(errors[0]).toBe(validationRules.medication.required.message)
})
```

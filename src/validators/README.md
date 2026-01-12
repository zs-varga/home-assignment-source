# Validators Directory

## Purpose
Input validation logic for all form fields. Each validator returns an array of error messages.

## Validation Functions

### validateMedication(value)
**File**: `medicationValidator.js`
**Returns**: `[errors]` array

**Rules**:
- Required field
- Maximum 20 characters
- Must be one of: `aspirin`, `ibuprofen`, `paracetamol`, `naproxen`
- Case-insensitive matching

**Example**:
```javascript
validateMedication('aspirin')    // → []
validateMedication('morphine')   // → ['Medication is invalid']
validateMedication('')           // → ['Medication is required']
```

---

### validateDateOfBirth(value)
**File**: `dateOfBirthValidator.js`
**Returns**: `[errors]` array

**Rules**:
- Required field
- Format: `YYYY-MM-DD`
- Valid calendar date (handles leap years)
- Age must be 0-150 years
- Cannot be a future date
- Valid month: 1-12
- Valid day: 1-31 (or less depending on month)

**Examples**:
```javascript
validateDateOfBirth('2000-01-15')  // → []
validateDateOfBirth('2050-01-15')  // → ['Date of Birth cannot be in the future']
validateDateOfBirth('1800-01-15')  // → ['Date of Birth must result in a realistic age...']
validateDateOfBirth('2000-13-45')  // → ['Month must be between 1 and 12', 'Day must be between...']
validateDateOfBirth('2000-02-30')  // → ['February has a maximum of 29 days in leap year']
```

---

### validateWeight(value)
**File**: `weightValidator.js`
**Returns**: `[errors]` array

**Rules**:
- Required field
- Must be numeric (accepts integers and decimals)
- Minimum: 5 kg
- Maximum: 500 kg
- Decimal point accepted as decimal separator

**Examples**:
```javascript
validateWeight('70')      // → []
validateWeight('72.5')    // → [] (decimals accepted)
validateWeight('4')       // → ['Weight must be at least 5']
validateWeight('501')     // → ['Weight must not exceed 500']
validateWeight('abc')     // → ['Weight must be a valid number']
```

---

### validateDosage(value)
**File**: `dosageValidator.js`
**Returns**: `[errors]` array

**Rules**:
- Required field
- Must be numeric (accepts integers and decimals)
- Minimum: 200 mg
- Maximum: 1000 mg
- Decimal point accepted as decimal separator

**Examples**:
```javascript
validateDosage('500')      // → []
validateDosage('250.5')    // → [] (decimals accepted)
validateDosage('199')      // → ['Dosage must be at least 200']
validateDosage('1001')     // → ['Dosage must not exceed 1000']
validateDosage('abc')      // → ['Dosage must be a valid number']
```

---

### validateFrequency(value)
**File**: `frequencyValidator.js`
**Returns**: `[errors]` array

**Rules**:
- Required field
- Must be numeric
- Must be an integer (NO decimals allowed)
- Minimum: 1
- Maximum: 5
- Decimal values are explicitly rejected

**Examples**:
```javascript
validateFrequency('3')     // → []
validateFrequency('2.5')   // → ['Frequency must be an integer (no decimal values)']
validateFrequency('0')     // → ['Frequency must be at least 1']
validateFrequency('6')     // → ['Frequency must not exceed 5']
validateFrequency('abc')   // → ['Frequency must be a valid number']
```

---

## Helper Functions

### parseDate(dateString)
**Location**: `dateOfBirthValidator.js`

Parses a date string in `YYYY-MM-DD` format.

**Returns**:
```javascript
{
  month: number,
  day: number,
  year: number,
  isValid: boolean
}
```

**Example**:
```javascript
parseDate('2000-01-15')  // → { month: 1, day: 15, year: 2000, isValid: true }
parseDate('invalid')     // → { isValid: false }
```

### isLeapYear(year)
**Location**: `dateOfBirthValidator.js`

Checks if a year is a leap year according to Gregorian calendar rules.

**Rules**:
- Divisible by 4 AND not by 100 = Leap year
- OR divisible by 400 = Leap year

**Example**:
```javascript
isLeapYear(2000)  // → true
isLeapYear(2001)  // → false
isLeapYear(2020)  // → true
```

### getDaysInMonth(month, year)
**Location**: `dateOfBirthValidator.js`

Returns the number of days in a given month, accounting for leap years.

**Example**:
```javascript
getDaysInMonth(2, 2000)  // → 29 (February in leap year)
getDaysInMonth(2, 2001)  // → 28 (February in non-leap year)
getDaysInMonth(4, 2000)  // → 30 (April)
getDaysInMonth(1, 2000)  // → 31 (January)
```

### calculateAge(year, month, day)
**Location**: `dateOfBirthValidator.js`

Calculates age based on date of birth, accounting for whether birthday has occurred this year.

**Example**:
```javascript
calculateAge(2000, 1, 15)  // → 26 (as of Jan 7, 2026)
calculateAge(2000, 12, 31) // → 25 (birthday hasn't occurred yet)
```

---

## Testing

Run validator tests:
```bash
npm test -- validator
```

Test files: `/__tests__/*Validator.test.js`
- Total: 5 test files
- Coverage: 60+ test cases covering valid inputs, invalid inputs, edge cases

---

## Integration with Detectors

Each validator has a corresponding **detector** that identifies testing patterns:
- Validators return errors (validation failures)
- Detectors return achievements (testing patterns detected)

See `/detectors/README.md` for detector documentation.

---

## Configuration

Default validation rules are stored in `/config/validationRules.js`:
```javascript
export const validationRules = {
  medication: { required: { message: 'Medication is required' } },
  dateOfBirth: { required: { message: 'Date of Birth is required' } },
  weight: { required: { message: 'Weight is required' } },
  dosage: { required: { message: 'Dosage is required' } },
  frequency: { required: { message: 'Frequency is required' } }
}
```

---

## Recent Changes

### Version Updates
- **Decimal Support**: Weight and Dosage validators now accept and validate decimal values
- **Age Validation**: DateOfBirth validator now validates realistic ages (0-150 years)
- **Future Date Prevention**: DateOfBirth validator rejects future dates
- **Integer-Only Frequency**: Frequency validator explicitly rejects decimal values

### Helper Functions Added
- `calculateAge()` - Accurately calculates age with month/day consideration
- `hasDecimalPoint()` - Detects decimal values for validation routing

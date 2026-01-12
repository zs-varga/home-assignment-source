# Medication Validation Application

A React-based application for validating medication-related data including dosage, frequency, date of birth, and weight. This application includes form detection, validators, and comprehensive integration tests.

## Features

- **Medication Detection**: Identifies medication names and validates against known medications
- **Dosage Validation**: Validates medication dosages with unit conversion support
- **Frequency Validation**: Validates medication administration frequency
- **Date of Birth Validation**: Validates and calculates age from date of birth
- **Weight Validation**: Validates patient weight with unit support
- **Form Detection**: Automatically detects form fields and applies appropriate validators
- **Session Storage Integration**: Secure session storage management with encryption support
- **Google Forms Integration**: Submits validated data to Google Forms

## Project Setup

### Prerequisites
- Node.js (v20.11.0 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## Project Structure

```
src/
├── App.jsx                                      # Main application component
├── App.css                                      # Main app styling
├── components/
│   ├── ValidationForm.jsx                       # Medication validation form
│   ├── ValidationForm.css                       # Form styling
│   └── Badges.jsx                               # UI badge components
├── detectors/                                   # Field and data detectors
│   ├── medicationDetector.js
│   ├── dosageDetector.js
│   ├── frequencyDetector.js
│   ├── dateOfBirthDetector.js
│   ├── weightDetector.js
│   ├── fieldDetector.js
│   └── formDetector.js
├── validators/                                  # Validation logic
│   ├── medicationValidator.js
│   ├── dosageValidator.js
│   ├── frequencyValidator.js
│   ├── dateOfBirthValidator.js
│   └── weightValidator.js
├── hooks/                                       # Custom React hooks
│   ├── useSessionStorage.js
│   ├── useProtectedSessionStorage.js
│   └── useSyncedSessionStorage.js
├── utils/                                       # Utility functions
│   ├── ageCalculator.js
│   ├── googleFormsSubmission.js
│   ├── checksumUtils.js
│   ├── storageChangeDetector.js
│   ├── accessTokenManager.js
│   └── readOnlyState.js
├── config/
│   └── validationRules.js                       # Centralized validation rules
├── __tests__/                                   # Integration tests
│   ├── integratedDetectorValidator.test.js
│   └── fixtures/                                # Test data fixtures
├── index.css                                    # Global styles
└── main.jsx                                     # React entry point
```

## Form Fields

The application validates the following medication-related fields:

- **Medication Name**: Validated against known medications (aspirin, ibuprofen, naproxen, paracetamol)
- **Dosage**: Numeric value with unit support (mg, g, mcg)
- **Frequency**: Administration frequency (e.g., "twice daily", "every 8 hours")
- **Date of Birth**: Patient date of birth for age calculation
- **Weight**: Patient weight with unit support (kg, lbs)

## Repositories

- **Source Code**: https://github.com/zs-varga/home-assignment-source
- **Obfuscated Version** (GitHub Pages): https://github.com/zs-varga/home-assignment-obfuscated

## Development

The project uses:
- **React** for UI components
- **Vite** for fast development and building
- **ESLint** for code quality
- **Vitest** for testing

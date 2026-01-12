# Validation Testing Challenge

A React-based application designed to help software testers practice and improve their validation testing skills. This is a form with no backend validation - testers need to find interesting edge cases and understand what validation rules should be applied.

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

## Project Structure

```
src/
├── App.jsx                          # Main application component
├── App.css                          # Main app styling
├── components/
│   ├── ValidationForm.jsx           # Validation form component
│   └── ValidationForm.css           # Form styling
├── index.css                        # Global styles
└── main.jsx                         # React entry point
```

## Form Fields

The application currently contains a form with the following fields (grouped by category):

### Personal Information
- Full Name
- Email Address
- Phone Number
- Date of Birth

### Address Information
- Zip Code

### Security Information
- Username
- Password
- Confirm Password

### Additional Information
- Credit Card Number
- Website URL

## Challenge

As a software tester, your goal is to:
1. Identify what validation rules should be applied to each field
2. Test the form with edge cases, invalid inputs, and boundary conditions
3. Document interesting test cases that reveal validation issues

Some areas to consider:
- Format validation (emails, phone numbers, dates, URLs)
- Length constraints
- Character restrictions
- SQL injection attempts
- XSS attempts
- Special characters and Unicode
- Empty/null values
- Whitespace handling
- Cross-field validation (e.g., password match)

## Current Status

✅ Basic form structure created with all input fields
✅ Responsive styling implemented
✅ Form state management initialized

⏳ Validation logic to be implemented

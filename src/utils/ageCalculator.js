// Convert date of birth string (YYYY-MM-DD) to age components
// Returns null if input is invalid or empty
// Returns age as {years, months, days} object for precise boundary detection
export const getAge = (dateOfBirthString) => {
  if (!dateOfBirthString || dateOfBirthString.trim() === '') {
    return null
  }

  const trimmed = dateOfBirthString.trim()

  // Validate YYYY-MM-DD format
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    return null
  }

  const [year, month, day] = trimmed.split('-').map(Number)

  // Validate date components
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  // Calculate age
  const today = new Date()
  const birthDate = new Date(year, month - 1, day)

  // Check if date is in the future
  if (birthDate > today) {
    return null
  }

  // Calculate age in years, months, and days
  let ageYears = today.getFullYear() - birthDate.getFullYear()
  let ageMonths = today.getMonth() - birthDate.getMonth()
  let ageDays = today.getDate() - birthDate.getDate()

  // Adjust for negative days
  if (ageDays < 0) {
    ageMonths--
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    ageDays += prevMonth.getDate()
  }

  // Adjust for negative months
  if (ageMonths < 0) {
    ageYears--
    ageMonths += 12
  }

  return { years: ageYears, months: ageMonths, days: ageDays }
}

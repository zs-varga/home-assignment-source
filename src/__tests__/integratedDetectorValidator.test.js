import { it, expect } from "vitest";
import { medicationDetector } from "../detectors/medicationDetector";
import { dosageDetector } from "../detectors/dosageDetector";
import { frequencyDetector } from "../detectors/frequencyDetector";
import { weightDetector } from "../detectors/weightDetector";
import { dateOfBirthDetector } from "../detectors/dateOfBirthDetector";
import { fieldDetector } from "../detectors/fieldDetector";
import { validateMedication } from "../validators/medicationValidator";
import { validateDosage } from "../validators/dosageValidator";
import { validateFrequency } from "../validators/frequencyValidator";
import { validateWeight } from "../validators/weightValidator";
import { validateDateOfBirth } from "../validators/dateOfBirthValidator";

/**
 * Integrated test suite for detector and validator validation
 * Tests field-by-field detection patterns AND validation errors for various medication scenarios
 */
const getRelativeDate = (yearsOffset, monthsOffset, daysOffset) => {
  const today = new Date();
  const date = new Date(
    today.getFullYear() + yearsOffset,
    today.getMonth() + monthsOffset,
    today.getDate() + daysOffset
  );
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Load all fixture files dynamically
const fixtures = import.meta.glob("./fixtures/*.json", { eager: true });
const testCases = Object.values(fixtures)
  .flatMap((mod) => {
    const data = mod.default;
    // Support both single test case and array of test cases
    const testCasesArray = Array.isArray(data) ? data : [data];
    return testCasesArray;
  })
  .map((testCase) => {
    // If dateOfBirth is an array (dateOffsets), calculate the actual date
    if (Array.isArray(testCase.values.dateOfBirth)) {
      const [yearsOffset, monthsOffset, daysOffset] =
        testCase.values.dateOfBirth;
      testCase.values.dateOfBirth = getRelativeDate(
        yearsOffset,
        monthsOffset,
        daysOffset
      );
    }
    return testCase;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

testCases.forEach((testCase) => {
  const detections = {
    medication: [
      ...fieldDetector(testCase.values.medication, testCase.values),
      ...medicationDetector(testCase.values.medication, testCase.values),
    ],
    dosage: [
      ...fieldDetector(testCase.values.dosage, testCase.values),
      ...dosageDetector(testCase.values.dosage, testCase.values),
    ],
    frequency: [
      ...fieldDetector(testCase.values.frequency, testCase.values),
      ...frequencyDetector(testCase.values.frequency, testCase.values),
    ],
    weight: [
      ...fieldDetector(testCase.values.weight, testCase.values),
      ...weightDetector(testCase.values.weight, testCase.values),
    ],
    dateOfBirth: [
      ...fieldDetector(testCase.values.dateOfBirth, testCase.values),
      ...dateOfBirthDetector(testCase.values.dateOfBirth, testCase.values),
    ],
  };
  const validationResults = {
    medication: validateMedication(testCase.values.medication, testCase.values),
    dateOfBirth: validateDateOfBirth(
      testCase.values.dateOfBirth,
      testCase.values
    ),
    weight: validateWeight(testCase.values.weight, testCase.values),
    dosage: validateDosage(testCase.values.dosage, testCase.values),
    frequency: validateFrequency(testCase.values.frequency, testCase.values),
  };
  for (const field in detections) {
    const fieldDetections = detections[field];
    const expectedDetections = testCase.expectedDetections[field];

    // Check that all expected detections are present
    expectedDetections.forEach((expectedDetection) => {
      it(`${field} detections - ${testCase.name} - is "${expectedDetection}" triggered?`, () => {
        expect
          .soft(
            fieldDetections,
            `Missing detection in ${field}: ${expectedDetection}`
          )
          .toContain(expectedDetection);
      });
    });

    // Check that no unexpected detections are present
    fieldDetections.forEach((actualDetection) => {
      it(`${field} detections - ${testCase.name} - is "${actualDetection}" an unexpected trigger?`,
        () => {
          expect
            .soft(
              expectedDetections,
              `Unexpected detection in ${field}: ${actualDetection}`
            )
            .toContain(actualDetection);
        }
      );
    });
  }

  for (const field in validationResults) {
    const fieldErrors = validationResults[field];
    const expectedErrors = testCase.expectedValidationErrors[field];

    // Check that all expected errors are present
    expectedErrors.forEach((expectedError) => {
      it(`${field} validations - ${testCase.name} - is "${expectedError}" triggered?`,
        () => {
          expect
            .soft(
              fieldErrors,
              `${field} missing expected error: "${expectedError}"`
            )
            .toContain(expectedError);
        }
      );
    });

    // Check that no unexpected errors are present
    fieldErrors.forEach((actualError) => {
      it(`${field} validations - ${testCase.name} - is "${actualError}" an unexpected trigger?`,
        () => {
          expect
            .soft(
              expectedErrors,
              `${field} has unexpected error: "${actualError}"`
            )
            .toContain(actualError);
        }
      );
    });
  }
});

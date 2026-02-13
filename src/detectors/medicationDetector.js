// Detector for medication field-specific testing patterns
import { ACCEPTED_MEDICATIONS } from '../config/medications'

const MAX_LENGTH = 20;

export const medicationDetector = (value, _allValues) => {
  const detections = [];

  // Only check for patterns if not empty
  if (!value || value.trim() === "") {
    return detections;
  }

  const lowerValue = value.toLowerCase().trim();
  const TOTAL_MAX_LENGTH = 100;

  // Detect: Boundary length values (minimum length)
  if (value.length === 1) {
    detections.push("boundary_length_min");
  }
  // Detect: Boundary length values (at max allowed)
  if (value.length === MAX_LENGTH) {
    detections.push("boundary_length_max");
  }

  // Detect: Above max length (between max and total max)
  if (value.length > MAX_LENGTH && value.length < TOTAL_MAX_LENGTH) {
    detections.push("boundary_length_above_max");
  }

  // Detect: At total max length
  if (value.length === TOTAL_MAX_LENGTH) {
    detections.push("boundary_length_total_max");
  }

  // Detect: Nominal value (accepted medication)
  if (lowerValue !== "" && ACCEPTED_MEDICATIONS.includes(lowerValue)) {
    detections.push("nominal_value");
  }

  // Detect: Invalid value (not in accepted list)
  if (lowerValue !== "" && !ACCEPTED_MEDICATIONS.includes(lowerValue)) {
    detections.push("invalid_value");
  }

  return detections;
};

// Descriptions for detected patterns
export const detectionDescriptions = {
  absolute_minimum: "Absolute Min",
  nominal_value: "Nominal",
  invalid_value: "Invalid",
  boundary_length_min: "Length Min",
  boundary_length_max: "Length Max",
  boundary_length_above_max: "Length Above Max",
  boundary_length_total_max: "Length Total Max",
};

// Detector for medication field-specific testing patterns
const ACCEPTED_MEDICATIONS = [
  "aspirin",
  "ibuprofen",
  "paracetamol",
  "naproxen",
  "placebo",
];
const MAX_LENGTH = 20;

export const medicationDetector = (value, _allValues) => {
  const detections = [];

  // Only check for patterns if not empty
  if (!value || value.trim() === "") {
    return detections;
  }

  const lowerValue = value.toLowerCase().trim();

  // Detect: Boundary length values
  if (value.length === 1) {
    detections.push("boundary_length_min");
  }
  // Detect: Boundary length values
  if (value.length === MAX_LENGTH) {
    detections.push("boundary_length_max");
  }

  // Detect: Above max length
  if (value.length > MAX_LENGTH) {
    detections.push("above_max");
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
  nominal_value: "Nominal",
  invalid_value: "Invalid value",
  boundary_length_min: "Min Boundary",
  boundary_length_max: "Max Boundary",
  above_max: "Above Max",
};

export const drugSymptomMappings = [
  {
    symptomId: "symptom-fever",
    drugId: "drug-paracetamol",
    priority: 1,
    isFirstLine: true,
    notes: "First line antipyretic"
  },
  {
    symptomId: "symptom-fever",
    drugId: "drug-ibuprofen",
    priority: 2,
    isFirstLine: false,
    notes: "Alternative antipyretic"
  },
  {
    symptomId: "symptom-cough",
    drugId: "drug-dextromethorphan",
    priority: 1,
    isFirstLine: true
  }
]
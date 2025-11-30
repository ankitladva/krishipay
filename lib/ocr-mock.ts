// Mock OCR functionality for extracting text from images
// In production, this would use Tesseract.js or a cloud OCR service

export interface OCRResult {
  success: boolean;
  extractedData: {
    name?: string;
    landArea?: number;
    documentType?: string;
    idNumber?: string;
    address?: string;
    ownerName?: string;
    surveyNumber?: string;
  };
  confidence: number;
  processingTime: number;
}

// Sample Indian names for mock data
const sampleNames = [
  'राजेश कुमार',
  'सुरेश पाटील',
  'अनिल शर्मा',
  'विजय सिंह',
  'रमेश यादव',
  'संजय गुप्ता',
  'प्रदीप वर्मा',
  'मनोज कुमार',
];

// Sample addresses
const sampleAddresses = [
  'ग्राम पंचायत रामपुर, तहसील सारंगपुर',
  'गाँव बेलगांव, जिला सांगली',
  'मौजा नागपुर, तहसील बीड',
  'ग्राम कल्याण, जिला नासिक',
];

// Simulate OCR processing delay
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extract text based on document type
export async function extractTextFromImage(
  file: File,
  documentType: 'land_record' | 'equipment_photo' | 'id_proof' | 'other' = 'other'
): Promise<OCRResult> {
  const startTime = Date.now();
  
  // Simulate processing time (500ms - 1500ms)
  const processingTime = Math.random() * 1000 + 500;
  await simulateDelay(processingTime);
  
  let extractedData: OCRResult['extractedData'] = {};
  let confidence = 0.85 + Math.random() * 0.1; // 85-95% confidence
  
  // Generate mock data based on document type
  switch (documentType) {
    case 'land_record':
      extractedData = {
        documentType: 'भूमि अभिलेख / Land Record',
        ownerName: sampleNames[Math.floor(Math.random() * sampleNames.length)],
        landArea: parseFloat((Math.random() * 10 + 0.5).toFixed(2)), // 0.5 - 10.5 hectares
        surveyNumber: `${Math.floor(Math.random() * 900 + 100)}/${Math.floor(Math.random() * 9 + 1)}`,
        address: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
      };
      break;
      
    case 'id_proof':
      extractedData = {
        documentType: 'आधार कार्ड / Aadhaar Card',
        name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
        idNumber: generateMockAadhaar(),
        address: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
      };
      break;
      
    case 'equipment_photo':
      extractedData = {
        documentType: 'उपकरण फोटो / Equipment Photo',
        name: 'कृषि उपकरण',
      };
      confidence = 0.70 + Math.random() * 0.15; // Lower confidence for photos
      break;
      
    default:
      extractedData = {
        documentType: 'अन्य दस्तावेज़',
        name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
      };
  }
  
  return {
    success: true,
    extractedData,
    confidence,
    processingTime: Date.now() - startTime,
  };
}

// Generate mock Aadhaar number (12 digits)
function generateMockAadhaar(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  return digits.join('').match(/.{1,4}/g)?.join(' ') || '';
}

// Validate if image is of acceptable quality (mock)
export function validateImageQuality(file: File): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check file size (should be between 10KB and 10MB for testing, 100KB+ for production)
  // Reduced minimum for testing purposes
  if (file.size < 10 * 1024) {
    issues.push('Image file too small. May be low quality.');
  }
  if (file.size > 10 * 1024 * 1024) {
    issues.push('Image file too large. Please compress.');
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    issues.push('Invalid file type. Please upload JPG, PNG, or WebP.');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

// Simulate geo-spatial valuation based on coordinates
export async function simulateGeoValuation(
  latitude?: number,
  longitude?: number,
  landArea?: number
): Promise<{
  valuation: number;
  confidence: number;
  factors: string[];
}> {
  // Simulate API delay
  await simulateDelay(800);
  
  // Mock valuation calculation
  const basePrice = 200000; // ₹2 Lakh per hectare
  const area = landArea || 2.5;
  const locationMultiplier = 1 + Math.random() * 0.5; // 1.0 - 1.5x
  
  const valuation = Math.round(basePrice * area * locationMultiplier);
  const confidence = 0.80 + Math.random() * 0.15;
  
  const factors = [
    'Satellite imagery verified',
    'Soil quality: Good',
    'Water access: Available',
    'Market proximity: Medium',
  ];
  
  return {
    valuation,
    confidence,
    factors,
  };
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { invokeBhashiniOCR, validateBhashiniImageQuality } from '@/lib/ocr-mock';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    
    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = (formData.get('documentType') as string) || 'other';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate image quality for Bhashini OCR
    const bhashiniValidation = validateBhashiniImageQuality(file);
    if (!bhashiniValidation.isValid) {
      return NextResponse.json(
        { error: bhashiniValidation.issues.join(', ') },
        { status: 400 }
      );
    }

    // Extract vernacular text using Bhashini OCR API
    const bhashiniOCRResult = await invokeBhashiniOCR(
      file,
      documentType as any
    );

    // In production: Bhashini API would:
    // 1. Upload file to Bhashini cloud storage
    // 2. Process with Bhashini ML models for Indian languages
    // 3. Return structured data
    // For demo, returning extracted data

    return NextResponse.json({
      success: true,
      filename: file.name,
      extractedData: bhashiniOCRResult.extractedData,
      confidence: bhashiniOCRResult.confidence,
      processingTime: bhashiniOCRResult.processingTime,
      bhashiniApiVersion: bhashiniOCRResult.bhashiniApiVersion,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload and process file' },
      { status: 500 }
    );
  }
}


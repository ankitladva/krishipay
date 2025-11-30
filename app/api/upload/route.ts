import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { extractTextFromImage, validateImageQuality } from '@/lib/ocr-mock';

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

    // Validate image quality
    const validation = validateImageQuality(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.issues.join(', ') },
        { status: 400 }
      );
    }

    // Extract text using mock OCR
    const ocrResult = await extractTextFromImage(
      file,
      documentType as any
    );

    // In production, you would:
    // 1. Upload file to storage (GridFS, S3, etc.)
    // 2. Store file reference in database
    // For now, we just return the extracted data

    return NextResponse.json({
      success: true,
      filename: file.name,
      extractedData: ocrResult.extractedData,
      confidence: ocrResult.confidence,
      processingTime: ocrResult.processingTime,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload and process file' },
      { status: 500 }
    );
  }
}


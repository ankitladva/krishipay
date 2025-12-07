import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import LoanApplication from '@/lib/models/LoanApplication';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Check authentication 
    const session = await getSession();
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applicationData = await request.json();

    // Validate required fields
    if (!applicationData.loanCategory) {
      return NextResponse.json(
        { error: 'Loan category is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create loan application
    const loanApplication = await LoanApplication.create({
      userId: new mongoose.Types.ObjectId(session.userId),
      loanCategory: applicationData.loanCategory,
      status: 'Submitted',
      extractedData: applicationData.extractedData || {},
      uploadedDocuments: applicationData.uploadedDocuments || [],
      geoValuation: applicationData.geoValuation || 0,
      voiceConsentRecording: applicationData.voiceConsentRecording || '',
      matchedSchemeId: applicationData.matchedSchemeId ? new mongoose.Types.ObjectId(applicationData.matchedSchemeId) : undefined,
    });

    return NextResponse.json({
      success: true,
      applicationId: loanApplication._id,
      application: loanApplication,
    });
  } catch (error) {
    console.error('Error creating loan application:', error);
    return NextResponse.json(
      { error: 'Failed to create loan application' },
      { status: 500 }
    );
  }
}


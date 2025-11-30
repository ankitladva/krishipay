import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { getSession } from '@/lib/session';
import { simulateVoiceBiometric } from '@/lib/voice';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, voicePrint } = await request.json();

    // Validate phone number
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be 10 digits.' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    let isNewUser = false;

    if (!user) {
      // Create new user
      const voicePrintId = voicePrint || simulateVoiceBiometric('new user');
      
      user = await User.create({
        phoneNumber,
        voicePrintId,
        kycVerified: false,
        language: 'hi',
      });
      
      isNewUser = true;
    } else {
      // Update voice print if provided
      if (voicePrint) {
        user.voicePrintId = voicePrint;
        await user.save();
      }
    }

    // Create session
    const session = await getSession();
    session.userId = user._id.toString();
    session.phoneNumber = user.phoneNumber;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        kycVerified: user.kycVerified,
        language: user.language,
      },
      isNewUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}


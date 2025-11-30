import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Scheme from '@/lib/models/Scheme';
import { matchIntent } from '@/lib/voice';

export async function POST(request: NextRequest) {
  try {
    const { userIntent } = await request.json();

    if (!userIntent) {
      return NextResponse.json(
        { error: 'User intent is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Match intent from voice input
    const intent = matchIntent(userIntent);
    let matchedScheme = null;

    if (intent) {
      // Map intents to loan types
      const loanTypeMap: Record<string, string> = {
        tractor: 'Tractor',
        dairy: 'Dairy',
        equipment: 'Equipment',
        land: 'Land',
        loan: 'General',
      };

      const loanType = loanTypeMap[intent];

      if (loanType) {
        matchedScheme = await Scheme.findOne({
          loanType,
          isActive: true,
        });
      }
    }

    // If no specific match, return a general scheme
    if (!matchedScheme) {
      matchedScheme = await Scheme.findOne({
        loanType: 'General',
        isActive: true,
      });
    }

    return NextResponse.json({
      success: true,
      matchedScheme,
      intent,
    });
  } catch (error) {
    console.error('Error matching scheme:', error);
    return NextResponse.json(
      { error: 'Failed to match scheme' },
      { status: 500 }
    );
  }
}


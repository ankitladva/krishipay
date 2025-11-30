import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Scheme from '@/lib/models/Scheme';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    await connectDB();

    // Check if schemes exist, if not seed them
    const count = await Scheme.countDocuments();
    if (count === 0) {
      await seedDatabase();
    }

    const schemes = await Scheme.find({ isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      schemes,
      count: schemes.length,
    });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemes' },
      { status: 500 }
    );
  }
}


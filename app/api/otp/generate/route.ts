import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

const IDFY_ACCOUNT_ID = process.env.IDFY_ACCOUNT_ID;
const IDFY_API_KEY = process.env.IDFY_API_KEY;
const IDFY_BASE_URL = 'https://eve.idfy.com/v3/tasks/sync/verify_with_source';

export async function POST(request: Request) {
  if (!IDFY_ACCOUNT_ID || !IDFY_API_KEY) {
    return NextResponse.json(
      { error: 'Missing IDfy credentials on server' },
      { status: 500 }
    );
  }

  const { phoneNumber } = await request.json();

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return NextResponse.json(
      { error: 'Phone number is required' },
      { status: 400 }
    );
  }

  const taskId = randomUUID();
  const groupId = randomUUID();

  try {
    const response = await fetch(`${IDFY_BASE_URL}/generate_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'account-id': IDFY_ACCOUNT_ID,
        'api-key': IDFY_API_KEY,
      },
      body: JSON.stringify({
        task_id: taskId,
        group_id: groupId,
        data: {
          mobile_number: phoneNumber,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to request OTP', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OTP generate error:', error);
    return NextResponse.json(
      { error: 'Unexpected error generating OTP' },
      { status: 500 }
    );
  }
}

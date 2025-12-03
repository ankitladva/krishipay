import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { getSession } from '@/lib/session';

const VOICE_MATCH_THRESHOLD = Number(process.env.VOICE_MATCH_THRESHOLD ?? '0.6');
const IDFY_ACCOUNT_ID = process.env.IDFY_ACCOUNT_ID;
const IDFY_API_KEY = process.env.IDFY_API_KEY;
const FACE_COMPARE_URL = 'https://eve.idfy.com/v3/tasks/sync/compare/face';

interface VoiceVerificationResult {
  match: boolean;
  similarity: number;
}

const PYTHON_BIN = process.env.VOICE_PYTHON_PATH || 'python3';
const normalizeThreshold = (value: number) => (value > 1 ? value / 100 : value);

const runVoiceVerification = async (storedSample: string, incomingSample: string): Promise<VoiceVerificationResult> => {
  const scriptPath = path.join(process.cwd(), 'scripts', 'voice_verify.py');

  if (!fs.existsSync(scriptPath)) {
    throw new Error('Voice verification script not found. Ensure scripts/voice_verify.py exists.');
  }

  return new Promise((resolve, reject) => {
    const python = spawn(PYTHON_BIN, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const payload = JSON.stringify({
      stored: storedSample,
      incoming: incomingSample,
      threshold: VOICE_MATCH_THRESHOLD,
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Voice verification process exited with code ${code}`));
      }

      try {
        const trimmed = stdout.trim();
        const jsonPayload = trimmed.includes('\n')
          ? trimmed
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.startsWith('{') && line.endsWith('}'))
              .pop() ?? trimmed
          : trimmed;

        const parsed = JSON.parse(jsonPayload);
        resolve({
          match: Boolean(parsed.match),
          similarity: typeof parsed.similarity === 'number' ? parsed.similarity : 0,
        });
      } catch (error) {
        console.error('Voice verification parse error:', error);
        reject(new Error('Failed to parse voice verification result'));
      }
    });

    python.on('error', (error) => {
      reject(error);
    });

    python.stdin.write(payload);
    python.stdin.end();
  });
};

interface FaceVerificationResult {
  match: boolean;
  score: number | null;
}

const compareFaceSamples = async (storedFace: string, incomingFace: string): Promise<FaceVerificationResult> => {
  if (!IDFY_ACCOUNT_ID || !IDFY_API_KEY) {
    throw new Error('Missing IDfy credentials for face verification');
  }

  const response = await fetch(FACE_COMPARE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'account-id': IDFY_ACCOUNT_ID,
      'api-key': IDFY_API_KEY,
    },
    body: JSON.stringify({
      task_id: randomUUID(),
      group_id: randomUUID(),
      data: {
        document1: storedFace,
        document2: incomingFace,
      },
    }),
  });

  const text = await response.text();
  console.log(text);
  if (!response.ok) {
    throw new Error(`IDfy face compare failed: ${text}`);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('IDfy face compare returned invalid JSON');
  }
  console.log(payload);
  const resultBlock =
    (payload as {
      result?: {
        score?: number;
        match_score?: number;
        matching_score?: number;
        is_a_match?: boolean;
      };
    })?.result || {};

  const rawScore =
    resultBlock.score ??
    resultBlock.match_score ??
    resultBlock.matching_score ??
    null;

  const normalizedScore =
    typeof rawScore === 'number' ? normalizeThreshold(rawScore) : null;

  const matchFlag =
    typeof resultBlock.is_a_match === 'boolean'
      ? resultBlock.is_a_match: false
      

  return {
    match: matchFlag,
    score: normalizedScore,
  };
};

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, voicePrint, faceImage } = await request.json();
    let voiceSimilarity: number | null = null;
    let faceScore: number | null = null;
    let voiceMatch = true;
    let faceMatch = true;

    // Validate phone number
    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be 10 digits.' },
        { status: 400 }
      );
    }

    if (!voicePrint || typeof voicePrint !== 'string' || voicePrint.length < 100) {
      return NextResponse.json(
        { error: 'A valid voice sample is required to continue.' },
        { status: 400 }
      );
    }

    if (!faceImage || typeof faceImage !== 'string' || faceImage.length < 100) {
      return NextResponse.json(
        { error: 'A valid face image is required to continue.' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    let isNewUser = false;

    if (!user) {
      // Create new user with enrolled voice sample
      user = await User.create({
        phoneNumber,
        voicePrintId: voicePrint,
        faceId: faceImage,
        kycVerified: false,
        language: 'hi',
      });
      isNewUser = true;
    } else {
      if (!user.voicePrintId) {
        // Legacy user without stored voiceprint - treat as enrollment
        user.voicePrintId = voicePrint;
        await user.save();
        isNewUser = true;
      } else {
        // Verify voice sample against stored print
        try {
          const verification = await runVoiceVerification(user.voicePrintId, voicePrint);
          voiceSimilarity = verification.similarity;
          voiceMatch = verification.match;

          if (!verification.match) {
            return NextResponse.json(
              {
                error: 'Voice did not match our records. Please try again.',
                similarity: verification.similarity,
              },
              { status: 401 }
            );
          }

          // Refresh stored voice sample with the newest recording
          user.voicePrintId = voicePrint;
        } catch (error) {
          console.error('Voice verification error:', error);
          return NextResponse.json(
            { error: 'Voice verification is temporarily unavailable. Please try again.' },
            { status: 500 }
          );
        }
      }
    }

    // Face enrollment / verification
    if (!user.faceId) {
      user.faceId = faceImage;
      await user.save();
    } else {
      try {
        const faceResult = await compareFaceSamples(user.faceId, faceImage);
        faceScore = faceResult.score;
        faceMatch = faceResult.match;

        if (!faceResult.match) {
          return NextResponse.json(
            {
              error: 'Face did not match our records. Please try again.',
              score: faceResult.score,
            },
            { status: 401 }
          );
        }

        // Update stored face with the freshest capture
        user.faceId = faceImage;
        await user.save();
      } catch (error) {
        console.error('Face verification error:', error);
        return NextResponse.json(
          { error: 'Face verification is temporarily unavailable. Please try again.' },
          { status: 500 }
        );
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
      voiceMatch,
      voiceSimilarity,
      faceMatch,
      faceScore,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

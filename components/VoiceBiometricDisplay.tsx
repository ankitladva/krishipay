'use client';

import { Shield, CheckCircle, Radio, Lock } from 'lucide-react';

interface Props {
  isVerifying: boolean;
  isVerified: boolean;
  confidenceScore?: number;
}

export default function VoiceBiometricDisplay({ isVerifying, isVerified, confidenceScore = 96.8 }: Props) {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-3 border-indigo-200 rounded-3xl shadow-2xl p-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 border-2 border-indigo-300 rounded-full mb-3">
          <Shield className="w-5 h-5 text-indigo-700" />
          <span className="text-sm font-semibold text-indigo-900">Voice Biometric Authentication</span>
        </div>
        <h3 className="text-2xl font-bold text-neutral-900">
          आवाज़ बायोमेट्रिक सत्यापन
        </h3>
      </div>

      {/* Status Display */}
      <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6">
        {isVerifying && !isVerified && (
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse"></div>
              <Radio className="relative w-12 h-12 text-white animate-ping" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-neutral-900 mb-2">
                Analyzing Voiceprint...
              </h4>
              <p className="text-neutral-600">
                Verifying your unique voice biometric signature
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <span>Extracting voice features</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600" style={{ animationDelay: '0.2s' }}>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span>Matching with database</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600" style={{ animationDelay: '0.4s' }}>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                <span>Validating authenticity</span>
              </div>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="text-center space-y-4 animate-scale-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-green-700 mb-2">
                Voice Verified!
              </h4>
              <p className="text-neutral-600">
                Your voice biometric has been authenticated
              </p>
            </div>
            
            {/* Confidence Score */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Confidence Score</span>
                <span className="text-2xl font-bold text-green-700">{confidenceScore}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                  style={{ width: `${confidenceScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {!isVerifying && !isVerified && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto shadow-xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-neutral-900 mb-2">
                Ready for Verification
              </h4>
              <p className="text-neutral-600">
                Speak the phrase to verify your identity
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border-2 border-indigo-200 rounded-xl p-3 text-center">
          <Lock className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-neutral-900">Bank-Grade</p>
          <p className="text-xs text-neutral-600">Encryption</p>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-xl p-3 text-center">
          <Shield className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-neutral-900">Anti-Spoofing</p>
          <p className="text-xs text-neutral-600">Protection</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200 rounded-xl p-3">
        <p className="text-xs text-indigo-900 text-center">
          <span className="font-bold">✨ Literacy Barrier Eliminated:</span> No passwords needed. 
          Your voice is your secure login.
        </p>
      </div>
    </div>
  );
}


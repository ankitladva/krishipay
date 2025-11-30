'use client';

import React from 'react';
import { Mic, AlertCircle, X } from 'lucide-react';

interface MicPermissionPromptProps {
  error: string;
  onClose: () => void;
}

export default function MicPermissionPrompt({ error, onClose }: MicPermissionPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass card-shadow-lg rounded-3xl p-8 max-w-md w-full scale-in">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Microphone Access</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-neutral-700 leading-relaxed">
            {error}
          </p>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">How to enable:</p>
            <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
              <li>Click the lock/info icon in your browser's address bar</li>
              <li>Find "Microphone" in the permissions list</li>
              <li>Set it to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Mic className="w-4 h-4" />
            <span>We need microphone access for voice-based loan applications</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-glow transition-all duration-300"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}


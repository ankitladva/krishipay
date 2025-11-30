'use client';

import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from './VoiceProvider';

interface MicButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onTranscript?: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

const iconSizes = {
  sm: 20,
  md: 28,
  lg: 36,
  xl: 48,
};

export default function MicButton({
  size = 'lg',
  onTranscript,
  disabled = false,
  className = '',
}: MicButtonProps) {
  const { isListening, isSupported, startListening, stopListening, transcript } = useVoice();

  React.useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const handleClick = () => {
    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} rounded-full glass flex items-center justify-center ${className}`}
        title="Voice not supported in this browser"
      >
        <MicOff size={iconSizes[size]} className="text-neutral-400" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center 
          transition-all duration-300 
          shadow-soft
          ${
            isListening
              ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse-glow'
              : 'bg-gradient-to-br from-primary-500 to-teal-500 hover:shadow-glow'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-95'}
          ${className}
        `}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
      >
        <Mic size={iconSizes[size]} className="text-white" />
      </button>

      {/* Ripple rings when listening */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-primary-500/30 ripple" />
          <div className="absolute inset-0 rounded-full bg-primary-500/20 ripple" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-0 rounded-full bg-primary-500/10 ripple" style={{ animationDelay: '1s' }} />
        </>
      )}
    </div>
  );
}

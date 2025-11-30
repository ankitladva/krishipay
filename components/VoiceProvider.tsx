'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  startSpeechRecognition,
  stopSpeechRecognition,
  speak as speakText,
  stopSpeaking,
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
  SpeechRecognitionResult,
} from '@/lib/voice';

interface VoiceContextType {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  language: string;
  error: string | null;
  permissionGranted: boolean | null;
  startListening: (onResult?: (transcript: string) => void) => void;
  stopListening: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  setLanguage: (lang: string) => void;
  clearTranscript: () => void;
  clearError: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('hi-IN');
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const resultCallbackRef = useRef<((transcript: string) => void) | null>(null);

  // Only check for support after mounting on client
  useEffect(() => {
    setMounted(true);
    checkMicrophonePermission();
    
    // Preload voices for better TTS performance
    if (typeof window !== 'undefined' && isSpeechSynthesisAvailable()) {
      // Trigger voice loading
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log(`✅ Loaded ${voices.length} voices for TTS`);
        }
      };
      
      // Load voices immediately if available
      loadVoices();
      
      // Also listen for voiceschanged event
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // Cleanup
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const isSupported = mounted && 
    typeof window !== 'undefined' && 
    isSpeechRecognitionAvailable() && 
    isSpeechSynthesisAvailable();

  const checkMicrophonePermission = async () => {
    if (typeof window === 'undefined' || !navigator.permissions) {
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionGranted(result.state === 'granted');
      
      result.addEventListener('change', () => {
        setPermissionGranted(result.state === 'granted');
      });
    } catch (err) {
      // Some browsers don't support permissions API
      console.log('Permissions API not supported');
    }
  };

  const startListening = useCallback((onResult?: (transcript: string) => void) => {
    if (!isSupported) {
      setError('Voice recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      return;
    }

    // Clear previous errors
    setError(null);
    resultCallbackRef.current = onResult || null;
    setTranscript('');
    setInterimTranscript('');
    setIsListening(true);

    const handleResult = (result: SpeechRecognitionResult) => {
      if (result.isFinal) {
        setTranscript(result.transcript);
        setInterimTranscript('');
        resultCallbackRef.current?.(result.transcript);
      } else {
        setInterimTranscript(result.transcript);
      }
    };

    const handleError = (errorType: string) => {
      setIsListening(false);
      
      // Handle different error types
      switch (errorType) {
        case 'not-allowed':
        case 'permission-denied':
          console.error('Speech recognition error: Microphone permission denied');
          setError('🎤 Microphone access denied. Please allow microphone permissions in your browser settings.');
          break;
        case 'no-speech':
          // "no-speech" is a normal condition - user didn't speak or timed out
          // Don't show error, just silently stop listening
          console.log('Speech recognition: No speech detected (this is normal)');
          setError(null); // Clear any previous errors
          break;
        case 'audio-capture':
          console.error('Speech recognition error: No microphone found');
          setError('No microphone found. Please check your device.');
          break;
        case 'network':
          console.error('Speech recognition error: Network error');
          setError('Network error. Please check your internet connection.');
          break;
        case 'aborted':
          // User manually stopped - this is normal
          console.log('Speech recognition: Aborted by user');
          setError(null);
          break;
        default:
          // Only log and show error for unexpected errors
          console.warn('Speech recognition warning:', errorType);
          // Don't set error for minor issues
          if (errorType !== 'no-speech' && errorType !== 'aborted') {
            setError('Voice recognition failed. Please try again.');
          }
      }
    };

    recognitionRef.current = startSpeechRecognition(language, handleResult, handleError);
  }, [isSupported, isListening, language]);

  const stopListeningHandler = useCallback(() => {
    if (recognitionRef.current) {
      stopSpeechRecognition(recognitionRef.current);
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported');
      onEnd?.();
      return;
    }

    speakText(text, language, onEnd);
  }, [isSupported, language]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: VoiceContextType = {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    language,
    error,
    permissionGranted,
    startListening,
    stopListening: stopListeningHandler,
    speak,
    stopSpeaking,
    setLanguage,
    clearTranscript,
    clearError,
  };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}


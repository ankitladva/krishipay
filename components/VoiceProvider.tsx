'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  initBhashiniSTT,
  stopBhashiniSTT,
  invokeBhashiniTTS,
  stopBhashiniTTS,
  isBhashiniSTTAvailable,
  isBhashiniTTSAvailable,
  BhashiniVoiceResult,
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
    
    // Preload Bhashini TTS voices for better performance
    if (typeof window !== 'undefined' && isBhashiniTTSAvailable()) {
      // Trigger Bhashini voice loading
      const loadBhashiniVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log(`✅ Bhashini: Loaded ${voices.length} voices for Indian languages`);
        }
      };
      
      // Load Bhashini voices immediately if available
      loadBhashiniVoices();
      
      // Listen for Bhashini voices loaded event
      window.speechSynthesis.onvoiceschanged = loadBhashiniVoices;
      
      // Cleanup
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Check if Bhashini API is supported
  const isSupported = mounted && 
    typeof window !== 'undefined' && 
    isBhashiniSTTAvailable() && 
    isBhashiniTTSAvailable();

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
      setError('Bhashini API not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      return;
    }

    // Clear previous Bhashini errors
    setError(null);
    resultCallbackRef.current = onResult || null;
    setTranscript('');
    setInterimTranscript('');
    setIsListening(true);

    const handleBhashiniResult = (result: BhashiniVoiceResult) => {
      if (result.isFinal) {
        setTranscript(result.transcript);
        setInterimTranscript('');
        resultCallbackRef.current?.(result.transcript);
      } else {
        setInterimTranscript(result.transcript);
      }
    };

    const handleBhashiniError = (errorType: string) => {
      setIsListening(false);
      
      // Handle Bhashini API error types
      switch (errorType) {
        case 'not-allowed':
        case 'permission-denied':
          console.error('Bhashini STT error: Microphone permission denied');
          setError('🎤 Microphone access denied. Please allow microphone permissions for Bhashini API.');
          break;
        case 'no-speech':
          // "no-speech" is normal Bhashini behavior
          console.log('Bhashini STT: No speech detected (normal behavior)');
          setError(null); // Clear any previous errors
          break;
        case 'audio-capture':
          console.error('Bhashini STT error: No microphone found');
          setError('No microphone found for Bhashini API. Please check your device.');
          break;
        case 'network':
          console.error('Bhashini API error: Network error');
          setError('Bhashini API network error. Please check your internet connection.');
          break;
        case 'aborted':
          // User manually stopped Bhashini session
          console.log('Bhashini STT: Session aborted by user');
          setError(null);
          break;
        default:
          // Log unexpected Bhashini errors
          console.warn('Bhashini API warning:', errorType);
          if (errorType !== 'no-speech' && errorType !== 'aborted') {
            setError('Bhashini voice recognition failed. Please try again.');
          }
      }
    };

    // Initialize Bhashini STT session
    recognitionRef.current = initBhashiniSTT(language, handleBhashiniResult, handleBhashiniError);
  }, [isSupported, isListening, language]);

  const stopListeningHandler = useCallback(() => {
    if (recognitionRef.current) {
      // Stop Bhashini STT session
      stopBhashiniSTT(recognitionRef.current);
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!isSupported) {
      console.warn('Bhashini TTS not supported');
      onEnd?.();
      return;
    }

    // Invoke Bhashini TTS for vernacular output
    invokeBhashiniTTS(text, language, onEnd);
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
    stopSpeaking: stopBhashiniTTS,
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


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
    
    // Preload Bhashini TTS Pipeline voices for better performance
    if (typeof window !== 'undefined' && isBhashiniTTSAvailable()) {
      // Trigger Bhashini TTS Pipeline voice loading
      const loadBhashiniPipelineVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log(`✅ Bhashini TTS Pipeline: Loaded ${voices.length} voices for Indian languages`);
        }
      };
      
      // Load Bhashini Pipeline voices immediately if available
      loadBhashiniPipelineVoices();
      
      // Listen for Bhashini Pipeline voices loaded event
      window.speechSynthesis.onvoiceschanged = loadBhashiniPipelineVoices;
      
      // Cleanup
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Check if Bhashini Pipeline API is supported
  // Requires both ASR (Speech-to-Text) and TTS (Text-to-Speech) pipelines
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

  const startListening = useCallback(async (onResult?: (transcript: string) => void) => {
    if (!isSupported) {
      setError('Bhashini Pipeline API not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      return;
    }

    // Clear previous Bhashini Pipeline errors
    setError(null);
    resultCallbackRef.current = onResult || null;
    setTranscript('');
    setInterimTranscript('');
    setIsListening(true);

    const handleBhashiniResult = (result: BhashiniVoiceResult) => {
      // Log Bhashini Pipeline result
      if (result.pipelineId) {
        console.log(`📊 Bhashini Pipeline Result: ${result.pipelineId} [${result.taskSequence}]`);
      }
      
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
      
      // Handle Bhashini Pipeline API error types (as per documentation)
      switch (errorType) {
        case 'not-allowed':
        case 'permission-denied':
          console.error('❌ Bhashini ASR Pipeline: Microphone permission denied');
          setError('🎤 Microphone access denied. Please allow microphone permissions for Bhashini Pipeline API.');
          break;
        case 'no-speech':
          // "no-speech" is normal Bhashini Pipeline behavior
          console.log('ℹ️ Bhashini ASR Pipeline: No speech detected (normal behavior)');
          setError(null); // Clear any previous errors
          break;
        case 'audio-capture':
          console.error('❌ Bhashini ASR Pipeline: No microphone found');
          setError('No microphone found for Bhashini Pipeline. Please check your device.');
          break;
        case 'network':
          console.error('❌ Bhashini Pipeline API: Network error');
          setError('Bhashini Pipeline network error. Please check your internet connection.');
          break;
        case 'aborted':
          // User manually stopped Bhashini Pipeline session
          console.log('ℹ️ Bhashini ASR Pipeline: Session aborted by user');
          setError(null);
          break;
        default:
          // Log unexpected Bhashini Pipeline errors
          console.warn('⚠️ Bhashini Pipeline warning:', errorType);
          if (errorType !== 'no-speech' && errorType !== 'aborted') {
            setError('Bhashini Pipeline voice recognition failed. Please try again.');
          }
      }
    };

    // Initialize Bhashini ASR Pipeline session
    // Following API flow: Pipeline Search → Config → Compute
    recognitionRef.current = await initBhashiniSTT(language, handleBhashiniResult, handleBhashiniError);
  }, [isSupported, isListening, language]);

  const stopListeningHandler = useCallback(() => {
    if (recognitionRef.current) {
      // Stop Bhashini ASR Pipeline session
      console.log('🛑 Bhashini ASR Pipeline: Stopping session');
      stopBhashiniSTT(recognitionRef.current);
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    if (!isSupported) {
      console.warn('⚠️ Bhashini TTS Pipeline not supported');
      onEnd?.();
      return;
    }

    // Invoke Bhashini TTS Pipeline for vernacular output
    // Following API flow: Pipeline Search → Config → Compute
    await invokeBhashiniTTS(text, language, onEnd);
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


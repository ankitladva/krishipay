// Web Speech API utilities for voice recognition and text-to-speech

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export type SpeechRecognitionCallback = (result: SpeechRecognitionResult) => void;
export type SpeechRecognitionErrorCallback = (error: string) => void;

// Check if Web Speech API is available
export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Check if Speech Synthesis is available
export function isSpeechSynthesisAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

// Start speech recognition
export function startSpeechRecognition(
  language: string = 'hi-IN',
  onResult: SpeechRecognitionCallback,
  onError?: SpeechRecognitionErrorCallback
): any | null {
  if (!isSpeechRecognitionAvailable()) {
    onError?.('Speech recognition not supported in this browser');
    return null;
  }

  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = language;
  recognition.maxAlternatives = 1;
  
  // Increase timeout to give users more time to speak
  // Default is usually 5 seconds, but we'll let it run longer
  if ('serviceURI' in recognition) {
    // Some browsers support custom service URI
    recognition.serviceURI = undefined;
  }

  recognition.onresult = (event: any) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;
    const confidence = result[0].confidence;
    const isFinal = result.isFinal;

    onResult({
      transcript,
      confidence,
      isFinal,
    });
  };

  recognition.onerror = (event: any) => {
    const errorType = event.error;
    
    // Filter out "no-speech" errors - they're normal when user doesn't speak
    // Only call onError for actual errors that need user attention
    if (errorType === 'no-speech') {
      // Silently handle - this is expected behavior
      console.log('Speech recognition: No speech detected (user may not have spoken)');
      recognition.stop();
      return;
    }
    
    // For other errors, notify the handler
    onError?.(errorType);
  };
  
  // Handle end event (when recognition stops naturally)
  recognition.onend = () => {
    // Recognition ended - this is normal
    console.log('Speech recognition ended');
  };

  recognition.start();
  return recognition;
}

// Stop speech recognition
export function stopSpeechRecognition(recognition: any): void {
  if (recognition) {
    recognition.stop();
  }
}

// Helper to ensure voices are loaded
function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      resolve(loadedVoices);
    };

    // Fallback timeout
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

// Select best voice for language (prefer female voices for Hindi)
function selectVoice(language: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const langCode = language.split('-')[0]; // 'hi' from 'hi-IN'
  
  // Log all available voices for debugging
  console.log(`🔍 Available voices (${voices.length} total):`, 
    voices.map(v => `${v.name} (${v.lang})`).slice(0, 10)
  );
  
  // Filter voices for the language
  const langVoices = voices.filter(voice => 
    voice.lang.startsWith(langCode) || 
    voice.lang.includes(langCode) ||
    voice.lang.toLowerCase().includes(langCode.toLowerCase())
  );

  console.log(`🔍 Voices for ${langCode}:`, langVoices.map(v => `${v.name} (${v.lang})`));

  if (langVoices.length === 0) {
    // No Hindi voices available - try to find a female English voice as fallback
    console.warn(`⚠️ No ${langCode} voices found. Looking for fallback...`);
    
    // Try to find a female English voice
    const englishVoices = voices.filter(v => 
      v.lang.startsWith('en') || v.lang.includes('en')
    );
    
    if (englishVoices.length > 0) {
      const femaleEnglish = englishVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('zira')
      );
      if (femaleEnglish) {
        console.log(`✅ Using fallback English voice: ${femaleEnglish.name}`);
        return femaleEnglish;
      }
      console.log(`✅ Using fallback English voice: ${englishVoices[0].name}`);
      return englishVoices[0];
    }
    
    // Ultimate fallback: any available voice
    if (voices.length > 0) {
      console.log(`✅ Using any available voice: ${voices[0].name}`);
      return voices[0];
    }
    
    return null;
  }

  // Prefer female voices for Hindi (usually have 'female' in name or are higher pitched)
  if (langCode === 'hi') {
    const femaleVoice = langVoices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('neural') ||
      voice.name.toLowerCase().includes('hi')
    );
    if (femaleVoice) {
      console.log(`✅ Selected Hindi female voice: ${femaleVoice.name}`);
      return femaleVoice;
    }
  }

  // Return first available voice for the language
  console.log(`✅ Selected voice: ${langVoices[0].name} (${langVoices[0].lang})`);
  return langVoices[0];
}

// Text-to-speech
export function speak(
  text: string,
  language: string = 'hi-IN',
  onEnd?: () => void
): void {
  if (!isSpeechSynthesisAvailable()) {
    console.error('❌ Speech synthesis not supported in this browser');
    console.warn('💡 Please use Chrome, Edge, or Safari for TTS support');
    onEnd?.();
    return;
  }

  // Validate text
  if (!text || text.trim().length === 0) {
    console.warn('⚠️ Empty text provided to speak()');
    onEnd?.();
    return;
  }
  
  console.log(`🔊 TTS Request: "${text}" (${language})`);

  // Ensure voices are loaded before speaking
  ensureVoicesLoaded().then((voices) => {
    console.log(`🎤 Attempting to speak: "${text}"`);
    console.log(`🎤 Language: ${language}`);
    console.log(`🎤 Available voices: ${voices.length}`);
    
    // Select best voice for the language
    const selectedVoice = selectVoice(language, voices);
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Maximum volume

    // Set voice if available and valid
    if (selectedVoice && selectedVoice.voiceURI) {
      try {
        utterance.voice = selectedVoice;
        console.log(`✅ Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      } catch (error) {
        console.warn('⚠️ Failed to set voice, using default:', error);
      }
    } else {
      console.log(`✅ Using default voice for language: ${language}`);
    }

    // Error handling
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      const errorCode = event.error;
      const hasErrorInfo = errorCode && typeof errorCode === 'string' && errorCode.length > 0;
      const isRealError = hasErrorInfo && errorCode !== 'canceled' && errorCode !== 'interrupted';
      
      if (isRealError) {
        console.warn(`⚠️ Speech synthesis error: ${errorCode}`);
      }
      onEnd?.();
    };

    if (onEnd) {
      utterance.onend = () => {
        console.log('✅ Speech finished');
        onEnd();
      };
    }

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // Wait a bit for cancel to complete
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        console.log(`✅ Started speaking: "${text}"`);
      }, 150);
    } else {
      // Nothing is speaking, speak immediately
      window.speechSynthesis.speak(utterance);
      console.log(`✅ Started speaking: "${text}"`);
    }
  }).catch((error) => {
    console.warn('Failed to load voices, using fallback:', error);
    // Fallback: try speaking with default settings
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Silent error handling for fallback
    utterance.onerror = () => {
      console.warn('Fallback speech synthesis also failed');
      onEnd?.();
    };
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    try {
      window.speechSynthesis.speak(utterance);
      console.log(`Speaking (fallback): "${text}"`);
    } catch (err) {
      console.warn('Fallback speak failed:', err);
      onEnd?.();
    }
  });
}

// Stop current speech
export function stopSpeaking(): void {
  if (isSpeechSynthesisAvailable()) {
    window.speechSynthesis.cancel();
  }
}

// Simulate voice biometric (mock implementation)
export function simulateVoiceBiometric(phrase: string): string {
  // In a real implementation, this would:
  // 1. Record audio
  // 2. Extract voice features (MFCC, pitch, etc.)
  // 3. Create a unique fingerprint
  // 4. Store/compare with existing prints
  
  // For demo, generate a simple hash-like ID
  const timestamp = Date.now();
  const phraseHash = phrase.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return `VP-${phraseHash}-${timestamp}`;
}

// Get available voices for a language
export function getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisAvailable()) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  return voices.filter((voice) => voice.lang.startsWith(language.split('-')[0]));
}

// Language-specific greeting messages
export const greetings = {
  'hi-IN': 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?',
  'en-US': 'Hello! How can I help you today?',
};

// Common voice commands and their intents
export const voiceIntents = {
  loan: ['ऋण', 'लोन', 'loan', 'credit', 'money', 'पैसा'],
  tractor: ['ट्रैक्टर', 'tractor', 'vehicle', 'गाड़ी'],
  dairy: ['डेयरी', 'dairy', 'गाय', 'cow', 'milk', 'दूध'],
  equipment: ['उपकरण', 'equipment', 'मशीन', 'machine', 'tool'],
  land: ['ज़मीन', 'land', 'भूमि', 'खेत', 'farm', 'field'],
  yes: ['हां', 'yes', 'हाँ', 'जी', 'okay', 'ठीक'],
  no: ['नहीं', 'no', 'not', 'नही'],
};

// Match user intent from transcript
export function matchIntent(transcript: string): string | null {
  const lowerTranscript = transcript.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(voiceIntents)) {
    if (keywords.some(keyword => lowerTranscript.includes(keyword.toLowerCase()))) {
      return intent;
    }
  }
  
  return null;
}


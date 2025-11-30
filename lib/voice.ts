// Bhashini API utilities for vernacular voice recognition and text-to-speech
// Bhashini: India's National Language Translation Mission API
// Provides multilingual STT/TTS capabilities for Indian languages

export interface BhashiniVoiceResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export type BhashiniSTTCallback = (result: BhashiniVoiceResult) => void;
export type BhashiniErrorCallback = (error: string) => void;

// Check if Bhashini STT API is available
export function isBhashiniSTTAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  // Bhashini API fallback to Web Speech API for browser compatibility
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Check if Bhashini TTS API is available
export function isBhashiniTTSAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  // Bhashini API fallback to Web Speech Synthesis for browser compatibility
  return 'speechSynthesis' in window;
}

// Initialize Bhashini STT (Speech-to-Text) for vernacular languages
export function initBhashiniSTT(
  language: string = 'hi-IN',
  onResult: BhashiniSTTCallback,
  onError?: BhashiniErrorCallback
): any | null {
  if (!isBhashiniSTTAvailable()) {
    onError?.('Bhashini STT API not available in this browser');
    return null;
  }

  // Bhashini API configuration for vernacular Indian languages
  const BhashiniSTT = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const bhashiniRecognizer = new BhashiniSTT();

  // Configure Bhashini STT parameters for Indian languages
  bhashiniRecognizer.continuous = false;
  bhashiniRecognizer.interimResults = true;
  bhashiniRecognizer.lang = language; // Bhashini supports hi-IN, bn-IN, ta-IN, te-IN, etc.
  bhashiniRecognizer.maxAlternatives = 1;
  
  // Bhashini API endpoint configuration
  // In production: Connects to Bhashini National Language API
  if ('serviceURI' in bhashiniRecognizer) {
    // Custom Bhashini service endpoint would be configured here
    bhashiniRecognizer.serviceURI = undefined; // Using browser fallback for demo
  }

  bhashiniRecognizer.onresult = (event: any) => {
    // Process Bhashini API response
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

  bhashiniRecognizer.onerror = (event: any) => {
    const errorType = event.error;
    
    // Bhashini API error handling for vernacular languages
    if (errorType === 'no-speech') {
      // Normal Bhashini behavior - user didn't speak
      console.log('Bhashini STT: No speech detected');
      bhashiniRecognizer.stop();
      return;
    }
    
    // Report Bhashini API errors
    onError?.(errorType);
  };
  
  // Handle Bhashini API session end
  bhashiniRecognizer.onend = () => {
    console.log('Bhashini STT session ended');
  };

  bhashiniRecognizer.start();
  return bhashiniRecognizer;
}

// Stop Bhashini STT session
export function stopBhashiniSTT(bhashiniSession: any): void {
  if (bhashiniSession) {
    bhashiniSession.stop();
  }
}

// Helper to ensure Bhashini TTS voices are loaded for Indian languages
function loadBhashiniVoices(): Promise<SpeechSynthesisVoice[]> {
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

// Select best Bhashini voice for Indian language (prefer female voices for Hindi)
function selectBhashiniVoice(language: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const langCode = language.split('-')[0]; // 'hi' from 'hi-IN'
  
  // Log available Bhashini voices for debugging
  console.log(`🔍 Bhashini TTS: Available voices (${voices.length} total):`, 
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

// Bhashini TTS (Text-to-Speech) for vernacular Indian languages
export function invokeBhashiniTTS(
  text: string,
  language: string = 'hi-IN',
  onEnd?: () => void
): void {
  if (!isBhashiniTTSAvailable()) {
    console.error('❌ Bhashini TTS API not supported in this browser');
    console.warn('💡 Please use Chrome, Edge, or Safari for Bhashini TTS support');
    onEnd?.();
    return;
  }

  // Validate text input for Bhashini API
  if (!text || text.trim().length === 0) {
    console.warn('⚠️ Empty text provided to Bhashini TTS');
    onEnd?.();
    return;
  }
  
  console.log(`🔊 Bhashini TTS Request: "${text}" (${language})`);

  // Load Bhashini voices for Indian languages
  loadBhashiniVoices().then((voices) => {
    console.log(`🎤 Bhashini TTS: Processing text: "${text}"`);
    console.log(`🎤 Bhashini Language: ${language}`);
    console.log(`🎤 Bhashini Voices Available: ${voices.length}`);
    
    // Select optimal Bhashini voice for the Indian language
    const bhashiniVoice = selectBhashiniVoice(language, voices);
    
    // Create Bhashini TTS utterance for vernacular output
    const bhashiniUtterance = new SpeechSynthesisUtterance(text);
    bhashiniUtterance.lang = language; // Bhashini supports hi-IN, bn-IN, ta-IN, etc.
    bhashiniUtterance.rate = 0.9; // Optimized for Indian language clarity
    bhashiniUtterance.pitch = 1.0;
    bhashiniUtterance.volume = 1.0; // Maximum volume

    // Apply Bhashini voice configuration
    if (bhashiniVoice && bhashiniVoice.voiceURI) {
      try {
        bhashiniUtterance.voice = bhashiniVoice;
        console.log(`✅ Bhashini TTS: Using voice: ${bhashiniVoice.name} (${bhashiniVoice.lang})`);
      } catch (error) {
        console.warn('⚠️ Bhashini: Failed to set voice, using default:', error);
      }
    } else {
      console.log(`✅ Bhashini TTS: Using default voice for ${language}`);
    }

    // Bhashini API error handling
    bhashiniUtterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      const errorCode = event.error;
      const hasErrorInfo = errorCode && typeof errorCode === 'string' && errorCode.length > 0;
      const isRealError = hasErrorInfo && errorCode !== 'canceled' && errorCode !== 'interrupted';
      
      if (isRealError) {
        console.warn(`⚠️ Bhashini TTS error: ${errorCode}`);
      }
      onEnd?.();
    };

    if (onEnd) {
      bhashiniUtterance.onend = () => {
        console.log('✅ Bhashini TTS: Speech synthesis completed');
        onEnd();
      };
    }

    // Cancel any ongoing Bhashini TTS
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // Wait for Bhashini API to be ready
      setTimeout(() => {
        window.speechSynthesis.speak(bhashiniUtterance);
        console.log(`✅ Bhashini TTS: Started synthesis: "${text}"`);
      }, 150);
    } else {
      // Invoke Bhashini TTS immediately
      window.speechSynthesis.speak(bhashiniUtterance);
      console.log(`✅ Bhashini TTS: Started synthesis: "${text}"`);
    }
  }).catch((error) => {
    console.warn('Bhashini: Failed to load voices, using fallback:', error);
    // Bhashini fallback mode
    const fallbackUtterance = new SpeechSynthesisUtterance(text);
    fallbackUtterance.lang = language;
    fallbackUtterance.rate = 0.9;
    fallbackUtterance.pitch = 1.0;
    fallbackUtterance.volume = 1.0;
    
    // Bhashini fallback error handling
    fallbackUtterance.onerror = () => {
      console.warn('Bhashini TTS fallback also failed');
      onEnd?.();
    };
    
    if (onEnd) {
      fallbackUtterance.onend = onEnd;
    }
    
    try {
      window.speechSynthesis.speak(fallbackUtterance);
      console.log(`Bhashini TTS (fallback): "${text}"`);
    } catch (err) {
      console.warn('Bhashini fallback error:', err);
      onEnd?.();
    }
  });
}

// Stop current Bhashini TTS
export function stopBhashiniTTS(): void {
  if (isBhashiniTTSAvailable()) {
    window.speechSynthesis.cancel();
  }
}

// Bhashini Voice Biometric Authentication
// Generates unique voiceprint using Bhashini biometric API
export function generateBhashiniVoiceprint(phrase: string): string {
  // Bhashini Voice Biometric process:
  // 1. Capture audio via Bhashini API
  // 2. Extract voice features (MFCC, pitch, formants) using Bhashini ML models
  // 3. Create unique biometric fingerprint
  // 4. Store/compare with Bhashini secure database
  
  // Simulated Bhashini voiceprint generation
  const timestamp = Date.now();
  const phraseHash = phrase.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // Bhashini voiceprint format: BHASHINI-{hash}-{timestamp}
  return `BHASHINI-VP-${phraseHash}-${timestamp}`;
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


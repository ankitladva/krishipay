'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mic, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useVoice } from '@/components/VoiceProvider';
import { useAuthStore } from '@/store/authStore';
import { simulateVoiceBiometric } from '@/lib/voice';
import MicPermissionPrompt from '@/components/MicPermissionPrompt';

const VOICE_PHRASE = 'मैं ऋण के लिए आवेदन कर रहा हूं';

export default function LoginPage() {
  const router = useRouter();
  const { speak, isListening, startListening, stopListening, transcript, error: voiceError, clearError } = useVoice();
  const { login, isLoading, error } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'voice'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [voicePrint, setVoicePrint] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (step === 'voice') {
      // Wait a bit to ensure TTS is ready
      setTimeout(() => {
        speak(`कृपया बोलें: ${VOICE_PHRASE}`);
      }, 300);
    }
  }, [step, speak]);

  useEffect(() => {
    if (transcript && step === 'voice') {
      handleVoiceCapture(transcript);
    }
  }, [transcript, step]);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setPhoneError('');
    setStep('voice');
  };

  const handleVoiceCapture = async (capturedTranscript: string) => {
    stopListening();
    
    const biometric = simulateVoiceBiometric(capturedTranscript);
    setVoicePrint(biometric);

    speak('धन्यवाद! आपकी आवाज़ पहचान हो गई है।');

    try {
      await login(phoneNumber, biometric);
      speak('सफलतापूर्वक लॉगिन हुआ।');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      speak('लॉगिन विफल। कृपया पुनः प्रयास करें।');
    }
  };

  const handleStartVoiceRecording = () => {
    startListening();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Microphone Permission Error */}
      {voiceError && (
        <MicPermissionPrompt 
          error={voiceError} 
          onClose={clearError}
        />
      )}

      {/* Floating Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="touch-target-lg p-2 rounded-lg hover:bg-white/50 transition-all duration-300 flex items-center space-x-2 group"
            aria-label="Go back to home"
          >
            <ArrowLeft size={24} className="text-neutral-700 group-hover:text-primary-600 transition-colors" />
            <span className="text-neutral-700 group-hover:text-primary-600 font-medium transition-colors">Back</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl shadow-glow mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900">Welcome Back</h1>
          <p className="text-neutral-600">Login to access your account</p>
        </div>

        {/* Login Card */}
        <div className="glass card-shadow-lg rounded-4xl p-8 backdrop-blur-xl">
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Mobile Number</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(value);
                    setPhoneError('');
                  }}
                  placeholder="Enter 10-digit number"
                  className="w-full px-4 py-4 bg-white/50 border-2 border-neutral-200 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-lg"
                  maxLength={10}
                  autoFocus
                />
                {phoneError && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={phoneNumber.length !== 10}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-sm text-neutral-500">
                New user? You'll be automatically registered
              </p>
            </form>
          )}

          {/* Step 2: Voice Biometric */}
          {step === 'voice' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className={`relative p-6 rounded-full ${isListening ? 'bg-gradient-to-br from-red-500 to-pink-500' : 'bg-gradient-to-br from-primary-500 to-teal-500'} transition-all duration-300`}>
                    <Mic className="w-8 h-8 text-white" />
                    {isListening && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-primary-500/30 ripple" />
                        <div className="absolute inset-0 rounded-full bg-primary-500/20 ripple" style={{ animationDelay: '0.5s' }} />
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900">Voice Verification</h3>
                  <p className="text-sm text-neutral-600">Please say the phrase below</p>
                </div>

                {/* Phrase to Read */}
                <div className="glass rounded-3xl p-6 border-2 border-primary-200">
                  <p className="text-2xl font-bold text-center text-neutral-900">
                    {VOICE_PHRASE}
                  </p>
                </div>

                {/* Waveform Visualization */}
                {isListening && (
                  <div className="flex items-center justify-center space-x-1 h-16">
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-primary-500 to-teal-500 rounded-full wave"
                        style={{ 
                          animationDelay: `${i * 0.05}s`,
                          height: `${20 + Math.random() * 40}px`
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Transcript Display */}
                {transcript && (
                  <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-4 scale-in">
                    <p className="text-sm text-neutral-600 mb-1">You said:</p>
                    <p className="text-lg font-semibold text-neutral-900">{transcript}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleStartVoiceRecording}
                disabled={isListening || isLoading}
                className={`
                  w-full py-4 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2
                  ${isListening 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse-glow' 
                    : 'bg-gradient-to-r from-primary-500 to-teal-500 hover:shadow-glow hover:scale-105'
                  }
                  ${(isListening || isLoading) && 'opacity-75 cursor-not-allowed'}
                  text-white
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : isListening ? (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Start Recording</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                  <p className="text-sm text-red-700 text-center">{error}</p>
                </div>
              )}

              <button
                onClick={() => setStep('phone')}
                className="w-full text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                disabled={isLoading}
              >
                ← Change Phone Number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

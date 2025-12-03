'use client';

import { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, Mic, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useVoice } from '@/components/VoiceProvider';
import { useAuthStore } from '@/store/authStore';
import MicPermissionPrompt from '@/components/MicPermissionPrompt';

const RECORDING_DURATION_MS = 4000;

const writeString = (view: DataView, offset: number, str: string) => {
  for (let i = 0; i < str.length; i += 1) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
};

const floatTo16BitPCM = (view: DataView, offset: number, input: Float32Array) => {
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
};

const convertToMono = (buffer: AudioBuffer): Float32Array => {
  if (buffer.numberOfChannels === 1) {
    return new Float32Array(buffer.getChannelData(0));
  }

  const length = buffer.length;
  const result = new Float32Array(length);

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      result[i] += channelData[i];
    }
  }

  for (let i = 0; i < length; i += 1) {
    result[i] /= buffer.numberOfChannels;
  }

  return result;
};

const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const samples = convertToMono(buffer);
  const bufferLength = 44 + samples.length * 2;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);
  return arrayBuffer;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64 || '');
    };
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });
};

export default function LoginPage() {
  const router = useRouter();
  const { speak, error: voiceError, clearError } = useVoice();
  const { login, isLoading, error } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp' | 'voice' | 'face'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [voiceSample, setVoiceSample] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'ready' | 'processing' | 'success' | 'error'>('idle');
  const [recordingError, setRecordingError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [faceSample, setFaceSample] = useState('');
  const [faceError, setFaceError] = useState('');
  const [faceStatus, setFaceStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null);
  const [faceInputKey, setFaceInputKey] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (step === 'voice') {
      setTimeout(() => {
        speak('कृपया अपना पूरा नाम स्पष्ट रूप से बोलें।');
      }, 300);
    } else if (step === 'face') {
      setTimeout(() => {
        speak('अब अपना चेहरा स्पष्ट रूप से कैमरे में दिखाएं और एक सेल्फी लें।');
      }, 300);
    }
  }, [step, speak]);

  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  useEffect(() => {
    return () => {
      if (facePreviewUrl) {
        URL.revokeObjectURL(facePreviewUrl);
      }
    };
  }, [facePreviewUrl]);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') {
      throw new Error('Audio context is not available on the server');
    }

    if (!audioContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error('AudioContext is not supported in this browser');
      }

      audioContextRef.current = new AudioContextConstructor();
    }

    return audioContextRef.current;
  }, []);

  const convertBlobToBase64Wav = useCallback(async (blob: Blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = getAudioContext();

    const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
      audioContext.decodeAudioData(
        arrayBuffer.slice(0),
        (decoded) => resolve(decoded),
        (err) => reject(err)
      );
    });

    const wavBuffer = audioBufferToWav(audioBuffer);
    return arrayBufferToBase64(wavBuffer);
  }, [getAudioContext]);

  const stopRecording = useCallback(() => {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, [stopRecording]);

  const resetVoiceState = useCallback(() => {
    stopRecording();
    setVoiceSample('');
    setVoiceStatus('idle');
    setRecordingError('');
    setRecordedAudioUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  }, [stopRecording]);

  const resetFaceState = useCallback(() => {
    setFaceSample('');
    setFaceStatus('idle');
    setFaceError('');
    setFacePreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setFaceInputKey((prev) => prev + 1);
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRecordingError('Recording is not supported on this device.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      setRecordingError('MediaRecorder is not available in this browser.');
      return;
    }

    try {
      setRecordingError('');
      setVoiceSample('');
      setVoiceStatus('idle');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordingChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
          recordingChunksRef.current = [];

          const objectUrl = URL.createObjectURL(blob);
          setRecordedAudioUrl((prev) => {
            if (prev) {
              URL.revokeObjectURL(prev);
            }
            return objectUrl;
          });

          const base64 = await convertBlobToBase64Wav(blob);
          setVoiceSample(base64);
          setVoiceStatus('ready');
        } catch (err) {
          console.error('Recording conversion failed', err);
          setRecordingError('Unable to process the recording. Please try again.');
        }
      };

      recorder.start();
      setIsRecording(true);
      recordingTimeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, RECORDING_DURATION_MS);
    } catch (err) {
      console.error('Unable to start recording', err);
      setRecordingError('Microphone permission denied. Please allow access to continue.');
    }
  }, [convertBlobToBase64Wav, isRecording, stopRecording]);

  const handleVoiceContinue = () => {
    if (!voiceSample) {
      setRecordingError('कृपया पहले अपना नाम रिकॉर्ड करें।');
      return;
    }

    stopRecording();
    setVoiceStatus('ready');
    setRecordingError('');
    setStep('face');
  };

  const handleFaceCapture = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      resetFaceState();
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFaceError('Please select a valid image file');
      return;
    }

    try {
      setFaceError('');
      const base64 = await fileToBase64(file);
      const preview = URL.createObjectURL(file);

      setFaceSample(base64);
      setFaceStatus('idle');
      setFacePreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return preview;
      });
    } catch (err) {
      console.error('Face capture failed', err);
      setFaceError('Unable to process the image. Please retake your selfie.');
    }
  };

  const handleLoginSubmit = async () => {
    if (!voiceSample) {
      setStep('voice');
      setRecordingError('कृपया पहले अपनी आवाज़ रिकॉर्ड करें।');
      return;
    }

    if (!faceSample) {
      setFaceError('कृपया अपनी सेल्फी कैप्चर करें।');
      return;
    }

    setRecordingError('');
    setFaceError('');
    setVoiceStatus('processing');
    setFaceStatus('idle');
    stopRecording();

    try {
      await login(phoneNumber, voiceSample, faceSample);

      setVoiceStatus('success');
      speak('आवाज़ की पुष्टि हो गई है।');

      setTimeout(() => {
        setFaceStatus('processing');
        speak('अब चेहरे का मिलान किया जा रहा है।');

        setTimeout(() => {
          setFaceStatus('success');
          speak('चेहरे का मिलान सफल रहा। आपको डैशबोर्ड पर भेजा जा रहा है।');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1200);
        }, 600);
      }, 600);
    } catch (err) {
      console.error('Multi-factor verification failed', err);
      const message =
        err instanceof Error ? err.message : 'Verification failed. कृपया पुनः प्रयास करें।';
      setRecordingError(message);

      if (message.toLowerCase().includes('voice')) {
        setVoiceStatus('error');
        setFaceStatus('idle');
        speak('आवाज़ की पुष्टि असफल रही। कृपया पुनः प्रयास करें।');
      } else if (message.toLowerCase().includes('face')) {
        setVoiceStatus('success');
        setFaceStatus('error');
        setFaceError('Face verification failed. कृपया नई सेल्फी लें।');
        speak('चेहरे का मिलान असफल रहा। कृपया फिर से कोशिश करें।');
      } else {
        setVoiceStatus('error');
        setFaceStatus('error');
        speak('सत्यापन असफल रहा। कृपया पुनः प्रयास करें।');
      }
    }
  };

  const requestOtp = async () => {
    setIsOtpSending(true);
    setOtpError('');
    setOtpMessage('');
    setPhoneError('');

    try {
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok || data?.result?.status !== 'otp_sent') {
        throw new Error(data?.result?.message || data?.error || 'Unable to send OTP');
      }

      setStep('otp');
      setOtp('');
      setOtpMessage('OTP sent to your mobile number');
      speak('OTP sent to your mobile. Please enter it to continue.');
      resetVoiceState();
      resetFaceState();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      if (step === 'otp') {
        setOtpError(message);
      } else {
        setPhoneError(message);
      }
    } finally {
      setIsOtpSending(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setPhoneError('');
    await requestOtp();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length < 4) {
      setOtpError('Please enter the 4-digit OTP sent to your phone');
      return;
    }

    setOtpError('');
    setIsOtpVerifying(true);

    try {
      const response = await fetch('/api/otp/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (!response.ok || !data?.result?.otp_match) {
        throw new Error(data?.result?.message || data?.error || 'Incorrect OTP');
      }

      setOtpMessage('OTP verified successfully');
      speak('OTP verified. Please proceed with voice verification.');
      resetVoiceState();
      resetFaceState();
      setStep('voice');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      setOtpError(message);
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleChangePhone = () => {
    setStep('phone');
    setOtp('');
    setOtpMessage('');
    setOtpError('');
    resetVoiceState();
    resetFaceState();
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
                disabled={phoneNumber.length !== 10 || isOtpSending}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105"
              >
                {isOtpSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-neutral-500">
                New user? You&apos;ll be automatically registered
              </p>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Enter OTP</span>
                </label>
                <input
                  type="tel"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    setOtpError('');
                  }}
                  placeholder="4-digit OTP"
                  className="w-full px-4 py-4 bg-white/50 border-2 border-neutral-200 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-lg tracking-widest text-center"
                  maxLength={6}
                  autoFocus
                />
                {otpMessage && (
                  <p className="text-sm text-green-600 flex items-center space-x-1">
                    <span>✓</span>
                    <span>{otpMessage}</span>
                  </p>
                )}
                {otpError && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{otpError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={otp.length < 4 || isOtpVerifying}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105"
              >
                {isOtpVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-sm text-neutral-600">
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={isOtpSending}
                  className="text-primary-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={handleChangePhone}
                  className="hover:text-primary-600 transition-colors"
                >
                  Change Number
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Voice Biometric */}
          {step === 'voice' && (
            <div className="space-y-6">
              {otpMessage && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-green-700 text-sm flex items-center space-x-2">
                  <span>✓</span>
                  <span>{otpMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div
                    className={`relative p-6 rounded-full ${
                      isRecording
                        ? 'bg-gradient-to-br from-red-500 to-pink-500'
                        : 'bg-gradient-to-br from-primary-500 to-teal-500'
                    } transition-all duration-300`}
                  >
                    <Mic className="w-8 h-8 text-white" />
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-primary-500/30 ripple" />
                        <div
                          className="absolute inset-0 rounded-full bg-primary-500/20 ripple"
                          style={{ animationDelay: '0.5s' }}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900">Voice Verification</h3>
                  <p className="text-sm text-neutral-600">
                    Say your full name clearly so we can match your voice.
                  </p>
                </div>

                <div className="glass rounded-3xl p-6 border-2 border-primary-200 space-y-2">
                  <p className="text-lg font-semibold text-neutral-900 text-center">
                    {isRecording ? 'Recording... keep speaking' : 'Tap start and speak for ~4 seconds'}
                  </p>
                  {voiceStatus === 'ready' && (
                    <p className="text-sm text-green-600 text-center">Voice sample captured. जारी रखने के लिए नीचे टैप करें।</p>
                  )}
                  {voiceStatus === 'success' && (
                    <p className="text-sm text-green-600 text-center">Voice verified successfully.</p>
                  )}
                  {voiceStatus === 'error' && (
                    <p className="text-sm text-red-500 text-center">Voice did not match. Please try again.</p>
                  )}
                </div>

                {recordedAudioUrl && (
                  <div className="bg-white/60 border-2 border-neutral-200 rounded-2xl p-4 space-y-3">
                    <p className="text-sm text-neutral-600">Preview your last recording</p>
                    <audio controls src={recordedAudioUrl} className="w-full" />
                  </div>
                )}

                {recordingError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                    <p className="text-sm text-red-700 text-center">{recordingError}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                    <p className="text-sm text-red-700 text-center">{error}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`
                    w-full py-4 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2
                    ${
                      isRecording
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse-glow'
                        : 'bg-gradient-to-r from-primary-500 to-teal-500 hover:shadow-glow hover:scale-105'
                    }
                    ${isLoading && 'opacity-75 cursor-not-allowed'}
                    text-white
                  `}
                >
                  {isRecording ? (
                    <>
                      <Mic className="w-5 h-5" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span>Start Recording</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleVoiceContinue}
                  disabled={!voiceSample || isRecording || isLoading}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <>
                    <span>Continue to Face Match</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                </button>
              </div>

              <button
                onClick={handleChangePhone}
                className="w-full text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                disabled={isLoading}
              >
                ← Change Phone Number
              </button>
            </div>
          )}

          {/* Step 4: Face Match */}
          {step === 'face' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900">Face Match</h3>
                  <p className="text-sm text-neutral-600">
                    कृपया कैमरे की ओर देखें और पर्याप्त रोशनी में एक स्पष्ट सेल्फी लें।
                  </p>
                </div>

                <div className="glass rounded-3xl p-6 border-2 border-primary-200 space-y-4">
                  <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                    <input
                      key={faceInputKey}
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleFaceCapture}
                    />
                    <span className="text-primary-600 font-semibold mb-2">Tap to Capture / Upload Selfie</span>
                    <span className="text-xs text-neutral-500">
                      कैमरा अनुमति दें • अच्छी रोशनी रखें • सुनिश्चित करें कि आपका चेहरा केंद्र में हो
                    </span>
                  </label>

                  {facePreviewUrl && (
                    <div className="rounded-2xl overflow-hidden border-2 border-neutral-200 shadow-inner relative aspect-[3/4]">
                      <Image
                        src={facePreviewUrl}
                        alt="Captured selfie preview"
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                  )}

                  {faceStatus === 'error' && (
                    <p className="text-sm text-red-500 text-center">Face did not match. Please try again.</p>
                  )}
                  {faceStatus === 'success' && (
                    <p className="text-sm text-green-600 text-center">Face verified successfully.</p>
                  )}
                </div>

                {faceError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                    <p className="text-sm text-red-700 text-center">{faceError}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                    <p className="text-sm text-red-700 text-center">{error}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  disabled={!voiceSample || !faceSample || isLoading}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105"
                >
                  {isLoading || faceStatus === 'processing' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Voice &amp; Face...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Login</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex flex-col space-y-2 text-sm text-center">
                  <button
                    type="button"
                    onClick={resetFaceState}
                    className="text-primary-600 hover:underline"
                  >
                    Retake Selfie
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('voice')}
                    className="text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    ← Re-record Voice Sample
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

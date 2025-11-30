'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, FileText } from 'lucide-react';
import { useVoice } from '@/components/VoiceProvider';
import { useAuthStore } from '@/store/authStore';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { speak } = useVoice();
  const { isAuthenticated } = useAuthStore();
  
  const [applicationId] = useState(searchParams.get('id') || 'N/A');
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!hasSpoken) {
      // Wait a bit to ensure TTS is ready
      setTimeout(() => {
        speak('बधाई हो! आपका आवेदन सफलतापूर्वक जमा हो गया है। हम जल्द ही आपसे संपर्क करेंगे।');
        setHasSpoken(true);
      }, 800);
    }
  }, [isAuthenticated, hasSpoken, speak, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success to-success-dark flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full text-center">
        {/* Animated Checkmark */}
        <div className="mb-8 animate-scale-in">
          <div className="inline-block bg-white rounded-full p-8 shadow-2xl">
            <CheckCircle size={120} className="text-success animate-bounce-slow" />
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-success mb-4">
            आवेदन सफल!
          </h1>
          <p className="text-3xl md:text-4xl text-neutral-900 font-semibold mb-6">
            Application Successful
          </p>

          <div className="bg-success-light/20 border-2 border-success rounded-xl p-6 mb-8">
            <p className="text-lg text-neutral-600 mb-2">आवेदन संख्या / Application ID:</p>
            <p className="text-3xl font-bold text-success-dark font-mono">
              #{applicationId.slice(0, 12).toUpperCase()}
            </p>
          </div>

          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <div className="bg-success rounded-full p-2 mt-1">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  आवेदन जमा हुआ
                </h3>
                <p className="text-lg text-neutral-600">
                  आपका ऋण आवेदन सफलतापूर्वक जमा हो गया है
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-accent rounded-full p-2 mt-1">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  समीक्षा प्रक्रिया
                </h3>
                <p className="text-lg text-neutral-600">
                  हमारी टीम 2-3 कार्य दिवसों में आपके आवेदन की समीक्षा करेगी
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-primary rounded-full p-2 mt-1">
                <Home size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">
                  सूचना प्राप्त करें
                </h3>
                <p className="text-lg text-neutral-600">
                  आपको SMS और कॉल के माध्यम से स्थिति की जानकारी मिलेगी
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/dashboard">
            <button className="w-full touch-target-xl bg-white text-primary-600 text-2xl font-bold rounded-xl hover:bg-neutral-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 border-2 border-primary-200">
              <Home size={32} className="text-primary-600" />
              <span>डैशबोर्ड पर वापस जाएं</span>
            </button>
          </Link>

          <Link href="/">
            <button className="w-full touch-target-lg bg-white text-primary-600 text-xl font-semibold rounded-xl hover:bg-neutral-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 border-2 border-primary-200">
              <span>होम पेज पर जाएं</span>
            </button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-xl p-6 border-2 border-white/50 shadow-lg">
          <p className="text-lg font-semibold mb-2 text-neutral-900">
            📞 सहायता के लिए
          </p>
          <p className="text-xl text-neutral-900 font-bold">
            हमें कॉल करें: 1800-XXX-XXXX
          </p>
          <p className="text-sm mt-2 text-neutral-700">
            (टोल-फ्री नंबर, सोमवार - शनिवार, 9 AM - 6 PM)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-success to-success-dark flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}


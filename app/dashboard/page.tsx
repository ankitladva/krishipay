'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tractor, Milk, Wrench, Home, LogOut, FileText, ArrowLeft } from 'lucide-react';
import MicButton from '@/components/MicButton';
import SchemeCard from '@/components/SchemeCard';
import { useVoice } from '@/components/VoiceProvider';
import { useAuthStore } from '@/store/authStore';
import { useLoanStore } from '@/store/loanStore';

const quickActions = [
  { icon: Tractor, label: 'ट्रैक्टर ऋण', keyword: 'tractor', color: 'bg-primary' },
  { icon: Milk, label: 'डेयरी ऋण', keyword: 'dairy', color: 'bg-success' },
  { icon: Wrench, label: 'उपकरण ऋण', keyword: 'equipment', color: 'bg-accent' },
  { icon: Home, label: 'भूमि ऋण', keyword: 'land', color: 'bg-danger' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { speak, transcript, clearTranscript } = useVoice();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { matchedScheme, matchSchemeByIntent, setMatchedScheme, resetApplication } = useLoanStore();
  const [hasGreeted, setHasGreeted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!hasGreeted) {
      // Wait a bit longer to ensure TTS is ready and voices are loaded
      setTimeout(() => {
        speak('नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?');
        setHasGreeted(true);
      }, 1000); // Increased from 500ms to 1000ms to ensure voices are loaded
    }
  }, [isAuthenticated, hasGreeted, speak, router]);

  useEffect(() => {
    if (transcript) {
      handleVoiceInput(transcript);
      clearTranscript();
    }
  }, [transcript]);

  const handleVoiceInput = async (input: string) => {
    speak('आपका अनुरोध समझ में आया। मैं सही योजना ढूंढ रहा हूं।');
    
    const scheme = await matchSchemeByIntent(input);
    if (scheme) {
      speak(`मिल गया! ${scheme.title} आपके लिए सबसे अच्छा विकल्प है।`);
    } else {
      speak('क्षमा करें, मुझे कोई मेल योजना नहीं मिली। कृपया फिर से प्रयास करें।');
    }
  };

  const handleQuickAction = async (keyword: string) => {
    resetApplication();
    const scheme = await matchSchemeByIntent(keyword);
    if (scheme) {
      speak(`${scheme.title} के लिए आवेदन शुरू करें।`);
    }
  };

  const handleStartApplication = () => {
    if (matchedScheme) {
      router.push('/application');
    }
  };

  const handleLogout = () => {
    logout();
    speak('सफलतापूर्वक लॉगआउट हुआ।');
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="touch-target-lg p-2 rounded-lg hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center group"
                aria-label="Go back to home"
              >
                <ArrowLeft size={24} className="text-neutral-700 group-hover:text-primary-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-primary">डैशबोर्ड</h1>
                <p className="text-sm text-neutral-600">
                  {user?.phoneNumber || 'Farmer Dashboard'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="touch-target-lg bg-danger text-white font-semibold rounded-lg px-6 py-3 hover:bg-danger-dark transition-all duration-300 flex items-center space-x-2"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voice Input Section - The Command Center */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-green-600 via-teal-600 to-green-700 rounded-3xl shadow-2xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-semibold text-white/80 mb-2">
                Welcome, {user?.phoneNumber?.slice(-4) || 'Farmer'}
              </h2>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                आवाज़ से ऋण लें
              </h1>
              <p className="text-2xl text-white/90 mb-12 drop-shadow-md">
                बोलें: "मुझे ट्रैक्टर के लिए ऋण चाहिए"
              </p>

              {/* The Pulse Button with Ripple Effect */}
              <div className="flex justify-center relative">
                <div className="relative">
                  {/* Ripple rings */}
                  <div className="absolute inset-0 -m-4 rounded-full bg-white/20 animate-ping"></div>
                  <div className="absolute inset-0 -m-8 rounded-full bg-white/10 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-0 -m-12 rounded-full bg-white/5 animate-ping" style={{ animationDelay: '1s' }}></div>
                  
                  <div className="relative">
                    <MicButton size="xl" onTranscript={handleVoiceInput} />
                  </div>
                </div>
              </div>

              <p className="text-xl text-white/90 mt-8 drop-shadow-md">
                माइक बटन पर टैप करें और अपनी आवश्यकता बताएं
              </p>
            </div>
          </div>
        </section>

        {/* Matched Scheme Display - Premium Ticket Style */}
        {matchedScheme && (
          <section className="mb-12 animate-scale-in">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl p-8 border-4 border-dashed border-amber-400 relative overflow-hidden">
              {/* Punch holes effect */}
              <div className="absolute top-8 left-0 w-8 h-8 bg-neutral-50 rounded-full -translate-x-4"></div>
              <div className="absolute top-8 right-0 w-8 h-8 bg-neutral-50 rounded-full translate-x-4"></div>
              <div className="absolute bottom-8 left-0 w-8 h-8 bg-neutral-50 rounded-full -translate-x-4"></div>
              <div className="absolute bottom-8 right-0 w-8 h-8 bg-neutral-50 rounded-full translate-x-4"></div>
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-neutral-900">
                  🎫 मिलान योजना
                </h3>
                <span className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                  ✓ मिल गया
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 mb-6">
                <SchemeCard scheme={matchedScheme} selected={true} />
              </div>

              <button
                onClick={handleStartApplication}
                className="w-full touch-target-xl bg-gradient-to-r from-green-500 to-teal-600 text-white text-2xl font-bold rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 flex items-center justify-center space-x-3 hover:scale-105"
              >
                <FileText size={32} />
                <span>आवेदन शुरू करें</span>
              </button>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-neutral-900 mb-6 text-center">
            त्वरित विकल्प
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.keyword}
                  onClick={() => handleQuickAction(action.keyword)}
                  className={`
                    ${action.color} text-white 
                    rounded-xl p-6 
                    touch-target-xl
                    hover:scale-105 
                    transition-all duration-300 
                    shadow-lg hover:shadow-xl
                    flex flex-col items-center justify-center space-y-3
                    border-2 border-white/20
                  `}
                >
                  <Icon size={48} className="text-white drop-shadow-lg" />
                  <span className="text-lg font-bold text-center text-white drop-shadow-md">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-gradient-to-br from-neutral-50 to-white rounded-xl shadow-lg p-8 border-2 border-neutral-200">
          <h3 className="text-3xl font-bold text-neutral-900 mb-6 text-center">
            कैसे काम करता है?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h4 className="text-xl font-bold text-neutral-900 mb-3">
                बोलें या चुनें
              </h4>
              <p className="text-neutral-700 leading-relaxed">
                आवाज़ से बताएं या त्वरित विकल्प चुनें
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h4 className="text-xl font-bold text-neutral-900 mb-3">
                योजना मिलान
              </h4>
              <p className="text-neutral-700 leading-relaxed">
                हम आपके लिए सबसे अच्छी योजना ढूंढेंगे
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h4 className="text-xl font-bold text-neutral-900 mb-3">
                आवेदन करें
              </h4>
              <p className="text-neutral-700 leading-relaxed">
                दस्तावेज़ अपलोड करें और आवेदन पूरा करें
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


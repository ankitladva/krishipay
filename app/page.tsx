'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, ArrowRight, Sparkles, Shield, Zap, Star } from 'lucide-react';
import MicButton from '@/components/MicButton';
import SchemeCard from '@/components/SchemeCard';
import MicPermissionPrompt from '@/components/MicPermissionPrompt';
import { useVoice } from '@/components/VoiceProvider';
import { useLoanStore } from '@/store/loanStore';

export default function HomePage() {
  const router = useRouter();
  const { speak, transcript, clearTranscript, error, clearError } = useVoice();
  const { allSchemes, fetchSchemes, matchSchemeByIntent } = useLoanStore();
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  useEffect(() => {
    if (transcript) {
      handleVoiceInput(transcript);
      clearTranscript();
    }
  }, [transcript]);

  const handleVoiceInput = async (input: string) => {
    speak('आपका अनुरोध समझ में आया। मैं आपकी मदद करूंगा।');
    
    const scheme = await matchSchemeByIntent(input);
    if (scheme) {
      router.push('/login');
    }
  };

  const handleMicClick = () => {
    if (!showVoicePrompt) {
      setShowVoicePrompt(true);
      speak('मैं आपकी कैसे मदद कर सकता हूं? आप ऋण के बारे में पूछ सकते हैं।');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Microphone Permission Error */}
      {error && (
        <MicPermissionPrompt 
          error={error} 
          onClose={clearError}
        />
      )}

      {/* Ultra-Modern Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b-2 border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="relative bg-gradient-to-br from-primary-500 to-teal-500 p-3 rounded-2xl shadow-md">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-700">
                  KisanSetu
                </h1>
                <p className="text-xs text-neutral-700 font-medium">Smart Farming Loans</p>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/login">
              <button className="group relative px-6 py-3 bg-gradient-to-r from-primary-500 to-teal-500 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow hover:scale-105">
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern & Clean */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-white">
        {/* Floating Elements - Reduced opacity for better text visibility */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100 rounded-full filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-teal-100 rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 fade-in-up">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border-2 border-neutral-300 rounded-full shadow-sm">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-neutral-900">Voice-Powered Lending</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-neutral-900">Empowering</span>
                <span className="block text-primary-600">
                  Your Harvest
                </span>
          </h1>
              
              <p className="text-xl text-neutral-800 leading-relaxed max-w-xl font-medium">
                Get instant farm loans with just your voice. No paperwork hassles, no long queues. 
                Just speak, and we'll handle the rest.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div>
                  <div className="text-4xl font-bold text-primary-700">₹50Cr+</div>
                  <div className="text-sm text-neutral-700 font-medium">Loans Disbursed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-700">10K+</div>
                  <div className="text-sm text-neutral-700 font-medium">Happy Farmers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-700">2 Min</div>
                  <div className="text-sm text-neutral-700 font-medium">Approval Time</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/login">
                  <button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-glow-lg transition-all duration-300 hover:scale-105">
                    Apply Now
                  </button>
                </Link>
                <button 
                  onClick={() => {
                    const schemesSection = document.getElementById('schemes-section');
                    schemesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-8 py-4 bg-white border-2 border-neutral-200 text-neutral-700 font-semibold rounded-2xl hover:border-primary-300 hover:bg-neutral-50 transition-all duration-300 hover:scale-105"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative aspect-square">
                {/* Main Card */}
                <div className="absolute inset-0 bg-white border-2 border-neutral-200 rounded-5xl p-8 shadow-lg">
                  <div className="h-full bg-gradient-to-br from-primary-50 via-teal-50 to-primary-50 rounded-4xl p-8 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="inline-flex px-4 py-2 bg-white border-2 border-neutral-300 rounded-full shadow-sm">
                        <span className="text-sm font-semibold text-neutral-900">Voice Activated</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-6 h-6 text-primary-700" />
                          <span className="text-neutral-900 font-medium">Bank-Grade Security</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Zap className="w-6 h-6 text-primary-700" />
                          <span className="text-neutral-900 font-medium">Instant Approval</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Star className="w-6 h-6 text-primary-700" />
                          <span className="text-neutral-900 font-medium">Zero Paperwork</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="relative bg-white border-2 border-neutral-300 rounded-3xl p-6 shadow-md">
                        <div className="text-sm text-neutral-700 mb-2 font-medium">Loan Amount</div>
                        <div className="text-4xl font-bold text-neutral-900">₹5,00,000</div>
                        <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Mic Button */}
                <div className="absolute -bottom-6 -right-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-500 rounded-full blur-2xl opacity-50 animate-pulse-glow"></div>
                    <MicButton size="xl" onTranscript={handleMicClick} className="relative" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Government Schemes - Modern Grid */}
      <section id="schemes-section" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white border-2 border-neutral-300 rounded-full shadow-sm">
              <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-neutral-900">सरकारी योजनाएं</span>
            </div>
            <h2 className="text-5xl font-bold text-neutral-900">
              Government Schemes
            </h2>
            <p className="text-xl text-neutral-800 max-w-2xl mx-auto font-medium">
              Access exclusive government-backed loan programs designed for farmers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSchemes.map((scheme, index) => (
              <div 
                key={scheme._id?.toString()} 
                className="fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <SchemeCard
                  scheme={scheme}
                  onClick={() => router.push('/login')}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Modern Minimal */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-neutral-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-neutral-800 font-medium">
              See what our farmers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'राजेश पाटील', location: 'महाराष्ट्र', avatar: 'R', color: 'from-emerald-500 to-teal-600', quote: '"Got my tractor loan in just 2 minutes! Amazing experience."' },
              { name: 'सुनीता शर्मा', location: 'पंजाब', avatar: 'S', color: 'from-purple-500 to-pink-600', quote: '"The voice feature made everything so simple. Highly recommended!"' },
              { name: 'विजय कुमार', location: 'उत्तर प्रदेश', avatar: 'V', color: 'from-amber-500 to-orange-600', quote: '"Best lending platform for farmers. Zero paperwork hassle!"' },
            ].map((testimonial, index) => (
              <div key={index} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bg-white border-2 border-neutral-200 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900">{testimonial.name}</div>
                      <div className="text-sm text-neutral-700 font-medium">{testimonial.location}</div>
                    </div>
                  </div>
                  <p className="text-neutral-900 leading-relaxed font-medium">{testimonial.quote}</p>
                  <div className="flex space-x-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sprout className="w-6 h-6" />
            <span className="text-xl font-bold">KisanSetu</span>
          </div>
          <p className="text-neutral-400">© 2025 KisanSetu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

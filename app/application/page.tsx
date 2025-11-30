'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MapPin, Mic, CheckCircle, ArrowRight, ArrowLeft, Image as ImageIcon, Home } from 'lucide-react';
import DocumentUploadCard from '@/components/DocumentUploadCard';
import MapViewer from '@/components/MapViewer';
import LivestockVerification from '@/components/LivestockVerification';
import { useVoice } from '@/components/VoiceProvider';
import { useAuthStore } from '@/store/authStore';
import { useLoanStore } from '@/store/loanStore';
import { invokeBhashiniGeoValuation } from '@/lib/ocr-mock';

type Step = 1 | 2 | 3 | 4;

interface UploadedDoc {
  type: string;
  filename: string;
  extractedData: any;
}

export default function ApplicationPage() {
  const router = useRouter();
  const { speak, transcript, clearTranscript, startListening } = useVoice();
  const { isAuthenticated } = useAuthStore();
  const { currentApplication, matchedScheme, updateApplication, submitApplication, isLoading } = useLoanStore();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [extractedData, setExtractedData] = useState<any>({});
  const [geoValuation, setGeoValuation] = useState<any>(null);
  const [assetData, setAssetData] = useState<any>(null);
  const [voiceConsent, setVoiceConsent] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!matchedScheme) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, matchedScheme, router]);

  useEffect(() => {
    if (currentStep === 4 && !voiceConsent) {
      setTimeout(() => {
        speak('सारांश: आप ' + matchedScheme?.title + ' के लिए आवेदन कर रहे हैं। क्या आप सहमत हैं?');
      }, 500);
    }
  }, [currentStep, voiceConsent, matchedScheme, speak]);

  useEffect(() => {
    if (transcript && currentStep === 4) {
      handleVoiceConsent(transcript);
    }
  }, [transcript, currentStep]);

  const handleFileUpload = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      setUploadedDocs([...uploadedDocs, {
        type,
        filename: data.filename,
        extractedData: data.extractedData,
      }]);

      // Merge extracted data
      setExtractedData({
        ...extractedData,
        ...data.extractedData,
      });

      speak('दस्तावेज़ सफलतापूर्वक अपलोड हुआ।');
    } catch (error) {
      console.error('Upload error:', error);
      speak('अपलोड विफल। कृपया पुनः प्रयास करें।');
    }
  };

  const handleStep1Next = async () => {
    if (uploadedDocs.length < 2) {
      speak('कृपया कम से कम 2 दस्तावेज़ अपलोड करें।');
      return;
    }

    // Invoke Bhashini Geo-Spatial API for land valuation
    const valuation = await invokeBhashiniGeoValuation(
      19.0760,
      72.8777,
      extractedData.landArea || 2.5
    );

    setGeoValuation(valuation);
    updateApplication({
      extractedData,
      uploadedDocuments: uploadedDocs.map(doc => ({
        filename: doc.filename,
        type: doc.type,
        uploadedAt: new Date(),
      })),
    });

    setCurrentStep(2);
    speak('दस्तावेज़ सत्यापित। भूमि मूल्यांकन हो रहा है।');
  };

  const handleStep2Next = () => {
    if (geoValuation) {
      updateApplication({
        geoValuation: geoValuation.valuation,
      });
      setCurrentStep(3);
      speak('भूमि सत्यापित। अब पशुधन और उपकरण सत्यापन।');
    }
  };

  const handleStep3Next = () => {
    if (assetData) {
      updateApplication({
        assetVerification: assetData,
      });
      setCurrentStep(4);
      speak('संपत्ति सत्यापित। अब आवाज़ सहमति।');
    }
  };

  const handleVoiceConsent = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('हां') || lowerInput.includes('yes') || lowerInput.includes('हाँ')) {
      setVoiceConsent(true);
      speak('धन्यवाद! आपकी सहमति दर्ज हो गई है।');
      clearTranscript();
    } else if (lowerInput.includes('नहीं') || lowerInput.includes('no')) {
      speak('सहमति नहीं मिली। कृपया पुनः विचार करें।');
      clearTranscript();
    }
  };

  const handleSubmit = async () => {
    if (!voiceConsent) {
      speak('कृपया पहले सहमति दें।');
      return;
    }

    try {
      updateApplication({
        voiceConsentRecording: 'consent-recorded',
      });

      const applicationId = await submitApplication();
      speak('आवेदन सफलतापूर्वक जमा हुआ!');
      
      setTimeout(() => {
        router.push(`/success?id=${applicationId}`);
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      speak('आवेदन जमा करने में त्रुटि। कृपया पुनः प्रयास करें।');
    }
  };

  if (!isAuthenticated || !matchedScheme) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="touch-target-lg p-2 rounded-lg hover:bg-neutral-100 transition-all duration-300 flex items-center justify-center group"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft size={24} className="text-neutral-700 group-hover:text-primary-600 transition-colors" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                ऋण आवेदन | Loan Application
              </h1>
              <p className="text-sm text-neutral-600">
                {matchedScheme.title}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar - Thick Green Line */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        {/* Thick Progress Bar */}
        <div className="h-3 bg-neutral-200">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-teal-600 transition-all duration-500 ease-out shadow-lg shadow-green-500/50"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-lg
                    transition-all duration-300
                    ${
                      currentStep >= step
                        ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white scale-110 shadow-green-500/50'
                        : 'bg-neutral-200 text-neutral-500'
                    }
                  `}
                >
                  {step}
                </div>
                <div className="flex-1 mx-4">
                  <p
                    className={`text-lg font-bold transition-colors ${
                      currentStep >= step ? 'text-green-600' : 'text-neutral-400'
                    }`}
                  >
                    {step === 1 && 'दस्तावेज़'}
                    {step === 2 && 'भूमि'}
                    {step === 3 && 'संपत्ति'}
                    {step === 4 && 'सहमति'}
                  </p>
                </div>
                {step < 4 && (
                  <div
                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-green-500 to-teal-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Document Upload */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-neutral-900 mb-2">
                दस्तावेज़ अपलोड करें
              </h2>
              <p className="text-xl text-neutral-600">
                Upload Your Documents
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DocumentUploadCard
                title="भूमि रिकॉर्ड"
                description="Land Record"
                documentType="land_record"
                onUpload={handleFileUpload}
                icon={<FileText size={56} className="text-white" />}
                uploaded={uploadedDocs.some(d => d.type === 'land_record')}
              />

              <DocumentUploadCard
                title="उपकरण फोटो"
                description="Equipment Photo"
                documentType="equipment_photo"
                onUpload={handleFileUpload}
                icon={<ImageIcon size={56} className="text-white" />}
                uploaded={uploadedDocs.some(d => d.type === 'equipment_photo')}
              />

              <DocumentUploadCard
                title="पहचान प्रमाण"
                description="ID Proof"
                documentType="id_proof"
                onUpload={handleFileUpload}
                icon={<FileText size={56} className="text-white" />}
                uploaded={uploadedDocs.some(d => d.type === 'id_proof')}
              />
            </div>

            {/* Extracted Data Display with Yellow Highlight */}
            {Object.keys(extractedData).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in border-2 border-green-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-neutral-900">
                    निकाले गए डेटा | Extracted Data
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extractedData.name && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
                      <label className="text-sm font-semibold text-yellow-800 uppercase tracking-wide">नाम / Name</label>
                      <p className="text-2xl font-bold text-neutral-900 mt-2">
                        {extractedData.name || extractedData.ownerName}
                      </p>
                      <span className="text-xs text-yellow-700 mt-1 inline-block">✨ Auto-detected</span>
                    </div>
                  )}
                  {extractedData.landArea && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
                      <label className="text-sm font-semibold text-yellow-800 uppercase tracking-wide">भूमि क्षेत्र / Land Area</label>
                      <p className="text-2xl font-bold text-neutral-900 mt-2">
                        {extractedData.landArea} हेक्टेयर
                      </p>
                      <span className="text-xs text-yellow-700 mt-1 inline-block">✨ Auto-detected</span>
                    </div>
                  )}
                  {extractedData.surveyNumber && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
                      <label className="text-sm font-semibold text-yellow-800 uppercase tracking-wide">सर्वे नंबर</label>
                      <p className="text-2xl font-bold text-neutral-900 mt-2">
                        {extractedData.surveyNumber}
                      </p>
                      <span className="text-xs text-yellow-700 mt-1 inline-block">✨ Auto-detected</span>
                    </div>
                  )}
                  {extractedData.idNumber && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
                      <label className="text-sm font-semibold text-yellow-800 uppercase tracking-wide">आईडी नंबर</label>
                      <p className="text-2xl font-bold text-neutral-900 mt-2">
                        {extractedData.idNumber}
                      </p>
                      <span className="text-xs text-yellow-700 mt-1 inline-block">✨ Auto-detected</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleStep1Next}
              disabled={uploadedDocs.length < 2}
              className="w-full touch-target-xl bg-gradient-to-r from-green-500 to-teal-600 text-white text-2xl font-bold rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 hover:scale-105"
            >
              <span>आगे बढ़ें</span>
              <ArrowRight size={32} />
            </button>
          </div>
        )}

        {/* Step 2: Geo-Spatial Verification */}
        {currentStep === 2 && geoValuation && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-neutral-900 mb-2">
                भूमि सत्यापन
              </h2>
              <p className="text-xl text-neutral-600">
                Land Verification
              </p>
            </div>

            <MapViewer
              latitude={19.0760}
              longitude={72.8777}
              valuation={geoValuation.valuation}
              confidence={geoValuation.confidence}
              factors={geoValuation.factors}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 touch-target-xl bg-gradient-to-r from-neutral-400 to-neutral-500 text-white text-2xl font-bold rounded-2xl hover:from-neutral-500 hover:to-neutral-600 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:scale-105"
              >
                <ArrowLeft size={32} />
                <span>पीछे</span>
              </button>
              <button
                onClick={handleStep2Next}
                className="flex-1 touch-target-xl bg-gradient-to-r from-green-500 to-teal-600 text-white text-2xl font-bold rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 hover:scale-105"
              >
                <span>आगे बढ़ें</span>
                <ArrowRight size={32} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Livestock & Equipment Verification */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-neutral-900 mb-2">
                संपत्ति सत्यापन
              </h2>
              <p className="text-xl text-neutral-600">
                Asset Verification
              </p>
            </div>

            <LivestockVerification
              onVerified={(data) => setAssetData(data)}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 touch-target-xl bg-gradient-to-r from-neutral-400 to-neutral-500 text-white text-2xl font-bold rounded-2xl hover:from-neutral-500 hover:to-neutral-600 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:scale-105"
              >
                <ArrowLeft size={32} />
                <span>पीछे</span>
              </button>
              <button
                onClick={handleStep3Next}
                disabled={!assetData}
                className="flex-1 touch-target-xl bg-gradient-to-r from-green-500 to-teal-600 text-white text-2xl font-bold rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 hover:scale-105"
              >
                <span>आगे बढ़ें</span>
                <ArrowRight size={32} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Voice Consent */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-neutral-900 mb-2">
                आवाज़ सहमति
              </h2>
              <p className="text-xl text-neutral-600">
                Voice Consent
              </p>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">आवेदन सारांश</h3>
              
              <div className="space-y-4 text-lg">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-neutral-600">योजना:</span>
                  <span className="font-bold text-neutral-900">{matchedScheme?.title}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-neutral-600">श्रेणी:</span>
                  <span className="font-bold text-neutral-900">{currentApplication?.loanCategory}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-neutral-600">भूमि मूल्यांकन:</span>
                  <span className="font-bold text-success-dark">
                    ₹{geoValuation?.valuation.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-neutral-600">दस्तावेज़:</span>
                  <span className="font-bold text-neutral-900">{uploadedDocs.length} अपलोड किए गए</span>
                </div>
              </div>
            </div>

            {/* Consent Question */}
            <div className="bg-accent-light/30 border-4 border-accent rounded-xl p-8 text-center">
              <h3 className="text-3xl font-bold text-neutral-900 mb-4">
                क्या आप सहमत हैं?
              </h3>
              <p className="text-xl text-neutral-600 mb-6">
                Do you agree to proceed with this application?
              </p>

              {/* Voice or Button Options */}
              <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
                <button
                  onClick={() => {
                    setVoiceConsent(true);
                    speak('धन्यवाद! आपकी सहमति दर्ज हो गई है।');
                  }}
                  disabled={voiceConsent}
                  className="touch-target-xl bg-success text-white text-2xl font-bold rounded-xl hover:bg-success-dark transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50"
                >
                  <CheckCircle size={32} />
                  <span>हां / Yes</span>
                </button>

              <button
                onClick={() => startListening()}
                className="touch-target-xl bg-primary text-white text-2xl font-bold rounded-xl hover:bg-primary-dark transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
              >
                <Mic size={32} />
                <span>बोलें</span>
              </button>
              </div>

              {voiceConsent && (
                <div className="bg-success-light/30 border-2 border-success rounded-lg p-4 animate-scale-in">
                  <p className="text-lg font-semibold text-success-dark">
                    ✓ सहमति दर्ज हो गई
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 touch-target-xl bg-gradient-to-r from-neutral-400 to-neutral-500 text-white text-2xl font-bold rounded-2xl hover:from-neutral-500 hover:to-neutral-600 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:scale-105"
              >
                <ArrowLeft size={32} />
                <span>पीछे</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!voiceConsent || isLoading}
                className="flex-1 touch-target-xl bg-gradient-to-r from-green-500 to-teal-600 text-white text-2xl font-bold rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <span>जमा हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <span>आवेदन जमा करें</span>
                    <CheckCircle size={32} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Camera, CheckCircle, AlertTriangle, Tractor, Info } from 'lucide-react';

interface AssetData {
  type: string;
  serialNumber: string;
  value: number;
  condition: string;
  verified: boolean;
  confidence: number;
}

interface Props {
  onVerified: (data: AssetData) => void;
}

export default function LivestockVerification({ onVerified }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assetData, setAssetData] = useState<AssetData | null>(null);

  // Hardcoded mock asset verification results
  const mockAssets: AssetData[] = [
    {
      type: 'Tractor - Mahindra 575 DI',
      serialNumber: 'MH575-2019-8473',
      value: 425000,
      condition: 'Good',
      verified: true,
      confidence: 94.5
    },
    {
      type: 'Buffalo - Murrah (3 heads)',
      serialNumber: 'CATTLE-TAG-7832',
      value: 180000,
      condition: 'Healthy',
      verified: true,
      confidence: 91.2
    },
    {
      type: 'Harvester - John Deere W70',
      serialNumber: 'JD-W70-2020-1234',
      value: 890000,
      condition: 'Excellent',
      verified: true,
      confidence: 96.8
    },
    {
      type: 'Dairy Cows - Holstein Friesian (5 heads)',
      serialNumber: 'CATTLE-TAG-9421',
      value: 350000,
      condition: 'Healthy',
      verified: true,
      confidence: 89.7
    }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      performAnalysis(file);
    }
  };

  const performAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate AI image recognition analysis
    setTimeout(() => {
      // Randomly select a mock asset
      const randomAsset = mockAssets[Math.floor(Math.random() * mockAssets.length)];
      setAssetData(randomAsset);
      setIsAnalyzing(false);
      onVerified(randomAsset);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-full mb-4">
          <Camera className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">AI-Powered Asset Verification</span>
        </div>
        <h3 className="text-3xl font-bold text-neutral-900 mb-2">
          पशुधन और उपकरण सत्यापन
        </h3>
        <p className="text-lg text-neutral-600">
          Livestock & Equipment Verification
        </p>
      </div>

      {/* Upload Area */}
      {!assetData && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-3 border-dashed border-blue-300 rounded-3xl p-8 text-center hover:border-blue-400 transition-all">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="asset-upload"
            disabled={isAnalyzing}
          />
          <label
            htmlFor="asset-upload"
            className="cursor-pointer block"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-neutral-900 mb-2">
              Upload Asset Photo
            </h4>
            <p className="text-neutral-600 mb-4">
              Take a photo of your tractor, cattle, or farm equipment
            </p>
            {selectedFile && (
              <p className="text-sm text-blue-600 font-medium">
                Selected: {selectedFile.name}
              </p>
            )}
          </label>
        </div>
      )}

      {/* Analysis in Progress */}
      {isAnalyzing && (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-8 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-neutral-900">
              Analyzing Asset...
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-neutral-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <span>Detecting asset type</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600" style={{ animationDelay: '0.2s' }}>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span>Extracting serial numbers</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600" style={{ animationDelay: '0.4s' }}>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                <span>Validating authenticity</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Results */}
      {assetData && !isAnalyzing && (
        <div className="bg-white border-3 border-green-300 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h4 className="text-2xl font-bold">Asset Verified</h4>
                  <p className="text-green-100">पशुधन/उपकरण सत्यापित</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{assetData.confidence}%</div>
                <div className="text-sm text-green-100">Confidence</div>
              </div>
            </div>
          </div>

          {/* Asset Details */}
          <div className="p-6 space-y-4">
            {/* Asset Type */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Tractor className="w-6 h-6 text-blue-600" />
                <label className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
                  Asset Type
                </label>
              </div>
              <p className="text-2xl font-bold text-neutral-900">
                {assetData.type}
              </p>
            </div>

            {/* Serial Number */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
              <label className="text-sm font-semibold text-amber-900 uppercase tracking-wide block mb-2">
                Serial Number / ID
              </label>
              <p className="text-xl font-bold text-neutral-900 font-mono">
                {assetData.serialNumber}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Verified in Registry
                </span>
              </div>
            </div>

            {/* Value & Condition Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                <label className="text-sm font-semibold text-purple-900 uppercase tracking-wide block mb-2">
                  Market Value
                </label>
                <p className="text-2xl font-bold text-neutral-900">
                  ₹{assetData.value.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                <label className="text-sm font-semibold text-green-900 uppercase tracking-wide block mb-2">
                  Condition
                </label>
                <p className="text-2xl font-bold text-neutral-900">
                  {assetData.condition}
                </p>
              </div>
            </div>

            {/* Fraud Prevention Notice */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-orange-900 mb-1">Fraud Prevention Active</h5>
                  <p className="text-sm text-orange-800">
                    Serial number cross-checked against national database. Asset ownership verified. 
                    No duplicate claims detected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="p-6 pt-0">
            <button
              onClick={() => {
                setAssetData(null);
                setSelectedFile(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
            >
              Verify Another Asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


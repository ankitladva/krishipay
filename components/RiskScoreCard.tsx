'use client';

import { TrendingUp, Cloud, Leaf, TrendingDown, Shield, BarChart3 } from 'lucide-react';

interface RiskFactor {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
  icon: any;
}

interface Props {
  userId?: string;
}

export default function RiskScoreCard({ userId }: Props) {
  // Hardcoded predictive agri risk score data
  const riskScore = 782; // Out of 900
  const cibilScore = 720;
  
  const riskFactors: RiskFactor[] = [
    {
      name: 'Weather Forecast',
      value: 'Favorable (Next 90 days)',
      impact: 'positive',
      icon: Cloud
    },
    {
      name: 'Last Season Yield',
      value: '+23% Above Average',
      impact: 'positive',
      icon: TrendingUp
    },
    {
      name: 'Crop Market Price',
      value: '₹2,850/quintal (Stable)',
      impact: 'positive',
      icon: BarChart3
    },
    {
      name: 'Soil Health Index',
      value: '8.2/10 (Excellent)',
      impact: 'positive',
      icon: Leaf
    },
    {
      name: 'Regional Pest Alert',
      value: 'Low Risk',
      impact: 'positive',
      icon: Shield
    },
    {
      name: 'Water Availability',
      value: 'Adequate (95%)',
      impact: 'positive',
      icon: TrendingUp
    }
  ];

  const getRiskGrade = (score: number) => {
    if (score >= 750) return { grade: 'A+', color: 'green', label: 'Excellent Risk Profile' };
    if (score >= 650) return { grade: 'A', color: 'blue', label: 'Good Risk Profile' };
    if (score >= 550) return { grade: 'B', color: 'yellow', label: 'Moderate Risk' };
    return { grade: 'C', color: 'red', label: 'High Risk' };
  };

  const riskGrade = getRiskGrade(riskScore);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-3 border-purple-200 rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-6 h-6" />
              <span className="text-sm font-medium text-purple-100">Predictive Agri Risk Scoring</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {riskScore}/900
            </h3>
            <p className="text-purple-100">
              {riskGrade.label}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${
              riskGrade.color === 'green' ? 'from-green-400 to-emerald-500' :
              riskGrade.color === 'blue' ? 'from-blue-400 to-cyan-500' :
              riskGrade.color === 'yellow' ? 'from-yellow-400 to-orange-500' :
              'from-red-400 to-pink-500'
            } flex items-center justify-center shadow-2xl border-4 border-white`}>
              <span className="text-4xl font-bold text-white">{riskGrade.grade}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison with CIBIL */}
      <div className="p-6 bg-white border-b-2 border-purple-100">
        <h4 className="text-lg font-bold text-neutral-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <span>Score Comparison</span>
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-900 font-medium mb-2">Traditional CIBIL</p>
            <p className="text-3xl font-bold text-neutral-900">{cibilScore}</p>
            <p className="text-xs text-neutral-600 mt-1">Credit History Only</p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center">
            <p className="text-sm text-purple-900 font-medium mb-2">KisanSetu Agri Score</p>
            <p className="text-3xl font-bold text-neutral-900">{riskScore}</p>
            <p className="text-xs text-neutral-600 mt-1">Holistic Farmer Profile</p>
          </div>
        </div>
        <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 rounded-lg p-3">
          <p className="text-sm text-purple-900 font-medium text-center">
            <span className="text-green-600 font-bold">+{riskScore - cibilScore} points</span> more fair assessment
          </p>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="p-6 space-y-3">
        <h4 className="text-lg font-bold text-neutral-900 mb-4">
          Real-Time Risk Factors
        </h4>
        
        {riskFactors.map((factor, index) => {
          const Icon = factor.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                factor.impact === 'positive'
                  ? 'bg-green-50 border-green-200'
                  : factor.impact === 'negative'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    factor.impact === 'positive'
                      ? 'bg-green-200'
                      : factor.impact === 'negative'
                      ? 'bg-red-200'
                      : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      factor.impact === 'positive'
                        ? 'text-green-700'
                        : factor.impact === 'negative'
                        ? 'text-red-700'
                        : 'text-gray-700'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">
                      {factor.name}
                    </p>
                    <p className="text-neutral-700 font-medium">
                      {factor.value}
                    </p>
                  </div>
                </div>
                {factor.impact === 'positive' && (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                )}
                {factor.impact === 'negative' && (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="p-6 pt-0">
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200 rounded-2xl p-4">
          <p className="text-sm text-indigo-900 text-center">
            <span className="font-bold">✨ Beyond CIBIL:</span> Our AI analyzes weather patterns, crop yields, 
            market trends, and soil health to create a fairer risk profile for farmers.
          </p>
        </div>
      </div>
    </div>
  );
}


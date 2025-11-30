'use client';

import { CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign, Calendar, Percent } from 'lucide-react';

interface LoanProduct {
  id: string;
  name: string;
  amount: string;
  interest: string;
  tenure: string;
  eligibility: 'approved' | 'review' | 'rejected';
  matchScore: number;
  reason: string;
}

interface Props {
  farmerProfile?: any;
  onSelectLoan?: (loanId: string) => void;
}

export default function LoanPreFilter({ farmerProfile, onSelectLoan }: Props) {
  // Hardcoded loan pre-filtering results
  const loanProducts: LoanProduct[] = [
    {
      id: 'LOAN-001',
      name: 'Tractor Purchase Scheme',
      amount: '₹3.5-5 Lakh',
      interest: '7.5% p.a.',
      tenure: '5 years',
      eligibility: 'approved',
      matchScore: 94,
      reason: 'Excellent match based on your land area (2.5 hectares), strong risk score (782), and favorable weather forecast.'
    },
    {
      id: 'LOAN-002',
      name: 'Dairy Farm Expansion',
      amount: '₹2-4 Lakh',
      interest: '8.0% p.a.',
      tenure: '3 years',
      eligibility: 'approved',
      matchScore: 88,
      reason: 'Good match. Your livestock verification shows healthy cattle. Market demand for dairy is high in your region.'
    },
    {
      id: 'LOAN-003',
      name: 'Kisan Credit Card',
      amount: '₹3 Lakh',
      interest: '4.0% p.a.',
      tenure: 'Revolving',
      eligibility: 'approved',
      matchScore: 91,
      reason: 'Pre-approved! Perfect for seasonal crop needs. Low interest with government subsidy.'
    },
    {
      id: 'LOAN-004',
      name: 'Land Purchase Loan',
      amount: '₹10-15 Lakh',
      interest: '9.5% p.a.',
      tenure: '15 years',
      eligibility: 'review',
      matchScore: 68,
      reason: 'Under review. Requires additional collateral or guarantor due to higher loan amount.'
    },
    {
      id: 'LOAN-005',
      name: 'Commercial Farming Loan',
      amount: '₹25+ Lakh',
      interest: '10.5% p.a.',
      tenure: '10 years',
      eligibility: 'rejected',
      matchScore: 45,
      reason: 'Not recommended currently. Minimum 5 hectares land required. Consider after expanding operations.'
    }
  ];

  const getEligibilityBadge = (eligibility: string) => {
    switch (eligibility) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'green',
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-800',
          label: 'Pre-Approved'
        };
      case 'review':
        return {
          icon: AlertCircle,
          color: 'yellow',
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          label: 'Under Review'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'red',
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-800',
          label: 'Not Eligible'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'gray',
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-800',
          label: 'Unknown'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-full mb-4">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-semibold text-teal-900">AI-Powered Loan Pre-Filtering</span>
        </div>
        <h3 className="text-3xl font-bold text-neutral-900 mb-2">
          स्वचालित ऋण प्री-फ़िल्टरिंग
        </h3>
        <p className="text-lg text-neutral-600">
          Automated Loan Product Recommendations
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-neutral-900">3</p>
          <p className="text-sm text-neutral-600 font-medium">Pre-Approved</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
          <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-neutral-900">1</p>
          <p className="text-sm text-neutral-600 font-medium">Under Review</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-neutral-900">1</p>
          <p className="text-sm text-neutral-600 font-medium">Not Eligible</p>
        </div>
      </div>

      {/* Loan Products */}
      <div className="space-y-4">
        {loanProducts.map((loan) => {
          const badge = getEligibilityBadge(loan.eligibility);
          const Icon = badge.icon;

          return (
            <div
              key={loan.id}
              className={`bg-white border-2 ${badge.border} rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                loan.eligibility === 'approved' ? 'hover:scale-105' : ''
              }`}
            >
              {/* Loan Header */}
              <div className={`p-4 ${badge.bg} border-b-2 ${badge.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-6 h-6 ${badge.text}`} />
                    <div>
                      <h4 className="text-xl font-bold text-neutral-900">
                        {loan.name}
                      </h4>
                      <p className={`text-sm font-medium ${badge.text}`}>
                        {badge.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${badge.text}`}>
                      {loan.matchScore}%
                    </div>
                    <div className="text-xs text-neutral-600">Match Score</div>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="p-4 space-y-4">
                {/* Loan Terms Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                    <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-neutral-600 mb-1">Amount</p>
                    <p className="text-sm font-bold text-neutral-900">{loan.amount}</p>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 text-center">
                    <Percent className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-neutral-600 mb-1">Interest</p>
                    <p className="text-sm font-bold text-neutral-900">{loan.interest}</p>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 text-center">
                    <Calendar className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-xs text-neutral-600 mb-1">Tenure</p>
                    <p className="text-sm font-bold text-neutral-900">{loan.tenure}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-neutral-700">
                    <span className="font-bold text-neutral-900">AI Analysis:</span> {loan.reason}
                  </p>
                </div>

                {/* Action Button */}
                {loan.eligibility === 'approved' && (
                  <button
                    onClick={() => onSelectLoan?.(loan.id)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                  >
                    <span>Apply for This Loan</span>
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                {loan.eligibility === 'review' && (
                  <button
                    disabled
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-xl opacity-75 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>Additional Documents Required</span>
                    <AlertCircle className="w-5 h-5" />
                  </button>
                )}
                {loan.eligibility === 'rejected' && (
                  <button
                    disabled
                    className="w-full py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-xl opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>Not Eligible</span>
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6">
        <h4 className="font-bold text-neutral-900 mb-2 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          <span>How Pre-Filtering Works</span>
        </h4>
        <div className="space-y-2 text-sm text-neutral-700">
          <p>✅ <span className="font-semibold">Profile Analysis:</span> We analyze your land size, assets, and farming history</p>
          <p>✅ <span className="font-semibold">Collateral Verification:</span> Cross-check with verified assets and property</p>
          <p>✅ <span className="font-semibold">Risk Assessment:</span> Use your Agri Risk Score (782/900) for fair evaluation</p>
          <p>✅ <span className="font-semibold">Smart Matching:</span> Suggest loans with highest approval probability</p>
        </div>
      </div>
    </div>
  );
}


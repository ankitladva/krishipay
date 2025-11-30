'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { IScheme } from '@/lib/models/Scheme';
import { ArrowRight } from 'lucide-react';

interface SchemeCardProps {
  scheme: IScheme | {
    _id?: string;
    title: string;
    description: string;
    benefits: string;
    icon: string;
    loanType: string;
  };
  onClick?: () => void;
  selected?: boolean;
}

export default function SchemeCard({ scheme, onClick, selected = false }: SchemeCardProps) {
  const IconComponent = (Icons as any)[scheme.icon] || Icons.Sprout;

  return (
    <div
      onClick={onClick}
      className={`
        group relative glass card-shadow rounded-3xl p-6 
        transition-all duration-500 cursor-pointer
        hover:scale-105 hover:shadow-glow
        ${selected ? 'ring-2 ring-primary-500 shadow-glow' : ''}
      `}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-teal-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Icon with Modern Design */}
        <div className="mb-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-primary-500 to-teal-500 p-4 rounded-2xl transform group-hover:scale-110 transition-transform duration-300">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
            {scheme.title}
          </h3>
          
          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">
            {scheme.description}
          </p>

          {/* Benefits */}
          <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full border border-primary-200">
            <span className="text-sm font-semibold text-primary-700">
              {scheme.benefits}
            </span>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="mt-6 flex items-center text-primary-600 font-medium">
          <span className="text-sm">Learn More</span>
          <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

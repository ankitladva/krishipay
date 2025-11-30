'use client';

import React from 'react';
import { MapPin, TrendingUp } from 'lucide-react';

interface MapViewerProps {
  latitude?: number;
  longitude?: number;
  valuation?: number;
  confidence?: number;
  factors?: string[];
}

export default function MapViewer({
  latitude = 19.0760,
  longitude = 72.8777,
  valuation = 500000,
  confidence = 0.85,
  factors = [],
}: MapViewerProps) {
  // In production, this would use Google Maps, Mapbox, or Leaflet
  // For now, we'll use a static representation

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mock Map Display */}
      <div className="relative h-64 bg-gradient-to-br from-green-100 via-green-200 to-green-300">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-neutral-400"></div>
            ))}
          </div>
        </div>

        {/* Center Pin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <MapPin size={64} className="text-danger drop-shadow-lg animate-bounce-slow" />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-danger/30 rounded-full blur-sm"></div>
          </div>
        </div>

        {/* Coordinates Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
          <p className="text-xs text-neutral-600">
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </p>
        </div>
      </div>

      {/* Valuation Info */}
      <div className="p-6 space-y-4">
        {/* Main Valuation */}
        <div className="flex items-center justify-between bg-success-light/20 rounded-lg p-4">
          <div>
            <p className="text-sm text-neutral-600 mb-1">भूमि मूल्यांकन</p>
            <p className="text-3xl font-bold text-success-dark">
              ₹{valuation.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-success rounded-full p-3">
            <TrendingUp size={32} className="text-white" />
          </div>
        </div>

        {/* Confidence Meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-neutral-700">सत्यापन विश्वास स्तर</p>
            <p className="text-sm font-bold text-primary">{(confidence * 100).toFixed(0)}%</p>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div
              className="bg-success h-3 rounded-full transition-all duration-500"
              style={{ width: `${confidence * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Factors */}
        {factors.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-neutral-700 mb-2">सत्यापन कारक:</p>
            <ul className="space-y-1">
              {factors.map((factor, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-neutral-600">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Verified Badge */}
        <div className="flex items-center justify-center space-x-2 bg-primary-light/10 text-primary-dark py-3 rounded-lg">
          <MapPin size={20} />
          <span className="font-semibold">सैटेलाइट द्वारा सत्यापित</span>
        </div>
      </div>
    </div>
  );
}


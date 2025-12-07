'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2, Sparkles } from 'lucide-react';

interface DocumentUploadCardProps {
  title: string;
  description: string;
  documentType: 'land_record' | 'equipment_photo' | 'id_proof' | 'other';
  onUpload: (file: File, type: string) => Promise<void>;
  icon?: React.ReactNode;
  uploaded?: boolean;
}

export default function DocumentUploadCard({
  title,
  description,
  documentType,
  onUpload,
  icon,
  uploaded = false,
}: DocumentUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('कृपया JPG, PNG, या WebP फाइल अपलोड करें');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('फाइल का आकार 10MB से कम होना चाहिए');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file, documentType);
    } catch (error) {
      console.error('Upload error:', error);
      alert('अपलोड विफल। कृपया पुनः प्रयास करें।');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!isUploading && !uploaded) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative
        bg-white rounded-2xl shadow-xl p-10
        border-4 border-dashed
        transition-all duration-500
        touch-target-xl
        ${uploaded ? 'border-green-500 bg-green-50 shadow-green-500/20 transform scale-105' : 'border-neutral-300'}
        ${isDragging ? 'border-amber-500 bg-amber-50 scale-105 shadow-2xl' : ''}
        ${isUploading ? 'cursor-wait animate-pulse' : 'cursor-pointer hover:scale-105 hover:shadow-2xl hover:border-green-400'}
      `}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon with Enhanced  Effects */}
        <div
          className={`
            p-8 rounded-2xl shadow-lg transition-all duration-300
            ${uploaded ? 'bg-gradient-to-br from-green-500 to-teal-600' : isUploading ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}
          `}
        >
          {isUploading ? (
            <div className="relative">
              <Loader2 size={56} className="text-white animate-spin" />
              <Sparkles size={24} className="text-white absolute -top-2 -right-2 animate-pulse" />
            </div>
          ) : uploaded ? (
            <CheckCircle size={56} className="text-white animate-bounce-slow" />
          ) : icon ? (
            <div className="text-white">{icon}</div>
          ) : (
            <Upload size={56} className="text-white" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-neutral-900">
          {title}
        </h3>

        {/* Description */}
        <p className="text-lg text-neutral-700 font-medium">
          {description}
        </p>

        {/* Status with Shimmer Effect */}
        {isUploading && (
          <div className="space-y-3">
            <p className="text-xl text-green-700 font-bold animate-pulse">
              स्कैन हो रहा है...
            </p>
            {/* Shimmer skeleton loader */}
            <div className="space-y-2">
              <div className="h-4 bg-neutral-300 rounded shimmer"></div>
              <div className="h-4 bg-neutral-300 rounded shimmer w-3/4"></div>
              <div className="h-4 bg-neutral-300 rounded shimmer w-1/2"></div>
            </div>
          </div>
        )}
        
        {uploaded && (
          <div className="bg-green-100 border-2 border-green-500 rounded-xl p-4 animate-scale-in shadow-md">
            <p className="text-xl text-green-800 font-bold flex items-center justify-center space-x-2">
              <CheckCircle size={24} className="text-green-700" />
              <span>✓ अपलोड पूर्ण</span>
            </p>
          </div>
        )}

        {!uploaded && !isUploading && (
          <p className="text-sm text-neutral-700 font-medium">
            टैप करें या फाइल खींचें
          </p>
        )}
      </div>
    </div>
  );
}


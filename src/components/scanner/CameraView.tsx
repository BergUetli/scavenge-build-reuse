/**
 * CAMERA VIEW - SIMPLE CAPTURE MODE (v0.8.12)
 * Real-time detection removed - back to simple capture 1 analyze flow
 */

import React, { useEffect, useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  capturedImages: string[];
  isCapturing: boolean;
  onCapture: () => void;
  onUpload: (file: File) => void;
  onRemoveImage: (index: number) => void;
  onAnalyze: () => void;
  onClose: () => void;
}

export function CameraView({
  videoRef,
  capturedImages,
  isCapturing,
  onCapture,
  onUpload,
  onRemoveImage,
  onAnalyze,
  onClose,
}: CameraViewProps) {
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update video size when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSize = () => {
      setVideoSize({ width: video.videoWidth, height: video.videoHeight });
    };

    video.addEventListener('loadedmetadata', updateSize);
    return () => video.removeEventListener('loadedmetadata', updateSize);
  }, [videoRef]);

  // Update display size (actual rendered size on screen)
  useEffect(() => {
    const updateDisplaySize = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setDisplaySize({ width: rect.width, height: rect.height });
    };

    // Initial updates with delays
    setTimeout(updateDisplaySize, 100);
    setTimeout(updateDisplaySize, 300);
    setTimeout(updateDisplaySize, 500);

    window.addEventListener('resize', updateDisplaySize);
    return () => window.removeEventListener('resize', updateDisplaySize);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
  };

  const canAnalyze = capturedImages.length > 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-lg font-semibold">44f7 Scanner</h2>
          <p className="text-sm text-white/60">
            Capture a photo, then Analyze with AI
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera Feed */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Captured Images Preview */}
        {capturedImages.length > 0 && (
          <div className="absolute bottom-20 left-0 right-0 p-4 z-50">
            <div className="flex gap-2 overflow-x-auto">
              {capturedImages.map((img, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <img
                    src={img}
                    alt={`Captured ${index + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-white/20"
                  />
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="flex gap-2">
          <Button
            onClick={onCapture}
            disabled={false}
            className="flex-1"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            Capture
          </Button>

          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload
            </Button>
          </div>

          {canAnalyze && (
            <Button
              onClick={onAnalyze}
              className="flex-1"
              size="lg"
            >
              Analyze ({capturedImages.length})
            </Button>
          )}
        </div>

        {/* Tiny debug line to ensure we still compute sizes */}
        <div className="mt-2 text-xs text-white/30">
          video: {videoSize.width}x{videoSize.height}  display: {Math.round(displaySize.width)}x{Math.round(displaySize.height)}
        </div>
      </div>
    </div>
  );
}

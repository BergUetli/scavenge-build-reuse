/**
 * CAMERA VIEW WITH REAL-TIME DETECTION
 * 
 * Hybrid scanning system:
 * - Real-time mode: Instant object detection with bounding boxes
 * - Full AI mode: Detailed component analysis (current system)
 */

import React, { useEffect, useState } from 'react';
import { Camera, Upload, X, Zap, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtimeDetection, DetectedObject } from '@/hooks/useRealtimeDetection';
import { RealtimeDetectionOverlay } from './RealtimeDetectionOverlay';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  capturedImages: string[];
  isCapturing: boolean;
  onCapture: () => void;
  onUpload: (file: File) => void;
  onRemoveImage: (index: number) => void;
  onAnalyze: () => void;
  onClose: () => void;
  realtimeMode?: boolean;
  onRealtimeModeToggle?: () => void;
  onObjectSelect?: (detection: DetectedObject) => void;
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
  realtimeMode = true,
  onRealtimeModeToggle,
  onObjectSelect
}: CameraViewProps) {
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { 
    isModelLoading, 
    detections, 
    startDetection, 
    stopDetection 
  } = useRealtimeDetection();

  // Update video size when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSize = () => {
      setVideoSize({
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    video.addEventListener('loadedmetadata', updateSize);
    return () => video.removeEventListener('loadedmetadata', updateSize);
  }, [videoRef]);

  // Update display size (actual rendered size on screen)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDisplaySize = () => {
      const rect = container.getBoundingClientRect();
      setDisplaySize({
        width: rect.width,
        height: rect.height
      });
    };

    updateDisplaySize();
    window.addEventListener('resize', updateDisplaySize);
    return () => window.removeEventListener('resize', updateDisplaySize);
  }, []);

  // Start/stop detection based on mode
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !realtimeMode) {
      stopDetection();
      return;
    }

    // Wait for video to be ready
    if (video.readyState >= 2) {
      startDetection(video);
    } else {
      const handleCanPlay = () => startDetection(video);
      video.addEventListener('canplay', handleCanPlay);
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        stopDetection();
      };
    }

    return () => stopDetection();
  }, [realtimeMode, videoRef, startDetection, stopDetection]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">
            {realtimeMode ? '⚡ Real-Time Scanner' : '🧠 AI Scanner'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Mode Toggle */}
        {onRealtimeModeToggle && (
          <div className="mt-3 flex gap-2">
            <Button
              onClick={onRealtimeModeToggle}
              size="sm"
              variant={realtimeMode ? "default" : "outline"}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Real-Time
              {realtimeMode && <span className="ml-2 text-xs opacity-70">Active</span>}
            </Button>
            <Button
              onClick={onRealtimeModeToggle}
              size="sm"
              variant={!realtimeMode ? "default" : "outline"}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              Full AI
              {!realtimeMode && <span className="ml-2 text-xs opacity-70">Active</span>}
            </Button>
          </div>
        )}

        {/* Status */}
        {realtimeMode && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {isModelLoading ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading AI model...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>
                  {detections.length > 0 
                    ? `${detections.length} object${detections.length !== 1 ? 's' : ''} detected` 
                    : 'Point camera at objects'}
                </span>
              </div>
            )}
          </div>
        )}
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

        {/* Real-time Detection Overlay */}
        {realtimeMode && !isModelLoading && videoSize.width > 0 && displaySize.width > 0 && (
          <RealtimeDetectionOverlay
            detections={detections}
            videoWidth={videoSize.width}
            videoHeight={videoSize.height}
            displayWidth={displaySize.width}
            displayHeight={displaySize.height}
            onObjectSelect={onObjectSelect}
          />
        )}

        {/* Captured Images Preview */}
        {capturedImages.length > 0 && (
          <div className="absolute bottom-20 left-0 right-0 p-4">
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
        {realtimeMode ? (
          // Real-time mode: Just show instruction
          <div className="text-center">
            <p className="text-white/70 text-sm mb-3">
              {detections.length > 0 
                ? 'Tap any object to analyze it in detail' 
                : 'Point your camera at electronic devices'}
            </p>
            <Button
              onClick={onRealtimeModeToggle}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              Switch to Full AI Scan
            </Button>
          </div>
        ) : (
          // Full AI mode: Capture, Upload, Analyze buttons
          <div className="flex gap-2">
            <Button
              onClick={onCapture}
              disabled={isCapturing}
              className="flex-1"
              size="lg"
            >
              <Camera className="h-5 w-5 mr-2" />
              Capture
            </Button>

            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                as="span"
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload
              </Button>
            </label>

            {capturedImages.length > 0 && (
              <Button
                onClick={onAnalyze}
                variant="default"
                className="flex-1"
                size="lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Analyze
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

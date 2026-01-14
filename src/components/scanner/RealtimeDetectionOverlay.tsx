/**
 * REAL-TIME DETECTION OVERLAY - PRODUCTION VERSION
 * Clean overlay for real-time object detection with mobile optimization
 */

import React from 'react';
import { DetectedObject } from '@/hooks/useRealtimeDetection';

interface RealtimeDetectionOverlayProps {
  detections: DetectedObject[];
  videoWidth: number;
  videoHeight: number;
  displayWidth: number;
  displayHeight: number;
  onObjectSelect?: (detection: DetectedObject) => void;
}

export function RealtimeDetectionOverlay({
  detections,
  videoWidth,
  videoHeight,
  displayWidth,
  displayHeight,
  onObjectSelect
}: RealtimeDetectionOverlayProps) {
  // Don't render if we don't have valid dimensions
  if (!displayWidth || !displayHeight || !videoWidth || !videoHeight) {
    return null;
  }

  // Calculate scale factors
  const scaleX = displayWidth / videoWidth;
  const scaleY = displayHeight / videoHeight;

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        width: displayWidth, 
        height: displayHeight,
        zIndex: 10
      }}
    >
      {detections && detections.length > 0 ? (
        detections.map((detection, index) => {
          const [x, y, width, height] = detection.bbox;
          
          // Scale coordinates from video dimensions to display dimensions
          const scaledX = Math.max(0, Math.min(x * scaleX, displayWidth - 4));
          const scaledY = Math.max(0, Math.min(y * scaleY, displayHeight - 4));
          const scaledWidth = Math.min(width * scaleX, displayWidth - scaledX);
          const scaledHeight = Math.min(height * scaleY, displayHeight - scaledY);
          
          // Skip if box is too small or out of bounds
          if (scaledWidth < 20 || scaledHeight < 20) {
            return null;
          }
          
          const confidence = Math.round(detection.confidence * 100);
          
          // Color based on confidence
          const color = confidence > 80 ? '#22c55e' : // green-500
                       confidence > 60 ? '#eab308' : // yellow-500
                       '#f97316'; // orange-500

          return (
            <button
              key={`detection-${detection.label}-${index}`}
              onClick={() => onObjectSelect?.(detection)}
              className="absolute pointer-events-auto transition-all duration-200 hover:scale-105"
              style={{
                left: `${scaledX}px`,
                top: `${scaledY}px`,
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                border: `3px solid ${color}`,
                borderRadius: '8px',
                boxShadow: `0 0 16px ${color}66`,
                background: 'transparent',
                zIndex: 20
              }}
            >
              {/* Label badge */}
              <div
                className="absolute left-0 px-2 py-1 rounded-md font-semibold text-xs whitespace-nowrap shadow-lg"
                style={{
                  top: scaledY > 30 ? '-28px' : '4px', // Place above or inside box
                  backgroundColor: color,
                  color: '#ffffff',
                  maxWidth: `${scaledWidth}px`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {detection.label} {confidence}%
              </div>

              {/* Corner markers for better visibility */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color }} />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: color }} />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: color }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: color }} />
            </button>
          );
        })
      ) : (
        // Subtle hint when no detections
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white/70 rounded-lg text-sm text-center">
          Point camera at objects to detect
        </div>
      )}
    </div>
  );
}

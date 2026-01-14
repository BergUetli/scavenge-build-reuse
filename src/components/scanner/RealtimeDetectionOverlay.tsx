/**
 * REAL-TIME DETECTION OVERLAY - MOBILE OPTIMIZED
 * 
 * Displays bounding boxes and labels over camera feed
 * Properly scales coordinates for mobile screens
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
  if (!detections || detections.length === 0) {
    return null;
  }

  // Calculate scale factors to map from video coordinates to display coordinates
  const scaleX = displayWidth / videoWidth;
  const scaleY = displayHeight / videoHeight;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ width: displayWidth, height: displayHeight }}
    >
      {detections.map((detection, index) => {
        const [x, y, width, height] = detection.bbox;
        
        // Scale coordinates to match display size
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;
        
        // Skip if box is outside viewport
        if (scaledX + scaledWidth < 0 || scaledX > displayWidth ||
            scaledY + scaledHeight < 0 || scaledY > displayHeight) {
          return null;
        }
        
        const confidence = Math.round(detection.confidence * 100);
        
        // Color based on confidence
        const color = confidence > 80 ? '#00FF00' : 
                     confidence > 60 ? '#FFFF00' : '#FF6600';

        // Clamp label position to keep it visible
        const labelTop = Math.max(4, scaledY - 28);
        const labelLeft = Math.max(4, Math.min(scaledX, displayWidth - 120));

        return (
          <button
            key={`detection-${index}`}
            onClick={() => onObjectSelect?.(detection)}
            className="absolute pointer-events-auto group cursor-pointer touch-manipulation"
            style={{
              left: `${Math.max(0, scaledX)}px`,
              top: `${Math.max(0, scaledY)}px`,
              width: `${Math.min(scaledWidth, displayWidth - scaledX)}px`,
              height: `${Math.min(scaledHeight, displayHeight - scaledY)}px`,
              border: `3px solid ${color}`,
              boxShadow: `0 0 15px ${color}80, inset 0 0 15px ${color}20`,
              transition: 'all 0.15s',
              background: 'transparent',
              minWidth: '40px',
              minHeight: '40px'
            }}
          >
            {/* Label - positioned to stay in viewport */}
            <div
              className="absolute px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-xl"
              style={{
                left: `${labelLeft - scaledX}px`,
                top: `${labelTop - scaledY}px`,
                backgroundColor: color,
                color: '#000',
                zIndex: 10,
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {detection.label} {confidence}%
            </div>

            {/* Tap hint - only show on tap/hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity">
              <div 
                className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md"
                style={{
                  backgroundColor: `${color}CC`,
                  color: '#000',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                Analyzing...
              </div>
            </div>

            {/* Corner markers - scaled for visibility */}
            <div 
              className="absolute top-0 left-0 border-t-3 border-l-3" 
              style={{ 
                borderColor: color,
                width: Math.min(16, scaledWidth * 0.25),
                height: Math.min(16, scaledHeight * 0.25),
                borderTopWidth: '3px',
                borderLeftWidth: '3px'
              }} 
            />
            <div 
              className="absolute top-0 right-0 border-t-3 border-r-3" 
              style={{ 
                borderColor: color,
                width: Math.min(16, scaledWidth * 0.25),
                height: Math.min(16, scaledHeight * 0.25),
                borderTopWidth: '3px',
                borderRightWidth: '3px'
              }} 
            />
            <div 
              className="absolute bottom-0 left-0 border-b-3 border-l-3" 
              style={{ 
                borderColor: color,
                width: Math.min(16, scaledWidth * 0.25),
                height: Math.min(16, scaledHeight * 0.25),
                borderBottomWidth: '3px',
                borderLeftWidth: '3px'
              }} 
            />
            <div 
              className="absolute bottom-0 right-0 border-b-3 border-r-3" 
              style={{ 
                borderColor: color,
                width: Math.min(16, scaledWidth * 0.25),
                height: Math.min(16, scaledHeight * 0.25),
                borderBottomWidth: '3px',
                borderRightWidth: '3px'
              }} 
            />
          </button>
        );
      })}
    </div>
  );
}

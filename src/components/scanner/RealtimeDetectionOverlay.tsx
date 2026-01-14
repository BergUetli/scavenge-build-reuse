/**
 * REAL-TIME DETECTION OVERLAY - MOBILE OPTIMIZED WITH DEBUGGING
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
  console.log('[Overlay] Render:', {
    detectionsCount: detections.length,
    videoSize: `${videoWidth}x${videoHeight}`,
    displaySize: `${displayWidth}x${displayHeight}`
  });

  if (!detections || detections.length === 0) {
    console.log('[Overlay] No detections to display');
    return null;
  }

  if (videoWidth === 0 || videoHeight === 0) {
    console.log('[Overlay] Video dimensions not ready');
    return null;
  }

  if (displayWidth === 0 || displayHeight === 0) {
    console.log('[Overlay] Display dimensions not ready');
    return null;
  }

  // Calculate scale factors to map from video coordinates to display coordinates
  const scaleX = displayWidth / videoWidth;
  const scaleY = displayHeight / videoHeight;

  console.log('[Overlay] Scale factors:', { scaleX, scaleY });

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ 
        width: displayWidth, 
        height: displayHeight,
        zIndex: 10
      }}
    >
      {detections.map((detection, index) => {
        const [x, y, width, height] = detection.bbox;
        
        // Scale coordinates to match display size
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;
        
        console.log(`[Overlay] Detection ${index}:`, {
          label: detection.label,
          confidence: detection.confidence,
          original: { x, y, width, height },
          scaled: { 
            x: scaledX.toFixed(0), 
            y: scaledY.toFixed(0), 
            width: scaledWidth.toFixed(0), 
            height: scaledHeight.toFixed(0) 
          }
        });
        
        // Skip if box is completely outside viewport
        if (scaledX + scaledWidth < 0 || scaledX > displayWidth ||
            scaledY + scaledHeight < 0 || scaledY > displayHeight) {
          console.log(`[Overlay] Detection ${index} outside viewport, skipping`);
          return null;
        }
        
        const confidence = Math.round(detection.confidence * 100);
        
        // Color based on confidence
        const color = confidence > 80 ? '#00FF00' : 
                     confidence > 60 ? '#FFFF00' : '#FF6600';

        // Clamp label position to keep it visible
        const labelTop = Math.max(28, scaledY);
        const labelLeft = Math.max(4, Math.min(scaledX, displayWidth - 120));

        const boxLeft = Math.max(0, scaledX);
        const boxTop = Math.max(0, scaledY);
        const boxWidth = Math.min(scaledWidth, displayWidth - boxLeft);
        const boxHeight = Math.min(scaledHeight, displayHeight - boxTop);

        return (
          <button
            key={`detection-${index}-${detection.label}`}
            onClick={() => onObjectSelect?.(detection)}
            className="absolute pointer-events-auto group cursor-pointer touch-manipulation"
            style={{
              left: `${boxLeft}px`,
              top: `${boxTop}px`,
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
              border: `3px solid ${color}`,
              boxShadow: `0 0 15px ${color}80, inset 0 0 15px ${color}20`,
              transition: 'all 0.15s',
              background: 'rgba(0, 0, 0, 0.05)',
              minWidth: '40px',
              minHeight: '40px',
              zIndex: 20
            }}
          >
            {/* Label - positioned above box */}
            <div
              className="absolute px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap shadow-xl"
              style={{
                left: `${labelLeft - boxLeft}px`,
                top: '-32px',
                backgroundColor: color,
                color: '#000',
                zIndex: 30,
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {detection.label} {confidence}%
            </div>

            {/* Tap hint - show on tap */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity">
              <div 
                className="px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md shadow-lg"
                style={{
                  backgroundColor: `${color}DD`,
                  color: '#000'
                }}
              >
                Analyzing...
              </div>
            </div>

            {/* Corner markers - more visible */}
            <div 
              className="absolute top-0 left-0" 
              style={{ 
                borderTop: `4px solid ${color}`,
                borderLeft: `4px solid ${color}`,
                width: '20px',
                height: '20px'
              }} 
            />
            <div 
              className="absolute top-0 right-0" 
              style={{ 
                borderTop: `4px solid ${color}`,
                borderRight: `4px solid ${color}`,
                width: '20px',
                height: '20px'
              }} 
            />
            <div 
              className="absolute bottom-0 left-0" 
              style={{ 
                borderBottom: `4px solid ${color}`,
                borderLeft: `4px solid ${color}`,
                width: '20px',
                height: '20px'
              }} 
            />
            <div 
              className="absolute bottom-0 right-0" 
              style={{ 
                borderBottom: `4px solid ${color}`,
                borderRight: `4px solid ${color}`,
                width: '20px',
                height: '20px'
              }} 
            />
          </button>
        );
      })}
    </div>
  );
}

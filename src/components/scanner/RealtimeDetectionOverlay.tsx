/**
 * REAL-TIME DETECTION OVERLAY - WITH TEST BOX
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
  console.log('[Overlay] Props:', {
    detectionsCount: detections?.length || 0,
    videoSize: `${videoWidth}x${videoHeight}`,
    displaySize: `${displayWidth}x${displayHeight}`,
    hasDetections: detections && detections.length > 0
  });

  // Always show a test box in center of screen
  const testBox = {
    left: displayWidth / 2 - 100,
    top: displayHeight / 2 - 100,
    width: 200,
    height: 200
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        width: displayWidth, 
        height: displayHeight,
        zIndex: 10,
        border: '2px dashed white' // Debug: show overlay boundaries
      }}
    >
      {/* TEST BOX - Always visible */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: `${testBox.left}px`,
          top: `${testBox.top}px`,
          width: `${testBox.width}px`,
          height: `${testBox.height}px`,
          border: '4px solid #FF00FF',
          background: 'rgba(255, 0, 255, 0.1)',
          zIndex: 20
        }}
      >
        <div
          className="absolute -top-8 left-0 px-3 py-1 rounded bg-pink-500 text-white font-bold text-sm"
        >
          TEST BOX - If you see this, overlay works!
        </div>
      </div>

      {/* Actual detections */}
      {detections && detections.length > 0 && videoWidth > 0 && videoHeight > 0 && displayWidth > 0 && displayHeight > 0 ? (
        detections.map((detection, index) => {
          const [x, y, width, height] = detection.bbox;
          
          // Scale coordinates
          const scaleX = displayWidth / videoWidth;
          const scaleY = displayHeight / videoHeight;
          
          const scaledX = x * scaleX;
          const scaledY = y * scaleY;
          const scaledWidth = width * scaleX;
          const scaledHeight = height * scaleY;
          
          console.log(`[Overlay] Box ${index}:`, {
            label: detection.label,
            confidence: detection.confidence,
            original: { x, y, width, height },
            scaled: { x: scaledX, y: scaledY, width: scaledWidth, height: scaledHeight }
          });
          
          const confidence = Math.round(detection.confidence * 100);
          const color = confidence > 80 ? '#00FF00' : confidence > 60 ? '#FFFF00' : '#FF6600';

          return (
            <button
              key={`detection-${index}`}
              onClick={() => onObjectSelect?.(detection)}
              className="absolute pointer-events-auto"
              style={{
                left: `${Math.max(0, scaledX)}px`,
                top: `${Math.max(0, scaledY)}px`,
                width: `${Math.min(scaledWidth, displayWidth - scaledX)}px`,
                height: `${Math.min(scaledHeight, displayHeight - scaledY)}px`,
                border: `4px solid ${color}`,
                boxShadow: `0 0 20px ${color}`,
                background: `rgba(255, 255, 255, 0.1)`,
                zIndex: 20,
                minWidth: '40px',
                minHeight: '40px'
              }}
            >
              {/* Label */}
              <div
                className="absolute -top-8 left-0 px-3 py-1 rounded font-bold text-sm whitespace-nowrap"
                style={{
                  backgroundColor: color,
                  color: '#000'
                }}
              >
                {detection.label} {confidence}%
              </div>
            </button>
          );
        })
      ) : (
        <div
          className="absolute top-4 left-4 px-4 py-2 bg-red-500/80 text-white rounded font-bold text-sm"
        >
          No detections yet - Point at objects
          <div className="text-xs mt-1">
            Video: {videoWidth}x{videoHeight} | Display: {displayWidth}x{displayHeight}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * REAL-TIME DETECTION OVERLAY
 * 
 * Displays bounding boxes and labels over camera feed
 * Shows detected objects instantly as you move the camera
 */

import React from 'react';
import { DetectedObject } from '@/hooks/useRealtimeDetection';

interface RealtimeDetectionOverlayProps {
  detections: DetectedObject[];
  videoWidth: number;
  videoHeight: number;
  onObjectSelect?: (detection: DetectedObject) => void;
}

export function RealtimeDetectionOverlay({
  detections,
  videoWidth,
  videoHeight,
  onObjectSelect
}: RealtimeDetectionOverlayProps) {
  if (!detections || detections.length === 0) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ width: videoWidth, height: videoHeight }}
    >
      {detections.map((detection, index) => {
        const [x, y, width, height] = detection.bbox;
        const confidence = Math.round(detection.confidence * 100);
        
        // Color based on confidence
        const color = confidence > 80 ? '#00FF00' : 
                     confidence > 60 ? '#FFFF00' : '#FF6600';

        return (
          <button
            key={`detection-${index}`}
            onClick={() => onObjectSelect?.(detection)}
            className="absolute pointer-events-auto group cursor-pointer"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${width}px`,
              height: `${height}px`,
              border: `2px solid ${color}`,
              boxShadow: `0 0 10px ${color}40`,
              transition: 'all 0.2s',
              background: 'transparent'
            }}
          >
            {/* Label */}
            <div
              className="absolute -top-7 left-0 px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg group-hover:scale-110 transition-transform"
              style={{
                backgroundColor: color,
                color: '#000',
              }}
            >
              {detection.label} {confidence}%
            </div>

            {/* Tap hint */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div 
                className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                style={{
                  backgroundColor: `${color}80`,
                  color: '#000'
                }}
              >
                Tap to analyze
              </div>
            </div>

            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color }} />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: color }} />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: color }} />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: color }} />
          </button>
        );
      })}
    </div>
  );
}

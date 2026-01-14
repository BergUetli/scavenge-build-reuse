/**
 * REAL-TIME OBJECT DETECTION HOOK - ENHANCED DEBUGGING
 */

import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export interface DetectedObject {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export function useRealtimeDetection() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const animationFrameId = useRef<number>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastDetectionTime = useRef<number>(0);
  const isDetecting = useRef<boolean>(false);
  const detectionCount = useRef<number>(0);

  // Load model on mount
  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        console.log('[RT Detection] 🚀 Starting model load...');
        const startTime = Date.now();
        
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2' // Fastest model for mobile
        });
        
        const loadTime = Date.now() - startTime;
        console.log(`[RT Detection] ✅ Model loaded in ${loadTime}ms`);
        
        if (mounted) {
          setModel(loadedModel);
          setIsModelLoading(false);
        }
      } catch (error) {
        console.error('[RT Detection] ❌ Failed to load model:', error);
        setIsModelLoading(false);
      }
    }

    loadModel();

    return () => {
      mounted = false;
    };
  }, []);

  // Start detection loop with throttling
  const startDetection = (video: HTMLVideoElement) => {
    if (!model) {
      console.warn('[RT Detection] ⚠️ Cannot start - model not loaded');
      return;
    }

    console.log('[RT Detection] 🎬 Starting detection loop');
    videoRef.current = video;
    isDetecting.current = false;
    detectionCount.current = 0;

    const detect = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        console.log('[RT Detection] ⏸️ Video not ready, stopping');
        return;
      }

      const now = Date.now();
      
      // Throttle detection to max 3 FPS (333ms between detections)
      if (!isDetecting.current && now - lastDetectionTime.current >= 333) {
        isDetecting.current = true;
        lastDetectionTime.current = now;
        detectionCount.current++;

        try {
          const detectStart = Date.now();
          const predictions = await model.detect(videoRef.current, 10); // Increase to 10 max objects
          const detectTime = Date.now() - detectStart;
          
          // Lower threshold to 30% for more detections
          const filteredPredictions = predictions.filter(pred => pred.score > 0.3);
          
          if (detectionCount.current % 10 === 1) { // Log every 10th detection
            console.log(`[RT Detection] 📊 Detection #${detectionCount.current}:`, {
              totalPredictions: predictions.length,
              filtered: filteredPredictions.length,
              detectTime: `${detectTime}ms`
            });
          }
          
          if (filteredPredictions.length > 0) {
            console.log('[RT Detection] 🎯 Found:', filteredPredictions.map(p => 
              `${p.class} (${(p.score * 100).toFixed(0)}%)`
            ).join(', '));
          }
          
          // Convert to our format
          const detectedObjects: DetectedObject[] = filteredPredictions.map(pred => ({
            label: pred.class,
            confidence: pred.score,
            bbox: pred.bbox as [number, number, number, number]
          }));

          setDetections(detectedObjects);
        } catch (error) {
          console.error('[RT Detection] ❌ Detection error:', error);
        } finally {
          isDetecting.current = false;
        }
      }

      // Continue loop
      animationFrameId.current = requestAnimationFrame(detect);
    };

    detect();
  };

  // Stop detection loop
  const stopDetection = () => {
    console.log('[RT Detection] 🛑 Stopping detection');
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setDetections([]);
    isDetecting.current = false;
  };

  return {
    model,
    isModelLoading,
    detections,
    startDetection,
    stopDetection
  };
}

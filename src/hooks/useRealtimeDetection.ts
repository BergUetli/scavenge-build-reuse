/**
 * REAL-TIME OBJECT DETECTION HOOK - MOBILE OPTIMIZED
 * 
 * Uses TensorFlow.js COCO-SSD for instant object detection
 * Runs entirely in the browser, no server calls needed
 * Optimized for mobile performance with throttling
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

  // Load model on mount
  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        console.log('[RT Detection] Loading COCO-SSD model...');
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2' // Fastest model for mobile
        });
        
        if (mounted) {
          setModel(loadedModel);
          setIsModelLoading(false);
          console.log('[RT Detection] Model loaded!');
        }
      } catch (error) {
        console.error('[RT Detection] Failed to load model:', error);
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
      console.warn('[RT Detection] Model not loaded yet');
      return;
    }

    videoRef.current = video;
    isDetecting.current = false;

    const detect = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }

      const now = Date.now();
      
      // Throttle detection to max 3 FPS (333ms between detections) for mobile performance
      // This prevents UI slowdown while still feeling responsive
      if (!isDetecting.current && now - lastDetectionTime.current >= 333) {
        isDetecting.current = true;
        lastDetectionTime.current = now;

        try {
          const predictions = await model.detect(videoRef.current, 5); // Max 5 detections
          
          // Filter by confidence (only show confident detections)
          const filteredPredictions = predictions.filter(pred => pred.score > 0.5);
          
          // Convert to our format
          const detectedObjects: DetectedObject[] = filteredPredictions.map(pred => ({
            label: pred.class,
            confidence: pred.score,
            bbox: pred.bbox as [number, number, number, number]
          }));

          setDetections(detectedObjects);
        } catch (error) {
          console.error('[RT Detection] Detection error:', error);
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

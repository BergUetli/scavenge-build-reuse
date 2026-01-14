/**
 * REAL-TIME OBJECT DETECTION HOOK - PRODUCTION VERSION
 * Uses TensorFlow.js COCO-SSD for in-browser object detection
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
        console.log('[Real-time Detection] Loading model...');
        const startTime = Date.now();
        
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2' // Fastest model for mobile
        });
        
        const loadTime = Date.now() - startTime;
        console.log(`[Real-time Detection] Model loaded in ${loadTime}ms`);
        
        if (mounted) {
          setModel(loadedModel);
          setIsModelLoading(false);
        }
      } catch (error) {
        console.error('[Real-time Detection] Failed to load model:', error);
        setIsModelLoading(false);
      }
    }

    loadModel();

    return () => {
      mounted = false;
    };
  }, []);

  // Start detection loop with throttling for mobile performance
  const startDetection = (video: HTMLVideoElement) => {
    if (!model) {
      console.warn('[Real-time Detection] Model not loaded yet');
      return;
    }

    console.log('[Real-time Detection] Starting detection');
    videoRef.current = video;
    isDetecting.current = false;

    const detect = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }

      const now = Date.now();
      
      // Throttle to max 3 FPS (333ms between detections) for mobile performance
      if (!isDetecting.current && now - lastDetectionTime.current >= 333) {
        isDetecting.current = true;
        lastDetectionTime.current = now;

        try {
          // Detect objects (max 8 for performance)
          const predictions = await model.detect(videoRef.current, 8);
          
          // Filter by confidence (30% threshold)
          const filteredPredictions = predictions.filter(pred => pred.score > 0.3);
          
          // Convert to our format
          const detectedObjects: DetectedObject[] = filteredPredictions.map(pred => ({
            label: pred.class,
            confidence: pred.score,
            bbox: pred.bbox as [number, number, number, number]
          }));

          setDetections(detectedObjects);
        } catch (error) {
          console.error('[Real-time Detection] Detection error:', error);
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
    console.log('[Real-time Detection] Stopping detection');
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setDetections([]);
    isDetecting.current = false;
    videoRef.current = null;
  };

  return {
    model,
    isModelLoading,
    detections,
    startDetection,
    stopDetection
  };
}

/**
 * REAL-TIME OBJECT DETECTION HOOK
 * 
 * Uses TensorFlow.js COCO-SSD for instant object detection
 * Runs entirely in the browser, no server calls needed
 * 
 * Performance: <100ms per frame
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

  // Start detection loop
  const startDetection = (video: HTMLVideoElement) => {
    if (!model) {
      console.warn('[RT Detection] Model not loaded yet');
      return;
    }

    videoRef.current = video;

    const detect = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }

      try {
        const predictions = await model.detect(videoRef.current);
        
        // Convert to our format
        const detectedObjects: DetectedObject[] = predictions.map(pred => ({
          label: pred.class,
          confidence: pred.score,
          bbox: pred.bbox as [number, number, number, number]
        }));

        setDetections(detectedObjects);
      } catch (error) {
        console.error('[RT Detection] Detection error:', error);
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
  };

  return {
    model,
    isModelLoading,
    detections,
    startDetection,
    stopDetection
  };
}

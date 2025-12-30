/**
 * AI SCANNER HOOK
 * 
 * Handles image capture and AI-powered component identification.
 * Supports multi-image capture for better identification.
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIIdentificationResponse, ScannerState } from '@/types';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for AI-powered component scanning with multi-image support
 */
export function useScanner() {
  const [state, setState] = useState<ScannerState>({
    isCapturing: false,
    isProcessing: false,
    capturedImage: null,
    error: null
  });
  
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [identificationResult, setIdentificationResult] = useState<AIIdentificationResponse | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Start camera stream
   */
  const startCamera = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isCapturing: true, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setState(prev => ({ 
        ...prev, 
        isCapturing: false, 
        error: 'Could not access camera. Please grant permission.' 
      }));
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  }, []);

  /**
   * Stop camera stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState(prev => ({ ...prev, isCapturing: false }));
  }, []);

  /**
   * Capture image from video stream and add to captured images
   */
  const captureImage = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    setCapturedImages(prev => [...prev, dataUrl]);
    setState(prev => ({ ...prev, capturedImage: dataUrl }));
    return dataUrl;
  }, []);

  /**
   * Add uploaded image to captured images
   */
  const addUploadedImage = useCallback((file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setCapturedImages(prev => [...prev, dataUrl]);
          setState(prev => ({ ...prev, capturedImage: dataUrl }));
          resolve(dataUrl);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Remove image from captured images
   */
  const removeImage = useCallback((index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Process multiple images with AI identification
   */
  const identifyFromImages = useCallback(async (images: string[]): Promise<AIIdentificationResponse | null> => {
    if (images.length === 0) {
      toast({
        title: 'No Images',
        description: 'Please capture at least one image',
        variant: 'destructive'
      });
      return null;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    setIdentificationResult(null);

    try {
      // Prepare images array with base64 and mime type
      const imagesData = images.map(imageDataUrl => {
        const base64Match = imageDataUrl.match(/^data:image\/(.*?);base64,(.*)$/);
        if (!base64Match) {
          throw new Error('Invalid image format');
        }
        return {
          mimeType: `image/${base64Match[1]}`,
          imageBase64: base64Match[2]
        };
      });

      // Call edge function with multiple images
      const { data, error } = await supabase.functions.invoke('identify-component', {
        body: { images: imagesData }
      });

      if (error) {
        throw new Error(error.message || 'Identification failed');
      }

      const result = data as AIIdentificationResponse;
      setIdentificationResult(result);
      
      if (result.items && result.items.length > 0) {
        toast({
          title: 'Components Identified',
          description: `Found ${result.items.length} item(s) from ${images.length} photo(s)`
        });
      } else {
        toast({
          title: 'No Components Found',
          description: result.message || 'Try taking clearer photos from different angles'
        });
      }

      return result;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Identification error:', error);
      setState(prev => ({ ...prev, error: message }));
      toast({
        title: 'Identification Failed',
        description: message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, []);

  /**
   * Analyze all captured images
   */
  const analyzeAllImages = useCallback(async (): Promise<AIIdentificationResponse | null> => {
    stopCamera();
    return identifyFromImages(capturedImages);
  }, [capturedImages, identifyFromImages, stopCamera]);

  /**
   * Reset scanner state
   */
  const reset = useCallback(() => {
    stopCamera();
    setCapturedImages([]);
    setState({
      isCapturing: false,
      isProcessing: false,
      capturedImage: null,
      error: null
    });
    setIdentificationResult(null);
  }, [stopCamera]);

  return {
    state,
    capturedImages,
    identificationResult,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    addUploadedImage,
    removeImage,
    analyzeAllImages,
    identifyFromImages,
    reset
  };
}

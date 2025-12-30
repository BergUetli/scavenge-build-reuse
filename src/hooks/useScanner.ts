/**
 * AI SCANNER HOOK
 * 
 * Handles image capture and AI-powered component identification.
 * Uses the identify-component edge function.
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIIdentificationResponse, IdentifiedItem, ScannerState } from '@/types';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for AI-powered component scanning
 */
export function useScanner() {
  const [state, setState] = useState<ScannerState>({
    isCapturing: false,
    isProcessing: false,
    capturedImage: null,
    error: null
  });
  
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
          facingMode: 'environment', // Use rear camera on mobile
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
   * Capture image from video stream
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
    
    setState(prev => ({ ...prev, capturedImage: dataUrl }));
    return dataUrl;
  }, []);

  /**
   * Process image with AI identification
   */
  const identifyComponent = useCallback(async (imageDataUrl: string): Promise<AIIdentificationResponse | null> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    setIdentificationResult(null);

    try {
      // Extract base64 data from data URL
      const base64Match = imageDataUrl.match(/^data:image\/(.*?);base64,(.*)$/);
      if (!base64Match) {
        throw new Error('Invalid image format');
      }

      const mimeType = `image/${base64Match[1]}`;
      const imageBase64 = base64Match[2];

      // Call edge function
      const { data, error } = await supabase.functions.invoke('identify-component', {
        body: { imageBase64, mimeType }
      });

      if (error) {
        throw new Error(error.message || 'Identification failed');
      }

      const result = data as AIIdentificationResponse;
      setIdentificationResult(result);
      
      if (result.items && result.items.length > 0) {
        toast({
          title: 'Components Identified',
          description: `Found ${result.items.length} item(s)`
        });
      } else {
        toast({
          title: 'No Components Found',
          description: result.message || 'Try taking a clearer photo'
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
   * Capture and identify in one step
   */
  const captureAndIdentify = useCallback(async (): Promise<AIIdentificationResponse | null> => {
    const imageDataUrl = captureImage();
    if (!imageDataUrl) {
      toast({
        title: 'Capture Failed',
        description: 'Could not capture image from camera',
        variant: 'destructive'
      });
      return null;
    }
    
    stopCamera();
    return identifyComponent(imageDataUrl);
  }, [captureImage, stopCamera, identifyComponent]);

  /**
   * Process image from file upload
   */
  const processUploadedImage = useCallback(async (file: File): Promise<AIIdentificationResponse | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setState(prev => ({ ...prev, capturedImage: dataUrl }));
          const result = await identifyComponent(dataUrl);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => {
        toast({
          title: 'Upload Failed',
          description: 'Could not read the image file',
          variant: 'destructive'
        });
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }, [identifyComponent]);

  /**
   * Reset scanner state
   */
  const reset = useCallback(() => {
    stopCamera();
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
    identificationResult,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    identifyComponent,
    captureAndIdentify,
    processUploadedImage,
    reset
  };
}

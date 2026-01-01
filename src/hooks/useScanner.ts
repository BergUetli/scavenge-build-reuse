/**
 * AI SCANNER HOOK
 * 
 * Handles image capture and AI-powered component identification.
 * Supports multi-image capture for better identification.
 * 
 * Cost optimizations:
 * - Image compression (1024px max, 80% quality) - reduces API costs 50-70%
 * - Image hashing for cache lookup - avoids duplicate API calls
 * - Uses gpt-4o-mini for cost efficiency
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIIdentificationResponse, ScannerState } from '@/types';
import { toast } from '@/hooks/use-toast';
import { compressImage, hashImage } from '@/lib/imageUtils';
import { useAuth } from '@/contexts/AuthContext';

type AIProvider = 'openai' | 'gemini' | 'claude';

/**
 * Hook for AI-powered component scanning with multi-image support
 */
export function useScanner() {
  const { user } = useAuth();
  const [state, setState] = useState<ScannerState>({
    isCapturing: false,
    isProcessing: false,
    capturedImage: null,
    error: null
  });
  
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [identificationResult, setIdentificationResult] = useState<AIIdentificationResponse | null>(null);
  const [preferredProvider, setPreferredProvider] = useState<AIProvider | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load user's preferred AI provider
  useEffect(() => {
    if (!user) return;
    
    const loadProvider = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('ai_provider')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.ai_provider) {
          setPreferredProvider(data.ai_provider as AIProvider);
          console.log('[Scanner] Loaded preferred provider:', data.ai_provider);
        }
      } catch (error) {
        console.error('[Scanner] Failed to load provider preference:', error);
      }
    };
    
    loadProvider();
  }, [user]);

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
    if (!videoRef.current) {
      console.error('[Scanner] No video ref available');
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    
    console.log('[Scanner] Capturing image:', canvas.width, 'x', canvas.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[Scanner] Could not get canvas context');
      return null;
    }
    
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    
    console.log('[Scanner] Image captured, size:', dataUrl.length);
    
    setCapturedImages(prev => {
      const newImages = [...prev, dataUrl];
      console.log('[Scanner] Total captured images:', newImages.length);
      return newImages;
    });
    setState(prev => ({ ...prev, capturedImage: dataUrl }));
    
    toast({
      title: 'Photo captured',
      description: `${capturedImages.length + 1} photo(s) ready`
    });
    
    return dataUrl;
  }, [capturedImages.length]);

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
   * @param images - Array of base64 image data URLs
   * @param userHint - Optional user-provided context hint
   */
  const identifyFromImages = useCallback(async (images: string[], userHint?: string): Promise<AIIdentificationResponse | null> => {
    console.log('[Scanner] identifyFromImages called with', images.length, 'images', userHint ? `and hint: "${userHint}"` : '');
    
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
      // Step 1: Compress images for cost optimization (50-70% reduction)
      console.log('[Scanner] Compressing images for API cost optimization...');
      const compressedImages = await Promise.all(images.map(compressImage));
      
      // Step 2: Generate hash for cache lookup (first image only for simplicity)
      const imageHash = await hashImage(compressedImages[0]);
      console.log('[Scanner] Image hash:', imageHash);
      
      // Prepare images array with base64 and mime type
      const imagesData = compressedImages.map((imageDataUrl, index) => {
        console.log(`[Scanner] Compressed image ${index + 1}, length: ${imageDataUrl.length}`);
        const base64Match = imageDataUrl.match(/^data:image\/(.*?);base64,(.*)$/);
        if (!base64Match) {
          console.error(`[Scanner] Image ${index + 1} has invalid format`);
          throw new Error('Invalid image format');
        }
        return {
          mimeType: `image/${base64Match[1]}`,
          imageBase64: base64Match[2]
        };
      });

      console.log('[Scanner] Sending', imagesData.length, 'compressed images to edge function');
      if (preferredProvider) {
        console.log('[Scanner] Using preferred provider:', preferredProvider);
      }

      // Call edge function with compressed images, hint, hash, provider preference, and user ID
      const { data, error } = await supabase.functions.invoke('identify-component', {
        body: { 
          images: imagesData, 
          userHint: userHint?.trim() || undefined,
          imageHash, // For server-side cache lookup
          provider: preferredProvider, // User's preferred AI provider
          userId: user?.id // For cost tracking
        }
      });

      if (error) {
        console.error('[Scanner] Edge function error:', error);
        
        // Check for specific error types from the response
        const errorMessage = error.message || 'Identification failed';
        
        // Handle credits exhausted error
        if (errorMessage.includes('credits') || errorMessage.includes('402') || errorMessage.includes('payment')) {
          throw new Error('AI credits exhausted. Please add funds in Settings → Workspace → Usage.');
        }
        
        // Handle rate limiting
        if (errorMessage.includes('rate') || errorMessage.includes('429')) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        
        throw new Error(errorMessage);
      }
      
      // Also check if data contains an error (edge function returned error in body)
      if (data?.error) {
        console.error('[Scanner] Edge function returned error:', data.error);
        if (data.error.includes('credits') || data.error.includes('payment')) {
          throw new Error('AI credits exhausted. Please add funds in Settings → Workspace → Usage.');
        }
        throw new Error(data.error);
      }

      console.log('[Scanner] Edge function response:', data);

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
      console.error('[Scanner] Identification error:', error);
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
   * Analyze all captured images with optional user hint
   */
  const analyzeAllImages = useCallback(async (userHint?: string): Promise<AIIdentificationResponse | null> => {
    stopCamera();
    return identifyFromImages(capturedImages, userHint);
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

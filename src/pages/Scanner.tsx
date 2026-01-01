/**
 * SCANNER PAGE
 * 
 * Full-screen camera interface for scanning and identifying components.
 * Supports multi-photo capture for better AI identification.
 * Shows full component breakdown with parent object and all salvageable parts.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CameraView } from '@/components/scanner/CameraView';
import { ComponentBreakdown } from '@/components/scanner/ComponentBreakdown';
import { SuccessSparks } from '@/components/effects/ParticleEffect';
import { useScanner } from '@/hooks/useScanner';
import { useInventory } from '@/hooks/useInventory';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useAuth } from '@/contexts/AuthContext';
import { IdentifiedItem, AIIdentificationResponse } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function Scanner() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { addItem } = useInventory();
  const { addScan } = useScanHistory();
  
  const {
    state,
    capturedImages,
    videoRef,
    identificationResult,
    startCamera,
    stopCamera,
    captureImage,
    addUploadedImage,
    removeImage,
    analyzeAllImages,
    reset
  } = useScanner();

  const { isCapturing, isProcessing, capturedImage } = state;

  const [showResult, setShowResult] = useState(false);
  const [fullResult, setFullResult] = useState<AIIdentificationResponse | null>(null);
  const [userHint, setUserHint] = useState('');
  const [showSuccessSparks, setShowSuccessSparks] = useState(false);

  // Start camera on mount (allow for both users and guests)
  useEffect(() => {
    if (user || isGuest) {
      startCamera();
    }
    return () => stopCamera();
  }, [user, isGuest, startCamera, stopCamera]);

  // Handle image capture (just adds to captured images)
  const handleCapture = useCallback(() => {
    captureImage();
  }, [captureImage]);

  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    await addUploadedImage(file);
  }, [addUploadedImage]);

  // Handle analyze button - sends all images to AI with optional hint
  const handleAnalyze = useCallback(async () => {
    const result = await analyzeAllImages(userHint);
    
    if (!result) {
      setFullResult({ items: [], message: 'Analysis failed. Please try again.' });
      setShowResult(true);
      return;
    }

    console.log('[Scanner] Full AI result:', result);
    setFullResult(result);
    setShowResult(true);
  }, [analyzeAllImages, userHint]);

  // Handle closing scanner
  const handleClose = useCallback(() => {
    stopCamera();
    navigate(-1);
  }, [stopCamera, navigate]);

  // Handle adding a single component to inventory
  const handleAddComponent = useCallback(async (item: IdentifiedItem) => {
    // Check if user is authenticated (not guest)
    if (!user) {
      toast({
        title: 'Sign Up Required',
        description: 'Create an account to save components to your Cargo Hold.',
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-primary hover:bg-primary/90"
          >
            Sign Up
          </Button>
        ),
      });
      return;
    }

    try {
      await addItem.mutateAsync({
        component_name: item.component_name,
        category: item.category,
        condition: item.condition,
        specifications: item.specifications,
        technical_specs: item.technical_specs,
        reusability_score: item.reusability_score,
        market_value: (item.market_value_low + item.market_value_high) / 2,
        image_url: capturedImage || undefined,
        description: item.description,
        common_uses: item.common_uses,
      });

      await addScan.mutateAsync({
        component_name: item.component_name,
        category: item.category,
        confidence: item.confidence,
        image_url: capturedImage || undefined,
        ai_response: fullResult || undefined,
      });

      toast({
        title: 'Saved to Cargo Hold!',
        description: `${item.component_name} has been added to your inventory.`,
      });
    } catch (error) {
      console.error('Failed to save:', error);
      toast({
        title: 'Error',
        description: 'Failed to add component to inventory.',
        variant: 'destructive',
      });
    }
  }, [user, addItem, addScan, capturedImage, fullResult, navigate]);

  // Handle adding all components
  const handleAddAll = useCallback(async () => {
    // Check if user is authenticated (not guest)
    if (!user) {
      toast({
        title: 'Sign Up Required',
        description: 'Create an account to save components to your Cargo Hold.',
        action: (
          <Button 
            size="sm" 
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-primary hover:bg-primary/90"
          >
            Sign Up
          </Button>
        ),
      });
      return;
    }
    
    if (!fullResult?.items) return;

    let savedCount = 0;
    for (const item of fullResult.items) {
      try {
        await handleAddComponent(item);
        savedCount++;
      } catch (error) {
        console.error('Failed to save item:', item.component_name, error);
      }
    }

    toast({
      title: 'Cargo Loaded!',
      description: `${savedCount} components saved to your Cargo Hold.`,
    });

    navigate('/inventory');
  }, [user, fullResult, handleAddComponent, navigate]);

  // Handle rescanning
  const handleRescan = useCallback(() => {
    setShowResult(false);
    setFullResult(null);
    setUserHint('');
    reset();
    startCamera();
  }, [reset, startCamera]);

  // Handle updating a component's data (user corrections)
  const handleUpdateComponent = useCallback((index: number, updates: Partial<IdentifiedItem>) => {
    if (!fullResult?.items) return;
    
    setFullResult(prev => {
      if (!prev?.items) return prev;
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], ...updates };
      return { ...prev, items: newItems };
    });
  }, [fullResult]);

  // Require auth or guest mode
  if (!user && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">
            Please sign in to use the scanner.
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show result view with full breakdown
  if (showResult && fullResult) {
    return (
      <div className="min-h-screen bg-background p-4 safe-area-pt safe-area-pb overflow-y-auto relative">
        {/* Success particles */}
        <SuccessSparks 
          trigger={showSuccessSparks} 
          onComplete={() => setShowSuccessSparks(false)} 
        />
        
        <div className="max-w-md mx-auto pt-4 pb-8">
          <ComponentBreakdown
            result={fullResult}
            imageUrl={capturedImage || undefined}
            onAddComponent={(item) => {
              handleAddComponent(item);
              setShowSuccessSparks(true);
            }}
            onAddAll={() => {
              handleAddAll();
              setShowSuccessSparks(true);
            }}
            onRescan={handleRescan}
            onUpdateComponent={handleUpdateComponent}
            isLoading={addItem.isPending}
          />
        </div>
      </div>
    );
  }

  // Show processing overlay with glassmorphism
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center relative">
          {/* Glow background */}
          <div className="absolute inset-0 -m-16 bg-gradient-radial-glow animate-pulse-soft" />
          
          {/* Scanning ring */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDelay: '0.3s' }} />
            <div className="absolute inset-4 rounded-full bg-primary/10 backdrop-blur flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          </div>
          
          <p className="text-lg font-semibold text-foreground">
            Analyzing {capturedImages.length} photo{capturedImages.length !== 1 ? 's' : ''}...
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Identifying salvageable components
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show camera view with multi-photo support
  return (
    <CameraView
      videoRef={videoRef}
      isStreaming={isCapturing}
      capturedImages={capturedImages}
      userHint={userHint}
      onHintChange={setUserHint}
      onCapture={handleCapture}
      onUpload={handleUpload}
      onRemoveImage={removeImage}
      onAnalyze={handleAnalyze}
      onClose={handleClose}
    />
  );
}

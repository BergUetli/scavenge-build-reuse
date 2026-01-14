/**
 * SCANNER PAGE V0.7
 * 
 * Multi-stage scanning with optimized flow:
 * Stage 1: Device identification (~1s)
 * Stage 2: Component list (~0-2s) 
 * Stage 3: Individual component details (on-demand, ~1s each)
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
import { CameraView } from '@/components/scanner/CameraView';
import { ComponentBreakdownV7 } from '@/components/scanner/ComponentBreakdownV7';
import { SuccessSparks } from '@/components/effects/ParticleEffect';
import { PerformanceMonitor } from '@/components/scanner/PerformanceMonitor';
import { FollowUpPrompt } from '@/components/scanner/FollowUpPrompt';
import { useScanner } from '@/hooks/useScanner';
import { useInventory } from '@/hooks/useInventory';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useAuth } from '@/contexts/AuthContext';
import { IdentifiedItem, AIIdentificationResponse } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { stage1_identifyDevice, stage2_getComponentList } from '@/lib/scanFlow';
import { hashImage } from '@/lib/imageUtils';

type ScanStage = 'idle' | 'stage1' | 'stage2' | 'complete';

export default function Scanner() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { addItem } = useInventory();
  const { addScan } = useScanHistory();
  
  const {
    state,
    capturedImages,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    addUploadedImage,
    removeImage,
    reset
  } = useScanner();

  const { isCapturing, capturedImage } = state;

  // V0.7 state
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [deviceName, setDeviceName] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string | undefined>();
  const [model, setModel] = useState<string | undefined>();
  const [showResult, setShowResult] = useState(false);
  const [fullResult, setFullResult] = useState<AIIdentificationResponse | null>(null);
  const [userHint, setUserHint] = useState('');
  const [showSuccessSparks, setShowSuccessSparks] = useState(false);
  const [performanceTimings, setPerformanceTimings] = useState<any>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [genericDeviceName, setGenericDeviceName] = useState('');

  // Start camera on mount
  useEffect(() => {
    if (user || isGuest) {
      startCamera();
    }
    return () => stopCamera();
  }, [user, isGuest, startCamera, stopCamera]);

  // Handle image capture
  const handleCapture = useCallback(() => {
    captureImage();
  }, [captureImage]);

  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    await addUploadedImage(file);
  }, [addUploadedImage]);

  // V0.7 Multi-stage analyze
  const handleAnalyze = useCallback(async () => {
    if (capturedImages.length === 0) {
      toast({
        title: 'No image captured',
        description: 'Please capture or upload an image first.',
        variant: 'destructive'
      });
      return;
    }

    const startTime = performance.now();
    const imageBase64 = capturedImages[0];

    try {
      // STAGE 1: Identify device name only (~1s)
      console.log('[Scanner v0.7] Stage 1: Identifying device...');
      setScanStage('stage1');
      
      const imageHash = await hashImage(imageBase64);
      const stage1Result = await stage1_identifyDevice(
        imageBase64,
        imageHash,
        userHint
      );

      const stage1Time = performance.now() - startTime;
      console.log(`[Scanner v0.7] Stage 1 complete in ${stage1Time.toFixed(0)}ms:`, stage1Result.deviceName);
      
      setDeviceName(stage1Result.deviceName);
      setManufacturer(stage1Result.manufacturer);
      setModel(stage1Result.model);

      // Check if device name is too generic
      const deviceNameLower = stage1Result.deviceName.toLowerCase();
      const genericNames = ['smartphone', 'phone', 'device', 'gadget', 'tablet', 'laptop', 'computer', 'electronics', 'electronic device'];
      const isGeneric = genericNames.some(generic => 
        deviceNameLower.includes(generic) && deviceNameLower.split(' ').length <= 2
      );

      if (isGeneric && !userHint) {
        // Show follow-up prompt for more specific info
        setGenericDeviceName(stage1Result.deviceName);
        setShowFollowUp(true);
        setScanStage('idle');
        return;
      }

      // STAGE 2: Get component list (~0-2s)
      console.log('[Scanner v0.7] Stage 2: Getting component list...');
      setScanStage('stage2');
      
      let stage2Result: { components: any[]; fromDatabase: boolean };
      
      // OPTIMIZATION: If Stage 1 already returned components, use them!
      if (stage1Result.components && stage1Result.components.length > 0) {
        console.log(`[Scanner v0.7] Stage 2: Using ${stage1Result.components.length} components from Stage 1 (no AI call needed!)`);
        stage2Result = {
          components: stage1Result.components,
          fromDatabase: false
        };
      } else {
        // Stage 1 didn't return components, need to call Stage 2
        stage2Result = await stage2_getComponentList(
          stage1Result.deviceName,
          imageBase64,
          stage1Result.manufacturer,
          stage1Result.model
        );
      }

      const stage2Time = performance.now() - startTime;
      console.log(`[Scanner v0.7] Stage 2 complete in ${stage2Time.toFixed(0)}ms: ${stage2Result.components.length} components`);

      // Build AIIdentificationResponse for display
      const result: AIIdentificationResponse = {
        parent_object: stage1Result.deviceName,
        manufacturer: stage1Result.manufacturer,
        model: stage1Result.model,
        items: stage2Result.components.map(c => ({
          id: `${c.name}-${Date.now()}`,
          name: c.name,
          component_name: c.name,
          category: c.category,
          quantity: c.quantity || 1,
          // Other fields will be loaded on-demand in Stage 3
          confidence: 0.9,
          reusability_score: 0,
          market_value_low: 0,
          market_value_high: 0,
          condition: 'Unknown',
          common_uses: []
        })),
        from_database: stage2Result.fromDatabase,
        _timings: {
          stage1: stage1Time,
          stage2: stage2Time - stage1Time,
          total: stage2Time
        }
      };

      // Set timings
      const totalTime = performance.now() - startTime;
      setPerformanceTimings({
        total: totalTime,
        stage1: stage1Time,
        stage2: stage2Time - stage1Time,
        dataSource: stage2Result.fromDatabase ? 'database' : 
                   stage1Result.fromCache ? 'cache' : 'ai'
      });

      setFullResult(result);
      setScanStage('complete');
      setShowResult(true);

      toast({
        title: 'Scan complete!',
        description: `Found ${result.items.length} components in ${(totalTime / 1000).toFixed(1)}s`,
      });

    } catch (error) {
      console.error('[Scanner v0.7] Scan failed:', error);
      setScanStage('idle');
      toast({
        title: 'Scan failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
      
      // Show empty result for retry
      setFullResult({ 
        items: [], 
        message: 'Analysis failed. Please try again.' 
      });
      setShowResult(true);
    }
  }, [capturedImages, userHint]);

  // Handle follow-up prompt submission
  const handleFollowUpSubmit = useCallback(async (additionalHint: string) => {
    setShowFollowUp(false);
    setUserHint(additionalHint);
    // Re-analyze with the new hint
    await handleAnalyze();
  }, [handleAnalyze]);

  // Handle follow-up prompt skip
  const handleFollowUpSkip = useCallback(() => {
    setShowFollowUp(false);
    // Continue with generic device name
    handleAnalyze();
  }, [handleAnalyze]);

  // Handle closing scanner
  const handleClose = useCallback(() => {
    stopCamera();
    navigate(-1);
  }, [stopCamera, navigate]);

  // Handle adding a single component to inventory
  const handleAddComponent = useCallback(async (item: IdentifiedItem) => {
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
        component_name: item.name || item.component_name,
        category: item.category,
        condition: item.condition || 'Unknown',
        specifications: item.specifications,
        technical_specs: item.technical_specs,
        reusability_score: item.reusability_score,
        market_value: item.market_value_low && item.market_value_high 
          ? (item.market_value_low + item.market_value_high) / 2 
          : undefined,
        image_url: capturedImage || undefined,
        description: item.description,
        common_uses: item.common_uses,
      });

      await addScan.mutateAsync({
        component_name: fullResult?.parent_object || item.name || item.component_name,
        category: item.category,
        confidence: item.confidence || 0.9,
        image_url: capturedImage || undefined,
        ai_response: fullResult || undefined,
      });

      toast({
        title: 'Saved to Cargo Hold!',
        description: `${item.name || item.component_name} has been added to your inventory.`,
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

  // Handle adding the whole gadget as-is
  const handleAddGadget = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Sign Up Required',
        description: 'Create an account to save items to your Cargo Hold.',
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
    
    if (!fullResult) return;

    try {
      const gadgetName = fullResult.parent_object || 'Unknown Device';

      await addItem.mutateAsync({
        component_name: gadgetName,
        category: fullResult.items[0]?.category || 'Electronics',
        condition: 'Good',
        specifications: {
          is_whole_gadget: true,
          component_count: fullResult.items.length,
          manufacturer: manufacturer,
          model: model,
        },
        reusability_score: 8,
        market_value: undefined,
        image_url: capturedImage || undefined,
        description: `Complete ${gadgetName} with ${fullResult.items.length} salvageable parts. Not disassembled.`,
        common_uses: ['Repair', 'Refurbishment', 'Parts donor'],
      });

      await addScan.mutateAsync({
        component_name: gadgetName,
        category: fullResult.items[0]?.category || 'Electronics',
        confidence: 0.9,
        image_url: capturedImage || undefined,
        ai_response: fullResult,
      });

      toast({
        title: 'Gadget Saved!',
        description: `${gadgetName} has been added to your Cargo Hold as a whole item.`,
      });

      setShowSuccessSparks(true);
      setTimeout(() => setShowSuccessSparks(false), 2000);
      navigate('/inventory');
    } catch (error) {
      console.error('Failed to save gadget:', error);
      toast({
        title: 'Error',
        description: 'Failed to save gadget to inventory.',
        variant: 'destructive',
      });
    }
  }, [user, fullResult, manufacturer, model, addItem, addScan, capturedImage, navigate]);

  // Handle adding all components
  const handleAddAll = useCallback(async (components: IdentifiedItem[]) => {
    console.log('[Scanner] handleAddAll called with', components.length, 'components');
    
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
    
    if (!components || components.length === 0) return;

    // Add scan history
    try {
      await addScan.mutateAsync({
        component_name: fullResult?.parent_object || components[0]?.name || 'Unknown Device',
        category: components[0]?.category || 'Electronics',
        confidence: 0.9,
        image_url: capturedImage || undefined,
        ai_response: fullResult || undefined,
      });
    } catch (error) {
      console.error('Failed to save scan history:', error);
    }

    // Add all components
    let savedCount = 0;
    const errors: string[] = [];
    
    for (const item of components) {
      try {
        await addItem.mutateAsync({
          component_name: item.name || item.component_name,
          category: item.category,
          condition: item.condition || 'Unknown',
          specifications: item.specifications,
          technical_specs: item.technical_specs,
          reusability_score: item.reusability_score,
          market_value: item.market_value_low && item.market_value_high
            ? (item.market_value_low + item.market_value_high) / 2
            : undefined,
          image_url: capturedImage || undefined,
          description: item.description,
          common_uses: item.common_uses,
        });
        
        savedCount++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to save ${item.name}:`, error);
        errors.push(`${item.name}: ${errorMsg}`);
      }
    }
    
    if (errors.length > 0) {
      toast({
        title: 'Partial Save',
        description: `${savedCount} of ${components.length} components saved. ${errors.length} failed.`,
        variant: savedCount > 0 ? 'default' : 'destructive',
      });
    } else {
      toast({
        title: 'Cargo Loaded!',
        description: `${savedCount} component${savedCount !== 1 ? 's' : ''} saved to your Cargo Hold.`,
      });
    }

    setShowSuccessSparks(true);
    setTimeout(() => setShowSuccessSparks(false), 2000);
    navigate('/inventory');
  }, [user, fullResult, addItem, addScan, capturedImage, navigate]);

  // Handle rescanning
  const handleRescan = useCallback(() => {
    setShowResult(false);
    setFullResult(null);
    setUserHint('');
    setDeviceName('');
    setManufacturer(undefined);
    setModel(undefined);
    setScanStage('idle');
    reset();
    startCamera();
  }, [reset, startCamera]);

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

  // Show result view with V0.7 bubble UI
  if (showResult && fullResult) {
    return (
      <div className="min-h-screen bg-background safe-area-pt safe-area-pb overflow-y-auto relative">
        {/* Success particles */}
        <SuccessSparks 
          trigger={showSuccessSparks} 
          onComplete={() => setShowSuccessSparks(false)} 
        />
        
        {/* Performance diagnostics */}
        {performanceTimings && (
          <div className="max-w-4xl mx-auto px-6 pt-4">
            <PerformanceMonitor 
              timings={performanceTimings}
              className="mb-4"
            />
          </div>
        )}
        
        <ComponentBreakdownV7
          deviceName={deviceName || fullResult.parent_object || 'Unknown Device'}
          components={fullResult.items.map(item => ({
            name: item.name || item.component_name,
            category: item.category,
            quantity: item.quantity
          }))}
          onAddComponent={(item) => {
            handleAddComponent(item);
            setShowSuccessSparks(true);
          }}
          onAddAll={() => {
            handleAddAll(fullResult.items);
            setShowSuccessSparks(true);
          }}
          isLoading={addItem.isPending}
        />
      </div>
    );
  }

  // Show multi-stage processing overlay
  if (scanStage !== 'idle') {
    return (
      <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center relative max-w-md px-4">
          {/* Glow background */}
          <div className="absolute inset-0 -m-16 bg-gradient-radial-glow animate-pulse-soft" />
          
          {/* Scanning ring */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDelay: '0.3s' }} />
            <div className="absolute inset-4 rounded-full bg-primary/10 backdrop-blur flex items-center justify-center">
              {scanStage === 'complete' ? (
                <Check className="w-10 h-10 text-primary" />
              ) : (
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              )}
            </div>
          </div>
          
          {/* Stage indicator */}
          <div className="space-y-3">
            {scanStage === 'stage1' && (
              <>
                <p className="text-lg font-semibold text-foreground">
                  Identifying device...
                </p>
                <p className="text-sm text-muted-foreground">
                  Stage 1 of 2
                </p>
              </>
            )}
            
            {scanStage === 'stage2' && deviceName && (
              <>
                <p className="text-lg font-semibold text-foreground">
                  {deviceName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Loading components...
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Stage 2 of 2
                </p>
              </>
            )}
          </div>
          
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

  // Show camera view
  return (
    <>
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
      
      {/* Follow-up prompt for generic device names */}
      <FollowUpPrompt
        isOpen={showFollowUp}
        onClose={handleFollowUpSkip}
        onSubmit={handleFollowUpSubmit}
        genericName={genericDeviceName}
      />
    </>
  );
}

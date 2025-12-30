/**
 * SCANNER PAGE
 * 
 * Full-screen camera interface for scanning and identifying components.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CameraView } from '@/components/scanner/CameraView';
import { IdentificationResult } from '@/components/scanner/IdentificationResult';
import { useScanner } from '@/hooks/useScanner';
import { useInventory } from '@/hooks/useInventory';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useAuth } from '@/contexts/AuthContext';
import { IdentifiedItem } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function Scanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useInventory();
  const { addScan } = useScanHistory();
  
  const {
    state,
    videoRef,
    identificationResult,
    startCamera,
    stopCamera,
    captureImage,
    identifyComponent,
    reset
  } = useScanner();

  const { isCapturing, isProcessing, capturedImage } = state;

  const [showResult, setShowResult] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IdentifiedItem | null>(null);

  // Start camera on mount
  useState(() => {
    if (user) {
      startCamera();
    }
  });

  // Handle image capture
  const handleCapture = useCallback(async () => {
    const imageData = captureImage();
    if (imageData) {
      const result = await identifyComponent(imageData);
      if (result && result.items.length > 0) {
        setSelectedItem(result.items[0]);
        setShowResult(true);
      }
    }
  }, [captureImage, identifyComponent]);

  // Handle file upload from gallery
  const handleUpload = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      if (imageData) {
        const result = await identifyComponent(imageData);
        if (result && result.items.length > 0) {
          setSelectedItem(result.items[0]);
          setShowResult(true);
        }
      }
    };
    reader.readAsDataURL(file);
  }, [identifyComponent]);

  // Handle closing scanner
  const handleClose = useCallback(() => {
    stopCamera();
    navigate(-1);
  }, [stopCamera, navigate]);

  // Handle confirming identification and adding to inventory
  const handleConfirm = useCallback(async () => {
    if (!selectedItem || !user) return;

    try {
      // Add to inventory
      await addItem.mutateAsync({
        component_name: selectedItem.component_name,
        category: selectedItem.category,
        condition: selectedItem.condition,
        specifications: selectedItem.specifications,
        reusability_score: selectedItem.reusability_score,
        market_value: (selectedItem.market_value_low + selectedItem.market_value_high) / 2,
        image_url: capturedImage || undefined,
      });

      // Add to scan history
      await addScan.mutateAsync({
        component_name: selectedItem.component_name,
        category: selectedItem.category,
        confidence: selectedItem.confidence,
        image_url: capturedImage || undefined,
        ai_response: identificationResult || undefined,
      });

      toast({
        title: 'Added to Inventory!',
        description: `${selectedItem.component_name} has been saved.`,
      });

      stopCamera();
      navigate('/inventory');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }, [selectedItem, user, addItem, addScan, capturedImage, identificationResult, stopCamera, navigate]);

  // Handle editing identification
  const handleEdit = useCallback(() => {
    // TODO: Open edit modal
    toast({
      title: 'Edit Mode',
      description: 'Manual editing coming soon!',
    });
  }, []);

  // Handle rejecting and rescanning
  const handleReject = useCallback(() => {
    setShowResult(false);
    setSelectedItem(null);
    reset();
  }, [reset]);

  // Require auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">
            Please sign in to use the scanner.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="text-primary underline"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Show result view
  if (showResult && selectedItem) {
    return (
      <div className="min-h-screen bg-background p-4 safe-area-pt safe-area-pb">
        <div className="max-w-md mx-auto pt-8">
          <IdentificationResult
            result={selectedItem}
            imageUrl={capturedImage || undefined}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            onReject={handleReject}
            isLoading={addItem.isPending}
          />
        </div>
      </div>
    );
  }

  // Show processing overlay
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Analyzing...</p>
          <p className="text-sm text-white/70 mt-1">
            Identifying components with AI
          </p>
        </div>
      </div>
    );
  }

  // Show camera view
  return (
    <CameraView
      videoRef={videoRef}
      isStreaming={isCapturing}
      onCapture={handleCapture}
      onUpload={handleUpload}
      onClose={handleClose}
    />
  );
}

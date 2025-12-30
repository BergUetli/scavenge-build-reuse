/**
 * CAMERA VIEW COMPONENT
 * 
 * Full-screen camera interface for scanning components.
 * Handles camera permissions, capture, and gallery upload.
 */

import { useRef, useState, useCallback } from 'react';
import { Camera, X, ImagePlus, FlipHorizontal, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  onCapture: () => void;
  onUpload: (file: File) => void;
  onClose: () => void;
}

export function CameraView({ 
  videoRef, 
  isStreaming, 
  onCapture, 
  onUpload, 
  onClose 
}: CameraViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  const triggerCapture = useCallback(() => {
    setFlash(true);
    onCapture();
    setTimeout(() => setFlash(false), 150);
  }, [onCapture]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Flash effect */}
      {flash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash" />
      )}
      
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Scanning overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Viewfinder frame */}
        <div className="absolute inset-8 md:inset-20 border-2 border-white/30 rounded-2xl">
          {/* Corner accents */}
          <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
        </div>
        
        {/* Scan line animation */}
        {isStreaming && (
          <div className="absolute left-8 right-8 md:left-20 md:right-20 top-8 md:top-20 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
        )}
      </div>
      
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-area-pt">
        <Button
          variant="ghost"
          size="icon"
          className="text-white bg-black/30 backdrop-blur-sm hover:bg-black/50"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/30 backdrop-blur-sm hover:bg-black/50"
          >
            <FlipHorizontal className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/30 backdrop-blur-sm hover:bg-black/50"
          >
            <Zap className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Hint text */}
      <div className="absolute top-20 left-0 right-0 text-center safe-area-pt">
        <p className="text-white/80 text-sm bg-black/30 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
          Position component within the frame
        </p>
      </div>
      
      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 safe-area-pb">
        <div className="flex items-center justify-center gap-8">
          {/* Gallery button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-14 h-14 text-white bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="w-6 h-6" />
          </Button>
          
          {/* Capture button */}
          <Button
            size="icon"
            className={cn(
              'w-20 h-20 rounded-full border-4 border-white transition-all',
              'bg-white/20 hover:bg-white/30 active:scale-95',
              !isStreaming && 'opacity-50 cursor-not-allowed'
            )}
            onClick={triggerCapture}
            disabled={!isStreaming}
          >
            <Camera className="w-8 h-8 text-white" />
          </Button>
          
          {/* Spacer for layout */}
          <div className="w-14 h-14" />
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

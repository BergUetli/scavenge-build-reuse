/**
 * CAMERA VIEW COMPONENT
 * 
 * Full-screen camera interface for scanning components.
 * Supports multi-photo capture with thumbnail strip.
 * Includes sound feedback for actions.
 */

import { useRef, useState, useCallback } from 'react';
import { Camera, X, ImagePlus, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSounds } from '@/hooks/useSounds';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  capturedImages: string[];
  onCapture: () => void;
  onUpload: (file: File) => void;
  onRemoveImage: (index: number) => void;
  onAnalyze: () => void;
  onClose: () => void;
}

export function CameraView({ 
  videoRef, 
  isStreaming,
  capturedImages,
  onCapture, 
  onUpload,
  onRemoveImage,
  onAnalyze,
  onClose 
}: CameraViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState(false);
  const { playClick, playScan, playWhoosh } = useSounds();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => onUpload(file));
      playClick();
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onUpload, playClick]);

  const triggerCapture = useCallback(() => {
    setFlash(true);
    playScan();
    onCapture();
    setTimeout(() => setFlash(false), 150);
  }, [onCapture, playScan]);

  const handleAnalyze = useCallback(() => {
    playWhoosh();
    onAnalyze();
  }, [onAnalyze, playWhoosh]);

  const handleClose = useCallback(() => {
    playClick();
    onClose();
  }, [onClose, playClick]);

  const handleRemoveImage = useCallback((index: number) => {
    playClick();
    onRemoveImage(index);
  }, [onRemoveImage, playClick]);

  const hasImages = capturedImages.length > 0;

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
          onClick={handleClose}
        >
          <X className="w-6 h-6" />
        </Button>
        
        {/* Photo counter */}
        {hasImages && (
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
            {capturedImages.length} photo{capturedImages.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      {/* Hint text */}
      <div className="absolute top-20 left-0 right-0 text-center safe-area-pt">
        <p className="text-white/80 text-sm bg-black/30 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
          {hasImages 
            ? 'Take more angles or tap Analyze'
            : 'Position component within the frame'}
        </p>
      </div>

      {/* Captured images thumbnail strip */}
      {hasImages && (
        <div className="absolute left-0 right-0 bottom-36 safe-area-pb px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {capturedImages.map((img, index) => (
              <div 
                key={index} 
                className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-white/50 shadow-lg"
              >
                <img 
                  src={img} 
                  alt={`Capture ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 safe-area-pb">
        <div className="flex items-center justify-center gap-6">
          {/* Gallery button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-14 h-14 text-white bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-full"
            onClick={() => {
              playClick();
              fileInputRef.current?.click();
            }}
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
          
          {/* Analyze button - shows when images are captured */}
          {hasImages ? (
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-premium hover:bg-primary/90 active:scale-95"
              onClick={handleAnalyze}
            >
              <Send className="w-6 h-6" />
            </Button>
          ) : (
            <div className="w-14 h-14" />
          )}
        </div>
      </div>
      
      {/* Hidden file input - allow multiple */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

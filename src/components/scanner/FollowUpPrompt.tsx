/**
 * FOLLOW-UP PROMPT
 * 
 * Shows when AI returns generic device name (e.g., "SmartPhone")
 * Asks user for more specific details to improve identification
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpCircle, Sparkles, ChevronRight } from 'lucide-react';

interface FollowUpPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (additionalHint: string) => void;
  genericName: string;
}

export function FollowUpPrompt({ isOpen, onClose, onSubmit, genericName }: FollowUpPromptProps) {
  const [hint, setHint] = useState('');

  const handleSubmit = () => {
    if (hint.trim()) {
      onSubmit(hint.trim());
      setHint('');
    }
  };

  const suggestions = [
    'Brand name (Apple, Samsung, Google, etc.)',
    'Model number or name',
    'Color or physical characteristics',
    'Year or generation (e.g., 2022 model)',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-amber-400" />
            </div>
            <DialogTitle className="text-xl text-white">Need More Details</DialogTitle>
          </div>
          <DialogDescription className="text-slate-300 text-base">
            I detected a <span className="text-white font-semibold">"{genericName}"</span> but need more specific information to identify the exact device and its components.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Suggestions */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm font-medium text-slate-300 mb-2">💡 Try providing:</p>
            <ul className="space-y-1.5">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="additional-hint" className="text-white font-medium">
              Additional Information
            </Label>
            <Input
              id="additional-hint"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g., iPhone 12 Pro Max, Samsung Galaxy S21 Ultra"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hint.trim()) {
                  handleSubmit();
                }
              }}
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hint.trim()}
              className="flex-1 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Re-analyze
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

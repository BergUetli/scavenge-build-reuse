/**
 * SETTINGS PAGE
 * 
 * User settings including AI provider selection.
 */

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { AIProviderSettings } from '@/components/settings/AIProviderSettings';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 safe-area-pt">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 py-6 max-w-md mx-auto space-y-6">
          <AIProviderSettings />
        </div>
      </div>
    </AppLayout>
  );
}

/**
 * MARKETPLACE PAGE
 * Buy and sell salvaged parts with other makers
 */

import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Marketplace() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0A1828]">
        <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-white">Marketplace</h1>
              <p className="text-gray-400 text-sm">Buy & sell salvaged parts</p>
            </div>
          </div>

          {/* Coming Soon */}
          <Card className="bg-[#1C1C1E] border-[#2C394B]">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#00D9FF]/10 mx-auto mb-6 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-[#00D9FF]" />
              </div>
              <h2 className="text-white font-bold text-2xl mb-3">Coming Soon</h2>
              <p className="text-gray-400 max-w-sm mx-auto mb-8">
                Soon you'll be able to buy and sell salvaged electronic components with other makers in our community marketplace.
              </p>
              <div className="bg-[#00D9FF]/5 border border-[#00D9FF]/20 rounded-xl p-4 max-w-sm mx-auto mb-8">
                <p className="text-[#00D9FF] text-sm font-medium">
                  🛒 Marketplace coming soon
                </p>
              </div>
              <Button
                onClick={() => navigate('/')}
                className="bg-[#00D9FF] hover:bg-[#00B8DD] text-white font-semibold rounded-xl px-8"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

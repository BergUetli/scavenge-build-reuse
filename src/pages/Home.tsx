/**
 * HOME PAGE - Scavy
 * New dark electric blue design with feature cards
 */

import { useNavigate } from 'react-router-dom';
import { Camera, Package, Wrench, ShoppingBag, Hammer } from 'lucide-react';
import { ScavyLogo } from '@/components/ScavyLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';

export default function Home() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0A1828]">
        {/* Hexagon Pattern Background */}
        <div 
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300D9FF' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content Container */}
        <div className="relative px-6 pt-8 pb-24 max-w-lg mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <ScavyLogo size="md" className="mb-8" />
          </div>

          {/* Hero Section */}
          <div className="mb-10">
            <h1 className="text-5xl font-black text-white mb-2 leading-tight">
              <span className="inline-block glitch-text">Scan.</span>
              <br />
              <span className="inline-block">Salvage.</span>
              <br />
              <span className="inline-block">Build.</span>
            </h1>
            <p className="text-[#00D9FF] text-sm font-medium mt-4">
              15,243 components in database
            </p>
          </div>

          {/* Primary Scan Button */}
          <button
            onClick={() => navigate('/scanner')}
            className="w-full mb-10 group relative"
          >
            <div className="absolute inset-0 bg-[#00D9FF] rounded-2xl blur-xl opacity-60 group-hover:opacity-80 group-active:opacity-90 transition-opacity animate-pulse" />
            <div className="relative bg-gradient-to-r from-[#00D9FF] to-[#0099CC] rounded-2xl p-5 flex items-center justify-center gap-3 shadow-2xl group-hover:scale-[1.02] group-active:scale-[0.98] transition-transform">
              <Camera className="w-7 h-7 text-white" strokeWidth={2.5} />
              <span className="text-white text-xl font-bold tracking-wide">Scan</span>
            </div>
          </button>

          {/* Feature Cards */}
          <div className="space-y-4">
            
            {/* Track Inventory */}
            <Card className="bg-[#1C1C1E] border-[#2C394B] hover:border-[#00D9FF]/30 transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D9FF]/20 transition-colors">
                    <Package className="w-6 h-6 text-[#00D9FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Track Inventory</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Keep tabs on all your collected items easily.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/inventory')}
                  className="w-full bg-[#00D9FF] hover:bg-[#00B8DD] text-white font-semibold rounded-xl h-11 transition-colors"
                >
                  Manage Items
                </Button>
              </CardContent>
            </Card>

            {/* Find Tools */}
            <Card className="bg-[#1C1C1E] border-[#2C394B] hover:border-[#00D9FF]/30 transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D9FF]/20 transition-colors">
                    <Wrench className="w-6 h-6 text-[#00D9FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Find Tools</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Locate needed tools and resources quickly.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/tools')}
                  className="w-full bg-[#00D9FF] hover:bg-[#00B8DD] text-white font-semibold rounded-xl h-11 transition-colors"
                >
                  Explore Tools
                </Button>
              </CardContent>
            </Card>

            {/* Marketplace */}
            <Card className="bg-[#1C1C1E] border-[#2C394B] hover:border-[#00D9FF]/30 transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D9FF]/20 transition-colors">
                    <ShoppingBag className="w-6 h-6 text-[#00D9FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Marketplace</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Sell your salvaged parts to other makers.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/marketplace')}
                  className="w-full bg-[#00D9FF] hover:bg-[#00B8DD] text-white font-semibold rounded-xl h-11 transition-colors"
                >
                  Browse & Sell
                </Button>
              </CardContent>
            </Card>

            {/* Build Projects */}
            <Card className="bg-[#1C1C1E] border-[#2C394B] hover:border-[#00D9FF]/30 transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00D9FF]/20 transition-colors">
                    <Hammer className="w-6 h-6 text-[#00D9FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Build Projects</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Create amazing things from salvaged components.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/projects')}
                  className="w-full bg-[#00D9FF] hover:bg-[#00B8DD] text-white font-semibold rounded-xl h-11 transition-colors"
                >
                  Start Building
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/**
 * HOME PAGE - Scavy
 * Dark electric blue design matching the original mockup
 */

import { useNavigate } from 'react-router-dom';
import { Camera, Package, Wrench, ShoppingBag, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { useScanHistory } from '@/hooks/useScanHistory';

export default function Home() {
  const navigate = useNavigate();
  const { history } = useScanHistory();
  
  // Get most recent scan
  const recentScan = history?.[0];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0A1828] relative overflow-hidden">
        {/* Subtle Circuit Board Pattern Background */}
        <div 
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%2300D9FF' stroke-width='0.5'%3E%3Cpath d='M0 100h60M140 100h60M100 0v60M100 140v60'/%3E%3Ccircle cx='100' cy='100' r='5' fill='%2300D9FF'/%3E%3Ccircle cx='0' cy='100' r='3' fill='%2300D9FF'/%3E%3Ccircle cx='200' cy='100' r='3' fill='%2300D9FF'/%3E%3Ccircle cx='100' cy='0' r='3' fill='%2300D9FF'/%3E%3Ccircle cx='100' cy='200' r='3' fill='%2300D9FF'/%3E%3Crect x='25' y='25' width='15' height='15' rx='2'/%3E%3Crect x='160' y='25' width='15' height='15' rx='2'/%3E%3Crect x='25' y='160' width='15' height='15' rx='2'/%3E%3Crect x='160' y='160' width='15' height='15' rx='2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content Container */}
        <div className="relative px-5 pt-6 pb-28 max-w-lg mx-auto">
          
          {/* Simple Logo Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#00D9FF" strokeWidth="2"/>
                <path d="M12 16h8M16 12v8" stroke="#00D9FF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-[#00D9FF] text-2xl font-bold tracking-tight">Scavy</span>
            </div>
          </div>

          {/* Hero Tagline with Glitch Effect */}
          <div className="mb-8 text-center">
            <h1 
              className="text-5xl font-black mb-2 glitch-text"
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                lineHeight: '1.1',
                letterSpacing: '-0.02em'
              }}
            >
              <span className="text-white">Scan.</span>
              <br />
              <span className="text-white">Salvage.</span>
              <br />
              <span className="text-white">Build.</span>
            </h1>
            <p className="text-[#00D9FF]/70 text-sm font-medium mt-4">
              15,243 components in database
            </p>
          </div>

          {/* Primary Scan Button */}
          <button
            onClick={() => navigate('/scanner')}
            className="w-full mb-8 group relative"
          >
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-[#00D9FF]/40 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            
            {/* Button */}
            <div className="relative bg-[#00D9FF] hover:bg-[#00E5FF] text-[#0A1828] font-bold text-lg py-5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg">
              <Camera className="w-6 h-6" />
              <span>Scan</span>
            </div>
          </button>

          {/* Feature Cards */}
          <div className="space-y-3">
            
            {/* Track Inventory */}
            <div className="bg-[#1C1C1E] border border-[#00D9FF]/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-[#00D9FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base mb-1">Track Inventory</h3>
                <p className="text-gray-400 text-sm">
                  Keep tabs on all your collected items easily
                </p>
              </div>
              <Button
                onClick={() => navigate('/inventory')}
                size="sm"
                className="bg-[#00D9FF] hover:bg-[#00E5FF] text-[#0A1828] font-semibold rounded-full px-5 h-9 flex-shrink-0"
              >
                Manage Items
              </Button>
            </div>

            {/* Find Tools */}
            <div className="bg-[#1C1C1E] border border-[#00D9FF]/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-6 h-6 text-[#00D9FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base mb-1">Find Tools</h3>
                <p className="text-gray-400 text-sm">
                  Locate needed tools and resources quickly
                </p>
              </div>
              <Button
                onClick={() => navigate('/tools')}
                size="sm"
                className="bg-[#00D9FF] hover:bg-[#00E5FF] text-[#0A1828] font-semibold rounded-full px-5 h-9 flex-shrink-0"
              >
                Explore Tools
              </Button>
            </div>

            {/* Marketplace */}
            <div className="bg-[#1C1C1E] border border-[#00D9FF]/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-[#00D9FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base mb-1">Marketplace</h3>
                <p className="text-gray-400 text-sm">
                  Sell your salvaged parts to others
                </p>
              </div>
              <Button
                onClick={() => navigate('/marketplace')}
                size="sm"
                className="bg-[#00D9FF] hover:bg-[#00E5FF] text-[#0A1828] font-semibold rounded-full px-5 h-9 flex-shrink-0"
              >
                Browse & Sell
              </Button>
            </div>

            {/* Build Projects */}
            <div className="bg-[#1C1C1E] border border-[#00D9FF]/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center flex-shrink-0">
                <Hammer className="w-6 h-6 text-[#00D9FF]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base mb-1">Build Projects</h3>
                <p className="text-gray-400 text-sm">
                  Create amazing things from salvaged components
                </p>
              </div>
              <Button
                onClick={() => navigate('/projects')}
                size="sm"
                className="bg-[#00D9FF] hover:bg-[#00E5FF] text-[#0A1828] font-semibold rounded-full px-5 h-9 flex-shrink-0"
              >
                Start Building
              </Button>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

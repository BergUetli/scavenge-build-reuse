/**
 * HOME PAGE - Scavy
 * Dark electric blue design with circuit board pattern
 */

import { useNavigate } from 'react-router-dom';
import { Camera, Package, Wrench, ShoppingBag, Hammer } from 'lucide-react';
import { ScavyLogo } from '@/components/ScavyLogo';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { useScanHistory } from '@/hooks/useScanHistory';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const navigate = useNavigate();
  const { history } = useScanHistory();
  
  // Get most recent scan
  const recentScan = history?.[0];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0A1929] relative overflow-hidden">
        {/* Circuit Board Pattern Background */}
        <div 
          className="fixed inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%2300B4D8' stroke-width='0.8'%3E%3Cpath d='M0 60h45M75 60h45M60 0v45M60 75v45'/%3E%3Ccircle cx='60' cy='60' r='4' fill='%2300B4D8'/%3E%3Ccircle cx='0' cy='60' r='2' fill='%2300B4D8'/%3E%3Ccircle cx='120' cy='60' r='2' fill='%2300B4D8'/%3E%3Ccircle cx='60' cy='0' r='2' fill='%2300B4D8'/%3E%3Ccircle cx='60' cy='120' r='2' fill='%2300B4D8'/%3E%3Crect x='15' y='15' width='12' height='12' rx='2'/%3E%3Crect x='93' y='15' width='12' height='12' rx='2'/%3E%3Crect x='15' y='93' width='12' height='12' rx='2'/%3E%3Crect x='93' y='93' width='12' height='12' rx='2'/%3E%3Cpath d='M21 0v15M99 0v15M21 105v15M99 105v15M0 21h15M105 21h15M0 99h15M105 99h15'/%3E%3Cpath d='M30 30L45 45M75 30L90 45M30 90L45 75M75 90L90 75' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content Container */}
        <div className="relative px-5 pt-8 pb-28 max-w-lg mx-auto">
          
          {/* Header */}
          <div className="text-center mb-4">
            <ScavyLogo size="md" className="justify-center" />
          </div>

          {/* Hero Tagline */}
          <div className="mb-6">
            <h1 
              className="text-[3.2rem] leading-[1.05] mb-3 font-black italic"
              style={{
                fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
                textShadow: '0 0 40px rgba(0, 217, 255, 0.8), 0 0 80px rgba(0, 217, 255, 0.4)',
              }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#FFFFFF] to-[#00E5FF]">
                Scan. Salvage.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#FFFFFF] to-[#00E5FF]">
                Build.
              </span>
            </h1>
            <p className="text-[#00D9FF]/90 text-sm font-medium tracking-wide">
              15,243 components in database
            </p>
          </div>

          {/* Circuit Board Decorative Element */}
          <div className="relative mb-3">
            <svg className="w-full h-12 opacity-60" viewBox="0 0 400 50" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00D9FF" stopOpacity="0" />
                  <stop offset="30%" stopColor="#00D9FF" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#00D9FF" stopOpacity="1" />
                  <stop offset="70%" stopColor="#00D9FF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Center chip */}
              <rect x="175" y="10" width="50" height="30" rx="4" fill="none" stroke="url(#circuitGrad)" strokeWidth="1.5" />
              <rect x="185" y="18" width="30" height="14" rx="2" fill="#00D9FF" fillOpacity="0.2" />
              {/* Left traces */}
              <path d="M175 25 L120 25 L100 15 L50 15" stroke="url(#circuitGrad)" strokeWidth="1.5" fill="none" />
              <path d="M175 30 L130 30 L110 40 L60 40" stroke="url(#circuitGrad)" strokeWidth="1" fill="none" />
              <circle cx="50" cy="15" r="3" fill="#00D9FF" fillOpacity="0.5" />
              <circle cx="60" cy="40" r="2" fill="#00D9FF" fillOpacity="0.4" />
              {/* Right traces */}
              <path d="M225 25 L280 25 L300 15 L350 15" stroke="url(#circuitGrad)" strokeWidth="1.5" fill="none" />
              <path d="M225 30 L270 30 L290 40 L340 40" stroke="url(#circuitGrad)" strokeWidth="1" fill="none" />
              <circle cx="350" cy="15" r="3" fill="#00D9FF" fillOpacity="0.5" />
              <circle cx="340" cy="40" r="2" fill="#00D9FF" fillOpacity="0.4" />
            </svg>
          </div>

          {/* Primary Scan Button with Electric Lightning Effect */}
          <button
            onClick={() => navigate('/scanner')}
            className="w-full mb-6 group relative scan-button-electric"
          >
            {/* Outer glow */}
            <div className="absolute -inset-2 bg-[#00D9FF]/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
            
            {/* Lightning border container */}
            <div className="absolute -inset-[3px] rounded-2xl overflow-hidden">
              {/* Animated electric arcs */}
              <div className="absolute inset-0 electric-border" />
            </div>
            
            {/* Button content */}
            <div className="relative bg-gradient-to-r from-[#0891B2] via-[#00D9FF] to-[#0891B2] rounded-xl py-4 px-6 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(0,217,255,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Camera className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.5} />
              <span className="text-white text-xl font-bold tracking-wide drop-shadow-lg">Scan</span>
            </div>
          </button>

          {/* Feature Cards */}
          <div className="space-y-3">
            
            {/* Track Inventory */}
            <div className="bg-[#0D1B2A]/95 border border-[#00D9FF]/40 rounded-2xl p-4 backdrop-blur-sm shadow-[0_0_20px_rgba(0,217,255,0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#8B6914]/30 flex items-center justify-center flex-shrink-0 border border-[#D4A542]/20">
                  <Package className="w-6 h-6 text-[#D4A542]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base">Track Inventory</h3>
                  <p className="text-gray-400 text-sm leading-snug">
                    Keep tabs on all your collected items easily
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/inventory')}
                  size="sm"
                  className="bg-[#00D9FF] hover:bg-[#00C4E8] text-[#0A1929] font-semibold rounded-full px-4 h-9 flex-shrink-0 shadow-lg"
                >
                  Manage Items
                </Button>
              </div>
            </div>

            {/* Find Tools */}
            <div className="bg-[#0D1B2A]/95 border border-[#00D9FF]/40 rounded-2xl p-4 backdrop-blur-sm shadow-[0_0_20px_rgba(0,217,255,0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#4A5568]/30 flex items-center justify-center flex-shrink-0 border border-[#718096]/20">
                  <Wrench className="w-6 h-6 text-[#A0AEC0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base">Find Tools</h3>
                  <p className="text-gray-400 text-sm leading-snug">
                    Locate needed tools and resources quickly
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/tools')}
                  size="sm"
                  className="bg-[#00D9FF] hover:bg-[#00C4E8] text-[#0A1929] font-semibold rounded-full px-4 h-9 flex-shrink-0 shadow-lg"
                >
                  Explore Tools
                </Button>
              </div>
            </div>

            {/* Marketplace */}
            <div className="bg-[#0D1B2A]/95 border border-[#00D9FF]/40 rounded-2xl p-4 backdrop-blur-sm shadow-[0_0_20px_rgba(0,217,255,0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/15 flex items-center justify-center flex-shrink-0 border border-[#00D9FF]/30">
                  <ShoppingBag className="w-6 h-6 text-[#00D9FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base">Marketplace</h3>
                  <p className="text-gray-400 text-sm leading-snug">
                    Sell your salvaged parts to others
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/marketplace')}
                  size="sm"
                  className="bg-[#00D9FF] hover:bg-[#00C4E8] text-[#0A1929] font-semibold rounded-full px-4 h-9 flex-shrink-0 shadow-lg"
                >
                  Browse & Sell
                </Button>
              </div>
            </div>

            {/* Build Projects */}
            <div className="bg-[#0D1B2A]/95 border border-[#00D9FF]/40 rounded-2xl p-4 backdrop-blur-sm shadow-[0_0_20px_rgba(0,217,255,0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/15 flex items-center justify-center flex-shrink-0 border border-[#00D9FF]/30">
                  <Hammer className="w-6 h-6 text-[#00D9FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base">Build Projects</h3>
                  <p className="text-gray-400 text-sm leading-snug">
                    Create amazing things from salvaged components
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/projects')}
                  size="sm"
                  className="bg-[#00D9FF] hover:bg-[#00C4E8] text-[#0A1929] font-semibold rounded-full px-4 h-9 flex-shrink-0 shadow-lg"
                >
                  Start Building
                </Button>
              </div>
            </div>

            {/* Recent Item */}
            <div className="bg-[#0D1B2A]/95 border border-[#00D9FF]/40 rounded-2xl p-4 backdrop-blur-sm shadow-[0_0_20px_rgba(0,217,255,0.1)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/15 flex items-center justify-center flex-shrink-0 border border-[#00D9FF]/30">
                  <Camera className="w-6 h-6 text-[#00D9FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base">Recent Item</h3>
                  {recentScan ? (
                    <>
                      <p className="text-gray-300 text-sm truncate">{recentScan.component_name}</p>
                      <p className="text-gray-500 text-xs">
                        Identified {formatDistanceToNow(new Date(recentScan.scanned_at), { addSuffix: true })}.
                      </p>
                      <button 
                        onClick={() => navigate('/inventory')}
                        className="text-[#00D9FF] text-sm font-medium hover:underline"
                      >
                        View details.
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300 text-sm">Vintage Gear</p>
                      <p className="text-gray-500 text-xs">Identified 2 hours ago.</p>
                      <button className="text-[#00D9FF] text-sm font-medium hover:underline">
                        View details.
                      </button>
                    </>
                  )}
                </div>
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#00D9FF]/20">
                  {recentScan?.image_url ? (
                    <img 
                      src={recentScan.image_url} 
                      alt={recentScan.component_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#8B6914] to-[#5C4A0F] flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#D4A542]/60" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

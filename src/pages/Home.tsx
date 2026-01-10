/**
 * HOME PAGE - Scavy
 * Dark electric blue design with circuit board pattern
 */

import { useNavigate } from 'react-router-dom';
import { Camera, Package, Wrench, MapPin } from 'lucide-react';
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
      <div className="min-h-screen bg-[#0A1828] relative overflow-hidden">
        {/* Circuit Board Pattern Background */}
        <div 
          className="fixed inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%2300D9FF' stroke-width='0.5'%3E%3Cpath d='M0 50h40M60 50h40M50 0v40M50 60v40'/%3E%3Ccircle cx='50' cy='50' r='3'/%3E%3Ccircle cx='0' cy='50' r='2'/%3E%3Ccircle cx='100' cy='50' r='2'/%3E%3Ccircle cx='50' cy='0' r='2'/%3E%3Ccircle cx='50' cy='100' r='2'/%3E%3Cpath d='M20 20h10v10H20zM70 20h10v10H70zM20 70h10v10H20zM70 70h10v10H70z'/%3E%3Cpath d='M25 0v20M75 0v20M25 80v20M75 80v20M0 25h20M80 25h20M0 75h20M80 75h20'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content Container */}
        <div className="relative px-5 pt-10 pb-28 max-w-lg mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6">
            <ScavyLogo size="md" className="justify-center" />
          </div>

          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-5xl font-black leading-[1.1] mb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-white to-[#00D9FF]">Scan. Salvage.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-white to-[#00D9FF]">Build.</span>
            </h1>
            <p className="text-[#00D9FF]/80 text-sm font-medium">
              15,243 components in database
            </p>
          </div>

          {/* Primary Scan Button with Electric Effect */}
          <button
            onClick={() => navigate('/scanner')}
            className="w-full mb-8 group relative"
          >
            {/* Electric glow effect */}
            <div className="absolute inset-0 bg-[#00D9FF] rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
            
            {/* Electric border animation */}
            <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent animate-electric-slide" />
            </div>
            
            {/* Button content */}
            <div className="relative bg-gradient-to-r from-[#00A8CC] via-[#00D9FF] to-[#00A8CC] rounded-2xl p-4 flex items-center justify-center gap-3 border border-[#00D9FF]/50 shadow-[0_0_30px_rgba(0,217,255,0.4)]">
              <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
              <span className="text-white text-xl font-bold tracking-wide">Scan</span>
            </div>
          </button>

          {/* Feature Cards */}
          <div className="space-y-4">
            
            {/* Track Inventory */}
            <div className="bg-[#0D1B2A]/90 border border-[#00D9FF]/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#8B6914]/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-[#D4A542]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg">Track Inventory</h3>
                  <p className="text-gray-400 text-sm">
                    Keep tabs on all your collected items easily
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/inventory')}
                  className="bg-[#00D9FF] hover:bg-[#00B8DD] text-[#0A1828] font-semibold rounded-full px-5 h-10 flex-shrink-0"
                >
                  Manage Items
                </Button>
              </div>
            </div>

            {/* Find Tools */}
            <div className="bg-[#0D1B2A]/90 border border-[#00D9FF]/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#4A5568]/20 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-[#A0AEC0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg">Find Tools</h3>
                  <p className="text-gray-400 text-sm">
                    Locate needed tools and resources quickly
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/tools')}
                  className="bg-[#00D9FF] hover:bg-[#00B8DD] text-[#0A1828] font-semibold rounded-full px-5 h-10 flex-shrink-0"
                >
                  Explore Tools
                </Button>
              </div>
            </div>

            {/* Find Parts */}
            <div className="bg-[#0D1B2A]/90 border border-[#00D9FF]/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#00D9FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg">Find Parts</h3>
                  <p className="text-gray-400 text-sm">
                    Locate needed parts nearby
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/marketplace')}
                  className="bg-[#00D9FF] hover:bg-[#00B8DD] text-[#0A1828] font-semibold rounded-full px-5 h-10 flex-shrink-0"
                >
                  Search Nearby
                </Button>
              </div>
            </div>

            {/* Recent Item */}
            <div className="bg-[#0D1B2A]/90 border border-[#00D9FF]/30 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-[#00D9FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg">Recent Item</h3>
                  {recentScan ? (
                    <>
                      <p className="text-gray-300 text-sm truncate">{recentScan.component_name}</p>
                      <p className="text-gray-500 text-xs">
                        Identified {formatDistanceToNow(new Date(recentScan.scanned_at), { addSuffix: true })}
                      </p>
                      <button 
                        onClick={() => navigate('/inventory')}
                        className="text-[#00D9FF] text-sm font-medium hover:underline"
                      >
                        View details.
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">No items scanned yet</p>
                  )}
                </div>
                {recentScan?.image_url && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={recentScan.image_url} 
                      alt={recentScan.component_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

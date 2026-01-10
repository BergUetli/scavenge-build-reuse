/**
 * HOME PAGE - Scavy (Design B: Neo-Brutalist Style)
 * Bold lime green with black background and thick borders
 */

import { useNavigate } from 'react-router-dom';
import { Package, Wrench, ShoppingBag, Hammer, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function HomeB() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-black relative overflow-hidden">
        
        {/* Content Container */}
        <div className="relative px-5 pt-8 pb-28 max-w-lg mx-auto">
          
          {/* Logo - Top Left */}
          <div className="mb-12">
            <h1 className="text-[#CDFF00] text-3xl font-black tracking-tight uppercase">
              SCAVY
            </h1>
          </div>

          {/* Huge Bold Hero Text */}
          <div className="mb-8">
            <h2 
              className="text-white text-7xl font-black leading-none tracking-tighter uppercase mb-6"
              style={{
                fontFamily: "'Impact', 'Arial Black', sans-serif",
              }}
            >
              SCAN
              <br />
              YOUR
              <br />
              JUNK
            </h2>
          </div>

          {/* START SCANNING Button - Lime Green with Thick Border */}
          <button
            onClick={() => navigate('/scanner')}
            className="w-full mb-10 group relative"
          >
            <div 
              className="bg-[#CDFF00] text-black font-black text-xl py-6 rounded-lg border-4 border-black hover:translate-y-[-2px] transition-transform uppercase tracking-wide"
              style={{
                boxShadow: '4px 4px 0 0 #000000',
              }}
            >
              START SCANNING
            </div>
          </button>

          {/* Feature Cards - White with Black Borders */}
          <div className="space-y-4">
            
            {/* Track Inventory */}
            <button
              onClick={() => navigate('/inventory')}
              className="w-full group"
            >
              <div 
                className="bg-white rounded-lg border-3 border-black p-5 flex items-center justify-between hover:translate-y-[-2px] transition-transform"
                style={{
                  boxShadow: '4px 4px 0 0 #000000',
                  border: '3px solid black',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-[#CDFF00]" strokeWidth={3} />
                  </div>
                  <h3 className="text-black font-black text-lg uppercase tracking-tight text-left">
                    Track Inventory
                  </h3>
                </div>
                <ArrowRight className="w-8 h-8 text-black" strokeWidth={3} />
              </div>
            </button>

            {/* Find Tools */}
            <button
              onClick={() => navigate('/tools')}
              className="w-full group"
            >
              <div 
                className="bg-white rounded-lg border-3 border-black p-5 flex items-center justify-between hover:translate-y-[-2px] transition-transform"
                style={{
                  boxShadow: '4px 4px 0 0 #000000',
                  border: '3px solid black',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-6 h-6 text-[#CDFF00]" strokeWidth={3} />
                  </div>
                  <h3 className="text-black font-black text-lg uppercase tracking-tight text-left">
                    Find Tools
                  </h3>
                </div>
                <ArrowRight className="w-8 h-8 text-black" strokeWidth={3} />
              </div>
            </button>

            {/* Marketplace */}
            <button
              onClick={() => navigate('/marketplace')}
              className="w-full group"
            >
              <div 
                className="bg-white rounded-lg border-3 border-black p-5 flex items-center justify-between hover:translate-y-[-2px] transition-transform"
                style={{
                  boxShadow: '4px 4px 0 0 #000000',
                  border: '3px solid black',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 text-[#CDFF00]" strokeWidth={3} />
                  </div>
                  <h3 className="text-black font-black text-lg uppercase tracking-tight text-left">
                    Marketplace
                  </h3>
                </div>
                <ArrowRight className="w-8 h-8 text-black" strokeWidth={3} />
              </div>
            </button>

            {/* Build Projects */}
            <button
              onClick={() => navigate('/projects')}
              className="w-full group"
            >
              <div 
                className="bg-white rounded-lg border-3 border-black p-5 flex items-center justify-between hover:translate-y-[-2px] transition-transform"
                style={{
                  boxShadow: '4px 4px 0 0 #000000',
                  border: '3px solid black',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hammer className="w-6 h-6 text-[#CDFF00]" strokeWidth={3} />
                  </div>
                  <h3 className="text-black font-black text-lg uppercase tracking-tight text-left">
                    Build Projects
                  </h3>
                </div>
                <ArrowRight className="w-8 h-8 text-black" strokeWidth={3} />
              </div>
            </button>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/**
 * HOME PAGE - Scavy (Design A: Tech Circuit Board Style)
 * Dark hexagon pattern with electric blue glowing effects
 */

import { useNavigate } from 'react-router-dom';
import { Package, Wrench, ShoppingBag, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';

export default function Home() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0A1520] relative overflow-hidden">
        {/* Hexagon Pattern Background */}
        <div 
          className="fixed inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%2300D9FF' stroke-width='0.5'%3E%3Cpath d='M50 10 L75 25 L75 50 L50 65 L25 50 L25 25 Z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Floating Circuit Board Decoration - Top Right */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="10" y="10" width="80" height="60" fill="none" stroke="#00D9FF" strokeWidth="1"/>
            <circle cx="20" cy="20" r="3" fill="#00D9FF"/>
            <circle cx="80" cy="20" r="3" fill="#00D9FF"/>
            <circle cx="20" cy="60" r="3" fill="#00D9FF"/>
            <path d="M20 20 L50 40 L80 20" stroke="#00D9FF" strokeWidth="1" fill="none"/>
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative px-5 pt-6 pb-28 max-w-lg mx-auto">
          
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-white text-2xl font-bold tracking-wide">Scavy</h1>
          </div>

          {/* Hero Text with Cyan Glow */}
          <div className="mb-8">
            <h2 
              className="text-5xl font-black leading-tight mb-2"
              style={{
                color: '#FFFFFF',
                textShadow: '0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.3)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Scan.
              <br />
              Salvage.
              <br />
              Build.
            </h2>
            <p className="text-[#00D9FF] text-sm font-medium mt-4">
              15,243 components in database
            </p>
          </div>

          {/* Get Started Button with Electric Glow */}
          <button
            onClick={() => navigate('/scanner')}
            className="w-full mb-8 group relative"
          >
            {/* Outer glow animation */}
            <div className="absolute -inset-2 bg-[#00D9FF]/40 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
            
            {/* Button with jagged electric border effect */}
            <div 
              className="relative bg-[#00D9FF] text-[#0A1520] font-bold text-lg py-5 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                boxShadow: '0 0 30px rgba(0, 217, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3)',
              }}
            >
              <span>Get Started</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5 L15 10 L10 15 L10 12 L5 12 L5 8 L10 8 Z"/>
              </svg>
            </div>
          </button>

          {/* Glowing Separator Line */}
          <div className="relative h-px mb-8">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent"
              style={{
                boxShadow: '0 0 10px rgba(0, 217, 255, 0.8)',
              }}
            />
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            
            {/* Track Inventory */}
            <div 
              className="group bg-gradient-to-br from-[#1A2635] to-[#0F1820] border border-[#00D9FF]/30 rounded-2xl p-5 cursor-pointer hover:border-[#00D9FF]/60 transition-all"
              style={{
                boxShadow: '0 4px 20px rgba(0, 217, 255, 0.1)',
              }}
              onClick={() => navigate('/inventory')}
            >
              <div className="flex items-center gap-4">
                {/* Icon with circuit pattern */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="absolute inset-0 bg-[#00D9FF]/10 rounded-xl border border-[#00D9FF]/30 flex items-center justify-center">
                    <Package className="w-8 h-8 text-[#00D9FF]" />
                  </div>
                  {/* Small circuit lines */}
                  <svg className="absolute -top-1 -right-1 w-6 h-6 opacity-40" viewBox="0 0 20 20">
                    <path d="M0 10 L10 10 L15 5" stroke="#00D9FF" strokeWidth="1" fill="none"/>
                    <circle cx="15" cy="5" r="2" fill="#00D9FF"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg mb-1">Track Inventory</h3>
                  <p className="text-gray-400 text-sm">
                    Access and manage salvageable parts.
                  </p>
                </div>
                
                <svg className="w-6 h-6 text-[#00D9FF] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Find Tools */}
            <div 
              className="group bg-gradient-to-br from-[#1A2635] to-[#0F1820] border border-[#00D9FF]/30 rounded-2xl p-5 cursor-pointer hover:border-[#00D9FF]/60 transition-all"
              style={{
                boxShadow: '0 4px 20px rgba(0, 217, 255, 0.1)',
              }}
              onClick={() => navigate('/tools')}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="absolute inset-0 bg-[#00D9FF]/10 rounded-xl border border-[#00D9FF]/30 flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-[#00D9FF]" />
                  </div>
                  <svg className="absolute -top-1 -right-1 w-6 h-6 opacity-40" viewBox="0 0 20 20">
                    <path d="M0 10 L10 10 L15 5" stroke="#00D9FF" strokeWidth="1" fill="none"/>
                    <circle cx="15" cy="5" r="2" fill="#00D9FF"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg mb-1">Find Tools</h3>
                  <p className="text-gray-400 text-sm">
                    Locate needed tools and resources quickly.
                  </p>
                </div>
                
                <svg className="w-6 h-6 text-[#00D9FF] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Marketplace */}
            <div 
              className="group bg-gradient-to-br from-[#1A2635] to-[#0F1820] border border-[#00D9FF]/30 rounded-2xl p-5 cursor-pointer hover:border-[#00D9FF]/60 transition-all"
              style={{
                boxShadow: '0 4px 20px rgba(0, 217, 255, 0.1)',
              }}
              onClick={() => navigate('/marketplace')}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="absolute inset-0 bg-[#00D9FF]/10 rounded-xl border border-[#00D9FF]/30 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-[#00D9FF]" />
                  </div>
                  <svg className="absolute -top-1 -right-1 w-6 h-6 opacity-40" viewBox="0 0 20 20">
                    <path d="M0 10 L10 10 L15 5" stroke="#00D9FF" strokeWidth="1" fill="none"/>
                    <circle cx="15" cy="5" r="2" fill="#00D9FF"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg mb-1">Marketplace</h3>
                  <p className="text-gray-400 text-sm">
                    Sell your salvaged parts to others.
                  </p>
                </div>
                
                <svg className="w-6 h-6 text-[#00D9FF] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Build Projects */}
            <div 
              className="group bg-gradient-to-br from-[#1A2635] to-[#0F1820] border border-[#00D9FF]/30 rounded-2xl p-5 cursor-pointer hover:border-[#00D9FF]/60 transition-all"
              style={{
                boxShadow: '0 4px 20px rgba(0, 217, 255, 0.1)',
              }}
              onClick={() => navigate('/projects')}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="absolute inset-0 bg-[#00D9FF]/10 rounded-xl border border-[#00D9FF]/30 flex items-center justify-center">
                    <Hammer className="w-8 h-8 text-[#00D9FF]" />
                  </div>
                  <svg className="absolute -top-1 -right-1 w-6 h-6 opacity-40" viewBox="0 0 20 20">
                    <path d="M0 10 L10 10 L15 5" stroke="#00D9FF" strokeWidth="1" fill="none"/>
                    <circle cx="15" cy="5" r="2" fill="#00D9FF"/>
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg mb-1">Build Projects</h3>
                  <p className="text-gray-400 text-sm">
                    Create amazing things from salvaged components.
                  </p>
                </div>
                
                <svg className="w-6 h-6 text-[#00D9FF] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}

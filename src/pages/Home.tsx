/**
 * HOME PAGE - Scavy (EXACT match to user's mockup)
 * Tech circuit board style with 3 square tiles and component library
 */

import { useNavigate } from 'react-router-dom';
import { Camera, Package, Wrench, Hammer, Layers, Activity } from 'lucide-react';
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
        <div className="absolute top-4 right-4 w-24 h-24 opacity-50">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="10" y="10" width="60" height="50" fill="#00D9FF" opacity="0.2" rx="4"/>
            <rect x="15" y="15" width="50" height="40" fill="none" stroke="#00D9FF" strokeWidth="1"/>
            <circle cx="25" cy="25" r="3" fill="#00D9FF"/>
            <circle cx="55" cy="25" r="3" fill="#00D9FF"/>
            <circle cx="25" cy="45" r="3" fill="#00D9FF"/>
            <circle cx="55" cy="45" r="3" fill="#00D9FF"/>
            <path d="M25 25 L40 35 L55 25" stroke="#00D9FF" strokeWidth="1" fill="none"/>
            <text x="30" y="38" fill="#00D9FF" fontSize="8" fontWeight="bold">PCB</text>
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative px-5 pt-6 pb-28 max-w-lg mx-auto">
          
          {/* Logo with Version */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold tracking-wide">Scavy</h1>
            <span className="text-[#00D9FF]/40 text-xs font-mono tracking-wider">v0.9.4</span>
          </div>

          {/* Hero Text with Cyan Glow */}
          <div className="mb-6">
            <h2 
              className="text-5xl font-black leading-tight mb-3"
              style={{
                color: '#FFFFFF',
                textShadow: '0 0 30px rgba(0, 217, 255, 0.8), 0 0 60px rgba(0, 217, 255, 0.4)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Scan.
              <br />
              Salvage.
              <br />
              Build.
            </h2>
            <p className="text-[#00D9FF] text-sm font-medium">
              15,243 components in database
            </p>
          </div>

          {/* Get Started Button with Electric Lightning Border */}
          <button
            onClick={() => navigate('/scanner')}
            className="w-full mb-8 group relative"
          >
            {/* Animated outer glow */}
            <div className="absolute -inset-3 bg-[#00D9FF]/30 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
            
            {/* Lightning/jagged border effect */}
            <div className="relative">
              <svg 
                className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none" 
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path 
                  d="M10 10 L50 20 L90 10 L130 25 L170 15 L210 20 L250 10 L290 25 L330 15 L370 20 L390 10 L390 90 L370 80 L330 85 L290 75 L250 90 L210 80 L170 85 L130 75 L90 90 L50 80 L10 90 Z" 
                  fill="none" 
                  stroke="#00D9FF" 
                  strokeWidth="2"
                  filter="url(#glow)"
                  opacity="0.6"
                />
              </svg>
              
              {/* Button */}
              <div 
                className="relative bg-[#00D9FF] text-[#0A1520] font-bold text-lg py-5 rounded-xl flex items-center justify-center gap-2 transition-all overflow-hidden"
                style={{
                  boxShadow: '0 0 40px rgba(0, 217, 255, 0.9), inset 0 0 30px rgba(255, 255, 255, 0.4)',
                }}
              >
                <span>Get Started</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 5 L15 10 L10 15 L10 12 L5 12 L5 8 L10 8 Z"/>
                </svg>
              </div>
            </div>
          </button>

          {/* THREE SQUARE TILES - Scan, Salvage, Build */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            
            {/* Scan Tile */}
            <button
              onClick={() => navigate('/scanner')}
              className="group aspect-square relative overflow-hidden rounded-2xl border border-[#00D9FF]/40 bg-gradient-to-br from-[#1A2635]/50 to-[#0F1820]/50"
            >
              {/* Circuit board pattern overlay */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Cg stroke='%2300D9FF' stroke-width='0.5' fill='none'%3E%3Cpath d='M0 25h15M35 25h15M25 0v15M25 35v15'/%3E%3Ccircle cx='25' cy='25' r='2'/%3E%3Crect x='10' y='10' width='8' height='8'/%3E%3Crect x='32' y='32' width='8' height='8'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative h-full flex flex-col items-center justify-center p-3">
                <Camera className="w-8 h-8 text-[#00D9FF] mb-2" strokeWidth={2} />
                <span className="text-white text-sm font-bold">Scan</span>
              </div>
            </button>

            {/* Salvage Tile */}
            <button
              onClick={() => navigate('/inventory')}
              className="group aspect-square relative overflow-hidden rounded-2xl border border-[#00D9FF]/40 bg-gradient-to-br from-[#1A2635]/50 to-[#0F1820]/50"
            >
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Cg stroke='%2300D9FF' stroke-width='0.5' fill='none'%3E%3Cpath d='M0 25h15M35 25h15M25 0v15M25 35v15'/%3E%3Ccircle cx='25' cy='25' r='2'/%3E%3Crect x='10' y='10' width='8' height='8'/%3E%3Crect x='32' y='32' width='8' height='8'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative h-full flex flex-col items-center justify-center p-3">
                <Package className="w-8 h-8 text-[#00D9FF] mb-2" strokeWidth={2} />
                <span className="text-white text-sm font-bold">Salvage</span>
              </div>
            </button>

            {/* Build Tile */}
            <button
              onClick={() => navigate('/projects')}
              className="group aspect-square relative overflow-hidden rounded-2xl border border-[#00D9FF]/40 bg-gradient-to-br from-[#1A2635]/50 to-[#0F1820]/50"
            >
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Cg stroke='%2300D9FF' stroke-width='0.5' fill='none'%3E%3Cpath d='M0 25h15M35 25h15M25 0v15M25 35v15'/%3E%3Ccircle cx='25' cy='25' r='2'/%3E%3Crect x='10' y='10' width='8' height='8'/%3E%3Crect x='32' y='32' width='8' height='8'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative h-full flex flex-col items-center justify-center p-3">
                <Hammer className="w-8 h-8 text-[#00D9FF] mb-2" strokeWidth={2} />
                <span className="text-white text-sm font-bold">Build</span>
              </div>
            </button>
          </div>

          {/* Glowing Blue Horizontal Line */}
          <div className="relative h-2 mb-8">
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent"
              style={{
                boxShadow: '0 0 20px rgba(0, 217, 255, 1), 0 0 40px rgba(0, 217, 255, 0.5)',
              }}
            />
            {/* Animated scan line */}
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
              style={{
                animation: 'scan 3s linear infinite',
              }}
            />
          </div>

          {/* Component Library Card with Glossy Blue Background */}
          <button
            onClick={() => navigate('/inventory')}
            className="w-full group relative overflow-hidden rounded-2xl"
          >
            {/* Glossy blue gradient background */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#0088CC] via-[#0066AA] to-[#004488]"
              style={{
                boxShadow: '0 8px 32px rgba(0, 136, 204, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
              }}
            />
            
            {/* Glass shine effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 50%, 0% 100%)',
              }}
            />
            
            <div className="relative p-5 flex items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 flex items-center justify-center flex-shrink-0">
                <Layers className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-white font-bold text-lg mb-1">Component Library</h3>
                <p className="text-white/80 text-sm">
                  Access and manage salvageable parts.
                </p>
              </div>
              
              <svg className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Performance Dashboard Card */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-4 group relative overflow-hidden rounded-2xl"
          >
            {/* Dark gradient background */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#1A2635] via-[#0F1820] to-[#0A1520]"
              style={{
                boxShadow: '0 8px 32px rgba(0, 217, 255, 0.2), inset 0 2px 10px rgba(0, 217, 255, 0.1)',
              }}
            />
            
            {/* Animated border glow */}
            <div 
              className="absolute inset-0 border-2 border-[#00D9FF]/30 rounded-2xl group-hover:border-[#00D9FF]/60 transition-colors"
            />
            
            <div className="relative p-5 flex items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-[#00D9FF]/10 backdrop-blur-sm rounded-xl border border-[#00D9FF]/30 flex items-center justify-center flex-shrink-0">
                <Activity className="w-8 h-8 text-[#00D9FF]" strokeWidth={2} />
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="text-white font-bold text-lg mb-1">Performance Dashboard</h3>
                <p className="text-[#00D9FF]/70 text-sm">
                  View scan metrics, speed, and AI costs.
                </p>
              </div>
              
              <svg className="w-6 h-6 text-[#00D9FF] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </AppLayout>
  );
}

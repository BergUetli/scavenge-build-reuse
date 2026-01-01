/**
 * JunkHauler Logo Component
 * Blue on white outline style - industrial salvage aesthetic
 */

import { cn } from '@/lib/utils';

interface JunkHaulerLogoProps {
  className?: string;
  size?: number;
}

export const JunkHaulerLogo = ({ className, size = 48 }: JunkHaulerLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Background circle with white fill */}
      <circle 
        cx="24" 
        cy="24" 
        r="22" 
        fill="white" 
        stroke="hsl(199, 89%, 48%)" 
        strokeWidth="2.5"
      />
      
      {/* Truck body - main hauler shape */}
      <path
        d="M10 28V22C10 20.8954 10.8954 20 12 20H26L30 24V28"
        stroke="hsl(199, 89%, 48%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Truck cab */}
      <path
        d="M30 24H35C36.1046 24 37 24.8954 37 26V28"
        stroke="hsl(199, 89%, 48%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Truck bed base */}
      <line
        x1="10"
        y1="28"
        x2="37"
        y2="28"
        stroke="hsl(199, 89%, 48%)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Front wheel */}
      <circle 
        cx="15" 
        cy="31" 
        r="3" 
        stroke="hsl(199, 89%, 48%)" 
        strokeWidth="2"
        fill="white"
      />
      
      {/* Rear wheel */}
      <circle 
        cx="32" 
        cy="31" 
        r="3" 
        stroke="hsl(199, 89%, 48%)" 
        strokeWidth="2"
        fill="white"
      />
      
      {/* Junk/cargo pile on truck - circuit board pattern */}
      <path
        d="M12 20V16L14 14H22L24 16V20"
        stroke="hsl(199, 89%, 48%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Circuit details on cargo */}
      <circle cx="15" cy="17" r="1" fill="hsl(199, 89%, 48%)" />
      <circle cx="18" cy="15" r="1" fill="hsl(199, 89%, 48%)" />
      <circle cx="21" cy="17" r="1" fill="hsl(199, 89%, 48%)" />
      
      {/* Connection lines */}
      <line x1="15" y1="17" x2="18" y2="15" stroke="hsl(199, 89%, 48%)" strokeWidth="1" />
      <line x1="18" y1="15" x2="21" y2="17" stroke="hsl(199, 89%, 48%)" strokeWidth="1" />
    </svg>
  );
};

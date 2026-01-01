/**
 * PARTICLE EFFECT COMPONENT
 * 
 * Creates spark/particle animations for success states.
 * Uses CSS animations for performance.
 */

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: 'primary' | 'accent' | 'success';
  delay: number;
}

interface ParticleEffectProps {
  /** Trigger the effect */
  trigger: boolean;
  /** Number of particles */
  count?: number;
  /** Type of effect */
  type?: 'sparks' | 'confetti' | 'burst';
  /** Called when animation completes */
  onComplete?: () => void;
  className?: string;
}

export function ParticleEffect({ 
  trigger, 
  count = 12, 
  type = 'sparks',
  onComplete,
  className 
}: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateParticles = useCallback(() => {
    const colors: Particle['color'][] = ['primary', 'accent', 'success'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i + Math.random() * 30 - 15;
      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        angle,
        speed: type === 'burst' ? 80 + Math.random() * 40 : 40 + Math.random() * 30,
        size: type === 'confetti' ? 6 + Math.random() * 4 : 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 100,
      });
    }

    return newParticles;
  }, [count, type]);

  useEffect(() => {
    if (trigger && !isAnimating) {
      setIsAnimating(true);
      setParticles(generateParticles());

      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setParticles([]);
        onComplete?.();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [trigger, isAnimating, generateParticles, onComplete]);

  if (!isAnimating || particles.length === 0) return null;

  return (
    <div 
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden z-50',
        className
      )}
      aria-hidden="true"
    >
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180;
        const endX = particle.x + Math.cos(radians) * particle.speed;
        const endY = particle.y + Math.sin(radians) * particle.speed;

        return (
          <div
            key={particle.id}
            className={cn(
              'absolute rounded-full',
              particle.color === 'primary' && 'bg-primary shadow-[0_0_6px_hsl(var(--primary))]',
              particle.color === 'accent' && 'bg-accent shadow-[0_0_6px_hsl(var(--accent))]',
              particle.color === 'success' && 'bg-success shadow-[0_0_6px_hsl(var(--success))]',
              type === 'confetti' && 'rounded-sm'
            )}
            style={{
              width: particle.size,
              height: type === 'confetti' ? particle.size * 1.5 : particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: 'translate(-50%, -50%)',
              animation: `particle-fly 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              animationDelay: `${particle.delay}ms`,
              '--end-x': `${endX - particle.x}%`,
              '--end-y': `${endY - particle.y}%`,
            } as React.CSSProperties}
          />
        );
      })}

      <style>{`
        @keyframes particle-fly {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + var(--end-x)),
              calc(-50% + var(--end-y))
            ) scale(0.3);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * SUCCESS SPARKS
 * Pre-configured for scan success states
 */
export function SuccessSparks({ trigger, onComplete }: { trigger: boolean; onComplete?: () => void }) {
  return (
    <ParticleEffect 
      trigger={trigger} 
      count={16} 
      type="sparks" 
      onComplete={onComplete}
    />
  );
}

/**
 * LEVEL UP BURST
 * More dramatic effect for achievements
 */
export function LevelUpBurst({ trigger, onComplete }: { trigger: boolean; onComplete?: () => void }) {
  return (
    <ParticleEffect 
      trigger={trigger} 
      count={24} 
      type="burst" 
      onComplete={onComplete}
    />
  );
}

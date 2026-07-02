'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  x: number; y: number; size: number; delay: number; duration: number; color: string;
  opacity: number; shape: 'circle' | 'square' | 'diamond';
}

const COLORS = [
  'rgba(124,58,237', 'rgba(6,182,212', 'rgba(236,72,153',
  'rgba(16,217,160', 'rgba(251,191,36',
];
const SHAPES: Particle['shape'][] = ['circle', 'square', 'diamond'];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1.5,
    delay: Math.random() * 10,
    duration: Math.random() * 8 + 5,
    color: COLORS[i % COLORS.length],
    opacity: Math.random() * 0.4 + 0.15,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  }));
}

export function ParticlesBackground({
  count = 80,
  interactive = true,
  className = '',
  style = {},
}: {
  count?: number;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
} = {}) {
  const [particles] = useState<Particle[]>(() => generateParticles(count));
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!interactive) return;
    const container = document.querySelector('[data-particles-container]');
    if (!container) return;
    const handleMove = (e: Event) => {
      const me = e as MouseEvent;
      const rect = (container as HTMLElement).getBoundingClientRect();
      setMousePos({
        x: ((me.clientX - rect.left) / rect.width) * 100,
        y: ((me.clientY - rect.top) / rect.height) * 100,
      });
    };
    const handleLeave = () => setMousePos(null);
    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseleave', handleLeave);
    return () => {
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('mouseleave', handleLeave);
    };
  }, [interactive]);

  return (
    <div
      data-particles-container
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={style}
    >
      {particles.map((p, i) => {
        const dist = mousePos
          ? Math.sqrt((mousePos.x - p.x) ** 2 + (mousePos.y - p.y) ** 2)
          : Infinity;
        const glowIntensity = dist < 20 ? (1 - dist / 20) * 15 : 0;
        const pulseScale = 1 + Math.sin(p.delay * 2 + i) * 0.1;

        const shapeStyle: React.CSSProperties =
          p.shape === 'circle'
            ? { borderRadius: '50%' }
            : p.shape === 'square'
            ? { borderRadius: '4px', transform: `rotate(${p.delay * 30}deg)` }
            : { borderRadius: '2px', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size * pulseScale}px`,
              height: `${p.size * pulseScale}px`,
              opacity: p.opacity * (dist < 20 ? 1 : 0.7),
              background: `${p.color},${Math.round(p.opacity * 255).toString(16).padStart(2, '0')})`,
              boxShadow: `0 0 ${p.size * 3 + glowIntensity}px ${p.color},0.4)`,
              animation: `pulse-glow ${p.duration}s ease-in-out ${p.delay}s infinite`,
              ...shapeStyle,
            }}
          />
        );
      })}

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] radial-glow radial-glow-purple animate-float-gentle" />
      <div className="absolute top-1/3 right-1/5 w-[250px] h-[250px] radial-glow radial-glow-cyan animate-float-gentle" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/5 w-[200px] h-[200px] radial-glow radial-glow-pink animate-float-gentle" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-[280px] h-[280px] radial-glow radial-glow-emerald animate-float-gentle" style={{ animationDelay: '6s' }} />
    </div>
  );
}

export default ParticlesBackground;
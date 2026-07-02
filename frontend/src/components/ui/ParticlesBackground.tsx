'use client';

import React from 'react';

interface Particle {
  x: number; y: number; size: number; delay: number; duration: number; color: string;
}

const PARTICLES: Particle[] = Array.from({ length: 60 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 8,
  duration: Math.random() * 6 + 4,
  color: i % 3 === 0 ? 'rgba(124,58,237,' : i % 3 === 1 ? 'rgba(6,182,212,' : 'rgba(236,72,153,',
}));

export function ParticlesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse-glow"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `${p.color}0.6)`,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}0.4)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default ParticlesBackground;

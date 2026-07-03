'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number;
  baseSize: number; opacity: number; baseOpacity: number;
  color: string; shape: number;
  pulseSpeed: number; pulsePhase: number;
}

interface MouseState { x: number; y: number; active: boolean; }

const COLORS: Record<string, string[]> = {
  auto: ['#7C3AED', '#06B6D4', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#FFFFFF'],
  purple: ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  cyan: ['#06B6D4', '#22D3EE', '#67E8F9', '#A5F3FC', '#CFFAFE'],
  warm: ['#EC4899', '#F43F5E', '#F59E0B', '#FBBF24', '#FFFFFF'],
  cool: ['#7C3AED', '#06B6D4', '#3B82F6', '#60A5FA', '#FFFFFF'],
};

const SHAPES = 5; // 0:circle,1:square,2:diamond,3:triangle,4:star

function drawShape(ctx: CanvasRenderingContext2D, shape: number, size: number) {
  const s = size / 2;
  ctx.beginPath();
  switch (shape) {
    case 0: ctx.arc(0, 0, s, 0, Math.PI * 2); break;
    case 1: ctx.rect(-s, -s, size, size); break;
    case 2:
      ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0);
      ctx.closePath(); break;
    case 3:
      ctx.moveTo(0, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s);
      ctx.closePath(); break;
    case 4: {
      const spikes = 5; const outerR = s; const innerR = s / 2;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        i === 0 ? ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle)) : ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
      }
      ctx.closePath(); break;
    }
  }
}

export function ParticlesBackground({
  count = 120, interactive = true, className = '', style = {},
  colorScheme = 'auto',
}: {
  count?: number; interactive?: boolean; className?: string; style?: React.CSSProperties;
  colorScheme?: 'auto' | 'purple' | 'cyan' | 'warm' | 'cool';
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MouseState>({ x: -1000, y: -1000, active: false });
  const rafRef = useRef<number>(0);
  const dimsRef = useRef({ w: 0, h: 0 });

  const initParticles = useCallback((w: number, h: number) => {
    const palette = COLORS[colorScheme] || COLORS.auto;
    const p: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 5 + 1;
      p.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: -(Math.random() * 0.2 + 0.05),
        size, baseSize: size, opacity: Math.random() * 0.5 + 0.15,
        baseOpacity: Math.random() * 0.5 + 0.15,
        color: palette[i % palette.length],
        shape: Math.floor(Math.random() * SHAPES),
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = p;
  }, [count, colorScheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      dimsRef.current = { w, h };
      initParticles(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (time: number) => {
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const connDist = 100;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        // Mouse interaction
        if (mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;
          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 0.5;
            p.vx += dx * force * 0.001;
            p.vy += dy * force * 0.001;
            p.size = p.baseSize + (1 - dist / maxDist) * 4;
            p.opacity = Math.min(1, p.baseOpacity + (1 - dist / maxDist) * 0.6);
          } else {
            p.size += (p.baseSize - p.size) * 0.05;
            p.opacity += (p.baseOpacity - p.opacity) * 0.05;
          }
        }
        // Speed limit
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 2) { p.vx *= 0.98; p.vy *= 0.98; }
        // Pulse
        const pulse = Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.15 + 1;
        const drawSize = p.size * pulse;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = drawSize * 3;
        drawShape(ctx, p.shape, drawSize);
        ctx.fill();
        ctx.restore();
      }

      // Connection lines
      if (particles.length > 1) {
        ctx.strokeStyle = 'rgba(124,58,237,0.08)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length - 1; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connDist) {
              if (mouse.active) {
                const mdx = (particles[i].x + particles[j].x) / 2 - mouse.x;
                const mdy = (particles[i].y + particles[j].y) / 2 - mouse.y;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mDist < 200) ctx.strokeStyle = `rgba(124,58,237,${0.15 * (1 - mDist / 200)})`;
                else ctx.strokeStyle = `rgba(124,58,237,${0.06 * (1 - dist / connDist)})`;
              } else {
                ctx.strokeStyle = `rgba(124,58,237,${0.06 * (1 - dist / connDist)})`;
              }
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initParticles]);

  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container || !interactive) return;
    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const handleLeave = () => { mouseRef.current = { x: -1000, y: -1000, active: false }; };
    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      particlesRef.current.forEach(p => {
        const dx = p.x - cx, dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - dist / 200) * 8;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      });
    };
    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseleave', handleLeave);
    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('mouseleave', handleLeave);
      container.removeEventListener('click', handleClick);
    };
  }, [interactive]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`} style={style}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Ambient glow orbs */}
      <div className="absolute top-1/5 left-1/5 w-[400px] h-[400px] radial-glow radial-glow-purple animate-float-gentle opacity-60" />
      <div className="absolute top-1/3 right-1/6 w-[300px] h-[300px] radial-glow radial-glow-cyan animate-float-gentle opacity-40" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] radial-glow radial-glow-pink animate-float-gentle opacity-30" style={{ animationDelay: '6s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] radial-glow radial-glow-emerald animate-float-gentle opacity-35" style={{ animationDelay: '9s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] radial-glow radial-glow-gold animate-float-gentle opacity-20" style={{ animationDelay: '12s' }} />
    </div>
  );
}

export default ParticlesBackground;

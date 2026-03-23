/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 1500;
    const heartPoints: { x: number; y: number }[] = [];

    // Heart parametric equation
    const getHeartPoint = (t: number) => {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return { x, y };
    };

    // Pre-calculate heart points
    for (let i = 0; i < Math.PI * 2; i += 0.01) {
      heartPoints.push(getHeartPoint(i));
    }

    class Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      speed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.targetX = this.x;
        this.targetY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 2 + 1;
        this.color = `rgba(255, ${Math.floor(Math.random() * 50 + 20)}, ${Math.floor(Math.random() * 50 + 20)}, `;
        this.alpha = Math.random();
        this.speed = Math.random() * 0.05 + 0.02;
      }

      update(targetX: number, targetY: number) {
        this.targetX = targetX;
        this.targetY = targetY;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        this.vx += dx * this.speed;
        this.vy += dy * this.speed;

        this.vx *= 0.9; // friction
        this.vy *= 0.9;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    let time = 0;
    const animate = () => {
      time += 0.05;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pulse effect
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      const scale = Math.min(canvas.width, canvas.height) / 40 * pulse;

      particles.forEach((p, i) => {
        const pointIndex = Math.floor((i / particleCount) * heartPoints.length);
        const point = heartPoints[pointIndex];
        
        const targetX = canvas.width / 2 + point.x * scale;
        const targetY = canvas.height / 2 + point.y * scale;

        p.update(targetX, targetY);
        p.draw(ctx);
      });

      // Add glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        id="heart-canvas"
      />
      <div className="absolute bottom-10 text-red-500/50 font-mono text-xs tracking-widest uppercase pointer-events-none">
        Pulsing Heart Animation
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';

export default function ParticleBackground({ className = "absolute inset-0 z-0 pointer-events-none" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const codeTokens = [
      '{ }', '< />', '=>', '01', '10', 'async', 'fn()', 'return',
      '0x7F', 'const', 'null', '&&', '!=', '++', '[ ]', 'import',
      'void', 'try', 'catch', 'let', 'await', 'eval', 'break', 'class'
    ];

    const cyberColors = [
      'rgba(59, 130, 246, ',   // Electric Blue
      'rgba(168, 85, 247, ',  // Cyber Purple
      'rgba(6, 182, 212, ',   // Neon Cyan
      'rgba(16, 185, 129, ',  // Terminal Emerald
    ];

    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class CodeParticle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
        this.isToken = Math.random() > 0.4;
        this.token = codeTokens[Math.floor(Math.random() * codeTokens.length)];
        this.colorPrefix = cyberColors[Math.floor(Math.random() * cyberColors.length)];
        
        this.speedY = -(Math.random() * 0.5 + 0.2);
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.baseSize = this.isToken ? (Math.random() * 3 + 14) : (Math.random() * 2 + 1.5);
        this.alpha = Math.random() * 0.45 + 0.2;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulse = Math.random() * Math.PI;
      }

      update(mouseX, mouseY) {
        this.y += this.speedY;
        this.x += this.speedX;
        this.pulse += this.pulseSpeed;

        // Interactive mouse repelling
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.x -= (dx / dist) * force * 3.5;
          this.y -= (dy / dist) * force * 3.5;
        }

        // Wrap around
        if (this.y < -30) this.reset(false);
        if (this.x < -30) this.x = canvas.width + 20;
        if (this.x > canvas.width + 30) this.x = -20;
      }

      draw() {
        const currentAlpha = Math.max(0.12, this.alpha + Math.sin(this.pulse) * 0.15);
        const color = `${this.colorPrefix}${currentAlpha})`;
        ctx.fillStyle = color;

        if (this.isToken) {
          ctx.save();
          ctx.shadowColor = `${this.colorPrefix}0.6)`;
          ctx.shadowBlur = 10;
          ctx.font = `600 ${Math.round(this.baseSize)}px "JetBrains Mono", Consolas, "Fira Code", monospace`;
          ctx.fillText(this.token, this.x, this.y);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const init = () => {
      particles = [];
      const density = Math.floor((canvas.width * canvas.height) / 16000);
      const count = Math.min(Math.max(density, 45), 90);
      for (let i = 0; i < count; i++) {
        particles.push(new CodeParticle());
      }
    };

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Clear with slight trailing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint cyber constellation connection lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update(mouseX, mouseY);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ opacity: 0.9 }}
    />
  );
}

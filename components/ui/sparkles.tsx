"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./sparkles.module.css";

type SparklesCoreProps = {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
  speed?: number;
  maxParticles?: number;
};

type Particle = {
  x: number;
  y: number;
  originX: number;
  size: number;
  alpha: number;
  phase: number;
  wave: number;
  velocityX: number;
  velocityY: number;
};

export function SparklesCore({
  id,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.2,
  particleDensity = 100,
  className,
  particleColor = "#FFFFFF",
  speed = 0.7,
  maxParticles = 900,
}: SparklesCoreProps) {
  const generatedId = useId();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return undefined;
    }

    let frameId = 0;
    let particles: Particle[] = [];
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const createParticle = (width: number, height: number, fromBottom = false): Particle => {
      const x = Math.random() * width;

      return {
        x,
        originX: x,
        y: fromBottom ? height + Math.random() * 18 : Math.random() * height,
        size: minSize + Math.random() * Math.max(maxSize - minSize, 0.1),
        alpha: 0.36 + Math.random() * 0.64,
        phase: Math.random() * Math.PI * 2,
        wave: 7 + Math.random() * 22,
        velocityX: (Math.random() - 0.5) * speed * 0.06,
        velocityY: -(0.12 + Math.random() * 0.48) * speed,
      };
    };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const count = Math.min(maxParticles, Math.max(48, Math.floor((width * height * particleDensity) / 750_000)));
      particles = Array.from({ length: count }, () => createParticle(width, height));
    };

    let tick = 0;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      tick += mediaQuery.matches ? 0.004 : 0.012 * speed;
      context.clearRect(0, 0, width, height);

      if (background !== "transparent") {
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
      }

      for (const particle of particles) {
        particle.phase += 0.01 * speed;
        particle.originX += particle.velocityX;
        particle.x = particle.originX + Math.sin(tick + particle.phase + particle.y * 0.014) * particle.wave;
        particle.y += particle.velocityY;

        if (particle.originX < -particle.wave) particle.originX = width + particle.wave;
        if (particle.originX > width + particle.wave) particle.originX = -particle.wave;
        if (particle.y < -12) {
          const replacement = createParticle(width, height, true);
          particle.x = replacement.x;
          particle.originX = replacement.originX;
          particle.y = replacement.y;
          particle.size = replacement.size;
          particle.alpha = replacement.alpha;
          particle.phase = replacement.phase;
          particle.wave = replacement.wave;
          particle.velocityX = replacement.velocityX;
          particle.velocityY = replacement.velocityY;
        }

        const verticalFade = Math.max(0, Math.min(1, 1 - particle.y / Math.max(height, 1)));
        const twinkle = 0.65 + Math.sin(tick * 5 + particle.phase) * 0.22;
        context.globalAlpha = (mediaQuery.matches ? 0.45 : 1) * particle.alpha * twinkle * (0.38 + verticalFade * 0.62);
        context.fillStyle = particleColor;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [background, maxParticles, maxSize, minSize, particleColor, particleDensity, speed]);

  return (
    <canvas
      aria-hidden="true"
      className={[styles.canvas, className ?? ""].filter(Boolean).join(" ")}
      id={id ?? generatedId}
      ref={canvasRef}
    />
  );
}

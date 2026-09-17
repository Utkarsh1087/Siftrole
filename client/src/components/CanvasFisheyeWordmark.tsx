"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface CanvasFisheyeWordmarkProps {
  text?: string;
  className?: string;
}

export function CanvasFisheyeWordmark({
  text = "siftrole",
  className = "",
}: CanvasFisheyeWordmarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation and physics state matching Kevin Levron's Framer component
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    vx: 0,
    vy: 0,
    isHovered: false,
    radius: 140,
    maxMagnification: 0.62, // 1 / 0.62 ~= 1.6x center zoom
  });
  const animationFrameRef = useRef<number | null>(null);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const offCanvas = offscreenCanvasRef.current;
    if (!canvas || !offCanvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !offCtx) return;

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    // Smooth physics with spring inertia
    const m = mouseRef.current;
    const spring = 0.22;
    const friction = 0.76;
    const ax = (m.targetX - m.x) * spring;
    const ay = (m.targetY - m.y) * spring;
    m.vx = (m.vx + ax) * friction;
    m.vy = (m.vy + ay) * friction;
    m.x += m.vx;
    m.y += m.vy;

    ctx.clearRect(0, 0, width, height);

    if (!m.isHovered && Math.abs(m.x - m.targetX) < 1 && Math.abs(m.y - m.targetY) < 1 && Math.abs(m.vx) < 0.1) {
      // Direct draw when at rest
      ctx.drawImage(offCanvas, 0, 0);
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    // Render base text
    ctx.drawImage(offCanvas, 0, 0);

    // Interactive Fisheye Lens with Chromatic Refraction
    const lensRadius = m.radius;
    if (m.x > -lensRadius && m.x < width + lensRadius && m.y > -lensRadius && m.y < height + lensRadius) {
      const minX = Math.max(0, Math.floor(m.x - lensRadius));
      const maxX = Math.min(width, Math.ceil(m.x + lensRadius));
      const minY = Math.max(0, Math.floor(m.y - lensRadius));
      const maxY = Math.min(height, Math.ceil(m.y + lensRadius));
      const boxW = maxX - minX;
      const boxH = maxY - minY;

      if (boxW > 0 && boxH > 0) {
        try {
          const srcData = offCtx.getImageData(minX, minY, boxW, boxH);
          const dstData = ctx.createImageData(boxW, boxH);
          const src = srcData.data;
          const dst = dstData.data;

          const radiusSq = lensRadius * lensRadius;

          for (let y = 0; y < boxH; y++) {
            const currentY = minY + y;
            const dy = currentY - m.y;
            for (let x = 0; x < boxW; x++) {
              const currentX = minX + x;
              const dx = currentX - m.x;
              const distSq = dx * dx + dy * dy;

              const dstIdx = (y * boxW + x) * 4;

              if (distSq < radiusSq) {
                const dist = Math.sqrt(distSq);
                const normDist = dist / lensRadius;

                // Authentic spherical fisheye distortion curve
                const curve = Math.sin((normDist * Math.PI) / 2);
                const baseFactor = m.maxMagnification + (1 - m.maxMagnification) * curve;

                // Subtle chromatic refraction
                const factorR = baseFactor * 0.988;
                const factorG = baseFactor;
                const factorB = baseFactor * 1.012;

                // Red sample
                const sXr = Math.round(m.x + dx * factorR);
                const sYr = Math.round(m.y + dy * factorR);
                if (sXr >= minX && sXr < maxX && sYr >= minY && sYr < maxY) {
                  const sIdx = ((sYr - minY) * boxW + (sXr - minX)) * 4;
                  dst[dstIdx] = src[sIdx];
                  dst[dstIdx + 3] = src[sIdx + 3];
                } else {
                  dst[dstIdx] = src[dstIdx];
                  dst[dstIdx + 3] = src[dstIdx + 3];
                }

                // Green sample
                const sXg = Math.round(m.x + dx * factorG);
                const sYg = Math.round(m.y + dy * factorG);
                if (sXg >= minX && sXg < maxX && sYg >= minY && sYg < maxY) {
                  const sIdx = ((sYg - minY) * boxW + (sXg - minX)) * 4;
                  dst[dstIdx + 1] = src[sIdx + 1];
                } else {
                  dst[dstIdx + 1] = src[dstIdx + 1];
                }

                // Blue sample
                const sXb = Math.round(m.x + dx * factorB);
                const sYb = Math.round(m.y + dy * factorB);
                if (sXb >= minX && sXb < maxX && sYb >= minY && sYb < maxY) {
                  const sIdx = ((sYb - minY) * boxW + (sXb - minX)) * 4;
                  dst[dstIdx + 2] = src[sIdx + 2];
                } else {
                  dst[dstIdx + 2] = src[dstIdx + 2];
                }
              } else {
                dst[dstIdx] = src[dstIdx];
                dst[dstIdx + 1] = src[dstIdx + 1];
                dst[dstIdx + 2] = src[dstIdx + 2];
                dst[dstIdx + 3] = src[dstIdx + 3];
              }
            }
          }

          ctx.putImageData(dstData, minX, minY);

          // Glass refraction perimeter ring
          ctx.beginPath();
          ctx.arc(m.x, m.y, lensRadius * 0.96, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Subtle lens highlight
          const grad = ctx.createRadialGradient(m.x, m.y, lensRadius * 0.3, m.x, m.y, lensRadius);
          grad.addColorStop(0, "rgba(52, 211, 153, 0.08)");
          grad.addColorStop(0.85, "rgba(16, 185, 129, 0.02)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fill();
        } catch {
          // Fallback if security restrictions block image data
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, []);

  // Update canvas size and redraw pre-rendered text to offscreen canvas
  const updateCanvasDimensions = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(rect.width);
    // Responsive font sizing based on container width
    const fontSize = Math.min(Math.max(width * 0.14, 52), 195);
    const height = Math.floor(fontSize * 1.15);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    mouseRef.current.radius = Math.min(fontSize * 0.88, 145) * dpr;

    // Setup offscreen canvas
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offCanvas = offscreenCanvasRef.current;
    offCanvas.width = width * dpr;
    offCanvas.height = height * dpr;

    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    offCtx.fillStyle = "#083327";
    offCtx.font = `600 ${fontSize * dpr}px "Plus Jakarta Sans", "Montserrat", var(--font-heading), -apple-system, BlinkMacSystemFont, sans-serif`;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.letterSpacing = "-0.035em";

    // Draw text in vertical center
    offCtx.fillText(text, (width * dpr) / 2, (height * dpr) / 2 + fontSize * dpr * 0.04);
  }, [text]);

  useEffect(() => {
    updateCanvasDimensions();
    animationFrameRef.current = requestAnimationFrame(renderFrame);

    window.addEventListener("resize", updateCanvasDimensions);
    return () => {
      window.removeEventListener("resize", updateCanvasDimensions);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateCanvasDimensions, renderFrame]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    mouseRef.current.targetX = (e.clientX - rect.left) * dpr;
    mouseRef.current.targetY = (e.clientY - rect.top) * dpr;
    mouseRef.current.isHovered = true;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
    mouseRef.current.vx = 0;
    mouseRef.current.vy = 0;
    mouseRef.current.isHovered = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.isHovered = false;
    mouseRef.current.targetX = -1000;
    mouseRef.current.targetY = -1000;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-visible select-none text-center ${className}`}
      data-cursor-hide="true"
    >
      <h1 className="sr-only">{text}</h1>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="mx-auto block cursor-none touch-none will-change-transform"
      />
    </div>
  );
}

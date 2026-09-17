"use client";

import React, { useEffect, useRef } from "react";

interface LiquidSilkBackgroundProps {
  imageSrc?: string;
  className?: string;
}

export function LiquidSilkBackground({
  imageSrc = "/images/emerald_silk_horizontal.jpg",
  className = "",
}: LiquidSilkBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try loading threejs-components LiquidBackground first
    async function loadThreeJsLiquid() {
      try {
        const dynamicImport = new Function("url", "return import(url)");
        const module = await dynamicImport(
          "https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js"
        );

        if (!isMounted || !canvasRef.current) return;

        const LiquidBackground = module.default || module;
        const app = LiquidBackground(canvasRef.current);
        appRef.current = app;

        // Use requested image or emerald silk
        app.loadImage(imageSrc || "https://assets.codepen.io/33787/liquid.webp");
        if (app.liquidPlane) {
          if (app.liquidPlane.material) {
            app.liquidPlane.material.metalness = 0.75;
            app.liquidPlane.material.roughness = 0.25;
          }
          if (app.liquidPlane.uniforms && app.liquidPlane.uniforms.displacementScale) {
            app.liquidPlane.uniforms.displacementScale.value = 5;
          }
        }
        if (typeof app.setRain === "function") {
          app.setRain(false);
        }
        return true;
      } catch {
        return false;
      }
    }

    // High-performance hardware-accelerated fluid wave simulation fallback
    function initNativeFluidEngine() {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc || "https://assets.codepen.io/33787/liquid.webp";

      let imgLoaded = false;
      img.onload = () => {
        imgLoaded = true;
        resize();
      };

      const simWidth = 160;
      const simHeight = 100;
      let buffer1 = new Float32Array(simWidth * simHeight);
      let buffer2 = new Float32Array(simWidth * simHeight);
      const damping = 0.965;

      let animationId: number;

      function resize() {
        if (!cvs) return;
        const rect = cvs.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cvs.width = Math.floor(rect.width * dpr);
        cvs.height = Math.floor(rect.height * dpr);
      }

      function addDrop(x: number, y: number, radius: number, strength: number) {
        const cx = Math.floor((x / cvs!.width) * simWidth);
        const cy = Math.floor((y / cvs!.height) * simHeight);

        for (let j = Math.max(0, cy - radius); j <= Math.min(simHeight - 1, cy + radius); j++) {
          for (let i = Math.max(0, cx - radius); i <= Math.min(simWidth - 1, cx + radius); i++) {
            const distSq = (i - cx) * (i - cx) + (j - cy) * (j - cy);
            if (distSq <= radius * radius) {
              const falloff = 1 - Math.sqrt(distSq) / radius;
              buffer1[j * simWidth + i] -= strength * falloff;
            }
          }
        }
      }

      let lastMouse = { x: -1000, y: -1000 };

      const onPointerMove = (e: MouseEvent) => {
        if (!cvs) return;
        const rect = cvs.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const currentX = (e.clientX - rect.left) * dpr;
        const currentY = (e.clientY - rect.top) * dpr;

        const dx = currentX - lastMouse.x;
        const dy = currentY - lastMouse.y;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed > 2) {
          addDrop(currentX, currentY, 4, Math.min(speed * 0.8, 45));
        }
        lastMouse = { x: currentX, y: currentY };
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener("mousemove", onPointerMove);
      }

      function updateWave() {
        for (let y = 1; y < simHeight - 1; y++) {
          for (let x = 1; x < simWidth - 1; x++) {
            const idx = y * simWidth + x;
            buffer2[idx] =
              (buffer1[idx - 1] +
                buffer1[idx + 1] +
                buffer1[idx - simWidth] +
                buffer1[idx + simWidth]) /
                2 -
              buffer2[idx];
            buffer2[idx] *= damping;
          }
        }

        const temp = buffer1;
        buffer1 = buffer2;
        buffer2 = temp;
      }

      // Pre-rendered offscreen background texture
      const offscreen = document.createElement("canvas");
      let offCtx: CanvasRenderingContext2D | null = null;

      function render() {
        if (!cvs || !ctx) return;
        updateWave();

        const w = cvs.width;
        const h = cvs.height;
        if (w === 0 || h === 0) {
          animationId = requestAnimationFrame(render);
          return;
        }

        if (offscreen.width !== w || offscreen.height !== h) {
          offscreen.width = w;
          offscreen.height = h;
          offCtx = offscreen.getContext("2d", { willReadFrequently: true });
        }

        if (offCtx && imgLoaded) {
          offCtx.drawImage(img, 0, 0, w, h);
        }

        ctx.clearRect(0, 0, w, h);
        if (offCtx && imgLoaded) {
          try {
            const srcData = offCtx.getImageData(0, 0, w, h);
            const dstData = ctx.createImageData(w, h);
            const src = srcData.data;
            const dst = dstData.data;

            const scaleX = simWidth / w;
            const scaleY = simHeight / h;

            for (let y = 0; y < h; y += 2) {
              const simY = Math.min(simHeight - 2, Math.floor(y * scaleY));
              for (let x = 0; x < w; x += 2) {
                const simX = Math.min(simWidth - 2, Math.floor(x * scaleX));
                const sIdx = simY * simWidth + simX;

                // Surface normal gradient
                const dx = (buffer1[sIdx + 1] - buffer1[sIdx - 1]) * 1.8;
                const dy = (buffer1[sIdx + simWidth] - buffer1[sIdx - simWidth]) * 1.8;

                const refrX = Math.max(0, Math.min(w - 1, Math.round(x + dx)));
                const refrY = Math.max(0, Math.min(h - 1, Math.round(y + dy)));

                const srcP = (refrY * w + refrX) * 4;
                const dstP = (y * w + x) * 4;

                // Specular reflection (metalness 0.75, roughness 0.25)
                const spec = Math.max(0, (dx + dy) * 0.65);

                const r = Math.min(255, src[srcP] + spec * 22);
                const g = Math.min(255, src[srcP + 1] + spec * 38);
                const b = Math.min(255, src[srcP + 2] + spec * 28);
                const a = src[srcP + 3] || 255;

                // 2x2 pixel write for 60fps performance
                dst[dstP] = r;
                dst[dstP + 1] = g;
                dst[dstP + 2] = b;
                dst[dstP + 3] = a;

                dst[dstP + 4] = r;
                dst[dstP + 5] = g;
                dst[dstP + 6] = b;
                dst[dstP + 7] = a;

                const nextRowP = dstP + w * 4;
                dst[nextRowP] = r;
                dst[nextRowP + 1] = g;
                dst[nextRowP + 2] = b;
                dst[nextRowP + 3] = a;

                dst[nextRowP + 4] = r;
                dst[nextRowP + 5] = g;
                dst[nextRowP + 6] = b;
                dst[nextRowP + 7] = a;
              }
            }
            ctx.putImageData(dstData, 0, 0);
          } catch {
            ctx.drawImage(img, 0, 0, w, h);
          }
        } else if (imgLoaded) {
          ctx.drawImage(img, 0, 0, w, h);
        }

        animationId = requestAnimationFrame(render);
      }

      window.addEventListener("resize", resize);
      resize();
      animationId = requestAnimationFrame(render);

      return () => {
        if (container) {
          container.removeEventListener("mousemove", onPointerMove);
        }
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animationId);
      };
    }

    let cleanupNative: (() => void) | undefined;

    loadThreeJsLiquid().then((success) => {
      if (!success && isMounted) {
        cleanupNative = initNativeFluidEngine();
      }
    });

    return () => {
      isMounted = false;
      if (cleanupNative) cleanupNative();
      if (appRef.current && typeof appRef.current.dispose === "function") {
        try {
          appRef.current.dispose();
        } catch {
          // ignore
        }
      }
    };
  }, [imageSrc]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-auto select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        className="w-full h-full object-cover block will-change-transform"
        style={{
          filter: "brightness(0.85) contrast(1.1)",
        }}
      />
    </div>
  );
}

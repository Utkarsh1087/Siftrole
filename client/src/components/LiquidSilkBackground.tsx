"use client";

import React, { useEffect, useRef } from "react";

interface LiquidSilkBackgroundProps {
  imageSrc?: string;
  className?: string;
  nativeOnly?: boolean;
}

export function LiquidSilkBackground({
  imageSrc = "/images/auth_fern_frame.jpg",
  className = "",
  nativeOnly = false,
}: LiquidSilkBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Load original threejs-components LiquidBackground
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

        app.loadImage(imageSrc || "/images/auth_fern_frame.jpg");

        if (app.liquidPlane) {
          if (app.liquidPlane.material) {
            // Low metalness/roughness so specular highlights don't bloom white
            app.liquidPlane.material.metalness = 0.05;
            app.liquidPlane.material.roughness = 0.85;
            app.liquidPlane.material.envMapIntensity = 0.2;
          }
          if (app.liquidPlane.uniforms && app.liquidPlane.uniforms.displacementScale) {
            app.liquidPlane.uniforms.displacementScale.value = 5;
          }
        }

        // Dim all lights in the scene so the whitish spotlight is removed
        if (app.scene) {
          app.scene.traverse((obj: any) => {
            if (obj.isLight) {
              obj.intensity = obj.intensity * 0.12;
            }
          });
        }
        // Also try renderer tone mapping if accessible
        if (app.renderer) {
          app.renderer.toneMapping = 0; // NoToneMapping
          app.renderer.toneMappingExposure = 0.85;
        }

        if (typeof app.setRain === "function") {
          app.setRain(false);
        }
        return true;
      } catch {
        return false;
      }
    }

    // Hardware-accelerated fluid wave fallback
    function initNativeFluidEngine() {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc || "/images/auth_fern_frame.jpg";

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
          ctx.clearRect(0, 0, w, h);

          try {
            const srcData = offCtx.getImageData(0, 0, w, h);
            const dstData = new ImageData(new Uint8ClampedArray(srcData.data), w, h);
            const src = srcData.data;
            const dst = dstData.data;
            const scaleX = simWidth / w;
            const scaleY = simHeight / h;
            const sampleWave = (x: number, y: number) => {
              const x0 = Math.max(0, Math.min(simWidth - 1, Math.floor(x)));
              const y0 = Math.max(0, Math.min(simHeight - 1, Math.floor(y)));
              const x1 = Math.min(simWidth - 1, x0 + 1);
              const y1 = Math.min(simHeight - 1, y0 + 1);
              const xFraction = x - x0;
              const yFraction = y - y0;
              const top = buffer1[y0 * simWidth + x0] * (1 - xFraction) +
                buffer1[y0 * simWidth + x1] * xFraction;
              const bottom = buffer1[y1 * simWidth + x0] * (1 - xFraction) +
                buffer1[y1 * simWidth + x1] * xFraction;
              return top * (1 - yFraction) + bottom * yFraction;
            };

            for (let y = 0; y < h; y++) {
              const simY = Math.min(simHeight - 2, y * scaleY);
              for (let x = 0; x < w; x++) {
                const simX = Math.min(simWidth - 2, x * scaleX);
                const dx = (sampleWave(simX + 1, simY) - sampleWave(simX - 1, simY)) * 1.8;
                const dy = (sampleWave(simX, simY + 1) - sampleWave(simX, simY - 1)) * 1.8;
                const refrX = Math.max(0, Math.min(w - 1, Math.round(x + dx)));
                const refrY = Math.max(0, Math.min(h - 1, Math.round(y + dy)));
                const srcP = (refrY * w + refrX) * 4;
                const dstP = (y * w + x) * 4;
                const spec = Math.max(0, (dx + dy) * 0.65);

                dst[dstP] = Math.min(255, src[srcP] + spec * 22);
                dst[dstP + 1] = Math.min(255, src[srcP + 1] + spec * 38);
                dst[dstP + 2] = Math.min(255, src[srcP + 2] + spec * 28);
                dst[dstP + 3] = src[srcP + 3] || 255;
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

    if (nativeOnly) {
      cleanupNative = initNativeFluidEngine();
    } else {
      loadThreeJsLiquid().then((success) => {
        if (!success && isMounted) {
          cleanupNative = initNativeFluidEngine();
        }
      });
    }

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
  }, [imageSrc, nativeOnly]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-auto select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block will-change-transform"
      />
    </div>
  );
}

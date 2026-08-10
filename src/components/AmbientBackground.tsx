import { useEffect, useRef } from "react";

/**
 * AmbientBackground — تأثيرات AI مستقبلية خفيفة (شبكة تقنية + particles + خطوط ضوئية)
 * تُرسَم على canvas ولا تشوش على المحتوى. تحترم prefers-reduced-motion.
 */
export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const COUNT = Math.min(42, Math.floor(width / 28));
    interface P { x: number; y: number; vx: number; vy: number; r: number }
    const points: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.5,
    }));

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // تقنية الشبكة (تُرسم بخطوات خفيفة)
      if (frame % 2 === 0) {
        ctx.strokeStyle = "rgba(99, 130, 255, 0.045)";
        ctx.lineWidth = 1;
        const step = 64;
        for (let x = 0; x <= width; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // تحديث المواقع
      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      // خطوط الاتصال بين النقاط القريبة
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.16;
            ctx.strokeStyle = `rgba(120, 150, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // نقاط متوهجة
      for (const p of points) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grad.addColorStop(0, "rgba(140, 180, 255, 0.35)");
        grad.addColorStop(1, "rgba(140, 180, 255, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      resize();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      />
      {/* Glowing orbs — ناعمة ولا تشوش */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="orb-drift absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="orb-drift absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[120px]" style={{ animationDelay: "-5s" }} />
        <div className="orb-drift absolute bottom-0 right-1/4 h-[380px] w-[380px] rounded-full bg-sky-500/10 blur-[110px]" style={{ animationDelay: "-9s" }} />
      </div>
    </>
  );
}

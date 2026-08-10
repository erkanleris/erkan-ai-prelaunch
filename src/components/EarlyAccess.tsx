import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Users } from "lucide-react";
import { BASE_REGISTERED_COUNT, LAUNCH_DATE } from "../lib/siteConfig";

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-4 backdrop-blur-md md:px-6 md:py-5">
      <span className="font-display text-2xl font-bold text-white tabular-nums md:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[11px] font-medium text-muted-foreground md:text-xs">{label}</span>
    </div>
  );
}

export default function EarlyAccess() {
  const { days, hours, minutes, seconds } = useCountdown(LAUNCH_DATE);
  // نسخة GitHub Pages الثابتة: العداد الأساسي فقط (لا توجد قاعدة بيانات)
  const count = BASE_REGISTERED_COUNT;

  return (
    <section id="early-access" className="relative z-10 px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="glass-card mx-auto max-w-4xl rounded-3xl p-8 text-center md:p-12"
      >
        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600/25 to-violet-600/25">
          <Rocket className="h-7 w-7 text-sky-400" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
          كن من <span className="text-gradient-brand">الأوائل</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          المستخدمون الذين يسجلون مسبقاً يحصلون على أولوية الوصول عند إطلاق ERKAN AI.
        </p>

        {/* Countdown */}
        <div className="mt-8 flex items-center justify-center gap-2.5 md:gap-3" dir="ltr">
          <TimeUnit value={days} label="يوم" />
          <span className="font-display text-2xl text-white/40 md:text-3xl">:</span>
          <TimeUnit value={hours} label="ساعة" />
          <span className="font-display text-2xl text-white/40 md:text-3xl">:</span>
          <TimeUnit value={minutes} label="دقيقة" />
          <span className="font-display text-2xl text-white/40 md:text-3xl">:</span>
          <TimeUnit value={seconds} label="ثانية" />
        </div>

        {/* Real registrants count */}
        <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/20 bg-emerald-500/8 px-5 py-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
          </span>
          <Users className="h-4 w-4 text-emerald-400" />
          <p className="text-sm font-semibold text-foreground">
            <span className="font-display text-base font-bold text-emerald-300">{count.toLocaleString("ar-EG")}</span>{" "}
            شخص حجزوا أسماءهم
          </p>
        </div>

        <a
          href="#register"
          className="btn-glow mt-8 inline-block rounded-xl px-8 py-3.5 text-base font-bold text-white"
        >
          احجز مقعدك الآن
        </a>
      </motion.div>
    </section>
  );
}

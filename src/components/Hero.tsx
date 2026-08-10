import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { LOGO_URL, SITE } from "../lib/siteConfig";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] as const },
};

export default function Hero() {
  return (
    <section id="hero" className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
      {/* Badge */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-sky-300 backdrop-blur-md md:text-sm"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>التسجيل المسبق مفتوح الآن — الأماكن محدودة</span>
      </motion.div>

      {/* Logo */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.12 }}
        className="float-slow relative mb-8"
      >
        <div className="absolute inset-0 rounded-[2.2rem] bg-gradient-to-tr from-blue-600/30 via-violet-600/25 to-sky-500/20 blur-2xl" />
        <img
          src={LOGO_URL}
          alt="شعار ERKAN AI"
          width={160}
          height={160}
          loading="eager"
          className="relative h-32 w-32 rounded-[2rem] shadow-[0_0_60px_rgba(59,130,246,0.35)] md:h-40 md:w-40"
        />
      </motion.div>

      {/* Main title */}
      <motion.h1
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
        className="font-display text-4xl font-extrabold leading-tight tracking-wide text-white sm:text-5xl md:text-6xl lg:text-7xl"
      >
        {SITE.taglineEn}
      </motion.h1>

      {/* Arabic sub-title */}
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.3 }}
        className="mt-4 text-2xl font-bold text-gradient-brand sm:text-3xl md:text-4xl"
      >
        {SITE.taglineAr}
      </motion.p>

      {/* Description */}
      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.38 }}
        className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
      >
        {SITE.description}
      </motion.p>

      {/* CTAs */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.46 }}
        className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
      >
        <a
          href="#register"
          className="btn-glow rounded-xl px-8 py-3.5 text-base font-bold text-white"
        >
          احجز مقعدك الآن
        </a>
        <a
          href="#why"
          className="btn-ghost-brand rounded-xl px-8 py-3.5 text-base font-semibold text-foreground"
        >
          اكتشف ERKAN AI
        </a>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.58 }}
        className="mt-14 text-muted-foreground"
      >
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </motion.div>
    </section>
  );
}

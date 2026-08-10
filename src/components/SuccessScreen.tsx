import { motion } from "framer-motion";
import { Check, Share2 } from "lucide-react";

interface Props {
  username: string;
  onCopy: () => void;
  onShare: () => void;
  copying: boolean;
}

/**
 * شاشة النجاح لنسخة GitHub Pages — بدون رقم حجز فريد
 * (لا توجد قاعدة بيانات، فيعرض اسم المستخدم فقط مع زر المشاركة).
 */
export default function SuccessScreen({ username, onCopy, onShare, copying }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="mx-auto max-w-2xl px-4"
    >
      <div className="glass-card rounded-3xl p-8 text-center md:p-12">
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500/25 to-sky-500/25 shadow-[0_0_40px_rgba(52,211,153,0.25)]"
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-emerald-400">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              className="check-draw"
            />
          </svg>
        </motion.div>

        <h2 className="text-2xl font-extrabold text-white md:text-3xl">
          تم استلام تسجيلك بنجاح <span aria-hidden>🎉</span>
        </h2>
        <p className="mt-3 text-lg font-semibold text-gradient-brand">
          مرحباً بك في ERKAN AI
        </p>

        {/* Username */}
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/10 px-5 py-2.5">
          <span className="text-muted-foreground text-sm">اسمك:</span>
          <span className="font-display text-lg font-bold text-sky-300" dir="ltr">
            @{username}
          </span>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          تم إرسال بياناتك للمراجعة. سنكون بانتظارك عند الإطلاق الرسمي.
        </p>

        {/* Share */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground">شارك حماسك مع أصدقائك</p>
          <div className="mt-4 flex flex-col items-stretch gap-2.5 sm:flex-row sm:justify-center">
            <button
              onClick={onCopy}
              className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            >
              {copying ? <Check className="h-4 w-4" /> : null}
              {copying ? "تم النسخ" : "نسخ رابط الدعوة"}
            </button>
            <button
              onClick={onShare}
              className="btn-ghost-brand inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              <Share2 className="h-4 w-4" />
              مشاركة
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

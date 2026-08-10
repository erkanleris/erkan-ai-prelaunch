import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AGE_MAX, AGE_MIN, USERNAME_MAX, USERNAME_MIN, USERNAME_REGEX, SITE } from "../lib/siteConfig";
import SuccessScreen from "./SuccessScreen";

/**
 * نسخة GitHub Pages الثابتة:
 * - لا يوجد تحقق فوري من توفر اسم المستخدم (لا توجد قاعدة بيانات)
 * - عند الإرسال تُرسل تفاصيل المسجل إلى GitHub Actions (repository_dispatch)
 *   والتي بدورها ترسل رسالة بريدية إلى بريد مالك المشروع عبر SMTP Gmail
 */

const fieldClass =
  "field-premium w-full rounded-xl px-4 py-3 text-sm md:text-base";
const labelClass = "mb-1.5 block text-sm font-semibold text-foreground/90";
const errorClass = "mt-1 flex items-start gap-1.5 text-xs font-medium text-red-400";

// GitHub Actions PAT — يُستبدل تلقائياً أثناء عمل workflow النشر
const GITHUB_REPO = "erkanleris/erkan-ai-prelaunch";
const GITHUB_TOKEN = "__GITHUB_ACTIONS_TOKEN__";

type ValidState = "idle" | "valid" | "invalid";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ username: string } | null>(null);
  const [copying, setCopying] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const usernameError = useMemo(() => {
    if (username.length === 0) return "";
    if (username.length < USERNAME_MIN)
      return `اسم المستخدم يجب أن يكون ${USERNAME_MIN} أحرف على الأقل`;
    if (username.length > USERNAME_MAX)
      return `اسم المستخدم يجب ألا يتجاوز ${USERNAME_MAX} أحرف`;
    if (!USERNAME_REGEX.test(username))
      return "يسمح فقط بالأحرف الإنجليزية والأرقام و underscore";
    return "";
  }, [username]);

  const usernameState: ValidState = useMemo(() => {
    if (!username) return "idle";
    return usernameError ? "invalid" : "valid";
  }, [username, usernameError]);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), [email]);

  const ageValid = useMemo(() => {
    if (!age) return true;
    const n = Number(age);
    return Number.isInteger(n) && n >= AGE_MIN && n <= AGE_MAX;
  }, [age]);

  // إرسال تفاصيل المسجل إلى GitHub Actions عبر repository_dispatch
  const notifyOwner = useCallback(
    async (data: {
      fullName: string;
      email: string;
      age: number;
      profession: string;
      username: string;
      submittedAt: string;
    }) => {
      const token = GITHUB_TOKEN.startsWith("__") ? "" : GITHUB_TOKEN;
      if (!token) {
        console.info("[ERKAN] GitHub token not configured — registration shown locally only.");
        return;
      }
      try {
        await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          body: JSON.stringify({
            event_type: "erkna_registration",
            client_payload: data,
          }),
        });
      } catch (err) {
        console.error("[ERKAN] Failed to notify owner:", err);
      }
    },
    []
  );

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;

      if (!fullName.trim()) {
        toast.error("يرجى كتابة اسمك الكامل");
        return;
      }
      if (!emailTouched) setEmailTouched(true);
      if (!emailValid) {
        toast.error("يرجى إدخال بريد إلكتروني صالح");
        return;
      }
      if (!ageValid || !age) {
        toast.error(`يرجى إدخال عمر صحيح بين ${AGE_MIN} و ${AGE_MAX}`);
        return;
      }
      if (!profession.trim()) {
        toast.error("يرجى كتابة مهنتك");
        return;
      }
      if (usernameState !== "valid") {
        toast.error("يرجى اختيار اسم مستخدم صالح");
        return;
      }

      setSubmitting(true);
      try {
        await notifyOwner({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          age: Number(age),
          profession: profession.trim(),
          username: username.toLowerCase(),
          submittedAt: new Date().toISOString(),
        });
        setSuccess({ username: username.toLowerCase() });
        toast.success("تم استلام تسجيلك بنجاح!");
      } catch {
        toast.error("حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى");
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, fullName, email, emailTouched, emailValid, age, ageValid, profession, username, usernameState, notifyOwner]
  );

  const copyShare = useCallback(async () => {
    const text = `${SITE.socialShareText} ${window.location.origin}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: SITE.name, text, url: window.location.origin });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${window.location.origin}`);
      toast.success("تم نسخ رابط المشاركة");
    } catch {
      // المستخدم ألغى المشاركة
    }
  }, []);

  const copyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`ERKAN AI — @${success?.username}`);
      setCopying(true);
      toast.success("تم النسخ");
      setTimeout(() => setCopying(false), 1600);
    } catch {
      toast.error("تعذر النسخ، يرجى تحديد النص يدوياً");
    }
  }, [success]);

  if (success) {
    return <SuccessScreen username={success.username} onCopy={copyId} onShare={copyShare} copying={copying} />;
  }

  return (
    <section id="register" className="relative z-10 px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            سجّل مسبقاً <span className="text-gradient-brand">واحجز اسمك</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            املأ النموذج أدناه وسنرسل لك رسالة تأكيد على بريدك قريباً.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 md:p-10">
          <form onSubmit={submit} noValidate className="space-y-5">
            {/* الاسم الكامل */}
            <div>
              <label htmlFor="fullName" className={labelClass}>الاسم الكامل</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="اكتب اسمك"
                className={fieldClass}
                autoComplete="name"
                maxLength={60}
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label htmlFor="email" className={labelClass}>البريد الإلكتروني</label>
              <input
                id="email"
                type="email"
                dir="ltr"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="example@email.com"
                className={`${fieldClass} ${emailTouched && !emailValid && email.length > 0 ? "!border-red-400/60" : ""}`}
                autoComplete="email"
              />
              <AnimatePresence>
                {emailTouched && email.length > 0 && !emailValid && (
                  <motion.p
                    {...{ initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }}
                    className={errorClass}
                  >
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>يرجى إدخال بريد إلكتروني صالح</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* العمر + المهنة */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="age" className={labelClass}>العمر</label>
                <input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder={`${AGE_MIN}-${AGE_MAX}`}
                  className={`${fieldClass} ${!ageValid && age.length > 0 ? "!border-red-400/60" : ""}`}
                />
                <AnimatePresence>
                  {age.length > 0 && !ageValid && (
                    <motion.p
                      {...{ initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }}
                      className={errorClass}
                    >
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>العمر يجب أن يكون بين {AGE_MIN} و {AGE_MAX}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label htmlFor="profession" className={labelClass}>المهنة</label>
                <input
                  id="profession"
                  type="text"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  placeholder="مثال: مطور برمجيات، مصمم، طالب..."
                  className={fieldClass}
                  maxLength={60}
                />
              </div>
            </div>

            {/* اسم المستخدم */}
            <div>
              <label htmlFor="username" className={labelClass}>
                اسم المستخدم
                <span className="mr-2 text-xs font-normal text-muted-foreground">
                  {USERNAME_MIN}–{USERNAME_MAX} أحرف • إنجليزية وأرقام و _
                </span>
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" dir="ltr">@</span>
                <input
                  id="username"
                  type="text"
                  dir="ltr"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/\s/g, ""))}
                  placeholder="arkan أو erkan_ai"
                  maxLength={10}
                  className={`${fieldClass} !pl-12 ${
                    usernameState === "invalid" ? "!border-red-400/60" : ""
                  } ${usernameState === "valid" ? "!border-emerald-400/60" : ""}`}
                  autoComplete="off"
                />
                <AnimatePresence mode="wait">
                  {usernameState === "valid" && (
                    <motion.span
                      key="valid"
                      {...{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } }}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </motion.span>
                  )}
                  {usernameState === "invalid" && (
                    <motion.span
                      key="invalid"
                      {...{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } }}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <XCircle className="h-4 w-4 text-red-400" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {usernameError && (
                  <motion.p
                    {...{ initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }}
                    className={errorClass}
                  >
                    {usernameError}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>سنراجع طلبك ونؤكد حجز اسمك على بريدك الإلكتروني.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-glow w-full rounded-xl py-3.5 text-base font-bold text-white"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </span>
              ) : (
                "احجز اسمي"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}

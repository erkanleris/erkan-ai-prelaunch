import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Copy, Loader2, Share2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { AGE_MAX, AGE_MIN, USERNAME_MAX, USERNAME_MIN, USERNAME_REGEX, SITE } from "@/lib/siteConfig";
import SuccessScreen from "./SuccessScreen";

type UsernameStatus = "idle" | "checking" | "taken" | "available" | "invalid";

const fieldClass =
  "field-premium w-full rounded-xl px-4 py-3 text-sm md:text-base";
const labelClass = "mb-1.5 block text-sm font-semibold text-foreground/90";
const errorClass = "mt-1 flex items-start gap-1.5 text-xs font-medium text-red-400";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ username: string; id: string } | null>(null);
  const [copying, setCopying] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utils = trpc.useUtils();
  const [checkName, setCheckName] = useState<string | null>(null);
  const checkUsernameQuery = trpc.registration.checkUsername.useQuery(
    { username: checkName ?? "" },
    { enabled: checkName !== null }
  );
  const registerMutation = trpc.registration.registerUser.useMutation();

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

  // التحقق الفوري من توفر اسم المستخدم مع Debounce
  useEffect(() => {
    if (usernameError) {
      setUsernameStatus("invalid");
      setStatusMessage(usernameError);
      return;
    }
    if (username.length < USERNAME_MIN || !USERNAME_REGEX.test(username)) {
      setUsernameStatus("idle");
      setStatusMessage("");
      return;
    }
    setUsernameStatus("checking");
    setStatusMessage("جاري التحقق من توفر الاسم...");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCheckName(username.toLowerCase());
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, usernameError]);

  // معالجة نتيجة الاستعلام بعد اكتماله
  useEffect(() => {
    if (checkName === null) return;
    if (checkUsernameQuery.isLoading || checkUsernameQuery.isFetching) return;
    if (checkUsernameQuery.isError) {
      setUsernameStatus("idle");
      setStatusMessage("");
      return;
    }
    if (checkUsernameQuery.data?.available) {
      setUsernameStatus("available");
      setStatusMessage("✓ اسم المستخدم متاح");
    } else {
      setUsernameStatus("taken");
      setStatusMessage("✕ اسم المستخدم محجوز");
    }
  }, [checkUsernameQuery.data, checkUsernameQuery.isLoading, checkUsernameQuery.isFetching, checkUsernameQuery.isError, checkName]);

  // التحقق الفوري من البريد الإلكتروني
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), [email]);
  const [emailTouched, setEmailTouched] = useState(false);

  // التحقق الفوري من العمر
  const ageValid = useMemo(() => {
    if (!age) return true;
    const n = Number(age);
    return Number.isInteger(n) && n >= AGE_MIN && n <= AGE_MAX;
  }, [age]);

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
      if (usernameError || usernameStatus !== "available") {
        toast.error("يرجى اختيار اسم مستخدم صالح ومتاح");
        return;
      }

      setSubmitting(true);
      try {
        const res = await registerMutation.mutateAsync({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          age: Number(age),
          profession: profession.trim(),
          username: username.toLowerCase(),
        });
        utils.registration.getCount.invalidate();
        setSuccess({ username: res.username, id: res.registrationId });
        toast.success("تم حجز مقعدك بنجاح!");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "";
        if (message.includes("EMAIL_TAKEN")) {
          toast.error("هذا البريد الإلكتروني مسجل مسبقاً");
        } else if (message.includes("USERNAME_TAKEN")) {
          setUsernameStatus("taken");
          setStatusMessage("✕ اسم المستخدم محجوز");
          toast.error("هذا الاسم محجوز بالفعل، جرّب اسماً آخر");
        } else if (message.includes("RATE_LIMITED")) {
          toast.error("طلبات كثيرة جداً، انتظر قليلاً ثم أعد المحاولة");
        } else {
          toast.error("حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, fullName, email, emailTouched, emailValid, age, ageValid, profession, username, usernameError, usernameStatus, utils]
  );

  const copyId = useCallback(async () => {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.id);
      setCopying(true);
      toast.success("تم نسخ رقم الحجز");
      setTimeout(() => setCopying(false), 1600);
    } catch {
      toast.error("تعذر النسخ، يرجى تحديد النص يدوياً");
    }
  }, [success]);

  const share = useCallback(async () => {
    if (!success) return;
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
  }, [success]);

  if (success) {
    return <SuccessScreen username={success.username} id={success.id} onCopy={copyId} onShare={share} copying={copying} />;
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
            املأ النموذج أدناه وسنحجز اسم المستخدم الخاص بك قبل الجميع.
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
                  className={`${fieldClass} !pl-24 ${
                    usernameStatus === "taken" ? "!border-red-400/60" : ""
                  } ${usernameStatus === "available" ? "!border-emerald-400/60" : ""}`}
                  autoComplete="off"
                />
                <AnimatePresence mode="wait">
                  {usernameStatus === "checking" && (
                    <motion.span
                      key="checking"
                      {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                    </motion.span>
                  )}
                  {usernameStatus === "available" && (
                    <motion.span
                      key="available"
                      {...{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } }}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </motion.span>
                  )}
                  {usernameStatus === "taken" && (
                    <motion.span
                      key="taken"
                      {...{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } }}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                    >
                      <XCircle className="h-4 w-4 text-red-400" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {statusMessage && usernameStatus !== "checking" && (
                  <motion.p
                    key={usernameStatus}
                    {...{ initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }}
                    className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
                      usernameStatus === "available" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {statusMessage}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>سيتم حجز هذا الاسم لك عند اكتمال التسجيل، وهو حصري ولا يمكن لأي شخص آخر حجزه.</span>
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
                  جاري الحجز...
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

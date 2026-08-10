import { LOGO_URL, SITE } from "../lib/siteConfig";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 px-4 pb-8 pt-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="شعار ERKAN AI" width={40} height={40} className="h-10 w-10 rounded-lg" />
          <span className="font-display text-xl font-bold text-white">ERKAN AI</span>
        </div>
        <p className="text-sm text-muted-foreground">{SITE.footerTagline}</p>
        <nav className="flex items-center gap-6 text-sm" aria-label="روابط التذييل">
          <a href="#privacy" className="text-muted-foreground transition-colors hover:text-foreground">
            Privacy Policy
          </a>
          <a href="#terms" className="text-muted-foreground transition-colors hover:text-foreground">
            Terms of Service
          </a>
          <a href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </a>
        </nav>
        {/* أقسام ثابتة قصيرة للروابط (بدون صفحات إضافية) */}
        <div id="privacy" className="mt-4 max-w-2xl rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-start text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1.5 font-bold text-foreground">Privacy Policy</p>
          <p>
            نحترم خصوصيتك. تُستخدم بياناتك (الاسم والبريد الإلكتروني والمهنة) فقط لأغراض
            التواصل حول إطلاق ERKAN AI وإبلاغك بتقدم التسجيل. لا نعرض بريدك أو بياناتك الشخصية
            للعامة بأي شكل، ولا نشاركها مع أي طرف ثالث.
          </p>
        </div>
        <div id="terms" className="max-w-2xl rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-start text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1.5 font-bold text-foreground">Terms of Service</p>
          <p>
            بحجزك المسبق، فإنك تضمن أن المعلومات المدخلة صحيحة وأن اسم المستخدم المختار لا ينتهك
            حقوق الآخرين. يُحجز اسم المستخدم حصرياً لك وعند اكتمال التسجيل النهائي. نحتفظ بحق
            تعديل سياسات الاستخدام قبل الإطلاق الرسمي مع إخطار المسجلين مسبقاً.
          </p>
        </div>
        <div id="contact" className="max-w-2xl rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-start text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1.5 font-bold text-foreground">Contact</p>
          <p>
            للاستفسارات والتعاون: تواصل معنا عبر قنوات ERKAN AI الرسمية. سنرد على المسجلين المسبقين
            أولاً بأولوية عند الإطلاق.
          </p>
        </div>
        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} ERKAN AI. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}

/**
 * الإعدادات المركزية لموقع ERKAN AI (نسخة GitHub Pages)
 * عدّل القيم من هذا الملف فقط — لا حاجة لتعديل أي ملف آخر.
 */

/** تاريخ ووقت الإطلاق الرسمي (UTC) — عدّل هذا التاريخ لتغيير العداد التنازلي */
export const LAUNCH_DATE = new Date("2026-09-15T00:00:00Z");

/**
 * العداد الأساسي لعدد المسجلين مسبقاً.
 * في نسخة GitHub Pages الثابتة يُعرض هذا الرقم فقط (لا توجد قاعدة بيانات).
 */
export const BASE_REGISTERED_COUNT = 56838;

/** رابط الشعار الرسمي — يُرفع مع موقع GitHub Pages */
export const LOGO_URL = "/icon-180.png";

/** النصوص الأساسية */
export const SITE = {
  name: "ERKAN AI",
  taglineEn: "ERKAN AI IS COMING",
  taglineAr: "الذكاء الاصطناعي... بطريقتك.",
  description:
    "احجز مكانك قبل الإطلاق، واختر اسم المستخدم الخاص بك قبل الجميع.",
  footerTagline: "Built for the next generation.",
  socialShareText: "حجزت مقعدي في ERKAN AI قبل الإطلاق! انضم الآن:",
  shareUrlFallback: "",
};

export const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 10;
export const AGE_MIN = 13;
export const AGE_MAX = 120;

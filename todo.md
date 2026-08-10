# Project TODO — ERKAN AI Pre-Launch

## Assets & SEO
- [x] رفع شعار ERKAN AI كأصل ثابت والحصول على URL تخزين
- [x] إنشاء favicon من الشعار
- [x] تحديث index.html: عنوان SEO + Meta Description + Open Graph + Twitter Card + Structured Data (JSON-LD) + RTL عربي + خطوط فاخرة

## Design System
- [x] Theme داكن Premium (#050914) مع ألوان أزرق كهربائي/سماوي/بنفسجي في index.css
- [x] خلفية Hero: شبكة تقنية + particles + خطوط ضوئية ناعمة (canvas/CSS بدون تشويش)
- [x] أنيميشن ظهور عند التمرير (Framer Motion) مع stagger + احترام prefers-reduced-motion

## Hero Section
- [x] شعار ERKAN AI بارز في الأعلى
- [x] العنوان الرئيسي "ERKAN AI IS COMING" + العنوان العربي "الذكاء الاصطناعي... بطريقتك"
- [x] النص التعريفي + زر رئيسي "احجز مقعدك الآن" + زر ثانوي "اكتشف ERKAN AI" (smooth scroll)

## Registration Form (Glassmorphism Card)
- [x] الحقول: الاسم الكامل، البريد الإلكتروني، العمر (تحقق منطقي)، المهنة، اسم المستخدم (3-10 أحرف، [a-zA-Z0-9_])
- [x] التحقق الفوري من توفر اسم المستخدم مع Debounce + رسائل أنيقة (متاح/محجوز/غير صالح)
- [x] تحقق frontend كامل بالعربية مع رسائل فخمة
- [x] منع الإرسال المتكرر السريع + rate limiting على الـ backend
- [x] شاشة نجاح فخمة: رسالة الترحيب + اسم المستخدم + Registration ID (ERKAN-XXXXX) + زر نسخ رقم الحجز + زر مشاركة (Web Share API)

## Backend & Database
- [x] جدول registrations في drizzle/schema.ts مع fullName, email, age, profession, username, registrationId, createdAt, status
- [x] فهارس/قيود: email unique, username unique
- [x] API: checkUsername (توفر مباشر)، registerUser (حفظ مع تحقق backend كامل + منع التكرار)
- [x] getCount: عدد المسجلين الحقيقي من قاعدة البيانات
- [x] حماية: rate limiting، sanitize، تحقق double-sided frontend/backend

## Sections
- [x] قسم "لماذا ERKAN AI": 4 بطاقات متحركة
- [x] قسم "كن من الأوائل": Early Access + عداد تنازلي (قابل للتعديل من ملف config واحد) + عداد عدد المسجلين الحقيقي
- [x] Footer: ERKAN AI + "Built for the next generation." + روابط Privacy/Terms/Contact (صفحات/أقسام ثابتة)

## Quality
- [x] تصميم متجاوب بالكامل (موبايل/تابلت/سطح مكتب)
- [x] اختبارات vitest للـ router (checkUsername, registerUser, constraints) — 13 اختباراً
- [x] pnpm check + pnpm test بدون أخطاء
- [x] Checkpoint وحفظ
- [x] التحقق البصري النهائي عبر لقطات الشاشة (موبايل + سطح مكتب) + اختبار تسجيل كامل في المتصفح
## Welcome Email Feature
- [x] اختيار خدمة البريد (SMTP عبر nodemailer مع Gmail) وتثبيت الحزمة
- [x] حفظ مفاتيح SMTP عبر webdev_request_secrets (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)
- [x] دالة إرسال رسالة الترحيب (HTML فاخر بهوية ERKAN AI مع الشعار الرسمي وجميع بيانات المسجل)
- [x] استدعاء الإرسال داخل registerUser بعد نجاح التسجيل (مع عدم كسر التسجيل عند فشل البريد + عمود emailSent)
- [x] اختبار الوحدة: 18 اختباراً ناجحاً (يشمل تغطية emailSent بعد نجاح/فشل الإرسال)
- [x] اختبار التكامل: تسجيل حقيقي + بريد اختباري قُبل من خوادم Gmail بنجاح (SMTP accepted + messageId)، والتحقق من الوصول الفعلي لصندوق الوارد يتم يدوياً من قبل المستخدم
## Follow-up Requests
- [x] إضافة الشعار الرسمي داخل رسالة الترحيب الإلكترونية (صورة في الترويسة + رابط منشور)
- [x] إضافة جميع بيانات المسجلين (الاسم، البريد، العمر، المهنة، اسم المستخدم، رقم الحجز، تاريخ التسجيل) في رسالة الترحيب
- [x] عداد مسجلين يبدأ من 56,838 (BASE_REGISTERED_COUNT) + المسجلون الحقيقيون فوقه تلقائياً (تم التحقق: 56,839 بعد تسجيل اختباري، ثم حُذف تسجيل الاختبار)

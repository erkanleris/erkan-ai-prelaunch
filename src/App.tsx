import AmbientBackground from "./components/AmbientBackground";
import Hero from "./components/Hero";
import RegisterForm from "./components/RegisterForm";
import WhyErkan from "./components/WhyErkan";
import EarlyAccess from "./components/EarlyAccess";
import Footer from "./components/Footer";

/**
 * صفحة هبوط ERKAN AI — نسخة GitHub Pages (ثابتة، بدون خادم)
 * التسجيل لا يُحفظ في قاعدة بيانات — تُرسل تفاصيل المسجل برسالة بريدية إلى
 * بريد مالك المشروع فور الإرسال عبر GitHub Actions (SMTP Gmail).
 */
export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AmbientBackground />
      <main className="relative z-0">
        <Hero />
        <WhyErkan />
        <RegisterForm />
        <EarlyAccess />
        <Footer />
      </main>
    </div>
  );
}

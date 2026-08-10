import AmbientBackground from "@/components/AmbientBackground";
import EarlyAccess from "@/components/EarlyAccess";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import RegisterForm from "@/components/RegisterForm";
import WhyErkan from "@/components/WhyErkan";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050914]">
      <AmbientBackground />
      <main className="relative z-10">
        <Hero />
        <RegisterForm />
        <WhyErkan />
        <EarlyAccess />
      </main>
      <Footer />
    </div>
  );
}

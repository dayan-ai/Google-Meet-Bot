import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Prototype from "@/components/Prototype";
import Architecture from "@/components/Architecture";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Prototype />
        <Architecture />
      </main>
      <Footer />
    </div>
  );
}

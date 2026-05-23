"use client";

import { useState } from "react";
import { Menu, X, Play, ArrowUpRight, Box, Camera, Scan } from "lucide-react";
import dynamic from "next/dynamic";

const ArScene = dynamic(() => import("@/components/ArScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="w-10 h-10 border-4 border-[#BFD1F9] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[#BFD1F9] font-medium">Loading AR Camera...</p>
    </div>
  ),
});

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAR, setShowAR] = useState(false);

  // Jika tombol diklik, langsung render kamera (Multi-target logic ada di dalam ArScene)
  if (showAR) {
    return <ArScene onBack={() => setShowAR(false)} />;
  }

  return (
    <main className="relative min-h-screen w-full bg-[#FFFFFF] text-slate-900 font-sans overflow-x-hidden selection:bg-[#BFD1F9]/40">
      {/* Dynamic Animated Gradient Blobs in Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] md:w-[60rem] h-[40rem] md:h-[60rem] rounded-full bg-[#BFD1F9] blur-[100px] md:blur-[140px] opacity-30 animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35rem] md:w-[50rem] h-[35rem] md:h-[50rem] rounded-full bg-[#BFD1F9] blur-[100px] md:blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[45rem] md:w-[70rem] h-[45rem] md:h-[70rem] rounded-full bg-[#BFD1F9] blur-[110px] md:blur-[150px] opacity-25"></div>
      </div>

      {/* 1. Header */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-transparent">
        <div className="flex items-center gap-2">
          <Box className="w-8 h-8 text-[#BFD1F9]" strokeWidth={2.5} />
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Holocharm
          </span>
        </div>

        {/* Global Hamburger Menu Button */}
        <button
          className="relative z-50 flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <a
            href="#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-semibold text-slate-900 hover:text-[#BFD1F9] transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-semibold text-slate-900 hover:text-[#BFD1F9] transition-colors"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-semibold text-slate-900 hover:text-[#BFD1F9] transition-colors"
          >
            Pricing
          </a>
        </div>
      </header>

      {/* 2 & 3. Hero Section & CTA */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 md:pt-24 pb-8 md:pb-16 max-w-5xl mx-auto">
        {/* Pill Badge */}
        <div className="inline-flex items-center p-1 pr-4 rounded-full border border-white/50 bg-white/30 backdrop-blur-md shadow-sm mb-8">
          <div className="bg-white px-4 py-1.5 rounded-full text-sm font-semibold text-slate-900 shadow-sm mr-3">
            Web AR
          </div>
          <span className="text-sm font-medium text-slate-700">
            No App Needed
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[2.75rem] leading-[1.1] sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl">
          Transform Reality <br className="hidden sm:block" /> With Just a Scan.
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-md md:max-w-2xl leading-relaxed">
          Perfect for brands aiming to simplify complex AR experiences for
          everyday users.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Button 1: Get Started -> LANGSUNG BUKA KAMERA */}
          <button
            onClick={() => setShowAR(true)}
            className="w-full sm:w-auto flex items-center justify-between gap-4 pl-6 pr-2 py-2 bg-white rounded-full text-slate-900 font-semibold shadow-md shadow-[#BFD1F9]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <span>Get Started</span>
            <div className="w-10 h-10 rounded-full bg-[#BFD1F9] flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-slate-900" />
            </div>
          </button>

          {/* Button 2: Watch Demo */}
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent border border-[#BFD1F9] text-slate-700 font-semibold rounded-full hover:bg-[#BFD1F9]/10 transition-colors">
            <Play className="w-4 h-4 fill-current" />
            Watch Demo
          </button>
        </div>
      </section>

      {/* 4. Bottom Visual/Mockup Card */}
      <section className="relative z-20 px-4 sm:px-8 max-w-5xl mx-auto -mb-1">
        <div className="relative w-full aspect-[3/4] sm:aspect-[16/9] bg-white rounded-t-3xl shadow-[0_-15px_40px_-15px_rgba(191,209,249,0.5)] border border-b-0 border-slate-100 overflow-hidden transform translate-y-12 sm:translate-y-16 flex flex-col">
          {/* Mockup Header */}
          <div className="w-full px-6 py-4 flex justify-between items-center bg-white border-b border-slate-50 z-10 hidden sm:flex">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Scan className="w-5 h-5 text-[#BFD1F9]" />
              Scanner Environment
            </div>
            <Camera className="w-5 h-5 text-slate-400" />
          </div>

          {/* Mockup Screen Content (WebAR Canvas Area) */}
          <div className="flex-1 relative flex items-center justify-center bg-slate-50/50 overflow-hidden">
            {/* Camera Viewfinder */}
            <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-dashed border-[#BFD1F9] rounded-3xl relative flex items-center justify-center">
              {/* Corner Accents */}
              <div className="absolute top-[-2px] left-[-2px] w-8 h-8 border-t-4 border-l-4 border-slate-900 rounded-tl-[22px]"></div>
              <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-4 border-r-4 border-slate-900 rounded-tr-[22px]"></div>
              <div className="absolute bottom-[-2px] left-[-2px] w-8 h-8 border-b-4 border-l-4 border-slate-900 rounded-bl-[22px]"></div>
              <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 border-b-4 border-r-4 border-slate-900 rounded-br-[22px]"></div>

              {/* Central 3D Placeholder Graphic */}
              <div className="flex flex-col items-center animate-pulse">
                <Box className="w-16 h-16 text-[#BFD1F9] drop-shadow-xl mb-4" />
                <p className="text-slate-400 font-medium text-sm">
                  Target Focused
                </p>
              </div>
            </div>

            {/* Scanning Status Badge */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg shadow-[#BFD1F9]/20 border border-slate-100 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#BFD1F9] animate-ping"></div>
              <span className="text-sm font-medium text-slate-700">
                Scanning surface...
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative extension for background flow */}
      <div className="w-full h-16 sm:h-24 bg-white relative z-30"></div>
    </main>
  );
}

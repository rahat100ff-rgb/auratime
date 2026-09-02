
"use client";

import { useState, useEffect } from "react";
import { Clock, Calculator, Timer, Hourglass, Sparkles } from "lucide-react";
import Image from "next/image";
import ClockPage from "@/components/ClockPage";
import StopwatchPage from "@/components/StopwatchPage";
import TimerPage from "@/components/TimerPage";
import CalculatorPage from "@/components/CalculatorPage";
import AssistantDialog from "@/components/AssistantDialog";
import { Toaster } from "@/components/ui/toaster";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export type Tab = "clock" | "stopwatch" | "timer" | "calc";

export default function LumenApp() {
  const [activeTab, setActiveTab] = useState<Tab>("clock");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashComplete(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: "clock", label: "Alarms", icon: Clock },
    { id: "stopwatch", label: "Stopwatch", icon: Timer },
    { id: "timer", label: "Timer", icon: Hourglass },
    { id: "calc", label: "Calculator", icon: Calculator },
  ] as const;

  const logo = PlaceHolderImages.find(img => img.id === "app-logo");

  if (!isSplashComplete) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden">
        <div className="relative w-40 h-40 animate-splash">
          <Image
            src={logo?.imageUrl || ""}
            alt="Lumen Logo"
            fill
            priority
            className="rounded-[2.5rem] object-cover shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-white/10"
            data-ai-hint="neon clock"
          />
        </div>
        <div className="mt-12 text-center animate-splash delay-300">
           <h1 className="font-headline text-4xl font-bold tracking-tight text-white mb-1">Lumen</h1>
           <p className="text-[10px] uppercase tracking-[0.5em] text-primary/60 font-bold">Temporal & Numeric Precision</p>
        </div>
        <div className="absolute bottom-20 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
           <div className="h-full bg-primary animate-progress" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-10 pb-6 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl glass flex items-center justify-center shadow-lg shadow-primary/10 overflow-hidden relative">
            <Image 
              src={logo?.imageUrl || ""} 
              alt="Lumen Logo" 
              fill 
              className="object-cover opacity-90"
            />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-white">Lumen</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold">
              {tabs.find(t => t.id === activeTab)?.label}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex items-center gap-2 rounded-full glass-dark px-5 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition-all border border-primary/20 shadow-lg shadow-primary/5"
        >
          <Sparkles className="h-4 w-4" />
          Aura AI
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg mx-auto w-full pb-32">
        <div className="w-full h-full px-6 transition-all duration-500">
          {activeTab === "clock" && <ClockPage />}
          {activeTab === "stopwatch" && <StopwatchPage />}
          {activeTab === "timer" && <TimerPage />}
          {activeTab === "calc" && <CalculatorPage />}
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md">
        <div className="glass-dark flex items-center justify-around gap-1 rounded-[2.5rem] p-2 shadow-2xl border border-white/5">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-full text-xs font-bold transition-all duration-500 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <IconComp className={`h-5 w-5 ${isActive ? "text-primary-foreground" : ""}`} />
                <span className={isActive ? "block" : "hidden sm:block"}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <AssistantDialog isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      <Toaster />
    </div>
  );
}

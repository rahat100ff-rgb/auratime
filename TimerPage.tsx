
"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playAudioTone } from "@/lib/audio";
import { cn } from "@/lib/utils";

export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(300); 
  const [isRunning, setIsRunning] = useState(false);
  const [inputValue, setInputValue] = useState("05:00");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playAudioTone("3");
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleToggle = () => {
    if (!isRunning && timeLeft === 0) {
      const [m, s] = inputValue.split(":").map(Number);
      const total = (m || 0) * 60 + (s || 0);
      if (total > 0) setTimeLeft(total);
      else return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const [m, s] = inputValue.split(":").map(Number);
    setTimeLeft((m || 0) * 60 + (s || 0));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isRunning) {
      const [m, s] = e.target.value.split(":").map(Number);
      setTimeLeft((m || 0) * 60 + (s || 0));
    }
  };

  const format = (seconds: number) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const totalPossible = (parseInt(inputValue.split(':')[0])*60) + parseInt(inputValue.split(':')[1]) || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass rounded-[2.5rem] py-24 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] text-primary/40 uppercase tracking-[0.4em] font-headline font-bold">
          Temporal Depletion
        </div>
        
        {isRunning || timeLeft > 0 ? (
          <div className="font-headline text-8xl font-light text-white text-glow tabular-nums">
            {format(timeLeft)}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="bg-transparent border-none text-center font-headline text-8xl font-light text-glow p-0 h-auto focus-visible:ring-0 w-64 text-primary"
              placeholder="00:00"
            />
            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Calibrate Duration (MM:SS)</p>
          </div>
        )}

        {isRunning && (
          <div className="absolute bottom-8 w-[85%] h-1.5 bg-white/5 rounded-full overflow-hidden">
             <div 
               className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
               style={{ width: `${(timeLeft / totalPossible) * 100}%` }}
             />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Button
          onClick={handleReset}
          className="rounded-[1.5rem] glass h-16 text-sm font-bold text-white/80 border-white/5 hover:bg-white/10 active:scale-95 transition-all"
        >
          <RotateCcw className="h-5 w-5 mr-2" /> Reset
        </Button>
        <Button
          onClick={handleToggle}
          className={cn(
            "rounded-[1.5rem] h-16 text-sm font-bold shadow-xl active:scale-95 transition-all",
            isRunning 
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/10" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isRunning ? (
            <><Pause className="h-5 w-5 mr-2" /> Pause</>
          ) : (
            <><Play className="h-5 w-5 mr-2" /> Start</>
          )}
        </Button>
      </div>
    </div>
  );
}

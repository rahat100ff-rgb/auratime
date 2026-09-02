
"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const requestRef = useRef<number>(null);
  const startTimeRef = useRef<number>(0);

  const animate = (now: number) => {
    if (startTimeRef.current === 0) startTimeRef.current = now - time;
    setTime(now - startTimeRef.current);
    requestRef.current = requestAnimationFrame(animate);
  };

  const handleToggle = () => {
    if (isRunning) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    } else {
      startTimeRef.current = performance.now() - time;
      requestRef.current = requestAnimationFrame(animate);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    startTimeRef.current = 0;
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps([time, ...laps]);
    }
  };

  const format = (ms: number) => {
    const mm = String(Math.floor(ms / 60000)).padStart(2, "0");
    const ss = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    const tens = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
    return `${mm}:${ss}.${tens}`;
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass rounded-[2.5rem] py-20 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] text-primary/40 uppercase tracking-[0.4em] font-headline font-bold">
          High Precision Chrono
        </div>
        <div className="font-headline text-7xl font-light text-white text-glow tabular-nums">
          {format(time)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Button
          onClick={isRunning ? handleLap : handleReset}
          className="rounded-[1.5rem] glass h-16 text-sm font-bold text-white/80 border-white/5 hover:bg-white/10 active:scale-95 transition-all"
        >
          {isRunning ? (
            <><Flag className="h-5 w-5 mr-2" /> Lap</>
          ) : (
            <><RotateCcw className="h-5 w-5 mr-2" /> Reset</>
          )}
        </Button>
        <Button
          onClick={handleToggle}
          className={`rounded-[1.5rem] h-16 text-sm font-bold shadow-xl active:scale-95 transition-all ${
            isRunning 
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isRunning ? (
            <><Pause className="h-5 w-5 mr-2" /> Pause</>
          ) : (
            <><Play className="h-5 w-5 mr-2" /> Start</>
          )}
        </Button>
      </div>

      <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
        {laps.map((lap, idx) => (
          <div key={idx} className="glass rounded-[1.5rem] p-6 flex justify-between items-center animate-fade-in group">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary/50 font-bold">Session Lap {laps.length - idx}</span>
            <span className="font-headline text-xl text-white tabular-nums">{format(lap)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

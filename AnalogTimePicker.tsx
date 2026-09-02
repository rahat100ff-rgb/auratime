
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnalogTimePickerProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
}

export default function AnalogTimePicker({ value, onChange }: AnalogTimePickerProps) {
  const [mode, setMode] = useState<"hours" | "minutes">("hours");
  const [currentValue, setCurrentValue] = useState(value);
  const clockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [h, m] = currentValue.split(":").map(Number);
  const isPM = h >= 12;
  const displayH = h % 12 || 12;

  const updateTime = (val: number, isFinal: boolean = false) => {
    let newH = h;
    let newM = m;

    if (mode === "hours") {
      newH = val;
      if (isPM && val !== 12) newH += 12;
      if (!isPM && val === 12) newH = 0;
      if (isFinal) setMode("minutes");
    } else {
      newM = val;
    }

    const nextValue = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
    setCurrentValue(nextValue);
    onChange(nextValue);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!clockRef.current) return;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    // Calculate angle in degrees (0 at 12 o'clock)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    
    if (mode === "hours") {
      // 360 / 12 = 30 degrees per hour
      let val = Math.round(angle / 30);
      if (val === 0) val = 12;
      if (val > 12) val = 12;
      updateTime(val);
    } else {
      // 360 / 60 = 6 degrees per minute
      let val = Math.round(angle / 6);
      if (val === 60) val = 0;
      updateTime(val);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      handlePointerMove(clientX, clientY);
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, mode]);

  const toggleAMPM = (pm: boolean) => {
    let newH = h;
    if (pm && h < 12) newH += 12;
    if (!pm && h >= 12) newH -= 12;
    const nextValue = `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setCurrentValue(nextValue);
    onChange(nextValue);
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const currentAngle = mode === "hours" ? (h % 12) * 30 : m * 6;

  return (
    <div className="flex flex-col items-center gap-6 p-4 select-none touch-none">
      {/* Header Display */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={() => setMode("hours")}
            className={cn(
              "text-5xl font-headline font-medium transition-colors",
              mode === "hours" ? "text-primary" : "text-white/40"
            )}
          >
            {displayH}
          </button>
          <span className="text-5xl text-white/40">:</span>
          <button 
            type="button"
            onClick={() => setMode("minutes")}
            className={cn(
              "text-5xl font-headline font-medium transition-colors",
              mode === "minutes" ? "text-primary" : "text-white/40"
            )}
          >
            {String(m).padStart(2, "0")}
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <button 
            type="button"
            onClick={() => toggleAMPM(false)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold transition-all",
              !isPM ? "bg-primary/20 text-primary border border-primary/30" : "text-white/40 border border-transparent"
            )}
          >
            AM
          </button>
          <button 
            type="button"
            onClick={() => toggleAMPM(true)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold transition-all",
              isPM ? "bg-primary/20 text-primary border border-primary/30" : "text-white/40 border border-transparent"
            )}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock Face */}
      <div 
        ref={clockRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="relative w-64 h-64 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/5 shadow-inner cursor-pointer"
      >
        {/* Needle */}
        <div 
          className="absolute w-1 h-24 bg-primary origin-bottom bottom-1/2 rounded-full transition-transform duration-75 ease-out"
          style={{ 
            transform: `rotate(${currentAngle}deg)` 
          }}
        >
          <div className="absolute top-0 -left-4 w-9 h-9 bg-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center border-2 border-background">
             <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </div>
        
        {/* Center Point */}
        <div className="absolute w-2 h-2 bg-primary rounded-full z-10" />

        {/* Major Numbers */}
        {(mode === "hours" ? hours : minutes).map((num, i) => {
          const angle = (i * 30) - 90;
          const x = 100 * Math.cos(angle * (Math.PI / 180));
          const y = 100 * Math.sin(angle * (Math.PI / 180));
          const isSelected = mode === "hours" ? (h % 12 === num % 12) : (m === num);

          return (
            <div
              key={num}
              className={cn(
                "absolute w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all z-0 pointer-events-none",
                isSelected ? "text-primary-foreground font-bold" : "text-white/60"
              )}
              style={{ 
                transform: `translate(${x}px, ${y}px)` 
              }}
            >
              {num === 0 && mode === "minutes" ? "00" : num}
            </div>
          );
        })}
      </div>
    </div>
  );
}

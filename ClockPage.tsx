
"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Bell, BellOff, Trash2, Clock as ClockIcon, Keyboard } from "lucide-react";
import { ALARM_PRESETS, playAudioTone } from "@/lib/audio";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnalogTimePicker from "./AnalogTimePicker";

interface Alarm {
  id: string;
  time: string;
  label: string;
  sound: string;
  enabled: boolean;
}

export default function ClockPage() {
  const [now, setNow] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"analog" | "manual">("analog");
  const [newTime, setNewTime] = useState("07:00");
  const [newLabel, setNewLabel] = useState("");
  const [newSound, setNewSound] = useState("1");
  const triggeredAlarms = useRef(new Set<string>());

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem("auratime_alarms");
    if (saved) setAlarms(JSON.parse(saved));
  }, []);

  // Optimized background persistence (only save when alarms change)
  const lastSavedRef = useRef<string>("");
  useEffect(() => {
    const stringified = JSON.stringify(alarms);
    if (stringified !== lastSavedRef.current) {
      localStorage.setItem("auratime_alarms", stringified);
      lastSavedRef.current = stringified;
    }
  }, [alarms]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    if (now.getSeconds() === 0) triggeredAlarms.current.clear();

    alarms.forEach((alarm) => {
      if (alarm.enabled && alarm.time === hhmm && !triggeredAlarms.current.has(alarm.id)) {
        triggeredAlarms.current.add(alarm.id);
        playAudioTone(alarm.sound);
      }
    });
  }, [now, alarms]);

  const addAlarm = () => {
    const alarm: Alarm = {
      id: Math.random().toString(36).substr(2, 9),
      time: newTime,
      label: newLabel || "Alarm",
      sound: newSound,
      enabled: true,
    };
    setAlarms(prev => [...prev, alarm].sort((a, b) => a.time.localeCompare(b.time)));
    setIsAddOpen(false);
    setNewLabel("");
    setPickerMode("analog");
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-lg mx-auto">
      <div className="relative glass rounded-[2.5rem] py-14 flex flex-col items-center justify-center shadow-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] text-primary/40 uppercase tracking-[0.4em] font-headline font-bold">
          Precision Timekeeping
        </div>
        <div className="font-headline text-7xl font-bold text-white text-glow tabular-nums flex items-baseline">
          {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
          <span className="text-2xl ml-3 text-primary/60 font-medium opacity-80">
            {String(now.getSeconds()).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-4 text-[11px] font-headline uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-headline uppercase tracking-[0.2em] text-muted-foreground font-bold">Scheduled Events</h2>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-10 shadow-lg shadow-primary/20 transition-transform active:scale-95">
                <Plus className="h-4 w-4 mr-1.5" /> New Alarm
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-dark border-white/10 sm:max-w-[420px] rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="font-headline text-white text-xl">Set Alarm</DialogTitle>
              </DialogHeader>
              
              <div className="py-2">
                {pickerMode === "analog" ? (
                  <AnalogTimePicker value={newTime} onChange={setNewTime} />
                ) : (
                  <div className="space-y-4 px-2">
                    <Label className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Manual Entry</Label>
                    <Input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="glass border-white/10 h-20 text-5xl font-headline font-medium text-center text-primary rounded-2xl"
                    />
                  </div>
                )}
                
                <div className="px-2 mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Event Label</Label>
                    <Input
                      placeholder="Wake up call"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="glass border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Auditory Tone</Label>
                    <Select value={newSound} onValueChange={setNewSound}>
                      <SelectTrigger className="glass border-white/10 rounded-xl">
                        <SelectValue placeholder="Select sound" />
                      </SelectTrigger>
                      <SelectContent className="glass-dark border-white/10">
                        {Object.entries(ALARM_PRESETS).map(([id, preset]) => (
                          <SelectItem key={id} value={id} className="text-white focus:bg-primary/20 focus:text-primary">
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 px-2">
                <button 
                  onClick={() => setPickerMode(pickerMode === "analog" ? "manual" : "analog")}
                  className="p-3 glass rounded-full text-white/40 hover:text-white transition-colors"
                >
                  <Keyboard className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold text-white/60">Cancel</Button>
                  <Button onClick={addAlarm} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-8">OK</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {alarms.length === 0 ? (
            <div className="glass rounded-[2.5rem] py-16 text-center border-dashed border-white/10">
              <ClockIcon className="h-12 w-12 text-white/5 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground/60 font-body">No pending alarms in orbit.</p>
            </div>
          ) : (
            alarms.map((alarm) => (
              <div
                key={alarm.id}
                className={`flex items-center justify-between p-6 glass rounded-[2rem] transition-all duration-500 group border border-white/5 ${
                  alarm.enabled ? "opacity-100 bg-white/[0.03]" : "opacity-40 grayscale-[0.5]"
                }`}
              >
                <div>
                  <div className="font-headline text-5xl text-white font-medium tracking-tight tabular-nums">
                    {alarm.time}
                  </div>
                  <div className="text-[10px] text-primary uppercase tracking-[0.2em] mt-3 font-bold flex items-center gap-2">
                    {alarm.label} <span className="opacity-30">•</span> {ALARM_PRESETS[alarm.sound]?.label}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`p-5 rounded-[1.5rem] transition-all active:scale-90 ${
                      alarm.enabled ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground"
                    }`}
                  >
                    {alarm.enabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
                  </button>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="p-5 rounded-[1.5rem] bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all active:scale-90"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles, Send, X, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { setAlarmWithCustomSoundAndLabel } from "@/ai/flows/set-alarm-with-custom-sound-and-label-flow";
import { setTimerFromNaturalLanguage } from "@/ai/flows/set-timer-from-natural-language-flow";

interface AssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssistantDialog({ isOpen, onClose }: AssistantDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAssistant = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    try {
      // Determine if it's a timer or alarm based on keywords
      const isTimer = prompt.toLowerCase().includes("timer") || 
                      prompt.toLowerCase().includes("count down") || 
                      prompt.toLowerCase().includes("for 5 minutes");

      if (isTimer) {
        const result = await setTimerFromNaturalLanguage({ text: prompt });
        toast({
          title: "Timer set via AI",
          description: `Timer for ${result.durationSeconds} seconds established.`,
        });
      } else {
        const result = await setAlarmWithCustomSoundAndLabel({ userRequest: prompt });
        // Manually update local storage so ClockPage picks it up on next load or refresh
        const existing = JSON.parse(localStorage.getItem("auratime_alarms") || "[]");
        const newAlarm = {
          id: Math.random().toString(36).substr(2, 9),
          time: result.time,
          label: result.label || "AI Generated",
          sound: result.soundId,
          enabled: true
        };
        localStorage.setItem("auratime_alarms", JSON.stringify([newAlarm, ...existing]));
        
        toast({
          title: "Alarm established",
          description: `Alarm for ${result.time} "${result.label || 'No label'}" has been added.`,
        });
      }
      setPrompt("");
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "I couldn't process that temporal command. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-white/10 sm:max-w-[450px]">
        <DialogHeader className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <DialogTitle className="font-headline text-xl text-white">Intelligent Assistant</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-xs font-body">
            Set complex alarms or timers using natural language. 
            Try "Set an alarm for 7 AM labeled Gym with Cosmic sound."
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Tell me what you need..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="glass border-white/10 min-h-[120px] text-white resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAssistant();
              }
            }}
          />
          <Button 
            onClick={handleAssistant} 
            disabled={isProcessing || !prompt.trim()}
            className="w-full bg-accent hover:bg-accent/80 text-accent-foreground font-bold h-12 rounded-xl"
          >
            {isProcessing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Command Assistant</>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-2 mt-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 text-center font-semibold">Capabilities</p>
            <div className="grid grid-cols-2 gap-2">
                <div className="glass rounded-lg p-2 text-[10px] flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    Multi-step alarms
                </div>
                <div className="glass rounded-lg p-2 text-[10px] flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    Sound selection
                </div>
                <div className="glass rounded-lg p-2 text-[10px] flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    Custom labels
                </div>
                <div className="glass rounded-lg p-2 text-[10px] flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    Dynamic timers
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
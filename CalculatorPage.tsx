
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const handlePress = (value: string) => {
    // Trigger subtle haptic feel on click
    if ("vibrate" in navigator) {
      navigator.vibrate(5);
    }

    if (value === "AC") {
      setDisplay("0");
      setEquation("");
      return;
    }

    if (value === "⌫") {
      if (equation.length > 0) {
        const newEq = equation.slice(0, -1);
        setEquation(newEq);
        
        if (newEq === "") {
          setDisplay("0");
        } else {
          const match = newEq.match(/(\d+\.?\d*)$/);
          setDisplay(match ? match[0] : "0");
        }
      } else if (display !== "0") {
        const newDisp = display.slice(0, -1) || "0";
        setDisplay(newDisp);
        setEquation(newDisp === "0" ? "" : newDisp);
      }
      return;
    }

    if (value === "=") {
      try {
        const cleanEq = equation
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-")
          .replace(/[^0-9*/%+-.]/g, "");
        
        // eslint-disable-next-line no-eval
        const result = eval(cleanEq);
        const resultStr = Number(result.toFixed(8)).toString();
        setDisplay(resultStr);
        setEquation(resultStr);
      } catch (e) {
        setDisplay("Error");
      }
      return;
    }

    if (value === "%") {
      const val = parseFloat(display) / 100;
      setDisplay(val.toString());
      setEquation(equation + "/100");
      return;
    }

    const isOperator = ["÷", "×", "−", "+"].includes(value);

    if (display === "0" && !isOperator) {
      setDisplay(value);
      setEquation(value);
    } else {
      if (isOperator) {
        // Prevent double operators
        if (["÷", "×", "−", "+"].includes(equation.slice(-1))) {
           setEquation(equation.slice(0, -1) + value);
        } else {
           setEquation(equation + value);
        }
      } else {
        const lastChar = equation.slice(-1);
        const isLastCharOp = ["÷", "×", "−", "+"].includes(lastChar);
        setDisplay(isLastCharOp ? value : display + value);
        setEquation(equation + value);
      }
    }
  };

  const buttons = [
    { label: "AC", type: "func" },
    { label: "⌫", type: "func" },
    { label: "%", type: "func" },
    { label: "÷", type: "op" },
    { label: "7", type: "num" },
    { label: "8", type: "num" },
    { label: "9", type: "num" },
    { label: "×", type: "op" },
    { label: "4", type: "num" },
    { label: "5", type: "num" },
    { label: "6", type: "num" },
    { label: "−", type: "op" },
    { label: "1", type: "num" },
    { label: "2", type: "num" },
    { label: "3", type: "num" },
    { label: "+", type: "op" },
    { label: "(", type: "num" },
    { label: "0", type: "num" },
    { label: ")", type: "num" },
    { label: ".", type: "num" },
    { label: "=", type: "eq" },
  ];

  return (
    <div className="flex flex-col h-full max-w-[420px] mx-auto animate-fade-in pb-12 pt-4 px-2">
      {/* Display Area */}
      <div className="flex-1 flex flex-col justify-end px-8 py-12 mb-8 glass rounded-[3rem] shadow-2xl min-h-[220px]">
        <div className="text-right mb-4">
          <span className="text-primary/30 text-2xl font-headline font-medium tabular-nums tracking-widest truncate block h-8">
            {equation}
          </span>
        </div>
        <div className={cn(
          "text-right font-headline font-light tabular-nums text-white transition-all duration-300 overflow-hidden text-ellipsis whitespace-nowrap",
          display.length > 8 ? "text-5xl" : "text-7xl"
        )}>
          {display}
        </div>
      </div>

      {/* Grid Layout - 4 Columns */}
      <div className="grid grid-cols-4 gap-4 px-2">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handlePress(btn.label)}
            className={cn(
              "aspect-square rounded-full flex items-center justify-center text-2xl font-medium transition-all duration-150 active:scale-90 active:opacity-70",
              btn.type === "func" && "bg-white/[0.08] text-primary/70 hover:bg-white/[0.12]",
              btn.type === "num" && "bg-white/[0.03] text-white/90 hover:bg-white/[0.06] border border-white/[0.02]",
              btn.type === "op" && "bg-primary/10 text-primary text-3xl hover:bg-primary/20",
              btn.type === "eq" && "col-span-4 aspect-auto h-20 mt-4 bg-primary text-primary-foreground text-4xl font-bold shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:bg-primary/90 rounded-[2.5rem]"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onDone: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onDone, duration = 2500 }: ToastProps) {
  const [stage, setStage] = useState<"enter" | "show" | "exit" | "idle">("idle");

  useEffect(() => {
    if (!visible) return;

    setStage("enter");
    const enterTimer = window.setTimeout(() => setStage("show"), 50);
    const exitTimer = window.setTimeout(() => setStage("exit"), duration - 400);
    const doneTimer = window.setTimeout(() => {
      setStage("idle");
      onDone();
    }, duration);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [visible, duration, onDone]);

  if (stage === "idle") return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <div
        className={`px-6 py-3.5 rounded-2xl bg-[#27272a] border border-white/10 shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          stage === "enter"
            ? "opacity-0 scale-90"
            : stage === "show"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
          <i className="ri-check-line text-sky-400 text-lg"></i>
        </div>
        <span className="text-[#f4f4f5] text-sm font-semibold whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
}

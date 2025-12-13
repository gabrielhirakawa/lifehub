import React, { useState, useEffect, useRef } from "react";
import { WidgetData, PomodoroMode } from "../../types";
import { Play, Pause, RotateCcw, Coffee, Brain, Armchair } from "lucide-react";

interface PomodoroWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const MODES: Record<
  PomodoroMode,
  { label: string; minutes: number; color: string; icon: any }
> = {
  work: {
    label: "Focus",
    minutes: 25,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    icon: Brain,
  },
  shortBreak: {
    label: "Short Break",
    minutes: 5,
    color:
      "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    icon: Coffee,
  },
  longBreak: {
    label: "Long Break",
    minutes: 15,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    icon: Armchair,
  },
};

const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ data, onUpdate }) => {
  // Extract state from data props directly
  const {
    timeLeft = MODES.work.minutes * 60,
    isActive = false,
    mode = "work",
    cyclesCompleted = 0,
    endTime,
  } = data.content?.pomodoro || {};

  // Local state only for display purposes (ticks every second)
  const [displayTime, setDisplayTime] = useState(timeLeft);

  // Timer ref for the UI update interval
  const timerRef = useRef<any>(null);

  const playNotificationSound = () => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Drop to A4

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // Helper to sync data back to parent
  const updateState = (updates: Partial<typeof data.content.pomodoro>) => {
    onUpdate({
      ...data,
      content: {
        ...data.content,
        pomodoro: {
          timeLeft,
          isActive,
          mode,
          cyclesCompleted,
          endTime,
          ...updates,
        },
      },
    });
  };

  // --- CORE LOGIC ---

  useEffect(() => {
    if (isActive && endTime) {
      // Logic when running: Calculate remaining time based on current Date vs endTime
      const tick = () => {
        const now = Date.now();
        const secondsRemaining = Math.max(0, Math.ceil((endTime - now) / 1000));

        setDisplayTime(secondsRemaining);

        if (secondsRemaining <= 0) {
          // Timer Finished
          if (timerRef.current) clearInterval(timerRef.current);
          playNotificationSound();

          const newCycles =
            mode === "work" ? cyclesCompleted + 1 : cyclesCompleted;

          updateState({
            isActive: false,
            timeLeft: 0,
            cyclesCompleted: newCycles,
            endTime: undefined,
          });
        }
      };

      // Run immediately to avoid 1s delay on load
      tick();

      // Update UI every 250ms (smoother than 1s, though we display seconds)
      timerRef.current = setInterval(tick, 250);
    } else {
      // Logic when paused: Just show the stored timeLeft
      setDisplayTime(timeLeft);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, endTime, mode, cyclesCompleted, timeLeft]);

  // --- HANDLERS ---

  const switchMode = (newMode: PomodoroMode) => {
    const newTime = MODES[newMode].minutes * 60;
    // Switching mode resets the timer
    updateState({
      mode: newMode,
      isActive: false,
      timeLeft: newTime,
      endTime: undefined,
    });
  };

  const toggleTimer = () => {
    if (isActive) {
      // PAUSE: Calculate time remaining based on where we stopped and save it
      const now = Date.now();
      const currentRemaining = endTime
        ? Math.max(0, Math.ceil((endTime - now) / 1000))
        : timeLeft;

      updateState({
        isActive: false,
        timeLeft: currentRemaining,
        endTime: undefined,
      });
    } else {
      // START: Calculate new EndTime based on current timeLeft
      const now = Date.now();
      const targetEndTime = now + timeLeft * 1000;

      updateState({
        isActive: true,
        endTime: targetEndTime,
      });
    }
  };

  const resetTimer = () => {
    const newTime = MODES[mode].minutes * 60;
    updateState({
      isActive: false,
      timeLeft: newTime,
      endTime: undefined,
    });
  };

  // --- UI HELPERS ---

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const CurrentIcon = MODES[mode].icon;

  return (
    <div className="h-full flex flex-col items-center justify-between py-2">
      {/* Mode Selector */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full mb-2">
        {(Object.keys(MODES) as PomodoroMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 text-[10px] sm:text-xs font-medium py-1.5 rounded-md transition-all ${
              mode === m
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        {/* Background Circle/Decor */}
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-colors relative ${
            isActive
              ? "border-slate-200 dark:border-slate-700"
              : "border-slate-100 dark:border-slate-800"
          }`}
        >
          <div
            className={`text-3xl font-mono font-bold tracking-wider ${
              isActive
                ? "text-slate-800 dark:text-slate-100"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {formatTime(displayTime)}
          </div>

          {/* Mode Icon floating */}
          <div
            className={`absolute -top-3 bg-white dark:bg-slate-900 p-1.5 rounded-full border shadow-sm ${
              MODES[mode].color.split(" ")[0]
            }`}
          >
            <CurrentIcon size={18} />
          </div>
        </div>

        <p
          className={`mt-3 text-xs font-medium px-3 py-1 rounded-full ${MODES[mode].color}`}
        >
          {isActive ? "Running" : "Paused"}
        </p>
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-center gap-4 mt-1">
        <button
          onClick={resetTimer}
          className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={toggleTimer}
          className={`p-3 rounded-full h-12 w-12 text-white shadow-lg transform transition-all active:scale-95 ${
            isActive
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-indigo-600 hover:bg-indigo-700"
          } flex items-center justify-center`}
          title={isActive ? "Pause" : "Start"}
        >
          {isActive ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-1" />
          )}
        </button>
      </div>

      <div className="w-full text-center mt-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        Cycles Completed: {cyclesCompleted}
      </div>
    </div>
  );
};

export default PomodoroWidget;

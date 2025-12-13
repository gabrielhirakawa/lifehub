import React, { useState } from 'react';
import { WidgetData } from '../../types';
import { Droplets, Plus, RotateCcw } from 'lucide-react';

interface WellnessWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const BLOCK_CAPACITY = 500; // Each square represents 500ml
const MAX_CAPACITY = 5000; // Max limit 5L
const TOTAL_BLOCKS = 10; // 10 * 500 = 5000ml total visually

const WellnessWidget: React.FC<WellnessWidgetProps> = ({ data, onUpdate }) => {
  // Date helpers
  const getDateStr = (offsetDays: number = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const todayStr = getDateStr(0);
  const yesterdayStr = getDateStr(1);
  const dayBeforeStr = getDateStr(2);
  
  const [activeDate, setActiveDate] = useState(todayStr);

  const history = data.content?.wellness?.history || [];
  
  // Find record for active date, or default to 0
  let currentMl = 0;
  const activeRecord = history.find(r => r.date === activeDate);
  
  if (activeRecord) {
    currentMl = activeRecord.amount;
  } else if (activeDate === todayStr && data.content?.wellness?.waterIntakeMl) {
    // Legacy support for migration
    currentMl = data.content.wellness.waterIntakeMl;
  }

  const updateAmountForDate = (date: string, newAmount: number) => {
    // Cap at MAX_CAPACITY
    const cappedAmount = Math.min(newAmount, MAX_CAPACITY);

    let newHistory = [...history];
    const existingIndex = history.findIndex(r => r.date === date);

    if (existingIndex >= 0) {
      newHistory[existingIndex] = { ...newHistory[existingIndex], amount: cappedAmount };
    } else {
      newHistory.push({ date: date, amount: cappedAmount });
    }

    onUpdate({
      ...data,
      content: { 
        ...data.content, 
        wellness: { 
            ...data.content?.wellness,
            history: newHistory,
            // Sync legacy field if updating today for safety
            waterIntakeMl: date === todayStr ? cappedAmount : data.content?.wellness?.waterIntakeMl 
        } 
      }
    });
  };

  const addWater = (amount: number) => {
    if (currentMl >= MAX_CAPACITY) return;
    updateAmountForDate(activeDate, currentMl + amount);
  };

  const resetWater = () => {
    updateAmountForDate(activeDate, 0);
  };

  // Helper to calculate how full a specific block is (0 to 100%)
  const getBlockFillPercentage = (index: number) => {
    const blockStartMl = index * BLOCK_CAPACITY;
    const amountInThisBlock = Math.max(0, Math.min(BLOCK_CAPACITY, currentMl - blockStartMl));
    return (amountInThisBlock / BLOCK_CAPACITY) * 100;
  };

  // Format display value
  const displayValue = currentMl >= 1000 
    ? `${(currentMl / 1000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}L`
    : `${currentMl}ml`;

  const TabButton = ({ date, label }: { date: string, label: string }) => (
    <button
      onClick={() => setActiveDate(date)}
      className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-colors border ${
        activeDate === date
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
          : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
       {/* Date Tabs (Mini) */}
      <div className="flex items-center gap-1 mb-2 justify-center bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg">
        <TabButton date={dayBeforeStr} label="Day Before" />
        <TabButton date={yesterdayStr} label="Yesterday" />
        <TabButton date={todayStr} label="Today" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1 flex-shrink-0">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
             <Droplets size={16} fill="currentColor" />
           </div>
           <div>
             <span className="font-bold text-xl block leading-none text-slate-800 dark:text-slate-100">
               {displayValue}
               {currentMl >= MAX_CAPACITY && <span className="text-[10px] text-red-500 font-normal ml-2">Max</span>}
             </span>
           </div>
        </div>
        <button 
          onClick={resetWater} 
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Reset"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Grid of 500ml Squares - Scrollable Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-1 mb-2">
        <div className="grid grid-cols-5 gap-2 content-start pb-2">
          {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => {
            const fillPercent = getBlockFillPercentage(i);
            const isFull = fillPercent >= 100;
            const isEmpty = fillPercent <= 0;
            
            return (
              <div key={i} className="aspect-square relative rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden shadow-sm">
                {/* Liquid */}
                <div 
                  className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-700 ease-in-out flex items-end overflow-hidden"
                  style={{ height: `${fillPercent}%` }}
                >
                  {/* Wave Effect (CSS Animation) */}
                  {!isFull && !isEmpty && (
                    <div className="absolute top-[-5px] left-0 w-[200%] h-3 flex opacity-80 animate-wave-slow">
                      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-blue-400 fill-current">
                        <path d="M0,10 C30,20 70,0 100,10 L100,20 L0,20 Z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* 500ml Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className={`text-[8px] font-medium transition-colors ${fillPercent > 50 ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    500
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls - Fixed at Bottom */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        {[250, 500, 750, 1000].map(amount => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            disabled={currentMl >= MAX_CAPACITY}
            className={`flex flex-col items-center justify-center py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-all active:scale-95 ${
                currentMl >= MAX_CAPACITY 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Plus size={14} className="mb-0.5" />
            <span className="text-[10px] font-bold">{amount < 1000 ? amount : '1L'}</span>
          </button>
        ))}
      </div>
      
      <style>{`
        @keyframes wave-slow {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave-slow {
          animation: wave-slow 3s linear infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default WellnessWidget;
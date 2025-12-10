import React from 'react';
import { WidgetData } from '../../types';
import { Droplets, Plus, RotateCcw } from 'lucide-react';

interface WellnessWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const BLOCK_CAPACITY = 500; // Each square represents 500ml
const TOTAL_BLOCKS = 10; // 10 * 500 = 5000ml total visually

const WellnessWidget: React.FC<WellnessWidgetProps> = ({ data, onUpdate }) => {
  const wellness = data.content?.wellness || { waterIntakeMl: 0 };
  const currentMl = wellness.waterIntakeMl || 0;

  const addWater = (amount: number) => {
    onUpdate({
      ...data,
      content: { ...data.content, wellness: { ...wellness, waterIntakeMl: currentMl + amount } }
    });
  };

  const resetWater = () => {
     onUpdate({
      ...data,
      content: { ...data.content, wellness: { ...wellness, waterIntakeMl: 0 } }
    });
  };

  // Helper to calculate how full a specific block is (0 to 100%)
  const getBlockFillPercentage = (index: number) => {
    const blockStartMl = index * BLOCK_CAPACITY;
    const amountInThisBlock = Math.max(0, Math.min(BLOCK_CAPACITY, currentMl - blockStartMl));
    return (amountInThisBlock / BLOCK_CAPACITY) * 100;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1 flex-shrink-0">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
             <Droplets size={16} fill="currentColor" />
           </div>
           <div>
             <span className="font-bold text-xl block leading-none text-slate-800 dark:text-slate-100">
               {currentMl}<span className="text-xs font-normal text-slate-500 ml-0.5">ml</span>
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
            className="flex flex-col items-center justify-center py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
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
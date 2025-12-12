import React, { useState, useRef } from 'react';
import { WidgetData, WidgetType } from '../types';
import { X, CheckSquare, FileText, Activity, Bot, Kanban, Bell, Dumbbell, Link as LinkIcon, Scaling, GripVertical, Check, Utensils } from 'lucide-react';
import TodoWidget from './widgets/TodoWidget';
import NoteWidget from './widgets/NoteWidget';
import WellnessWidget from './widgets/WellnessWidget';
import AICoachWidget from './widgets/AICoachWidget';
import KanbanWidget from './widgets/KanbanWidget';
import ReminderWidget from './widgets/ReminderWidget';
import GymTrackWidget from './widgets/GymTrackWidget';
import LinkWidget from './widgets/LinkWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import DietWidget from './widgets/DietWidget';

interface DashboardProps {
  widgets: WidgetData[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetData[]>>;
  isEditMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ widgets, setWidgets, isEditMode }) => {
  const [activeResizeMenu, setActiveResizeMenu] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const updateWidgetData = (id: string, newData: WidgetData) => {
    setWidgets(prev => prev.map(w => w.id === id ? newData : w));
  };

  const setWidgetSize = (id: string, cols: number) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, cols: cols } : w));
    setActiveResizeMenu(null);
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); 
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newWidgets = [...widgets];
    const [draggedItem] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedItem);
    
    setWidgets(newWidgets);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // --- Helpers ---

  const getIcon = (type: WidgetType) => {
    switch (type) {
      case WidgetType.TODO: return <CheckSquare size={18} className="text-indigo-500 dark:text-indigo-400" />;
      case WidgetType.NOTE: return <FileText size={18} className="text-yellow-500 dark:text-yellow-400" />;
      case WidgetType.WELLNESS: return <Activity size={18} className="text-emerald-500 dark:text-emerald-400" />;
      case WidgetType.AI_ASSISTANT: return <Bot size={18} className="text-purple-500 dark:text-purple-400" />;
      case WidgetType.KANBAN: return <Kanban size={18} className="text-orange-500 dark:text-orange-400" />;
      case WidgetType.REMINDER: return <Bell size={18} className="text-rose-500 dark:text-rose-400" />;
      case WidgetType.GYM: return <Dumbbell size={18} className="text-blue-500 dark:text-blue-400" />;
      case WidgetType.LINKS: return <LinkIcon size={18} className="text-cyan-500 dark:text-cyan-400" />;
      case WidgetType.DIET: return <Utensils size={18} className="text-lime-600 dark:text-lime-400" />;
      case WidgetType.POMODORO: return (
        // Custom Tomato Icon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400">
           <path d="M12 2c5.5 0 10 3.5 10 9a10 10 0 0 1-10 10C6.5 21 2 17.5 2 12c0-5.5 4.5-9 10-9Z" />
           <path d="M12 2v4" />
           <path d="m12 2-3 3" />
           <path d="m12 2 3 3" />
        </svg>
      );
      default: return null;
    }
  };

  const getColSpanClass = (cols?: number) => {
    switch (cols) {
      case 4: return 'md:col-span-2 lg:col-span-3 xl:col-span-4';
      case 3: return 'md:col-span-2 lg:col-span-3';
      case 2: return 'md:col-span-2';
      default: return '';
    }
  };

  const getSizeLabel = (cols?: number) => {
    switch (cols) {
      case 4: return 'Full Width';
      case 3: return 'Large (3x)';
      case 2: return 'Medium (2x)';
      default: return 'Small (1x)';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 auto-rows-[380px]">
      {widgets.map((widget, index) => {
        const isDragging = draggedIndex === index;
        const isOver = dragOverIndex === index;
        
        return (
          <div 
            key={widget.id}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              bg-white dark:bg-slate-900 rounded-2xl shadow-sm border overflow-visible flex flex-col h-[380px] transition-all duration-200 
              ${getColSpanClass(widget.cols)} 
              ${isEditMode ? 'cursor-default' : ''}
              ${isEditMode ? 'border-indigo-400 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/10' : 'border-slate-200/60 dark:border-slate-800 hover:shadow-md'}
              ${isDragging ? 'opacity-40 scale-95 border-dashed border-2' : ''}
              ${isOver && !isDragging ? 'translate-y-2 border-indigo-500 ring-4 ring-indigo-200 dark:ring-indigo-900' : ''}
            `}
          >
            {/* Widget Header */}
            <div 
              className={`px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10 rounded-t-2xl transition-colors ${
                isEditMode 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 cursor-move' 
                  : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isEditMode && (
                  <GripVertical size={16} className="text-slate-400 dark:text-slate-500 mr-[-4px]" />
                )}
                <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-md transition-colors">
                  {getIcon(widget.type)}
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight truncate max-w-[150px]" title={widget.title}>
                  {widget.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-0.5 relative">
                {isEditMode && (
                  <>
                    {/* Resize Dropdown Trigger - SIMPLIFIED TO ICON ONLY & HIDDEN ON MOBILE */}
                    <div className="relative hidden sm:block">
                      <button 
                        onClick={() => setActiveResizeMenu(activeResizeMenu === widget.id ? null : widget.id)}
                        className={`p-1.5 rounded-md transition-colors mx-1 ${
                          activeResizeMenu === widget.id 
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' 
                            : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={`Resize (Current: ${getSizeLabel(widget.cols)})`}
                      >
                        <Scaling size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeResizeMenu === widget.id && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                            Card Size
                          </div>
                          {[1, 2, 3, 4].map((size) => (
                            <button
                              key={size}
                              onClick={() => setWidgetSize(widget.id, size)}
                              className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                                (widget.cols || 1) === size 
                                  ? 'text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/10' 
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <span>{getSizeLabel(size)}</span>
                              {(widget.cols || 1) === size && <Check size={12} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Overlay to close menu when clicking outside */}
                    {activeResizeMenu === widget.id && (
                      <div className="fixed inset-0 z-40" onClick={() => setActiveResizeMenu(null)} />
                    )}

                    <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                    <button 
                      onClick={() => removeWidget(widget.id)}
                      className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md transition-colors"
                      title="Remove Widget"
                    >
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Widget Content - ADDED rounded-b-2xl to fix square corners bug */}
            <div className={`flex-1 p-4 overflow-hidden relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors rounded-b-2xl ${isEditMode ? 'pointer-events-none opacity-80' : ''}`}>
              {widget.type === WidgetType.TODO && (
                <TodoWidget 
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
              {widget.type === WidgetType.NOTE && (
                <NoteWidget 
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
              {widget.type === WidgetType.WELLNESS && (
                <WellnessWidget 
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
              {widget.type === WidgetType.AI_ASSISTANT && (
                <AICoachWidget 
                  allWidgets={widgets}
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
              {widget.type === WidgetType.KANBAN && (
                <KanbanWidget 
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
              {widget.type === WidgetType.REMINDER && (
                <ReminderWidget 
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
              {widget.type === WidgetType.GYM && (
                <GymTrackWidget 
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
              {widget.type === WidgetType.LINKS && (
                <LinkWidget 
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
              {widget.type === WidgetType.POMODORO && (
                <PomodoroWidget
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
               {widget.type === WidgetType.DIET && (
                <DietWidget
                  data={widget} 
                  onUpdate={(d) => updateWidgetData(widget.id, d)} 
                />
              )}
            </div>
          </div>
        );
      })}

      {widgets.length === 0 && (
        <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
          <p>Your dashboard is empty.</p>
          <p className="text-sm mt-2">Add a widget to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
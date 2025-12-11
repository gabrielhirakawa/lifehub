import React from 'react';
import { WidgetData, WidgetType } from '../types';
import { X, CheckSquare, FileText, Activity, Bot, Kanban, Bell, Maximize2, Minimize2, Dumbbell, Link as LinkIcon } from 'lucide-react';
import TodoWidget from './widgets/TodoWidget';
import NoteWidget from './widgets/NoteWidget';
import WellnessWidget from './widgets/WellnessWidget';
import AICoachWidget from './widgets/AICoachWidget';
import KanbanWidget from './widgets/KanbanWidget';
import ReminderWidget from './widgets/ReminderWidget';
import GymTrackWidget from './widgets/GymTrackWidget';
import LinkWidget from './widgets/LinkWidget';

interface DashboardProps {
  widgets: WidgetData[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetData[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ widgets, setWidgets }) => {
  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const updateWidgetData = (id: string, newData: WidgetData) => {
    setWidgets(prev => prev.map(w => w.id === id ? newData : w));
  };

  const toggleWidgetSize = (id: string, currentCols?: number) => {
    const newCols = currentCols === 2 ? 1 : 2;
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, cols: newCols } : w));
  };

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
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 auto-rows-[380px]">
      {widgets.map((widget) => (
        <div 
          key={widget.id} 
          className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col h-[380px] hover:shadow-md transition-all duration-300 ${widget.cols === 2 ? 'md:col-span-2' : ''}`}
        >
          {/* Widget Header */}
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-md transition-colors">
                {getIcon(widget.type)}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight truncate max-w-[150px]" title={widget.title}>
                {widget.title}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {/* Expand/Collapse Button - Hidden on Mobile */}
              <button 
                onClick={() => toggleWidgetSize(widget.id, widget.cols)}
                className="hidden md:block text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title={widget.cols === 2 ? "Collapse widget" : "Expand widget"}
              >
                {widget.cols === 2 ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button 
                onClick={() => removeWidget(widget.id)}
                className="text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-400 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Remove widget"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Widget Content */}
          <div className="flex-1 p-4 overflow-hidden relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
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
          </div>
        </div>
      ))}

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
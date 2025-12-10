import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { WidgetData, WidgetType } from './types';
import { LayoutDashboard, Plus, Sun, Moon } from 'lucide-react';

// Helper for initial dates
const today = new Date().toISOString().split('T')[0];

const DEFAULT_WIDGETS: WidgetData[] = [
  {
    id: '1',
    type: WidgetType.TODO,
    title: 'Daily Tasks',
    content: { todos: [
      { id: 't1', text: 'Drink water', completed: false, date: today },
      { id: 't2', text: 'Check emails', completed: true, date: today }
    ] }
  },
  {
    id: '2',
    type: WidgetType.WELLNESS,
    title: 'Hydration',
    content: { 
      wellness: { 
        history: [{ date: today, amount: 1250 }] 
      } 
    }
  },
  {
    id: '3',
    type: WidgetType.AI_ASSISTANT,
    title: 'Life Coach',
    content: { chatHistory: [
      { role: 'model', text: "Welcome to LifeHub! I'm here to help you stay organized. Try adding some tasks and then ask me for a summary!" }
    ]}
  }
];

const App: React.FC = () => {
  // --- State Management ---
  const [widgets, setWidgets] = useState<WidgetData[]>(() => {
    const saved = localStorage.getItem('lifehub_widgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lifehub_theme') === 'dark' || 
             (!localStorage.getItem('lifehub_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('lifehub_widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('lifehub_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('lifehub_theme', 'light');
    }
  }, [isDarkMode]);

  // --- Helpers ---
  const getDefaultTitle = (type: WidgetType) => {
    switch(type) {
      case WidgetType.TODO: return 'Daily Tasks';
      case WidgetType.NOTE: return 'Notes';
      case WidgetType.WELLNESS: return 'Hydration';
      case WidgetType.AI_ASSISTANT: return 'Life Coach';
      case WidgetType.KANBAN: return 'Kanban Board';
      case WidgetType.REMINDER: return '';
      default: return 'Widget';
    }
  };

  const isWidgetAdded = (type: WidgetType) => {
    return widgets.some(w => w.type === type);
  };

  // --- Handlers ---
  const handleAddWidget = (type: WidgetType) => {
    if (isWidgetAdded(type)) return;

    const newWidget: WidgetData = {
      id: Date.now().toString(),
      type: type,
      title: getDefaultTitle(type),
      content: {}
    };
    setWidgets([...widgets, newWidget]);
    setIsMenuOpen(false); // Close dropdown
  };

  const MenuButton = ({ type, colorClass }: { type: WidgetType, colorClass: string }) => {
    const added = isWidgetAdded(type);
    return (
      <button 
        onClick={() => !added && handleAddWidget(type)} 
        disabled={added}
        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
          added 
            ? 'opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50' 
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${added ? 'bg-slate-300 dark:bg-slate-600' : colorClass}`} /> 
        {getDefaultTitle(type)}
        {added && <span className="ml-auto text-[10px] uppercase font-bold tracking-wider opacity-60">Added</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <LayoutDashboard size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">LifeHub</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Widget</span>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    General
                  </div>
                  <MenuButton type={WidgetType.TODO} colorClass="bg-indigo-400" />
                  <MenuButton type={WidgetType.NOTE} colorClass="bg-yellow-400" />
                  <MenuButton type={WidgetType.AI_ASSISTANT} colorClass="bg-purple-400" />
                  
                  <div className="px-4 py-2 mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-slate-100 dark:border-slate-700">
                    Productivity
                  </div>
                  <MenuButton type={WidgetType.KANBAN} colorClass="bg-orange-400" />
                  <MenuButton type={WidgetType.REMINDER} colorClass="bg-rose-400" />
                  
                  <div className="px-4 py-2 mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-slate-100 dark:border-slate-700">
                    Health
                  </div>
                  <MenuButton type={WidgetType.WELLNESS} colorClass="bg-emerald-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hello, User</h2>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening in your life today.</p>
        </div>
        
        <Dashboard widgets={widgets} setWidgets={setWidgets} />
      </main>

      {/* Overlay for menu close */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
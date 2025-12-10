import React, { useState, useEffect } from 'react';
import { TodoItem, WidgetData } from '../../types';
import { Plus, Check, Trash2, AlertCircle } from 'lucide-react';

interface TodoWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const TodoWidget: React.FC<TodoWidgetProps> = ({ data, onUpdate }) => {
  const [newTodo, setNewTodo] = useState('');
  
  // Date Helpers
  const getDateStr = (offsetDays: number = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const todayStr = getDateStr(0);
  const yesterdayStr = getDateStr(1);
  const dayBeforeStr = getDateStr(2);

  const [activeDate, setActiveDate] = useState(todayStr);

  const todos = data.content?.todos || [];

  // Logic to rollover overdue tasks
  useEffect(() => {
    let hasChanges = false;
    const newTodos = todos.map(t => {
      // Logic: If a task is undefined date (legacy) -> assign to today.
      // If task is OLDER than today AND NOT completed -> move to today + mark rolledOver.
      
      if (!t.date) {
        // Legacy migration
        hasChanges = true;
        return { ...t, date: todayStr };
      }

      // Check strict string comparison for date
      if (!t.completed && t.date < todayStr && !t.rolledOver) {
        hasChanges = true;
        return { ...t, date: todayStr, rolledOver: true };
      }
      return t;
    });

    if (hasChanges) {
      onUpdate({
        ...data,
        content: { ...data.content, todos: newTodos }
      });
    }
  }, []); // Run once on mount

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    // Always add to Today as requested
    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      date: todayStr 
    };
    onUpdate({
      ...data,
      content: { ...data.content, todos: [...todos, newItem] }
    });
    setNewTodo('');
    // Switch view to today if adding
    setActiveDate(todayStr);
  };

  const toggleTodo = (id: string) => {
    const newTodos = todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    onUpdate({
      ...data,
      content: { ...data.content, todos: newTodos }
    });
  };

  const deleteTodo = (id: string) => {
    const newTodos = todos.filter(t => t.id !== id);
    onUpdate({
      ...data,
      content: { ...data.content, todos: newTodos }
    });
  };

  // Filter todos for active view
  const displayTodos = todos.filter(t => (t.date || todayStr) === activeDate);

  const TabButton = ({ date, label }: { date: string, label: string }) => (
    <button
      onClick={() => setActiveDate(date)}
      className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 flex-1 sm:flex-none ${
        activeDate === date
          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-500'
          : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Date Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-3 overflow-x-auto">
        <TabButton date={dayBeforeStr} label="Day Before" />
        <TabButton date={yesterdayStr} label="Yesterday" />
        <TabButton date={todayStr} label="Today" />
      </div>

      {/* Input - Only shown when Today is active (implied by requirement "new task must enter current day") */}
      {activeDate === todayStr && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add task for today..."
            className="flex-1 px-3 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
          />
          <button type="submit" className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus size={18} />
          </button>
        </form>
      )}
      
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {displayTodos.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-4">
            No tasks for {activeDate === todayStr ? 'today' : 'this day'}.
          </div>
        )}
        {displayTodos.map(todo => (
          <div key={todo.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative">
            <div className="flex items-center gap-3 overflow-hidden">
              <button 
                onClick={() => toggleTodo(todo.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${todo.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-500 text-transparent hover:border-indigo-400 dark:hover:border-indigo-400'}`}
              >
                <Check size={12} />
              </button>
              <div className="flex flex-col overflow-hidden">
                <span className={`text-sm truncate ${todo.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                  {todo.text}
                </span>
                {todo.rolledOver && !todo.completed && (
                  <span className="text-[10px] text-orange-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle size={10} /> Overdue from previous day
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => deleteTodo(todo.id)}
              className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoWidget;
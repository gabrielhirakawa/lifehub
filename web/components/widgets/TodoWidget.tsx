import React, { useState } from 'react';
import { TodoItem, WidgetData } from '../../types';
import { Plus, Check, Trash2, Archive, ArchiveRestore } from 'lucide-react';

interface TodoWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

type TabType = 'current' | 'archived';

const TodoWidget: React.FC<TodoWidgetProps> = ({ data, onUpdate }) => {
  const [newTodo, setNewTodo] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('current');

  const todos = data.content?.todos || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      archived: false
    };
    onUpdate({
      ...data,
      content: { ...data.content, todos: [...todos, newItem] }
    });
    setNewTodo('');
    setActiveTab('current'); // Ensure we are looking at where the task goes
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

  const toggleArchive = (id: string) => {
     const newTodos = todos.map(t => 
      t.id === id ? { ...t, archived: !t.archived } : t
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
  const displayTodos = todos.filter(t => {
      if (activeTab === 'archived') return t.archived;
      return !t.archived; // Current (default)
  });

  const TabButton = ({ id, label, count }: { id: TabType, label: string, count: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 flex-1 sm:flex-none flex items-center justify-center gap-2 ${
        activeTab === id
          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-500'
          : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === id ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-200 dark:bg-slate-700'}`}>
          {count}
      </span>
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-3">
        <TabButton 
            id="current" 
            label="Current" 
            count={todos.filter(t => !t.archived).length} 
        />
        <TabButton 
            id="archived" 
            label="Archived" 
            count={todos.filter(t => t.archived).length} 
        />
      </div>

      {/* Input - Only shown in Current tab */}
      {activeTab === 'current' && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add new task..."
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
            No {activeTab} tasks found.
          </div>
        )}
        {displayTodos.map(todo => (
          <div key={todo.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
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
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                onClick={() => toggleArchive(todo.id)}
                className="p-1 text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                title={todo.archived ? "Restore" : "Archive"}
                >
                {todo.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                </button>
                <button 
                onClick={() => deleteTodo(todo.id)}
                className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                title="Delete"
                >
                <Trash2 size={14} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoWidget;
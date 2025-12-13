import React, { useState } from 'react';
import { WidgetData, KanbanColumn, KanbanItem } from '../../types';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface KanbanWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const DEFAULT_COLUMNS = [
  { id: 'todo', title: 'To Do', items: [] },
  { id: 'progress', title: 'Doing', items: [] },
  { id: 'done', title: 'Done', items: [] },
];

const KanbanWidget: React.FC<KanbanWidgetProps> = ({ data, onUpdate }) => {
  const columns = data.content?.kanban && data.content.kanban.length > 0 
    ? data.content.kanban 
    : DEFAULT_COLUMNS;
  
  const [newItemText, setNewItemText] = useState('');
  const [addingToCol, setAddingToCol] = useState<string | null>(null);

  const updateColumns = (newCols: KanbanColumn[]) => {
    onUpdate({
      ...data,
      content: { ...data.content, kanban: newCols }
    });
  };

  const addItem = (colId: string) => {
    if (!newItemText.trim()) {
      setAddingToCol(null);
      return;
    }
    const newItem: KanbanItem = { id: Date.now().toString(), content: newItemText };
    const newCols = columns.map(col => {
      if (col.id === colId) {
        return { ...col, items: [...col.items, newItem] };
      }
      return col;
    });
    updateColumns(newCols);
    setNewItemText('');
    setAddingToCol(null);
  };

  const deleteItem = (colId: string, itemId: string) => {
    const newCols = columns.map(col => {
      if (col.id === colId) {
        return { ...col, items: col.items.filter(i => i.id !== itemId) };
      }
      return col;
    });
    updateColumns(newCols);
  };

  const moveItem = (fromColIdx: number, itemId: string, direction: 'left' | 'right') => {
    const toColIdx = direction === 'left' ? fromColIdx - 1 : fromColIdx + 1;
    if (toColIdx < 0 || toColIdx >= columns.length) return;

    const sourceCol = columns[fromColIdx];
    const item = sourceCol.items.find(i => i.id === itemId);
    if (!item) return;

    const newCols = [...columns];
    // Remove from source
    newCols[fromColIdx] = {
      ...sourceCol,
      items: sourceCol.items.filter(i => i.id !== itemId)
    };
    // Add to dest
    newCols[toColIdx] = {
      ...newCols[toColIdx],
      items: [...newCols[toColIdx].items, item]
    };

    updateColumns(newCols);
  };

  return (
    <div className="h-full flex gap-3 overflow-x-auto custom-scrollbar pb-2">
      {columns.map((col, colIdx) => (
        <div key={col.id} className="min-w-[140px] w-[140px] flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="p-2 font-medium text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            {col.title}
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 rounded-full text-[10px]">{col.items.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {col.items.map(item => (
              <div key={item.id} className="group relative bg-white dark:bg-slate-700 p-2 rounded shadow-sm text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                {item.content}
                
                {/* Hover Actions */}
                <div className="absolute top-0 right-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-700/90 gap-1 px-1">
                  {colIdx > 0 && (
                     <button onClick={() => moveItem(colIdx, item.id, 'left')} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"><ChevronLeft size={12} /></button>
                  )}
                  <button onClick={() => deleteItem(col.id, item.id)} className="p-0.5 hover:text-red-500"><X size={12} /></button>
                  {colIdx < columns.length - 1 && (
                     <button onClick={() => moveItem(colIdx, item.id, 'right')} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"><ChevronRight size={12} /></button>
                  )}
                </div>
              </div>
            ))}
            
            {addingToCol === col.id ? (
              <div className="p-1">
                 <input 
                   autoFocus
                   className="w-full text-xs p-1.5 border border-indigo-300 rounded focus:outline-none dark:bg-slate-800 dark:text-white"
                   value={newItemText}
                   onChange={e => setNewItemText(e.target.value)}
                   onKeyDown={e => {
                     if (e.key === 'Enter') addItem(col.id);
                     if (e.key === 'Escape') setAddingToCol(null);
                   }}
                   onBlur={() => addItem(col.id)}
                   placeholder="New item..."
                 />
              </div>
            ) : (
              <button 
                onClick={() => { setAddingToCol(col.id); setNewItemText(''); }}
                className="w-full py-1 text-xs text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded border border-dashed border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanWidget;
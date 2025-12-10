import React, { useState, useEffect } from 'react';
import { WidgetData, NoteTab } from '../../types';
import { Plus, X } from 'lucide-react';

interface NoteWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const NoteWidget: React.FC<NoteWidgetProps> = ({ data, onUpdate }) => {
  // Initialize notes. If legacy text exists, convert it to a tab.
  const notes: NoteTab[] = data.content?.notes || (data.content?.text ? [{
    id: 'default',
    title: 'General',
    content: data.content.text
  }] : [{ id: '1', title: 'Note 1', content: '' }]);

  const [activeTabId, setActiveTabId] = useState<string>(notes[0]?.id || '1');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);

  // Ensure activeTabId is valid
  useEffect(() => {
    if (!notes.find(n => n.id === activeTabId) && notes.length > 0) {
      setActiveTabId(notes[0].id);
    }
  }, [notes, activeTabId]);

  const activeNote = notes.find(n => n.id === activeTabId) || notes[0];

  const updateNotes = (newNotes: NoteTab[]) => {
    onUpdate({
      ...data,
      content: { ...data.content, notes: newNotes }
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = notes.map(n => 
      n.id === activeTabId ? { ...n, content: e.target.value } : n
    );
    updateNotes(newNotes);
  };

  const addTab = () => {
    const newId = Date.now().toString();
    const newNote: NoteTab = {
      id: newId,
      title: `Note ${notes.length + 1}`,
      content: ''
    };
    updateNotes([...notes, newNote]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (notes.length === 1) return; // Don't delete last tab
    const newNotes = notes.filter(n => n.id !== id);
    updateNotes(newNotes);
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    const newNotes = notes.map(n => 
      n.id === id ? { ...n, title: newTitle } : n
    );
    updateNotes(newNotes);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs Header */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto custom-scrollbar pb-1 mb-2">
        {notes.map(note => (
          <div 
            key={note.id}
            onClick={() => setActiveTabId(note.id)}
            className={`group flex items-center gap-1 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition-colors border-b-2 whitespace-nowrap min-w-[80px] justify-between ${
              activeTabId === note.id 
                ? 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 border-yellow-400 dark:border-yellow-600' 
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {editingTitleId === note.id ? (
              <input 
                autoFocus
                className="w-full bg-transparent outline-none min-w-0"
                value={note.title}
                onChange={(e) => handleTitleChange(note.id, e.target.value)}
                onBlur={() => setEditingTitleId(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitleId(null)}
              />
            ) : (
              <span onDoubleClick={() => setEditingTitleId(note.id)} className="truncate w-full select-none">
                {note.title}
              </span>
            )}
            
            {notes.length > 1 && (
              <button 
                onClick={(e) => closeTab(e, note.id)}
                className={`opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 ${activeTabId === note.id ? 'text-yellow-600 dark:text-yellow-500' : ''}`}
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        <button 
          onClick={addTab}
          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors flex-shrink-0"
          title="Add Note Tab"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Note Content */}
      <textarea
        className="flex-1 w-full h-full resize-none bg-yellow-50/30 dark:bg-yellow-900/5 p-3 rounded-b-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 transition-all custom-scrollbar leading-relaxed"
        placeholder="Type your thoughts here..."
        value={activeNote?.content || ''}
        onChange={handleContentChange}
      />
    </div>
  );
};

export default NoteWidget;
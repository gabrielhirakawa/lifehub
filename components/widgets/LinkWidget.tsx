import React, { useState } from 'react';
import { WidgetData, LinkItem } from '../../types';
import { Plus, Trash2, ExternalLink, X, Globe } from 'lucide-react';

interface LinkWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const LinkWidget: React.FC<LinkWidgetProps> = ({ data, onUpdate }) => {
  const links = data.content?.links || [];
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const normalizeUrl = (inputUrl: string) => {
    if (!inputUrl) return '';
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      return `https://${inputUrl}`;
    }
    return inputUrl;
  };

  const getFavicon = (u: string) => {
    try {
      const domain = new URL(u).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return null;
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: title.trim(),
      url: normalizeUrl(url.trim())
    };

    onUpdate({
      ...data,
      content: { ...data.content, links: [...links, newLink] }
    });
    setTitle('');
    setUrl('');
    setShowAdd(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent opening link
    onUpdate({
      ...data,
      content: { ...data.content, links: links.filter(l => l.id !== id) }
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Add Button (Overlay if not empty, otherwise inline) */}
      {!showAdd && (
        <button 
          onClick={() => setShowAdd(true)}
          className="absolute bottom-2 right-2 z-10 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110"
          title="Add Link"
        >
          <Plus size={18} />
        </button>
      )}

      {/* Add Form Overlay */}
      {showAdd && (
        <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full space-y-3">
             <div className="flex justify-between items-center mb-2">
               <h4 className="font-semibold text-slate-800 dark:text-slate-200">Pin New Link</h4>
               <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-red-500"><X size={18}/></button>
             </div>
             <input 
               autoFocus
               placeholder="Title (e.g., Banking)" 
               value={title} 
               onChange={e => setTitle(e.target.value)}
               className="w-full text-sm border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
             />
             <input 
               placeholder="URL (e.g., google.com)" 
               value={url} 
               onChange={e => setUrl(e.target.value)}
               className="w-full text-sm border p-2 rounded bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
             />
             <button 
               onClick={handleAdd}
               disabled={!title || !url}
               className="w-full bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
             >
               Save Link
             </button>
          </div>
        </div>
      )}

      {/* Grid of Links */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        {links.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
            <Globe size={32} className="mb-2 opacity-50" />
            <p>No pinned links yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {links.map(link => (
              <a 
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all text-center"
              >
                <div className="w-8 h-8 mb-2 rounded-full overflow-hidden bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                  <img 
                    src={getFavicon(link.url) || ''} 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    alt="" 
                    className="w-5 h-5"
                  />
                  {/* Fallback icon if image fails */}
                  <Globe size={16} className="text-slate-400 absolute z-[-1]" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate w-full px-1">{link.title}</span>
                
                {/* Delete Button (Visible on Hover) */}
                <button 
                  onClick={(e) => handleDelete(e, link.id)}
                  className="absolute top-1 right-1 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkWidget;
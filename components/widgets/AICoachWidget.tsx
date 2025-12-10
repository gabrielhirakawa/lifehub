import React, { useState, useRef, useEffect } from 'react';
import { WidgetData } from '../../types';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { getGeminiInsight } from '../../services/geminiService';

interface AICoachWidgetProps {
  allWidgets: WidgetData[];
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const AICoachWidget: React.FC<AICoachWidgetProps> = ({ allWidgets, data, onUpdate }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = data.content?.chatHistory || [
    { role: 'model', text: "Hi! I'm your LifeHub coach. I can see your tasks and wellness data. How can I help you today?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !e) return; // Allow empty input if it's a "analyze my day" trigger via button

    const userMsg = input;
    const newHistory = [...messages, { role: 'user', text: userMsg || "Analyze my dashboard." }];
    
    // Optimistic update
    onUpdate({
        ...data,
        content: { ...data.content, chatHistory: newHistory as any }
    });
    setInput('');
    setLoading(true);

    const responseText = await getGeminiInsight(allWidgets, userMsg);

    const finalHistory = [...newHistory, { role: 'model', text: responseText }];
    
    onUpdate({
        ...data,
        content: { ...data.content, chatHistory: finalHistory as any }
    });
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 mb-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 rounded-bl-none flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
               <Loader2 size={14} className="animate-spin" /> Thinking...
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for advice..."
          className="w-full pl-3 pr-10 py-2 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-1 top-1 p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
      
      {messages.length < 2 && (
          <button 
            onClick={() => handleSend()}
            className="mt-2 text-xs flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors w-full py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md"
          >
            <Sparkles size={12} /> Analyze my day for me
          </button>
      )}
    </div>
  );
};

export default AICoachWidget;
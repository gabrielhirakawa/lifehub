import React, { useState } from 'react';
import { WidgetData, GymTemplate, GymSession, GymSet, GymExerciseLog } from '../../types';
import { Play, Plus, Dumbbell, History, List, X, Check, Trash2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface GymTrackWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

type TabType = 'play' | 'workouts' | 'history';

const GymTrackWidget: React.FC<GymTrackWidgetProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('play');
  
  // Data extraction
  const templates = data.content?.gym?.templates || [];
  const history = data.content?.gym?.history || [];
  const activeSession = data.content?.gym?.activeSession;

  // State for creating new workout
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newExercises, setNewExercises] = useState<string[]>([]);
  const [exerciseInput, setExerciseInput] = useState('');

  // --- ACTIONS ---

  const handleUpdate = (updates: any) => {
    onUpdate({
      ...data,
      content: { 
        ...data.content, 
        gym: { 
          templates, 
          history, 
          activeSession, 
          ...updates 
        } 
      }
    });
  };

  // --- WORKOUTS TAB LOGIC ---
  
  const addExerciseToTemplate = () => {
    if (exerciseInput.trim()) {
      setNewExercises([...newExercises, exerciseInput.trim()]);
      setExerciseInput('');
    }
  };

  const removeExerciseFromTemplate = (idx: number) => {
    setNewExercises(newExercises.filter((_, i) => i !== idx));
  };

  const saveTemplate = () => {
    if (!newTemplateName.trim() || newExercises.length === 0) return;
    const newTemplate: GymTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      exercises: newExercises
    };
    handleUpdate({ templates: [...templates, newTemplate] });
    setIsCreating(false);
    setNewTemplateName('');
    setNewExercises([]);
    setExerciseInput('');
  };

  const deleteTemplate = (id: string) => {
    handleUpdate({ templates: templates.filter(t => t.id !== id) });
  };

  // --- PLAY TAB LOGIC ---

  const startSession = (template: GymTemplate) => {
    // Initialize logs structure
    const initialLogs: GymExerciseLog[] = template.exercises.map(ex => ({
      exerciseName: ex,
      sets: []
    }));

    const session: GymSession = {
      id: Date.now().toString(),
      templateName: template.name,
      startTime: new Date().toISOString(),
      logs: initialLogs
    };

    handleUpdate({ activeSession: session });
    setActiveTab('play');
  };

  const addSet = (exerciseName: string) => {
    if (!activeSession) return;

    const newLogs = activeSession.logs.map(log => {
      if (log.exerciseName === exerciseName) {
        return {
          ...log,
          sets: [...log.sets, { id: Date.now().toString(), reps: '', weight: '', completed: false }]
        };
      }
      return log;
    });

    handleUpdate({ activeSession: { ...activeSession, logs: newLogs } });
  };

  const updateSet = (exerciseName: string, setId: string, field: 'reps' | 'weight', value: string) => {
    if (!activeSession) return;
    const newLogs = activeSession.logs.map(log => {
      if (log.exerciseName === exerciseName) {
        return {
          ...log,
          sets: log.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return log;
    });
    handleUpdate({ activeSession: { ...activeSession, logs: newLogs } });
  };

  const toggleSetComplete = (exerciseName: string, setId: string) => {
     if (!activeSession) return;
    const newLogs = activeSession.logs.map(log => {
      if (log.exerciseName === exerciseName) {
        return {
          ...log,
          sets: log.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
        };
      }
      return log;
    });
    handleUpdate({ activeSession: { ...activeSession, logs: newLogs } });
  };

  const deleteSet = (exerciseName: string, setId: string) => {
      if (!activeSession) return;
      const newLogs = activeSession.logs.map(log => {
      if (log.exerciseName === exerciseName) {
        return {
          ...log,
          sets: log.sets.filter(s => s.id !== setId)
        };
      }
      return log;
    });
    handleUpdate({ activeSession: { ...activeSession, logs: newLogs } });
  };

  const finishSession = () => {
    if (!activeSession) return;
    const completedSession = { ...activeSession, endTime: new Date().toISOString() };
    handleUpdate({ 
      activeSession: null, 
      history: [...history, completedSession] 
    });
  };

  const cancelSession = () => {
    if (confirm("Cancel current workout? Progress will be lost.")) {
      handleUpdate({ activeSession: null });
    }
  };

  // --- RENDER ---

  const TabButton = ({ id, icon: Icon }: { id: TabType, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-2 flex justify-center items-center gap-1 text-xs font-medium border-b-2 transition-colors ${
        activeTab === id
          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
    >
      <Icon size={14} /> <span className="hidden sm:inline capitalize">{id}</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-2">
        <TabButton id="play" icon={Play} />
        <TabButton id="workouts" icon={List} />
        <TabButton id="history" icon={History} />
      </div>

      <div className="flex-1 overflow-hidden relative">
        
        {/* === PLAY TAB === */}
        {activeTab === 'play' && (
          <div className="h-full flex flex-col overflow-y-auto custom-scrollbar px-1">
            {activeSession ? (
              <div className="space-y-4 pb-2">
                <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="font-bold text-indigo-900 dark:text-indigo-100 text-sm">{activeSession.templateName}</div>
                  <div className="flex gap-2">
                    <button onClick={cancelSession} className="text-red-500 text-xs hover:bg-red-50 p-1.5 rounded">Cancel</button>
                    <button onClick={finishSession} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700 font-medium">Finish</button>
                  </div>
                </div>

                {activeSession.logs.map((log) => (
                  <div key={log.exerciseName} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 text-xs font-semibold text-slate-700 dark:text-slate-200 flex justify-between items-center">
                      {log.exerciseName}
                      <button onClick={() => addSet(log.exerciseName)} className="text-indigo-600 hover:bg-indigo-100 p-0.5 rounded"><Plus size={14}/></button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {log.sets.length === 0 && <div className="text-[10px] text-slate-400 p-2 text-center">No sets yet.</div>}
                      {log.sets.map((set, idx) => (
                        <div key={set.id} className={`flex items-center gap-2 p-1.5 ${set.completed ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-white dark:bg-slate-900'}`}>
                          <span className="text-[10px] text-slate-400 w-4 text-center">{idx + 1}</span>
                          <input 
                            type="number" 
                            placeholder="kg" 
                            value={set.weight}
                            onChange={(e) => updateSet(log.exerciseName, set.id, 'weight', e.target.value)}
                            className="w-12 text-xs border rounded p-1 text-center dark:bg-slate-800 dark:border-slate-700"
                          />
                          <input 
                            type="number" 
                            placeholder="reps"
                            value={set.reps}
                            onChange={(e) => updateSet(log.exerciseName, set.id, 'reps', e.target.value)} 
                            className="w-12 text-xs border rounded p-1 text-center dark:bg-slate-800 dark:border-slate-700"
                          />
                          <button 
                             onClick={() => toggleSetComplete(log.exerciseName, set.id)}
                             className={`p-1 rounded flex-1 flex justify-center ${set.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}
                          >
                            <Check size={12} />
                          </button>
                          <button onClick={() => deleteSet(log.exerciseName, set.id)} className="text-slate-300 hover:text-red-500 p-1"><X size={12}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <Dumbbell className="mx-auto text-indigo-300 mb-2" size={32} />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Start a workout routine</p>
                </div>
                {templates.length === 0 ? (
                  <div className="text-center p-4 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400">
                    No workouts found. Go to "Workouts" tab to create one!
                  </div>
                ) : (
                  templates.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => startSession(t)}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm transition-all bg-white dark:bg-slate-800 group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{t.name}</span>
                        <Play size={14} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate">
                        {t.exercises.join(', ')}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* === WORKOUTS TAB === */}
        {activeTab === 'workouts' && (
          <div className="h-full flex flex-col overflow-y-auto custom-scrollbar px-1">
             {isCreating ? (
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-200">New Workout</h4>
                    <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                  </div>
                  <input 
                    className="w-full text-sm border-b border-slate-200 dark:border-slate-700 py-1 bg-transparent outline-none focus:border-indigo-500"
                    placeholder="Workout Name (e.g. Leg Day)"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                  <div className="space-y-1">
                    {newExercises.map((ex, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                        <span>{ex}</span>
                        <button onClick={() => removeExerciseFromTemplate(i)} className="text-slate-400 hover:text-red-500"><X size={10}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 text-xs border rounded p-1.5 bg-transparent dark:border-slate-700"
                      placeholder="Add exercise..."
                      value={exerciseInput}
                      onChange={(e) => setExerciseInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addExerciseToTemplate()}
                    />
                    <button onClick={addExerciseToTemplate} className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded text-slate-600 hover:bg-slate-200"><Plus size={14}/></button>
                  </div>
                  <button onClick={saveTemplate} className="w-full bg-indigo-600 text-white py-1.5 rounded text-xs font-medium hover:bg-indigo-700">Save Workout</button>
               </div>
             ) : (
               <>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="mb-3 w-full border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-500 dark:text-indigo-400 py-2 rounded-lg text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/10 flex justify-center items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Create Workout
                </button>
                <div className="space-y-2">
                  {templates.map(t => (
                    <div key={t.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between items-start group">
                      <div>
                        <div className="font-medium text-sm text-slate-700 dark:text-slate-200">{t.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.exercises.length} exercises</div>
                      </div>
                      <button onClick={() => deleteTemplate(t.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {templates.length === 0 && <div className="text-center text-xs text-slate-400 py-2">No templates yet.</div>}
                </div>
               </>
             )}
          </div>
        )}

        {/* === HISTORY TAB === */}
        {activeTab === 'history' && (
          <div className="h-full flex flex-col overflow-y-auto custom-scrollbar px-1 space-y-2">
            {history.length === 0 && (
              <div className="text-center text-xs text-slate-400 py-10">No workout history yet.</div>
            )}
            {history.slice().reverse().map(session => (
              <div key={session.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                 <div className="flex justify-between items-start mb-1">
                   <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{session.templateName}</h4>
                   <span className="text-[10px] text-slate-400 flex items-center gap-1">
                     <Calendar size={10} /> {new Date(session.startTime).toLocaleDateString()}
                   </span>
                 </div>
                 <div className="text-[10px] text-slate-500">
                    <span className="font-medium">{session.logs.length} Exercises</span> • 
                    Duration: {session.endTime ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) : '?'} mins
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GymTrackWidget;
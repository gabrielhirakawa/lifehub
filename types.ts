export enum WidgetType {
  TODO = 'TODO',
  NOTE = 'NOTE',
  WELLNESS = 'WELLNESS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  KANBAN = 'KANBAN',
  REMINDER = 'REMINDER',
  GYM = 'GYM',
  LINKS = 'LINKS',
  POMODORO = 'POMODORO',
  DIET = 'DIET'
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic';
export type AILanguage = 'pt-br' | 'en-us';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  language: AILanguage;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  archived?: boolean; // Replaces date logic
}

export interface ReminderItem {
  id: string;
  text: string;
  date: string; // ISO date string YYYY-MM-DD
  completed: boolean;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export interface KanbanItem {
  id: string;
  content: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

export interface NoteTab {
  id: string;
  title: string;
  content: string;
}

export interface WellnessRecord {
  date: string;
  amount: number;
}

export interface WellnessData {
  // We keep this optional for backward compatibility during migration, 
  // but we primarily use 'history' now.
  waterIntakeMl?: number; 
  history?: WellnessRecord[];
}

// --- Gym Interfaces ---

export interface GymSet {
  id: string;
  reps: number | string;
  weight: number | string;
  completed: boolean;
}

export interface GymExerciseLog {
  exerciseName: string;
  sets: GymSet[];
}

export interface GymSession {
  id: string;
  templateName: string;
  startTime: string; // ISO String
  endTime?: string; // ISO String
  logs: GymExerciseLog[]; // Logs stored by exercise name for simplicity in this version
}

export interface GymTemplate {
  id: string;
  name: string;
  exercises: string[]; // Just list of names
}

export interface GymData {
  templates: GymTemplate[];
  history: GymSession[];
  activeSession?: GymSession | null;
}

// --- Pomodoro Interfaces ---
export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroData {
  timeLeft: number; // in seconds (used to store duration when paused)
  endTime?: number; // timestamp in ms (target completion time)
  isActive: boolean;
  mode: PomodoroMode;
  cyclesCompleted: number;
}

// --- Diet Interfaces ---
export interface DietFood {
  id: string;
  name: string;
  calories: number;
  protein?: number; // Optional protein tracking
}

export interface DietMeal {
  id: string;
  name: string; // e.g. "Breakfast", "Lunch"
  items: DietFood[];
}

export interface DietDayLog {
  date: string; // YYYY-MM-DD
  meals: DietMeal[];
}

export interface DietData {
  calorieGoal: number;
  history: DietDayLog[];
}

export interface WidgetData {
  id: string;
  type: WidgetType;
  title: string;
  cols?: number; // Number of grid columns to span (default 1)
  // Dynamic content based on type
  content?: {
    todos?: TodoItem[];
    // Deprecated single text string, kept for migration
    text?: string; 
    notes?: NoteTab[];
    wellness?: WellnessData;
    chatHistory?: { role: 'user' | 'model'; text: string }[];
    kanban?: KanbanColumn[];
    reminders?: ReminderItem[];
    gym?: GymData;
    links?: LinkItem[];
    pomodoro?: PomodoroData;
    diet?: DietData;
    // Optional local override for AI config per widget (or global)
    aiConfig?: AIConfig; 
  };
}

export interface AIResponse {
  text: string;
}
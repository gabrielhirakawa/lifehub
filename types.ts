export enum WidgetType {
  TODO = 'TODO',
  NOTE = 'NOTE',
  WELLNESS = 'WELLNESS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  KANBAN = 'KANBAN',
  REMINDER = 'REMINDER'
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
    // Optional local override for AI config per widget (or global)
    aiConfig?: AIConfig; 
  };
}

export interface AIResponse {
  text: string;
}
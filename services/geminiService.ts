import { GoogleGenAI } from "@google/genai";
import { WidgetData, WidgetType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to get today's date string YYYY-MM-DD
const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const getGeminiInsight = async (widgets: WidgetData[], userQuery?: string): Promise<string> => {
  if (!ai) {
    return "Please configure your API Key to use the AI features.";
  }

  try {
    const today = getTodayStr();
    // Construct a context summary of the dashboard
    let dashboardContext = `Here is the current state of the user's LifeHub dashboard (Today is ${today}):\n`;
    
    widgets.forEach(w => {
      dashboardContext += `- Widget "${w.title}" (${w.type}):\n`;
      
      if (w.type === WidgetType.TODO) {
        // Filter for today's tasks
        const todaysTodos = w.content?.todos?.filter(t => t.date === today) || [];
        const completed = todaysTodos.filter(t => t.completed).length || 0;
        const total = todaysTodos.length || 0;
        dashboardContext += `  Status for Today: ${completed}/${total} tasks completed.\n`;
        const pending = todaysTodos.filter(t => !t.completed).map(t => t.text).join(", ");
        if (pending) dashboardContext += `  Pending tasks: ${pending}\n`;
      
      } else if (w.type === WidgetType.WELLNESS) {
        const history = w.content?.wellness?.history || [];
        const record = history.find(r => r.date === today);
        // Fallback to legacy waterIntakeMl if history is empty
        const amount = record ? record.amount : (w.content?.wellness?.waterIntakeMl || 0);
        dashboardContext += `  Water Consumed Today: ${amount}ml.\n`;
      
      } else if (w.type === WidgetType.NOTE) {
        // Handle multiple notes
        const notes = w.content?.notes || [];
        if (notes.length > 0) {
          notes.forEach(note => {
            dashboardContext += `  Note [${note.title}]: ${note.content.substring(0, 100)}...\n`;
          });
        } else if (w.content?.text) {
          // Fallback for legacy single text
          dashboardContext += `  Note Content: ${w.content?.text?.substring(0, 100)}...\n`;
        }
      
      } else if (w.type === WidgetType.REMINDER) {
        const reminders = w.content?.reminders?.filter(r => !r.completed) || [];
        if (reminders.length > 0) {
          dashboardContext += `  Upcoming Reminders: ${reminders.map(r => `${r.text} on ${r.date}`).join("; ")}\n`;
        } else {
          dashboardContext += `  No pending reminders.\n`;
        }

      } else if (w.type === WidgetType.KANBAN) {
        const columns = w.content?.kanban || [];
        columns.forEach(col => {
          const items = col.items.map(i => i.content).join(", ");
          if (items) dashboardContext += `  Column '${col.title}': ${items}\n`;
        });
      }
    });

    const prompt = userQuery 
      ? `Context: ${dashboardContext}\nUser Question: ${userQuery}\n\nProvide a helpful, encouraging, and concise response.`
      : `Context: ${dashboardContext}\n\nAnalyze this dashboard and provide a brief, motivating summary or suggestion for the user to improve their day. Be concise (max 2 sentences).`;

    const modelId = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "I couldn't generate an insight right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the AI service right now.";
  }
};
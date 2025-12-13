import { GoogleGenAI } from "@google/genai";
import { WidgetData, WidgetType, AIConfig, AILanguage } from "../types";

// Helper to get today's date string YYYY-MM-DD
const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

// Translations for context generation
const TERMS = {
  "en-us": {
    intro: "Here is the current state of the user's LifeHub dashboard",
    todayIs: "Today is",
    activeList: "Current Active List",
    tasksCompleted: "tasks completed",
    pendingTasks: "Pending tasks",
    archivedTasks: "tasks archived",
    waterConsumed: "Water Consumed Today",
    noteContent: "Note Content",
    upcomingReminders: "Upcoming Reminders",
    noReminders: "No pending reminders",
    column: "Column",
    gymIntro: "Gym/Workout Stats:",
    lastWorkout: "Last workout was",
    activeWorkout: "User is currently doing a workout",
    availableWorkouts: "Available workout routines",
    linksIntro: "Pinned Links:",
    pomodoroIntro: "Focus/Pomodoro Timer Status:",
    pomodoroActive: "User is currently running a focus timer",
    pomodoroMode: "Current mode",
    pomodoroCycles: "Cycles completed",
    dietIntro: "Diet & Nutrition Stats:",
    caloriesConsumed: "Calories consumed today",
    calorieGoal: "Daily Calorie Goal",
    proteinConsumed: "Protein consumed",
    systemPrompt:
      "You are a helpful, encouraging Life Coach. Be concise (max 2 sentences unless asked otherwise). Always respond in English.",
  },
  "pt-br": {
    intro: "Aqui está o estado atual do painel LifeHub do usuário",
    todayIs: "Hoje é",
    activeList: "Lista Ativa Atual",
    tasksCompleted: "tarefas concluídas",
    pendingTasks: "Tarefas pendentes",
    archivedTasks: "tarefas arquivadas",
    waterConsumed: "Água Consumida Hoje",
    noteContent: "Conteúdo da Nota",
    upcomingReminders: "Próximos Lembretes",
    noReminders: "Sem lembretes pendentes",
    column: "Coluna",
    gymIntro: "Estatísticas de Academia/Treino:",
    lastWorkout: "Último treino foi",
    activeWorkout: "Usuário está treinando agora",
    availableWorkouts: "Rotinas de treino disponíveis",
    linksIntro: "Links Fixados:",
    pomodoroIntro: "Status do Temporizador Pomodoro/Foco:",
    pomodoroActive: "Usuário está com o temporizador rodando",
    pomodoroMode: "Modo atual",
    pomodoroCycles: "Ciclos completados",
    dietIntro: "Estatísticas de Dieta/Nutrição:",
    caloriesConsumed: "Calorias consumidas hoje",
    calorieGoal: "Meta diária de calorias",
    proteinConsumed: "Proteína consumida",
    systemPrompt:
      "Você é um Life Coach prestativo e encorajador. Seja conciso (máximo 2 frases, a menos que solicitado o contrário). Responda sempre em Português do Brasil.",
  },
};

const buildDashboardContext = (
  widgets: WidgetData[],
  lang: AILanguage = "en-us"
) => {
  const t = TERMS[lang];
  const today = getTodayStr();
  let dashboardContext = `${t.intro} (${t.todayIs} ${today}):\n`;

  widgets.forEach((w) => {
    dashboardContext += `- Widget "${w.title}" (${w.type}):\n`;

    if (w.type === WidgetType.TODO) {
      const activeTodos = w.content?.todos?.filter((t) => !t.archived) || [];
      const completed = activeTodos.filter((t) => t.completed).length || 0;
      const total = activeTodos.length || 0;
      dashboardContext += `  ${t.activeList}: ${completed}/${total} ${t.tasksCompleted}.\n`;
      const pending = activeTodos
        .filter((t) => !t.completed)
        .map((t) => t.text)
        .join(", ");
      if (pending) dashboardContext += `  ${t.pendingTasks}: ${pending}\n`;
      const archivedCount =
        w.content?.todos?.filter((t) => t.archived).length || 0;
      if (archivedCount > 0)
        dashboardContext += `  (${archivedCount} ${t.archivedTasks})\n`;
    } else if (w.type === WidgetType.WELLNESS) {
      const history = w.content?.wellness?.history || [];
      const record = history.find((r) => r.date === today);
      const amount = record
        ? record.amount
        : w.content?.wellness?.waterIntakeMl || 0;
      const amountStr =
        amount >= 1000 ? `${(amount / 1000).toFixed(2)}L` : `${amount}ml`;
      dashboardContext += `  ${t.waterConsumed}: ${amountStr}.\n`;
    } else if (w.type === WidgetType.NOTE) {
      const notes = w.content?.notes || [];
      if (notes.length > 0) {
        notes.forEach((note) => {
          dashboardContext += `  Note [${note.title}]: ${note.content.substring(
            0,
            100
          )}...\n`;
        });
      } else if (w.content?.text) {
        dashboardContext += `  ${t.noteContent}: ${w.content?.text?.substring(
          0,
          100
        )}...\n`;
      }
    } else if (w.type === WidgetType.REMINDER) {
      const reminders = w.content?.reminders?.filter((r) => !r.completed) || [];
      if (reminders.length > 0) {
        dashboardContext += `  ${t.upcomingReminders}: ${reminders
          .map((r) => `${r.text} on ${r.date}`)
          .join("; ")}\n`;
      } else {
        dashboardContext += `  ${t.noReminders}.\n`;
      }
    } else if (w.type === WidgetType.KANBAN) {
      const columns = w.content?.kanban || [];
      columns.forEach((col) => {
        const items = col.items.map((i) => i.content).join(", ");
        if (items)
          dashboardContext += `  ${t.column} '${col.title}': ${items}\n`;
      });
    } else if (w.type === WidgetType.GYM) {
      const gymData = w.content?.gym;
      if (gymData) {
        dashboardContext += `  ${t.gymIntro}\n`;
        if (gymData.activeSession) {
          dashboardContext += `  ${t.activeWorkout}: ${gymData.activeSession.templateName}\n`;
        }
        if (gymData.history && gymData.history.length > 0) {
          const historyTitle =
            lang === "pt-br"
              ? "Histórico Recente (Últimos 10)"
              : "Recent History (Last 10)";
          dashboardContext += `  ${historyTitle}:\n`;
          // Show last 10 workouts
          const recent = [...gymData.history].reverse().slice(0, 10);
          recent.forEach((h) => {
            const date = new Date(h.startTime).toLocaleDateString();
            dashboardContext += `    - ${date}: ${h.templateName}\n`;
          });
        }
        if (gymData.templates && gymData.templates.length > 0) {
          dashboardContext += `  ${t.availableWorkouts}:\n`;
          gymData.templates.forEach((tmpl) => {
            const exercisesList =
              tmpl.exercises && tmpl.exercises.length > 0
                ? tmpl.exercises.join(", ")
                : "No exercises";
            dashboardContext += `    - ${tmpl.name}: [${exercisesList}]\n`;
          });
        }
      }
    } else if (w.type === WidgetType.LINKS) {
      const links = w.content?.links || [];
      if (links.length > 0) {
        dashboardContext += `  ${t.linksIntro} ${links
          .map((l) => `${l.title} (${l.url})`)
          .join(", ")}\n`;
      }
    } else if (w.type === WidgetType.POMODORO) {
      const p = w.content?.pomodoro;
      if (p) {
        dashboardContext += `  ${t.pomodoroIntro}\n`;
        dashboardContext += `  ${t.pomodoroMode}: ${p.mode} (${p.timeLeft}s left)\n`;
        dashboardContext += `  ${t.pomodoroCycles}: ${p.cyclesCompleted}\n`;
        if (p.isActive) dashboardContext += `  ${t.pomodoroActive}\n`;
      }
    } else if (w.type === WidgetType.DIET) {
      const d = w.content?.diet;
      if (d) {
        const history = d.history || [];
        const todayLog = history.find((h) => h.date === today);
        const cal = todayLog
          ? todayLog.meals.reduce(
              (sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0),
              0
            )
          : 0;
        const prot = todayLog
          ? todayLog.meals.reduce(
              (sum, m) =>
                sum + m.items.reduce((s, i) => s + (i.protein || 0), 0),
              0
            )
          : 0;

        dashboardContext += `  ${t.dietIntro}\n`;
        dashboardContext += `  ${t.caloriesConsumed}: ${cal} / ${d.calorieGoal}\n`;
        dashboardContext += `  ${t.proteinConsumed}: ${prot}g\n`;
      }
    }
  });
  return dashboardContext;
};

// --- API ADAPTERS ---

const callOpenAI = async (apiKey: string, model: string, messages: any[]) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(
      `OpenAI Error: ${errData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
};

const callAnthropic = async (
  apiKey: string,
  model: string,
  system: string,
  userMsg: string
) => {
  // Note: Standard browser fetch to Anthropic often fails due to CORS without a backend proxy.
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "dangerously-allow-browser": "true", // Client-side override attempt
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 300,
      system: system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(
      `Anthropic Error: ${errData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.content?.[0]?.text;
};

const callGemini = async (
  apiKey: string,
  model: string,
  system: string,
  context: string,
  userQuery?: string
) => {
  const ai = new GoogleGenAI({ apiKey });

  const finalPrompt = userQuery
    ? `Context: ${context}\nUser Question: ${userQuery}`
    : `Context: ${context}\n\nAnalyze dashboard.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: finalPrompt,
    config: {
      systemInstruction: system,
    },
  });

  return response.text;
};

// --- MAIN ROUTER ---

export const getGeminiInsight = async (
  widgets: WidgetData[],
  userQuery?: string,
  config?: AIConfig
): Promise<string> => {
  const lang = config?.language || "en-us";
  const context = buildDashboardContext(widgets, lang);

  // Router Logic
  const provider = config?.provider || "gemini";

  // Key Resolution: Use provided key OR fallback to env ONLY for Gemini
  let apiKey = config?.apiKey;
  if (!apiKey && provider === "gemini") {
    apiKey = process.env.API_KEY || "";
  }

  if (!apiKey) {
    const msg =
      lang === "pt-br"
        ? "Por favor, configure sua chave de API nas configurações (ícone de engrenagem) para usar os recursos de IA."
        : "Please configure your API Key in the settings (gear icon) to use the AI features.";
    return msg;
  }

  const model =
    config?.model ||
    (provider === "openai"
      ? "gpt-4o-mini"
      : provider === "anthropic"
      ? "claude-3-haiku-20240307"
      : "gemini-2.5-flash");
  const systemPrompt = TERMS[lang].systemPrompt;

  try {
    switch (provider) {
      case "openai":
        const messages = [
          { role: "system", content: `${systemPrompt}\n\n${context}` },
          {
            role: "user",
            content:
              userQuery ||
              (lang === "pt-br"
                ? "Analise meu painel."
                : "Analyze my dashboard."),
          },
        ];
        return (await callOpenAI(apiKey, model, messages)) || "No response.";

      case "anthropic":
        const anthropicMsg = `${context}\n\n${
          userQuery ||
          (lang === "pt-br" ? "Analise meu painel." : "Analyze my dashboard.")
        }`;
        return (
          (await callAnthropic(apiKey, model, systemPrompt, anthropicMsg)) ||
          "No response."
        );

      case "gemini":
      default:
        return (
          (await callGemini(apiKey, model, systemPrompt, context, userQuery)) ||
          "No response."
        );
    }
  } catch (error: any) {
    console.error("AI Service Error:", error);
    return `Error (${provider}): ${
      error.message || "Failed to connect to AI service."
    }`;
  }
};

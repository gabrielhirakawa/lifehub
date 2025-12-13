import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import { WidgetData, WidgetType } from "./types";
import {
  LayoutDashboard,
  Plus,
  Sun,
  Moon,
  LogOut,
  Pencil,
  Check,
} from "lucide-react";
import { api } from "./services/api";

// Helper for initial dates
const todayObj = new Date();
const today = todayObj.toISOString().split("T")[0];

const App: React.FC = () => {
  // --- State Management ---
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("lifehub_auth") === "true";
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("lifehub_username") || "User";
  });
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null); // null = loading

  const [widgets, setWidgets] = useState<WidgetData[]>([]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // New Edit Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("lifehub_theme") === "dark" ||
        (!localStorage.getItem("lifehub_theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  // --- Effects ---
  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const status = await api.checkAuthStatus();
      setIsRegistered(status.registered);
    };
    checkAuth();

    // Fetch widgets from API on mount
    const loadWidgets = async () => {
      const data = await api.getWidgets();
      setWidgets(data);
    };
    loadWidgets();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("lifehub_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("lifehub_theme", "light");
    }
  }, [isDarkMode]);

  // --- Helpers ---
  const getDefaultTitle = (type: WidgetType) => {
    switch (type) {
      case WidgetType.TODO:
        return "Daily Tasks";
      case WidgetType.NOTE:
        return "Notes";
      case WidgetType.WELLNESS:
        return "Hydration";
      case WidgetType.AI_ASSISTANT:
        return "Life Coach";
      case WidgetType.KANBAN:
        return "Kanban Board";
      case WidgetType.REMINDER:
        return "Reminder";
      case WidgetType.GYM:
        return "Gym Tracker";
      case WidgetType.LINKS:
        return "Quick Links";
      case WidgetType.POMODORO:
        return "Pomodoro";
      case WidgetType.DIET:
        return "Diet Tracker";
      default:
        return "Widget";
    }
  };

  const isWidgetAdded = (type: WidgetType) => {
    return widgets.some((w) => w.type === type);
  };

  // --- Handlers ---
  const handleLogin = (user: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    localStorage.setItem("lifehub_auth", "true");
    localStorage.setItem("lifehub_username", user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("User");
    localStorage.removeItem("lifehub_auth");
    localStorage.removeItem("lifehub_username");
  };

  const handleAddWidget = async (type: WidgetType) => {
    if (isWidgetAdded(type)) return;

    // Try to restore from backend first
    const existingWidget = await api.getWidgetById(type);

    let newWidget: WidgetData;

    if (existingWidget) {
      newWidget = {
        ...existingWidget,
        isActive: true,
      };
    } else {
      newWidget = {
        id: type, // Use type as ID for singleton behavior
        type: type,
        title: getDefaultTitle(type),
        cols: type === WidgetType.TODO ? 2 : 1, // Todo defaults to Medium (2), others Small (1)
        isActive: true,
        content: {
          gym: { templates: [], history: [] }, // Init structure for gym
          links: [], // Init for links
          pomodoro: {
            timeLeft: 25 * 60,
            isActive: false,
            mode: "work",
            cyclesCompleted: 0,
          }, // Init for pomodoro
          diet: { calorieGoal: 2000, history: [] }, // Init for diet
        },
      };
    }

    // Optimistic update
    setWidgets([...widgets, newWidget]);
    setIsMenuOpen(false); // Close dropdown

    // Save to API
    await api.saveWidget(newWidget);
  };

  const handleUpdateWidget = async (updatedWidget: WidgetData) => {
    // Optimistic update
    setWidgets((prev) =>
      prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    );

    // Save to API
    await api.saveWidget(updatedWidget);
  };

  const handleDeleteWidget = async (id: string) => {
    // Optimistic update
    setWidgets((prev) => prev.filter((w) => w.id !== id));

    // Delete from API
    await api.deleteWidget(id);
  };

  const handleReorderWidgets = async (newWidgets: WidgetData[]) => {
    // Optimistic update
    setWidgets(newWidgets);

    // Save all widgets with new positions
    // Since backend expects one by one, we loop.
    // Ideally backend should support batch update, but for now loop is fine for small number of widgets.
    // We add 'position' to the widget data implicitly by index.
    // Wait, WidgetData doesn't have position field in frontend yet.
    // We can just save them in order, and backend will store position if we add it to WidgetData.
    // Or we can just save them all and let backend handle it? No, backend needs explicit position.

    // Let's update the widgets with position property if we added it to types.ts.
    // We haven't added it to types.ts yet.
    // For now, let's just save them. The backend 'position' field will be 0 if not sent.
    // We should update types.ts to include position?
    // Or just send it as part of the object even if not in interface (TS might complain).

    // Let's just save them for now. The order in DB is determined by 'position' column.
    // If we don't send position, they all get 0.
    // So fetching them back will lose order.

    // We need to add position to WidgetData in types.ts first.
    // But for this step, let's just implement the handler.

    newWidgets.forEach(async (w, index) => {
      // Cast to any to add position if not in type
      const wWithPos = { ...w, position: index };
      await api.saveWidget(wWithPos as any);
    });
  };

  const MenuButton = ({
    type,
    colorClass,
  }: {
    type: WidgetType;
    colorClass: string;
  }) => {
    const added = isWidgetAdded(type);
    return (
      <button
        onClick={() => !added && handleAddWidget(type)}
        disabled={added}
        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
          added
            ? "opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50"
            : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            added ? "bg-slate-300 dark:bg-slate-600" : colorClass
          }`}
        />
        {getDefaultTitle(type)}
        {added && (
          <span className="ml-auto text-[10px] uppercase font-bold tracking-wider opacity-60">
            Added
          </span>
        )}
      </button>
    );
  };

  // If loading auth status
  if (isRegistered === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not registered, show register screen
  if (!isRegistered) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <RegisterScreen
          onRegisterSuccess={(user) => {
            setIsRegistered(true);
            handleLogin(user);
          }}
        />
      </>
    );
  }

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <>
        {/* Toggle Theme Button for Login Screen */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <LayoutDashboard size={18} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              LifeHub
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Edit Layout Button */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${
                isEditMode
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-2 ring-amber-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={isEditMode ? "Finish Editing" : "Edit Layout"}
            >
              {isEditMode ? <Check size={18} /> : <Pencil size={18} />}
              <span className="hidden sm:inline">
                {isEditMode ? "Done" : "Edit"}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                disabled={isEditMode} // Disable adding while editing layout
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                  isEditMode
                    ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none"
                }`}
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Widget</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                title="Logout"
              >
                <LogOut size={20} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    General
                  </div>
                  <MenuButton
                    type={WidgetType.TODO}
                    colorClass="bg-indigo-400"
                  />
                  <MenuButton
                    type={WidgetType.NOTE}
                    colorClass="bg-yellow-400"
                  />
                  <MenuButton
                    type={WidgetType.AI_ASSISTANT}
                    colorClass="bg-purple-400"
                  />
                  <MenuButton
                    type={WidgetType.LINKS}
                    colorClass="bg-cyan-400"
                  />

                  <div className="px-4 py-2 mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-slate-100 dark:border-slate-700">
                    Productivity
                  </div>
                  <MenuButton
                    type={WidgetType.KANBAN}
                    colorClass="bg-orange-400"
                  />
                  <MenuButton
                    type={WidgetType.REMINDER}
                    colorClass="bg-rose-400"
                  />
                  <MenuButton
                    type={WidgetType.POMODORO}
                    colorClass="bg-red-400"
                  />

                  <div className="px-4 py-2 mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-slate-100 dark:border-slate-700">
                    Health
                  </div>
                  <MenuButton
                    type={WidgetType.WELLNESS}
                    colorClass="bg-emerald-400"
                  />
                  <MenuButton type={WidgetType.GYM} colorClass="bg-blue-400" />
                  <MenuButton type={WidgetType.DIET} colorClass="bg-lime-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Hello, {username}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Here's what's happening in your life today.
            </p>
          </div>
          {isEditMode && (
            <div className="text-amber-600 dark:text-amber-500 text-sm font-medium animate-pulse">
              Edit Mode Active
            </div>
          )}
        </div>

        <Dashboard
          widgets={widgets}
          onUpdateWidget={handleUpdateWidget}
          onDeleteWidget={handleDeleteWidget}
          onReorderWidgets={handleReorderWidgets}
          isEditMode={isEditMode}
        />
      </main>

      {/* Overlay for menu close */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

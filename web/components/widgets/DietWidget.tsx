import React, { useState } from "react";
import { WidgetData, DietDayLog, DietMeal, DietFood } from "../../types";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Apple,
  X,
  Settings,
} from "lucide-react";

interface DietWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const DEFAULT_MEALS = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const DietWidget: React.FC<DietWidgetProps> = ({ data, onUpdate }) => {
  // Helpers for dates
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [activeDate, setActiveDate] = useState(getTodayStr());
  const [isAddingToMeal, setIsAddingToMeal] = useState<string | null>(null); // Meal ID

  // Form State
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempGoal, setTempGoal] = useState(
    data.content?.diet?.calorieGoal || 2000
  );

  const dietData = data.content?.diet || { calorieGoal: 2000, history: [] };
  const history = dietData.history || [];

  // Get or Create Day Log
  const getActiveDayLog = (): DietDayLog => {
    const log = history.find((h) => h.date === activeDate);
    if (log) return log;

    // Construct default empty day
    return {
      date: activeDate,
      meals: DEFAULT_MEALS.map((name) => ({
        id: name.toLowerCase(),
        name: name,
        items: [],
      })),
    };
  };

  const activeDay = getActiveDayLog();

  // --- ACTIONS ---

  const updateHistory = (newDay: DietDayLog) => {
    const existingIdx = history.findIndex((h) => h.date === activeDate);
    let newHistory = [...history];

    if (existingIdx >= 0) {
      newHistory[existingIdx] = newDay;
    } else {
      newHistory.push(newDay);
    }

    onUpdate({
      ...data,
      content: { ...data.content, diet: { ...dietData, history: newHistory } },
    });
  };

  const addFood = () => {
    if (!isAddingToMeal || !foodName.trim() || !calories) return;

    const calVal = Math.max(0, parseInt(calories) || 0);
    const protVal = Math.max(0, parseInt(protein) || 0);

    const newFood: DietFood = {
      id: Date.now().toString(),
      name: foodName,
      calories: calVal,
      protein: protVal,
    };

    const newMeals = activeDay.meals.map((m) => {
      if (m.id === isAddingToMeal) {
        return { ...m, items: [...m.items, newFood] };
      }
      return m;
    });

    updateHistory({ ...activeDay, meals: newMeals });

    // Reset form
    setFoodName("");
    setCalories("");
    setProtein("");
    setIsAddingToMeal(null);
  };

  const removeFood = (mealId: string, foodId: string) => {
    const newMeals = activeDay.meals.map((m) => {
      if (m.id === mealId) {
        return { ...m, items: m.items.filter((f) => f.id !== foodId) };
      }
      return m;
    });
    updateHistory({ ...activeDay, meals: newMeals });
  };

  const saveSettings = () => {
    onUpdate({
      ...data,
      content: {
        ...data.content,
        diet: { ...dietData, calorieGoal: tempGoal },
      },
    });
    setShowSettings(false);
  };

  const changeDate = (offset: number) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + offset);
    setActiveDate(d.toISOString().split("T")[0]);
  };

  // --- CALCULATIONS ---

  const totalCalories = activeDay.meals.reduce(
    (sum, meal) => sum + meal.items.reduce((s, item) => s + item.calories, 0),
    0
  );

  const totalProtein = activeDay.meals.reduce(
    (sum, meal) =>
      sum + meal.items.reduce((s, item) => s + (item.protein || 0), 0),
    0
  );

  const goal = dietData.calorieGoal || 2000;
  const progress = Math.min(100, (totalCalories / goal) * 100);
  const isOver = totalCalories > goal;

  return (
    <div className="h-full flex flex-col relative">
      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
          <div className="w-full space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              Diet Settings
            </h4>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                Daily Calorie Goal
              </label>
              <input
                type="number"
                min="0"
                value={tempGoal}
                onChange={(e) =>
                  setTempGoal(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-full border p-2 rounded bg-transparent dark:border-slate-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 py-2 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 bg-lime-600 text-white py-2 rounded text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header: Progress & Nav */}
      <div className="flex-shrink-0 mb-3 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <button
              onClick={() => changeDate(-1)}
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {activeDate === getTodayStr() ? "Today" : activeDate.slice(5)}
            </span>
            <button
              onClick={() => changeDate(1)}
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Settings size={14} />
          </button>
        </div>

        {/* Calorie Bar */}
        <div className="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ${
              isOver ? "bg-red-500" : "bg-lime-500"
            }`}
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold text-slate-600 dark:text-slate-300 z-10">
            <span>{totalCalories} kcal</span>
            <span>{goal} kcal</span>
          </div>
        </div>

        {/* Macros Summary (Just Protein for now) */}
        <div className="flex justify-center text-[10px] text-slate-400 gap-3">
          <span>
            Protein:{" "}
            <b className="text-slate-600 dark:text-slate-300">
              {totalProtein}g
            </b>
          </span>
        </div>
      </div>

      {/* Meals List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        {activeDay.meals.map((meal) => (
          <div
            key={meal.id}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 p-2"
          >
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                {meal.name}
              </h5>
              <span className="text-[10px] text-slate-400">
                {meal.items.reduce((s, i) => s + i.calories, 0)} kcal
              </span>
            </div>

            {/* Food Items */}
            <div className="space-y-1 mb-2">
              {meal.items.length === 0 && (
                <div className="text-[10px] text-slate-400 italic pl-1">
                  Empty
                </div>
              )}
              {meal.items.map((food) => (
                <div
                  key={food.id}
                  className="group flex justify-between items-center text-xs bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex-1 truncate pr-2">
                    <span className="text-slate-700 dark:text-slate-200">
                      {food.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {food.calories}
                    </span>
                    <button
                      onClick={() => removeFood(meal.id, food.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Button Area */}
            {isAddingToMeal === meal.id ? (
              <div className="bg-white dark:bg-slate-900 p-2 rounded border border-indigo-200 dark:border-indigo-800 animate-in fade-in zoom-in-95">
                <input
                  autoFocus
                  placeholder="Food Name (e.g. Apple)"
                  className="w-full text-xs border-b mb-2 p-1 bg-transparent focus:border-indigo-500 outline-none dark:border-slate-700 dark:text-white"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="kcal"
                    className="w-1/2 text-xs border-b p-1 bg-transparent focus:border-indigo-500 outline-none dark:border-slate-700 dark:text-white"
                    value={calories}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (
                        val === "" ||
                        (!val.includes("-") && !isNaN(Number(val)))
                      ) {
                        setCalories(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") e.preventDefault();
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="prot (g)"
                    className="w-1/2 text-xs border-b p-1 bg-transparent focus:border-indigo-500 outline-none dark:border-slate-700 dark:text-white"
                    value={protein}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (
                        val === "" ||
                        (!val.includes("-") && !isNaN(Number(val)))
                      ) {
                        setProtein(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") e.preventDefault();
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingToMeal(null)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 py-1 rounded text-[10px] hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addFood}
                    className="flex-1 bg-indigo-600 text-white py-1 rounded text-[10px] hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAddingToMeal(meal.id);
                  setFoodName("");
                  setCalories("");
                  setProtein("");
                }}
                className="w-full py-1 text-[10px] text-slate-400 hover:text-lime-600 hover:bg-lime-50 dark:hover:bg-lime-900/10 rounded flex items-center justify-center gap-1 transition-colors border border-dashed border-slate-200 dark:border-slate-700"
              >
                <Plus size={10} /> Add Food
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DietWidget;

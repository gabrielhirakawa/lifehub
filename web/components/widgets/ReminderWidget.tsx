import React, { useState } from "react";
import { WidgetData, ReminderItem } from "../../types";
import { Plus, Trash2, Calendar, Bell } from "lucide-react";

interface ReminderWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const ReminderWidget: React.FC<ReminderWidgetProps> = ({ data, onUpdate }) => {
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");

  const reminders = data.content?.reminders || [];

  // Sort reminders by date
  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !newDate) return;

    const newItem: ReminderItem = {
      id: Date.now().toString(),
      text: newText,
      date: newDate,
      completed: false,
    };

    onUpdate({
      ...data,
      content: { ...data.content, reminders: [...reminders, newItem] },
    });
    setNewText("");
    setNewDate("");
  };

  const deleteReminder = (id: string) => {
    onUpdate({
      ...data,
      content: {
        ...data.content,
        reminders: reminders.filter((r) => r.id !== id),
      },
    });
  };

  const toggleReminder = (id: string) => {
    onUpdate({
      ...data,
      content: {
        ...data.content,
        reminders: reminders.map((r) =>
          r.id === id ? { ...r, completed: !r.completed } : r
        ),
      },
    });
  };

  const isOverdue = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr < today;
  };

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleAdd} className="mb-3 flex gap-2">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add reminder..."
            className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />

          {/* Date Picker Trigger */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <label className="relative w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <Calendar
                size={18}
                style={{ cursor: "pointer" }}
                className="text-indigo-500 pointer-events-none cursor-pointer"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full z-10 cursor-pointer"
                title="Select Date"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex-shrink-0"
          title="Add Reminder"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {sortedReminders.length === 0 && (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-4">
            No upcoming reminders.
          </div>
        )}
        {sortedReminders.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center justify-between p-2 rounded-lg border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${
              item.completed ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <button
                onClick={() => toggleReminder(item.id)}
                className={`flex-shrink-0 w-4 h-4 rounded-full border transition-colors flex items-center justify-center ${
                  item.completed
                    ? "bg-slate-400 border-slate-400"
                    : "border-slate-300 hover:border-indigo-500"
                }`}
              >
                {item.completed && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </button>
              <div className="flex flex-col overflow-hidden">
                <span
                  className={`text-sm truncate ${
                    item.completed
                      ? "line-through text-slate-400"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {item.text}
                </span>
                <div className="flex items-center gap-1 text-[10px]">
                  <Calendar
                    size={10}
                    className={
                      !item.completed && isOverdue(item.date)
                        ? "text-red-500"
                        : "text-slate-400"
                    }
                  />
                  <span
                    className={
                      !item.completed && isOverdue(item.date)
                        ? "text-red-500 font-medium"
                        : "text-slate-400"
                    }
                  >
                    {item.date}{" "}
                    {isOverdue(item.date) && !item.completed ? "(Overdue)" : ""}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => deleteReminder(item.id)}
              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderWidget;

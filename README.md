# LifeHub Dashboard

A centralized personal dashboard designed to streamline your daily life by tracking tasks, habits, notes, and wellness, powered by AI insights.

![LifeHub Dashboard](./screenshot.png)

## Features

### 📅 Daily Tasks
- **Date-based Tracking**: Manage tasks for Today, Yesterday, and the Day Before.
- **Smart Rollover**: Unfinished tasks from previous days automatically roll over to "Today" with an overdue indicator.

### 💧 Hydration Tracker
- **History Log**: Track water intake across multiple days.
- **Visual Progress**: Dynamic water level visualization.

### 🤖 AI Coach (Gemini)
- **Context Aware**: The AI analyzes your current tasks, hydration, and notes to provide personalized advice.
- **Chat Interface**: Interact directly with your data.

### ⚡ Productivity Tools
- **Kanban Board**: Drag-and-drop style task management (To Do, Doing, Done).
- **Notes**: Tabbed interface for multiple notes.
- **Reminders**: Track upcoming events and deadlines.

## Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google GenAI SDK (`@google/genai`)

## Setup

1. Clone the repository.
2. Create a `.env` file with your Google Gemini API Key:
   ```env
   API_KEY=your_api_key_here
   ```
3. Install dependencies and run.

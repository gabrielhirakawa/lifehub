import React, { useState, useRef, useEffect } from "react";
import { WidgetData, AIConfig, AIProvider, AILanguage } from "../../types";
import {
  Send,
  Sparkles,
  Loader2,
  Settings,
  X,
  Save,
  Globe,
} from "lucide-react";
import { getGeminiInsight } from "../../services/geminiService";

interface AICoachWidgetProps {
  allWidgets: WidgetData[];
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const DEFAULT_CONFIG: AIConfig = {
  provider: "gemini",
  model: "gemini-2.5-flash",
  apiKey: "",
  language: "pt-br",
};

const AICoachWidget: React.FC<AICoachWidgetProps> = ({
  allWidgets,
  data,
  onUpdate,
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load config from local storage or default
  const [config, setConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem("lifehub_ai_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  });

  const [tempConfig, setTempConfig] = useState<AIConfig>(config);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messages = data.content?.chatHistory || [
    {
      role: "model",
      text:
        config.language === "pt-br"
          ? "Olá! Sou seu coach LifeHub. Posso ver suas tarefas e dados de bem-estar. Como posso ajudar hoje?"
          : "Hi! I'm your LifeHub coach. I can see your tasks and wellness data. How can I help you today?",
    },
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showSettings]);

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();

    // Determine the text to use. If overrideText is present, use it. Otherwise use input.
    const textToSend = overrideText || input;

    if (!textToSend.trim()) return;

    const newHistory = [...messages, { role: "user", text: textToSend }];

    onUpdate({
      ...data,
      content: { ...data.content, chatHistory: newHistory as any },
    });

    // Only clear input if we used the input field
    if (!overrideText) {
      setInput("");
    }

    setLoading(true);

    const responseText = await getGeminiInsight(allWidgets, textToSend, config);
    const finalHistory = [...newHistory, { role: "model", text: responseText }];

    onUpdate({
      ...data,
      content: { ...data.content, chatHistory: finalHistory as any },
    });
    setLoading(false);
  };

  const saveSettings = () => {
    setConfig(tempConfig);
    localStorage.setItem("lifehub_ai_config", JSON.stringify(tempConfig));
    setShowSettings(false);
  };

  const getProviderName = (p: AIProvider) => {
    if (p === "openai") return "GPT";
    if (p === "anthropic") return "Claude";
    return "Gemini";
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Settings Toggle Button - Positioned absolute inside the container */}
      {!showSettings && (
        <div className="absolute top-0 right-0 z-10">
          <button
            onClick={() => {
              setTempConfig(config);
              setShowSettings(true);
            }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="AI Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      )}

      {showSettings ? (
        <div className="flex-1 flex flex-col p-1 animate-in fade-in zoom-in-95 duration-200 bg-slate-50 dark:bg-slate-800/50 rounded-lg h-full">
          <div className="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-slate-700 pb-2 px-1">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Settings size={14} /> AI Configuration
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar px-1">
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Globe size={12} /> Language / Idioma
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setTempConfig({ ...tempConfig, language: "pt-br" })
                  }
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-all ${
                    tempConfig.language === "pt-br"
                      ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400 font-semibold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700"
                  }`}
                >
                  🇧🇷 PT-BR
                </button>
                <button
                  onClick={() =>
                    setTempConfig({ ...tempConfig, language: "en-us" })
                  }
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-all ${
                    tempConfig.language === "en-us"
                      ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400 font-semibold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700"
                  }`}
                >
                  🇺🇸 EN-US
                </button>
              </div>
            </div>

            {/* Provider Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    setTempConfig({
                      ...tempConfig,
                      provider: "gemini",
                      model: "gemini-2.5-flash",
                    })
                  }
                  className={`py-2 text-xs rounded-md border transition-all ${
                    tempConfig.provider === "gemini"
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400 font-semibold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700"
                  }`}
                >
                  Gemini
                </button>
                <button
                  onClick={() =>
                    setTempConfig({
                      ...tempConfig,
                      provider: "openai",
                      model: "gpt-4o-mini",
                    })
                  }
                  className={`py-2 text-xs rounded-md border transition-all ${
                    tempConfig.provider === "openai"
                      ? "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400 font-semibold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700"
                  }`}
                >
                  OpenAI
                </button>
                <button
                  onClick={() =>
                    setTempConfig({
                      ...tempConfig,
                      provider: "anthropic",
                      model: "claude-3-haiku-20240307",
                    })
                  }
                  className={`py-2 text-xs rounded-md border transition-all ${
                    tempConfig.provider === "anthropic"
                      ? "bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400 font-semibold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700"
                  }`}
                >
                  Anthropic
                </button>
              </div>
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Model
              </label>
              <select
                value={tempConfig.model}
                onChange={(e) =>
                  setTempConfig({ ...tempConfig, model: e.target.value })
                }
                className="w-full text-xs p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                {tempConfig.provider === "gemini" && (
                  <>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.0-flash-lite-preview-02-05">
                      Gemini 2.0 Flash Lite
                    </option>
                    <option value="gemini-2.0-pro-exp-02-05">
                      Gemini 2.0 Pro
                    </option>
                  </>
                )}
                {tempConfig.provider === "openai" && (
                  <>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                )}
                {tempConfig.provider === "anthropic" && (
                  <>
                    <option value="claude-3-haiku-20240307">
                      Claude 3 Haiku
                    </option>
                    <option value="claude-3-5-sonnet-latest">
                      Claude 3.5 Sonnet
                    </option>
                  </>
                )}
              </select>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={tempConfig.apiKey}
                onChange={(e) =>
                  setTempConfig({ ...tempConfig, apiKey: e.target.value })
                }
                placeholder={
                  tempConfig.provider === "gemini"
                    ? "Optional (Uses default env key)"
                    : "sk-..."
                }
                className="w-full text-xs p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-medium transition-colors"
          >
            <Save size={14} /> Save
          </button>
        </div>
      ) : (
        <>
          {/* Chat Interface */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 mb-3 pt-6"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 rounded-bl-none flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking ({getProviderName(config.provider)})...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => handleSend(e)}
            className="relative flex-shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                config.language === "pt-br"
                  ? `Perguntar ao ${getProviderName(config.provider)}...`
                  : `Ask ${getProviderName(config.provider)}...`
              }
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
              onClick={() =>
                handleSend(
                  undefined,
                  config.language === "pt-br"
                    ? "Analise meu dia"
                    : "Analyze my day"
                )
              }
              className="mt-2 text-xs flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors w-full py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md flex-shrink-0"
            >
              <Sparkles size={12} />{" "}
              {config.language === "pt-br"
                ? "Analise meu dia"
                : "Analyze my day"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default AICoachWidget;

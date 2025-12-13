import React, { useState, useEffect } from "react";
import { WidgetData, WikiData, WikiPage } from "../../types";
import {
  Plus,
  Trash2,
  FileText,
  Globe,
  Edit2,
  Eye,
  Share2,
} from "lucide-react";

interface WikiWidgetProps {
  data: WidgetData;
  onUpdate: (updatedData: WidgetData) => void;
}

const WikiWidget: React.FC<WikiWidgetProps> = ({ data, onUpdate }) => {
  const wikiData: WikiData = data.content?.wiki || {
    pages: [],
    activePageId: undefined,
  };

  // Ensure we have at least one page if empty
  useEffect(() => {
    if (wikiData.pages.length === 0) {
      const initialPage: WikiPage = {
        id: crypto.randomUUID(),
        title: "Home",
        content: "# Welcome to your Wiki\n\nStart writing here...",
        isPublic: false,
      };
      updateWikiData({
        pages: [initialPage],
        activePageId: initialPage.id,
      });
    }
  }, []);

  const activePage =
    wikiData.pages.find((p) => p.id === wikiData.activePageId) ||
    wikiData.pages[0];
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const updateWikiData = (newData: WikiData) => {
    onUpdate({
      ...data,
      content: { ...data.content, wiki: newData },
    });
  };

  const handleAddPage = () => {
    const newPage: WikiPage = {
      id: crypto.randomUUID(),
      title: "New Page",
      content: "# New Page\n",
      isPublic: false,
    };
    updateWikiData({
      pages: [...wikiData.pages, newPage],
      activePageId: newPage.id,
    });
  };

  const handleDeletePage = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newPages = wikiData.pages.filter((p) => p.id !== id);
    // If we deleted the active page, switch to the first one available
    let newActiveId = wikiData.activePageId;
    if (id === wikiData.activePageId) {
      newActiveId = newPages.length > 0 ? newPages[0].id : undefined;
    }

    updateWikiData({
      pages: newPages,
      activePageId: newActiveId,
    });
  };

  const handleUpdatePage = (id: string, updates: Partial<WikiPage>) => {
    const newPages = wikiData.pages.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    updateWikiData({ ...wikiData, pages: newPages });
  };

  const handleTogglePublic = (id: string) => {
    const page = wikiData.pages.find((p) => p.id === id);
    if (!page) return;

    // If turning on public, generate UUID if not exists
    const updates: Partial<WikiPage> = {
      isPublic: !page.isPublic,
    };

    if (!page.isPublic && !page.publicId) {
      updates.publicId = crypto.randomUUID();
    }

    handleUpdatePage(id, updates);
  };

  if (!activePage) return <div className="p-4 text-slate-500">Loading...</div>;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top Bar / Page List */}
      <div className="w-full border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center overflow-x-auto no-scrollbar">
        <div className="flex items-center p-2 gap-2">
          {wikiData.pages.map((page) => (
            <div
              key={page.id}
              onClick={() =>
                updateWikiData({ ...wikiData, activePageId: page.id })
              }
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap border ${
                page.id === activePage.id
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border-transparent"
              }`}
            >
              <FileText
                size={14}
                className={
                  page.id === activePage.id
                    ? "fill-indigo-100 dark:fill-indigo-900/30"
                    : ""
                }
              />
              <span className="max-w-[100px] truncate">{page.title}</span>

              {page.isPublic && (
                <Globe
                  size={12}
                  className="text-emerald-500"
                  title="Public Link Active"
                />
              )}

              <button
                onClick={(e) => handleDeletePage(e, page.id)}
                className={`p-0.5 hover:text-red-500 transition-opacity ${
                  page.id === activePage.id
                    ? "opacity-50 hover:opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddPage}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
            title="Add Page"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
        {/* Toolbar */}
        <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4">
          <input
            type="text"
            value={activePage.title}
            onChange={(e) =>
              handleUpdatePage(activePage.id, { title: e.target.value })
            }
            className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 w-full mr-4"
            placeholder="Page Title"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTogglePublic(activePage.id)}
              className={`p-1.5 rounded transition-colors ${
                activePage.isPublic
                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={
                activePage.isPublic
                  ? "Public Link Active (Click to disable)"
                  : "Make Public"
              }
            >
              <Share2 size={16} />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`p-1.5 rounded transition-colors ${
                isPreviewMode
                  ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
            >
              {isPreviewMode ? <Edit2 size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 overflow-hidden relative">
          {isPreviewMode ? (
            <div className="absolute inset-0 p-4 overflow-y-auto prose dark:prose-invert max-w-none">
              {/* Simple Markdown Rendering (Placeholder for real markdown lib) */}
              {activePage.content.split("\n").map((line, i) => {
                if (line.startsWith("# "))
                  return (
                    <h1 key={i} className="text-2xl font-bold mb-4">
                      {line.substring(2)}
                    </h1>
                  );
                if (line.startsWith("## "))
                  return (
                    <h2 key={i} className="text-xl font-bold mb-3 mt-4">
                      {line.substring(3)}
                    </h2>
                  );
                if (line.startsWith("- "))
                  return (
                    <li key={i} className="ml-4">
                      {line.substring(2)}
                    </li>
                  );
                if (line.trim() === "") return <br key={i} />;
                return (
                  <p key={i} className="mb-2">
                    {line}
                  </p>
                );
              })}
            </div>
          ) : (
            <textarea
              value={activePage.content}
              onChange={(e) =>
                handleUpdatePage(activePage.id, { content: e.target.value })
              }
              className="w-full h-full p-4 resize-none focus:outline-none bg-transparent text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed"
              placeholder="Write your markdown here..."
            />
          )}
        </div>

        {activePage.isPublic && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between border-t border-emerald-100 dark:border-emerald-900/30">
            <span className="truncate">
              Public Link:{" "}
              <span className="font-mono select-all">
                /wiki/{activePage.publicId}
              </span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
              Read Only
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WikiWidget;

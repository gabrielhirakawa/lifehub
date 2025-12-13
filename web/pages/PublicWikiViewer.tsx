import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, AlertCircle, Loader2 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

interface WikiPage {
  id: string;
  title: string;
  content: string;
}

const PublicWikiViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/public/wiki/${id}`);
        // const data = await response.json();

        // Mock simulation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (id === "demo") {
          setPage({
            id: "demo",
            title: "Demo Public Page",
            content:
              "# Hello World\nThis is a public wiki page shared from LifeHub.\n\n- Item 1\n- Item 2",
          });
        } else {
          // For now, since we don't have the backend, we can't really fetch.
          // We'll just show a "Not Found" or a placeholder.
          setError("Public wiki access is not yet implemented on the backend.");
        }
      } catch (err) {
        setError("Failed to load page.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPage();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm" />
        </div>
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 transition-colors duration-300">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm" />
        </div>
        <AlertCircle size={48} className="mb-4 text-red-400" />
        <h1 className="text-xl font-semibold mb-2">Page Not Found</h1>
        <p>
          {error ||
            "The page you are looking for does not exist or is private."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-950 shadow-xl rounded-xl min-h-[calc(100vh-4rem)] px-8 py-12 md:px-12 border border-slate-200 dark:border-slate-800">
        <header className="mb-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <FileText
                className="text-indigo-600 dark:text-indigo-400"
                size={24}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {page.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Published via LifeHub
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <article className="prose dark:prose-invert max-w-none">
          {/* Simple Markdown Rendering */}
          {page.content.split("\n").map((line, i) => {
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
                <li key={i} className="ml-4 list-disc">
                  {line.substring(2)}
                </li>
              );
            if (line.trim() === "") return <br key={i} />;
            return (
              <p key={i} className="mb-2 leading-relaxed">
                {line}
              </p>
            );
          })}
        </article>
      </div>
    </div>
  );
};

export default PublicWikiViewer;

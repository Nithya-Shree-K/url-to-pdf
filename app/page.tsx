"use client";

import { useState } from "react";
import { 
  Globe, FileText, Image as ImageIcon, Sparkles, CheckCircle2, 
  ChevronRight, Loader2, Download, AlertCircle
} from "lucide-react";

interface HistoryItem {
  url: string;
  format: "pdf" | "image";
  time: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"pdf" | "image">("pdf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Capture failed. Check URL.");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = format === "pdf" ? "webpage.pdf" : "screenshot.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(true);
      setHistory((prev) => [
        { url, format, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev.slice(0, 4),
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      
      {/* Background Subtle Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Headless Chromium Service</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Web Page to PDF & Snapshot
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Convert any live website into an A4 document or high-resolution full page screenshot in seconds.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-[#0E131F] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <form onSubmit={handleExport} className="space-y-6">
            
            {/* URL Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Target Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#080B11] border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Format Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Select Output Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setFormat("pdf")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                    format === "pdf"
                      ? "bg-indigo-600/10 border-indigo-500 text-white"
                      : "bg-[#080B11] border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${format === "pdf" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">A4 PDF Document</h3>
                    <p className="text-xs text-slate-400">Print-ready document</p>
                  </div>
                </div>

                <div
                  onClick={() => setFormat("image")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                    format === "image"
                      ? "bg-indigo-600/10 border-indigo-500 text-white"
                      : "bg-[#080B11] border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${format === "image" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Full Screenshot</h3>
                    <p className="text-xs text-slate-400">Lossless PNG snapshot</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>File generated and downloaded successfully!</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Capturing Webpage... please wait</span>
                </>
              ) : (
                <>
                  <span>Generate & Download</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Real Dynamic History (Only shows what user actually downloaded) */}
        {history.length > 0 && (
          <div className="bg-[#0E131F]/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Recent Captures
            </h3>
            <div className="divide-y divide-slate-800">
              {history.map((item, index) => (
                <div key={index} className="py-2 flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-xs">{item.url}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                      {item.format}
                    </span>
                    <span className="text-slate-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
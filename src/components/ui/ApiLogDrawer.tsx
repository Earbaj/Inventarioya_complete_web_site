"use client";

import { useEffect, useState } from "react";
import { subscribeToApiLogs, ApiLogEntry } from "@/lib/api/client";
import { Terminal, X, Copy, Check, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export function ApiLogDrawer() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToApiLogs((updated) => {
      setLogs([...updated]);
    });
    return () => unsubscribe();
  }, []);

  const handleCopyJson = (log: ApiLogEntry) => {
    const payloadToCopy = {
      endpoint: `${log.method} ${log.url}`,
      status: log.status,
      timestamp: log.timestamp,
      response: log.responseData || log.error,
    };
    navigator.clipboard.writeText(JSON.stringify(payloadToCopy, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/50 text-white text-xs font-mono font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
        title="Open Live API Response Logger"
      >
        <div className={`w-2 h-2 rounded-full ${logs.length > 0 ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
        <span>API Logs ({logs.length})</span>
      </button>

      {/* Slide-over Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live API Network & Response Inspector
                </h3>
                <p className="text-[10px] text-slate-400">Click "Copy JSON" to send response payload to chat</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-sans">
                <Terminal className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-xs font-medium">No API calls recorded yet</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Navigate through any page (Dashboard, POS, etc.) to capture real API responses
                </p>
              </div>
            ) : (
              logs.map((log) => {
                const isSuccess = log.status && log.status >= 200 && log.status < 300;
                const isExpanded = expandedId === log.id;

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isSuccess
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {log.status || "FAIL"}
                          </span>
                          <span className="font-bold text-indigo-400">{log.method}</span>
                          <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                          {log.durationMs && (
                            <span className="text-[10px] text-slate-600">({log.durationMs}ms)</span>
                          )}
                        </div>
                        <p className="text-[11px] text-white break-all mt-1">{log.url}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopyJson(log)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-400 flex items-center gap-1 transition-colors"
                          title="Copy response JSON for developer"
                        >
                          {copiedId === log.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Toggle JSON preview"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable JSON Output */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold mb-1">RESPONSE DATA:</p>
                        <pre className="p-2.5 rounded-lg bg-slate-950 text-[10px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed border border-slate-800/80 selection:bg-indigo-600">
                          {JSON.stringify(log.responseData || log.error || "No body returned", null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}

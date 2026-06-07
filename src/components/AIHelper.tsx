import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, AlertCircle, AlertTriangle, Info, Check, RefreshCw } from "lucide-react";
import { COLOR_THEME, Hint } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AIHelperProps {
  code: string;
  lang: string;
  onApply: (fixedCode: string) => void;
}

export default function AIHelper({ code, lang, onApply }: AIHelperProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hints, setHints] = useState<Hint[]>([]);
  const [fixedCode, setFixedCode] = useState("");
  const [activeTab, setActiveTab] = useState<"hints" | "fix">("hints");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const analyze = useCallback(async (src: string) => {
    const trimmedInput = src.trim();
    if (!trimmedInput || trimmedInput.length < 5) {
      setHints([]);
      setFixedCode("");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: src, lang }),
      });

      if (!res.ok) {
        throw new Error("Unable to complete real-time static code analysis.");
      }

      const data = await res.json();
      setHints(data.hints || []);
      setFixedCode(data.fixed || "");
    } catch (err: any) {
      console.error("AI Code assistant request failed:", err);
      setError(err.message || "Auditing unavailable");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  // Debounced analysis triggered automatically as the user types, mimicking a live IDE diagnostics lint
  useEffect(() => {
    if (!open) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      analyze(code);
    }, 1200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [code, open, analyze]);

  const getSeverityStyles = (type: Hint["type"]) => {
    switch (type) {
      case "error":
        return {
          textColor: "text-rose-400",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/20",
          icon: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
        };
      case "warning":
        return {
          textColor: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        };
      case "tip":
      default:
        return {
          textColor: "text-cyan-400",
          bgColor: "bg-cyan-500/10",
          borderColor: "border-cyan-500/20",
          icon: <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        };
    }
  };

  return (
    <div className="relative">
      <button
        id="ai-audit-trigger-btn"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: open ? COLOR_THEME.cyanLo : COLOR_THEME.s3,
          borderColor: open ? COLOR_THEME.cyan : COLOR_THEME.border,
          color: open ? COLOR_THEME.cyan : COLOR_THEME.muted,
        }}
        className="flex items-center gap-2 border rounded-lg px-3 py-1.5 text-xs font-semibold hover:text-white cursor-pointer transition-all duration-200"
      >
        <Sparkles className={`w-3.5 h-3.5 ${open ? "animate-pulse text-cyan-400" : ""}`} />
        <span>AI Fix</span>
        {hints.length > 0 && !loading && (
          <span className="bg-rose-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
            {hints.length}
          </span>
        )}
        {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              backgroundColor: COLOR_THEME.s1,
              borderColor: `${COLOR_THEME.cyan}44`,
              boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.7)"
            }}
            className="absolute right-0 top-11 w-80 border rounded-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div
              style={{ backgroundColor: COLOR_THEME.s2, borderBottomColor: COLOR_THEME.border }}
              className="flex items-center justify-between border-b px-4 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">AI Code Auditor</span>
                <span className="bg-cyan-500/15 text-cyan-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/20">
                  REAL-TIME
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{ borderBottomColor: COLOR_THEME.border }} className="flex border-b text-xs">
              <button
                onClick={() => setActiveTab("hints")}
                style={{
                  borderBottomColor: activeTab === "hints" ? COLOR_THEME.cyan : "transparent",
                  color: activeTab === "hints" ? COLOR_THEME.cyan : COLOR_THEME.muted,
                  backgroundColor: activeTab === "hints" ? COLOR_THEME.s3 : "transparent",
                }}
                className="flex-1 py-2 font-medium border-b-2 hover:bg-indigo-950/10 transition-all text-center"
              >
                Diagnostic Hints {hints.length > 0 && `(${hints.length})`}
              </button>
              <button
                onClick={() => setActiveTab("fix")}
                style={{
                  borderBottomColor: activeTab === "fix" ? COLOR_THEME.cyan : "transparent",
                  color: activeTab === "fix" ? COLOR_THEME.cyan : COLOR_THEME.muted,
                  backgroundColor: activeTab === "fix" ? COLOR_THEME.s3 : "transparent",
                }}
                className="flex-1 py-2 font-medium border-b-2 hover:bg-indigo-950/10 transition-all text-center"
              >
                Refactored Preview
              </button>
            </div>

            {/* Diagnostic Content */}
            <div className="p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col gap-2.5 justify-center py-4">
                  <div className="h-4 w-3/4 bg-slate-8 w-full bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-8 w-full bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-slate-8 w-full bg-slate-800 rounded animate-pulse" />
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-xs text-rose-400">{error}</p>
                </div>
              ) : activeTab === "hints" ? (
                hints.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2 bg-emerald-500/10 p-1 rounded-full" />
                    <p className="font-semibold text-emerald-300">Code Audit Complete</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">No critical warnings or logic flaws detected.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {hints.map((hint, index) => {
                      const styles = getSeverityStyles(hint.type);
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-2.5 p-2.5 border rounded-lg ${styles.bgColor} ${styles.borderColor}`}
                        >
                          {styles.icon}
                          <div className="text-xs flex-1">
                            {hint.line && (
                              <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                                Line {hint.line} &middot; {hint.type}
                              </span>
                            )}
                            <p className="text-slate-200 leading-normal">{hint.msg}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Refactored Fix Tab */
                fixedCode ? (
                  <div className="flex flex-col gap-3">
                    <pre
                      style={{
                        backgroundColor: COLOR_THEME.s2,
                        borderColor: `${COLOR_THEME.green}33`,
                      }}
                      className="text-[11px] font-mono p-3 rounded-lg border max-h-40 overflow-y-auto text-emerald-300 leading-relaxed whiteSpace-pre-wrap whitespace-pre-wrap"
                    >
                      {fixedCode}
                    </pre>
                    <button
                      onClick={() => {
                        onApply(fixedCode);
                        setOpen(false);
                      }}
                      style={{
                        backgroundColor: COLOR_THEME.green,
                        color: "#050510",
                      }}
                      className="w-full py-2 rounded-lg text-xs font-bold hover:bg-emerald-400 transition-colors text-center cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      Apply Refactoring
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <Check className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="font-semibold">Your code matches standard style</p>
                    <p className="text-[11px] text-slate-500 mt-1">Make changes in the editor to view automated fix proposals.</p>
                  </div>
                )
              )}
            </div>

            {/* Footer Status Bar */}
            <div
              style={{
                backgroundColor: COLOR_THEME.s2,
                borderTopColor: COLOR_THEME.border,
              }}
              className="flex items-center gap-2 px-4 py-2 border-t text-[10px] text-slate-400 font-medium"
            >
              <span className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
              <span>{loading ? "Analyzing active updates..." : "Listening for code changes"}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

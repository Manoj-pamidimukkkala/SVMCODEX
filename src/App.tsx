import { useState, useEffect } from "react";
import { 
  Zap, 
  ArrowLeftRight, 
  Play, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Terminal, 
  AlertCircle, 
  Code2, 
  RefreshCw,
  Cpu
} from "lucide-react";
import { LANGUAGES, COLOR_THEME, DEFAULT_SNIPPETS, PISTON_LANG_MAP } from "./types";
import AnimatedBg from "./components/AnimatedBg";
import AIHelper from "./components/AIHelper";
import OutputBox from "./components/OutputBox";

// Helper components implemented cleanly at module level
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        backgroundColor: copied ? COLOR_THEME.greenLo : COLOR_THEME.s3,
        borderColor: copied ? COLOR_THEME.green : COLOR_THEME.border,
        color: copied ? COLOR_THEME.green : COLOR_THEME.muted,
      }}
      className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:text-white hover:border-slate-500 transition-all duration-200"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

interface RunBtnProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

function RunBtn({ onClick, loading, disabled }: RunBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        backgroundColor: loading ? COLOR_THEME.greenLo : COLOR_THEME.green,
        color: loading ? COLOR_THEME.green : "#04060a",
        borderColor: COLOR_THEME.green,
        opacity: disabled && !loading ? 0.45 : 1,
      }}
      className="flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed transition-all duration-200 select-none"
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Play className="w-3.5 h-3.5 fill-current" />
      )}
      <span>{loading ? "Running" : "Run Link"}</span>
    </button>
  );
}

export default function App() {
  const [srcLang, setSrcLang] = useState("Python");
  const [tgtLang, setTgtLang] = useState("JavaScript");
  const [srcCode, setSrcCode] = useState(DEFAULT_SNIPPETS.Python);
  const [transpiledCode, setTranspiledCode] = useState("");
  const [srcOutput, setSrcOutput] = useState("");
  const [tgtOutput, setTgtOutput] = useState("");
  const [transpiling, setTranspiling] = useState(false);
  const [runningSrc, setRunningSrc] = useState(false);
  const [runningTgt, setRunningTgt] = useState(false);
  const [error, setError] = useState("");
  const [srcErr, setSrcErr] = useState(false);
  const [tgtErr, setTgtErr] = useState(false);
  const [headerMode, setHeaderMode] = useState<"PRODUCTION" | "DEBUG">("PRODUCTION");

  // Automatically update source input placeholder or snippet template if left empty when language changes
  useEffect(() => {
    if (!srcCode || Object.values(DEFAULT_SNIPPETS).includes(srcCode)) {
      setSrcCode(DEFAULT_SNIPPETS[srcLang] || DEFAULT_SNIPPETS.Python || "");
    }
  }, [srcLang]);

  const loadDefaults = () => {
    if (window.confirm("Overwrite editor with default Fibonacci demo program?")) {
      setSrcCode(DEFAULT_SNIPPETS[srcLang] || "");
      setTranspiledCode("");
      setSrcOutput("");
      setTgtOutput("");
      setSrcErr(false);
      setTgtErr(false);
    }
  };

  const swap = () => {
    setSrcLang(tgtLang);
    setTgtLang(srcLang);
    setSrcCode(transpiledCode || srcCode);
    setTranspiledCode("");
    setSrcOutput("");
    setTgtOutput("");
    setSrcErr(false);
    setTgtErr(false);
  };

  const transpile = async () => {
    if (!srcCode.trim()) return;
    setTranspiling(true);
    setError("");
    setTranspiledCode("");
    setSrcOutput("");
    setTgtOutput("");
    setSrcErr(false);
    setTgtErr(false);

    try {
      const res = await fetch("/api/transpile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ srcLang, tgtLang, srcCode })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Execution gateway refused compilation parameters.");
      }

      const data = await res.json();
      setTranspiledCode(data.transpiledCode || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Compilation failed. Ensure your server endpoints are running safely.");
    } finally {
      setTranspiling(false);
    }
  };

  const runCodeExecutor = async (languageType: string, codeBuffer: string) => {
    const config = PISTON_LANG_MAP[languageType];
    if (!config) {
      throw new Error(`Execution environment for ${languageType} not configured.`);
    }

    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ content: codeBuffer }]
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Sandbox runtime execution failed.");
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    // Capture standard error sequences or compiler logs
    const outputResult = (data.run?.stdout || data.run?.stderr || data.compile?.stderr || "Execution successfully terminated. No stdout produced.").trim();
    const hasError = !!(data.run?.stderr || data.compile?.stderr || (data.run?.code && data.run.code !== 0));

    return { outputResult, hasError };
  };

  const runSrc = async () => {
    setRunningSrc(true);
    setSrcOutput("");
    setSrcErr(false);
    try {
      const { outputResult, hasError } = await runCodeExecutor(srcLang, srcCode);
      setSrcOutput(outputResult);
      setSrcErr(hasError);
    } catch (err: any) {
      setSrcOutput(err.message || "Failed execution");
      setSrcErr(true);
    } finally {
      setRunningSrc(false);
    }
  };

  const runTgt = async () => {
    setRunningTgt(true);
    setTgtOutput("");
    setTgtErr(false);
    try {
      const { outputResult, hasError } = await runCodeExecutor(tgtLang, transpiledCode);
      setTgtOutput(outputResult);
      setTgtErr(hasError);
    } catch (err: any) {
      setTgtOutput(err.message || "Failed execution");
      setTgtErr(true);
    } finally {
      setRunningTgt(false);
    }
  };

  const runBoth = async () => {
    setRunningSrc(true);
    setRunningTgt(true);
    setSrcOutput("");
    setTgtOutput("");
    setSrcErr(false);
    setTgtErr(false);

    try {
      const [srcResult, tgtResult] = await Promise.allSettled([
        runCodeExecutor(srcLang, srcCode),
        runCodeExecutor(tgtLang, transpiledCode)
      ]);

      if (srcResult.status === "fulfilled") {
        setSrcOutput(srcResult.value.outputResult);
        setSrcErr(srcResult.value.hasError);
      } else {
        setSrcOutput(srcResult.reason?.message || "Execution exception");
        setSrcErr(true);
      }

      if (tgtResult.status === "fulfilled") {
        setTgtOutput(tgtResult.value.outputResult);
        setTgtErr(tgtResult.value.hasError);
      } else {
        setTgtOutput(tgtResult.reason?.message || "Execution exception");
        setTgtErr(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setRunningSrc(false);
      setRunningTgt(false);
    }
  };

  const selectStyle = {
    backgroundColor: COLOR_THEME.s3,
    color: COLOR_THEME.text,
    border: `1px solid ${COLOR_THEME.border}`,
  };

  return (
    <div className="relative min-h-screen text-[#f0f4ff] font-sans px-4 py-8 md:px-8 select-none overflow-x-hidden">
      {/* Abstract particle backdrop canvas */}
      <AnimatedBg />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-6">
        {/* Top Branding Section */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-6 relative z-10 select-text">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7b6cf6] to-[#22d3a0] flex items-center justify-center text-xl shadow-[0_0_20px_rgba(123,108,246,0.4)]">
              <span className="animate-pulse">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#9d92ff] to-[#22d3a0]">
                SVM CODEX
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6b7599] font-semibold">
                Neural Transpilation & Execution Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex bg-[#0e1220]/80 backdrop-blur-md rounded-lg p-1 border border-[#252d45]">
              <button
                onClick={() => setHeaderMode("PRODUCTION")}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold shadow-lg transition-all cursor-pointer ${
                  headerMode === "PRODUCTION"
                    ? "bg-[#1c2235] text-white"
                    : "text-[#6b7599] hover:text-[#e2e8ff]"
                }`}
              >
                PRODUCTION
              </button>
              <button
                onClick={() => setHeaderMode("DEBUG")}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold shadow-lg transition-all cursor-pointer ${
                  headerMode === "DEBUG"
                    ? "bg-[#1c2235] text-white"
                    : "text-[#6b7599] hover:text-[#e2e8ff]"
                }`}
              >
                DEBUG
              </button>
            </div>
          </div>
        </header>

        {/* Global Toolbar Control Unit */}
        <section
          style={{
            backgroundColor: COLOR_THEME.s1,
            borderColor: COLOR_THEME.border,
          }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-2xl shadow-xl transition-all"
        >
          {/* Left selectors */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Source dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 uppercase font-bold font-mono">From</span>
              <select
                style={selectStyle}
                value={srcLang}
                onChange={(e) => setSrcLang(e.target.value)}
                className="w-36 py-2 px-3 text-xs font-bold rounded-lg cursor-pointer outline-none hover:border-slate-400 transition-colors"
                id="source-language-selector"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Language swapper link */}
            <button
              onClick={swap}
              title="Reverse Languages"
              style={{
                backgroundColor: COLOR_THEME.s3,
                borderColor: COLOR_THEME.borderHi,
                color: COLOR_THEME.accentHi,
              }}
              className="p-2 border rounded-lg hover:bg-slate-8 w-10 h-10 flex items-center justify-center cursor-pointer hover:border-white transition-all transform hover:rotate-180 duration-350 select-none active:scale-90"
              id="language-swap-button"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* Target dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 uppercase font-bold font-mono">To</span>
              <select
                style={selectStyle}
                value={tgtLang}
                onChange={(e) => setTgtLang(e.target.value)}
                className="w-36 py-2 px-3 text-xs font-bold rounded-lg cursor-pointer outline-none hover:border-slate-400 transition-colors"
                id="target-language-selector"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right compile buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={loadDefaults}
              style={{
                backgroundColor: `${COLOR_THEME.dim}1a`,
                borderColor: COLOR_THEME.border,
                color: COLOR_THEME.dim,
              }}
              className="flex items-center gap-1.5 border hover:text-[#f0f4ff] hover:border-slate-500 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-colors"
              id="demo-snippet-loader-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Template</span>
            </button>

            {transpiledCode && (
              <button
                onClick={runBoth}
                disabled={runningSrc || runningTgt}
                style={{
                  backgroundColor: COLOR_THEME.amberLo,
                  color: COLOR_THEME.amber,
                  borderColor: `${COLOR_THEME.amber}44`,
                }}
                className="flex items-center gap-1.5 border rounded-lg px-3 py-2 text-xs font-extrabold hover:brightness-110 active:scale-95 disabled:opacity-40 cursor-pointer transition-all uppercase tracking-wide select-none"
                id="run-both-sandbox-btn"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Run Both</span>
              </button>
            )}

            <button
              onClick={transpile}
              disabled={transpiling || !srcCode.trim()}
              className={`bg-gradient-to-r from-[#7b6cf6] to-[#6355d9] hover:brightness-110 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-[0_4px_20px_rgba(123,108,246,0.3)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed select-none ${
                transpiling ? "animate-[growGlow_1.5s_infinite]" : ""
              }`}
              id="transpile-trigger-btn"
            >
              {transpiling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>TRANSTYPE COMPILING...</span>
                </>
              ) : (
                <>
                  <span>⚡</span> TRANSTYPE CODE
                </>
              )}
            </button>
          </div>
        </section>

        {/* Global Error Notice */}
        {error && (
          <div
            style={{
              backgroundColor: COLOR_THEME.redLo,
              borderColor: `${COLOR_THEME.red}44`,
              color: COLOR_THEME.red,
            }}
            className="flex items-start gap-3 p-3.5 border rounded-xl animate-shake select-text"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Compilation System Error:</span> {error}
            </div>
          </div>
        )}

        {/* Side-by-Side Code Workspace Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-text">
          {/* Source Editor Panel */}
          <div
            style={{
              backgroundColor: COLOR_THEME.s1,
              borderColor: COLOR_THEME.border,
            }}
            className="flex flex-col rounded-2xl border overflow-hidden shadow-xl"
          >
            {/* Header bar */}
            <div
              style={{
                backgroundColor: COLOR_THEME.s2,
                borderBottomColor: COLOR_THEME.border,
              }}
              className="flex items-center justify-between px-4 py-3 border-b"
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    backgroundColor: COLOR_THEME.accentLo,
                    color: COLOR_THEME.accentHi,
                    borderColor: `${COLOR_THEME.accent}33`,
                  }}
                  className="px-2 py-0.5 rounded border text-[11px] font-mono uppercase font-bold"
                >
                  {srcLang}
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Source IDE</span>
              </div>

              {/* Utility actions inside header */}
              <div className="flex items-center gap-2">
                <AIHelper code={srcCode} lang={srcLang} onApply={setSrcCode} />
                <RunBtn onClick={runSrc} loading={runningSrc} />
              </div>
            </div>

            {/* Code Field Textarea */}
            <div className="relative flex-1">
              <textarea
                value={srcCode}
                onChange={(e) => setSrcCode(e.target.value)}
                placeholder={`Write or paste standard ${srcLang} code structure here...`}
                spellCheck={false}
                style={{
                  fontFamily: "var(--font-mono)",
                  lineHeight: "1.8",
                  color: COLOR_THEME.text,
                }}
                className="w-full min-h-[280px] p-4 bg-transparent resize-y outline-none border-0 text-slate-300 text-xs selection:bg-indigo-500/30 font-medium whitespace-pre"
                id="source-code-textarea"
              />
            </div>
          </div>

          {/* Target Transpiled Panel */}
          <div
            style={{
              backgroundColor: COLOR_THEME.s1,
              borderColor: transpiling ? `${COLOR_THEME.accent}77` : COLOR_THEME.border,
            }}
            className="flex flex-col rounded-2xl border overflow-hidden shadow-xl transition-all duration-300"
          >
            {/* Header bar */}
            <div
              style={{
                backgroundColor: COLOR_THEME.s2,
                borderBottomColor: COLOR_THEME.border,
              }}
              className="flex items-center justify-between px-4 py-3 border-b"
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    backgroundColor: COLOR_THEME.greenLo,
                    color: COLOR_THEME.greenHi,
                    borderColor: `${COLOR_THEME.green}33`,
                  }}
                  className="px-2 py-0.5 rounded border text-[11px] font-mono uppercase font-bold"
                >
                  {tgtLang}
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Transpiled IDE</span>
              </div>

              {/* Action buttons inside target header */}
              <div className="flex items-center gap-2">
                {transpiledCode && <CopyBtn text={transpiledCode} />}
                <RunBtn onClick={runTgt} loading={runningTgt} disabled={!transpiledCode} />
              </div>
            </div>

            {/* Transpiled output preview textarea */}
            <div className="relative flex-1">
              <textarea
                value={transpiledCode}
                readOnly
                placeholder={transpiling ? "Compiling translation sequences with server safety..." : `Transpiled ${tgtLang} program logic will map here...`}
                spellCheck={false}
                style={{
                  fontFamily: "var(--font-mono)",
                  lineHeight: "1.8",
                  color: transpiledCode ? COLOR_THEME.text : COLOR_THEME.dim,
                }}
                className="w-full min-h-[280px] p-4 bg-transparent resize-y outline-none border-0 text-xs selection:bg-indigo-500/30 font-medium whitespace-pre"
                id="target-transpiled-textarea"
              />
            </div>
          </div>
        </section>

        {/* Side-by-Side Sandboxed Run Consoles */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-text mb-6">
          <OutputBox
            label={srcLang}
            color={COLOR_THEME.accent}
            output={srcOutput}
            running={runningSrc}
            hasErr={srcErr}
          />
          <OutputBox
            label={tgtLang}
            color={COLOR_THEME.green}
            output={tgtOutput}
            running={runningTgt}
            hasErr={tgtErr}
          />
        </section>

        {/* Immersive UI Status Footer */}
        <footer className="mt-6 flex items-center justify-between px-2 border-t border-[#1c2235]/60 pt-4 pb-2">
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#3d4a6b]">
              <div className="w-2 h-2 rounded-full bg-[#7b6cf6] animate-pulse"></div>
              LSP: ACTIVE
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#3d4a6b]">
              <div className="w-2 h-2 rounded-full bg-[#22d3ee] animate-pulse"></div>
              AI CORE: STABLE
            </div>
          </div>
          <div className="text-[10px] text-[#3d4a6b] font-mono uppercase tracking-widest">
            Encrypted Session : 0xFF-7A2D9-X0
          </div>
        </footer>
      </div>
    </div>
  );
}

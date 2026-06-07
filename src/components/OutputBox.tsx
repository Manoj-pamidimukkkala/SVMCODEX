import { useState } from "react";
import { Terminal, Copy, Check, FileCode2 } from "lucide-react";
import { COLOR_THEME } from "../types";

interface OutputBoxProps {
  label: string;
  color: string;
  output: string;
  running: boolean;
  hasErr: boolean;
}

export default function OutputBox({ label, color, output, running, hasErr }: OutputBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: COLOR_THEME.s1,
        borderColor: output && !hasErr ? `${color}55` : hasErr ? `${COLOR_THEME.red}55` : COLOR_THEME.border,
      }}
      className="flex-1 min-w-0 border rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
    >
      {/* Terminal Title Bar */}
      <div
        style={{
          backgroundColor: COLOR_THEME.s2,
          borderBottomColor: COLOR_THEME.border,
        }}
        className="flex items-center justify-between px-4 py-2.5 border-b select-none"
      >
        <div className="flex items-center gap-3">
          {/* macOS-style window controls */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 import h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          
          <div className="flex items-center gap-1.5 ml-2">
            <Terminal style={{ color }} className="w-4 h-4 ml-1" />
            <span className="text-[11px] font-mono text-slate-400">
              output <span style={{ color }} className="font-bold">{label}</span>
            </span>
          </div>
        </div>

        {/* Copy Button for Terminal */}
        {output && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copy logs</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Terminal Run Output Console */}
      <div className="relative">
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            color: hasErr ? COLOR_THEME.red : output ? COLOR_THEME.text : COLOR_THEME.dim,
          }}
          className="m-0 p-4 text-[12.5px] leading-relaxed whitespace-pre-wrap break-all min-h-[140px] max-h-[250px] overflow-y-auto selection:bg-indigo-500/30 font-semibold"
        >
          {running ? (
            <div className="flex items-center gap-2 text-amber-400 animate-pulse">
              <span className="w-2 import h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Compiling sandbox runtime...</span>
              <span className="animate-[blink_1s_infinite]">_</span>
            </div>
          ) : output ? (
            output
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-slate-600 gap-2">
              <FileCode2 className="w-8 h-8 opacity-40 text-slate-500" />
              <span className="text-xs">&mdash; awaiting execution &mdash;</span>
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}

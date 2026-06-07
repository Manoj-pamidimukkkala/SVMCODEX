import { useRef } from "react";
import { COLOR_THEME } from "../types";

export default function AnimatedBg() {
  const points = useRef(
    Array.from({ length: 22 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 1.2,
      opacity: Math.random() * 0.2 + 0.05,
      color: [COLOR_THEME.accent, COLOR_THEME.green, COLOR_THEME.cyan, COLOR_THEME.accentHi][index % 4],
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 6,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#080b14]">
      {/* Immersive UI Atmospheric Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7b6cf6] opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#22d3a0] opacity-5 rounded-full blur-[150px] pointer-events-none"></div>

      {points.current.map((pt) => (
        <div
          key={pt.id}
          style={{
            position: "absolute",
            borderRadius: "50%",
            left: `${pt.left}%`,
            top: `${pt.top}%`,
            width: pt.size,
            height: pt.size,
            backgroundColor: pt.color,
            opacity: pt.opacity,
            animation: `float${pt.id % 3} ${pt.duration}s ${pt.delay}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`
        @keyframes float0 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.15); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(-15px, -35px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseIndicator {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes growGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 24px rgba(99,102,241,0.5); }
        }
      `}</style>
    </div>
  );
}

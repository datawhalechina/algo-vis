import { ReactNode } from "react";

export interface IntuitionChapter {
  /** 章节编号（如 "1" 或 "①"） */
  number: string;
  /** 章节图标（emoji） */
  icon: string;
  /** 章节标题 */
  title: string;
  /** 章节主体内容 */
  body: ReactNode;
  /** 强调色 */
  accent?: "rose" | "amber" | "blue" | "emerald" | "purple" | "indigo" | "pink" | "cyan";
}

const ACCENT_MAP: Record<string, { bg: string; border: string; num: string; title: string }> = {
  rose: {
    bg: "bg-rose-50/60",
    border: "border-rose-200",
    num: "bg-rose-500 text-white",
    title: "text-rose-900",
  },
  amber: {
    bg: "bg-amber-50/60",
    border: "border-amber-200",
    num: "bg-amber-500 text-white",
    title: "text-amber-900",
  },
  blue: {
    bg: "bg-blue-50/60",
    border: "border-blue-200",
    num: "bg-blue-500 text-white",
    title: "text-blue-900",
  },
  emerald: {
    bg: "bg-emerald-50/60",
    border: "border-emerald-200",
    num: "bg-emerald-500 text-white",
    title: "text-emerald-900",
  },
  purple: {
    bg: "bg-purple-50/60",
    border: "border-purple-200",
    num: "bg-purple-500 text-white",
    title: "text-purple-900",
  },
  indigo: {
    bg: "bg-indigo-50/60",
    border: "border-indigo-200",
    num: "bg-indigo-500 text-white",
    title: "text-indigo-900",
  },
  pink: {
    bg: "bg-pink-50/60",
    border: "border-pink-200",
    num: "bg-pink-500 text-white",
    title: "text-pink-900",
  },
  cyan: {
    bg: "bg-cyan-50/60",
    border: "border-cyan-200",
    num: "bg-cyan-500 text-white",
    title: "text-cyan-900",
  },
};

interface IntuitionFlowProps {
  /** 总标题（可选） */
  title?: string;
  /** 章节列表 */
  chapters: IntuitionChapter[];
}

/**
 * 3Blue1Brown 风格的叙事引入组件：
 * 用 "问题 → 类比 → 洞察 → 机制" 的故事节奏，引导小白一步步理解算法。
 */
export function IntuitionFlow({ title = "📚 从零理解：故事时间", chapters }: IntuitionFlowProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-xl border-2 border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        {title}
      </h3>
      <div className="space-y-3">
        {chapters.map((ch, idx) => {
          const accent = ACCENT_MAP[ch.accent ?? "blue"];
          return (
            <div
              key={idx}
              className={`relative rounded-lg border ${accent.border} ${accent.bg} p-4`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full ${accent.num} flex items-center justify-center font-bold text-sm shadow-sm`}
                >
                  {ch.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold ${accent.title} mb-1.5 flex items-center gap-1.5`}>
                    <span>{ch.icon}</span>
                    <span>{ch.title}</span>
                  </h4>
                  <div className="text-[12.5px] text-slate-700 leading-relaxed space-y-2">
                    {ch.body}
                  </div>
                </div>
              </div>
              {idx < chapters.length - 1 && (
                <div className="absolute -bottom-2.5 left-6 text-slate-300 text-lg z-10 bg-white rounded-full leading-none">
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

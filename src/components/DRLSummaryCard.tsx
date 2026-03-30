import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, ExternalLink, Circle } from "lucide-react";
import { getDrlProblemsByCategory } from "@/datadrl/data";
import { DRLCategory } from "@/types/drl";

interface DRLChapter {
  label: string;
  category: DRLCategory;
}

const CHAPTERS: DRLChapter[] = [
  { label: "一、基础概念", category: DRLCategory.OVERVIEW },
  { label: "二、TD 学习", category: DRLCategory.TD_LEARNING },
  { label: "三、高级价值学习", category: DRLCategory.VALUE_BASED },
  { label: "四、策略梯度", category: DRLCategory.POLICY_GRADIENT },
  { label: "五、高级策略学习", category: DRLCategory.ADVANCED_POLICY },
  { label: "六、连续动作空间", category: DRLCategory.CONTINUOUS_ACTION },
  { label: "七、多智能体强化学习", category: DRLCategory.MULTI_AGENT },
  { label: "八、模仿学习", category: DRLCategory.IMITATION_LEARNING },
  { label: "九、verl 框架", category: DRLCategory.VERL_FRAMEWORK },
];

interface DRLSummaryCardProps {
  totalCount: number;
}

export function DRLSummaryCard({ totalCount }: DRLSummaryCardProps) {
  const [openCategory, setOpenCategory] = useState<DRLCategory | null>(null);

  const toggle = (category: DRLCategory) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[40rem]">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-100 px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">深度强化学习</h3>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white text-emerald-600 text-sm font-medium rounded-full border border-emerald-200">
              {totalCount} 题
            </span>
            <Link
              to="/drl"
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full hover:bg-emerald-700 transition"
            >
              查看全部
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
        {CHAPTERS.map((chapter) => {
          const isOpen = openCategory === chapter.category;
          const problems = isOpen ? getDrlProblemsByCategory(chapter.category) : [];

          return (
            <div key={chapter.category}>
              <button
                onClick={() => toggle(chapter.category)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors group flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                  {chapter.label}
                </span>
                {isOpen
                  ? <ChevronDown size={14} className="text-emerald-500 flex-shrink-0" />
                  : <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
                }
              </button>

              {isOpen && (
                <div className="bg-gray-50 border-t border-gray-100">
                  {problems.map((p) => (
                    <Link
                      key={p.id}
                      to={`/drl/${p.id}`}
                      className="flex items-center gap-2 px-6 py-2 text-sm text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      <Circle size={6} className="text-emerald-400 flex-shrink-0 fill-emerald-400" />
                      <span className="text-xs font-mono text-gray-400 flex-shrink-0">#{p.id}</span>
                      {p.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

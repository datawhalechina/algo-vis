import { Link } from "react-router-dom";
import { DRLProblem } from "@/types/drl";
import { Circle } from "lucide-react";
import { Tooltip } from "antd";

interface DRLGroupCardProps {
  title: string;
  count: number;
  problems: DRLProblem[];
}

export function DRLGroupCard({ title, count, problems }: DRLGroupCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[40rem]">
      {/* 卡片头部 */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-100 px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="px-3 py-1 bg-white text-emerald-600 text-sm font-medium rounded-full border border-emerald-200">
            {count} 题
          </span>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
        {problems.map((problem) => (
          <Link
            key={problem.id}
            to={`/drl/${problem.id}`}
            className="block px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Circle className="text-gray-300 flex-shrink-0" size={18} />
              <span className="text-xs font-mono text-gray-400 flex-shrink-0">#{problem.id}</span>
              <Tooltip title={problem.title} placement="top">
                <h4 className="text-base font-medium text-gray-900 truncate">
                  {problem.title}
                </h4>
              </Tooltip>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

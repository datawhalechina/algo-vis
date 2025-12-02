import { Link } from "react-router-dom";
import { AIProblem } from "@/types/ai";
import { Circle } from "lucide-react";
import { Tooltip } from "antd";

interface AiGroupCardProps {
  title: string;
  count: number;
  problems: AIProblem[];
}

export function AiGroupCard({
  title,
  count,
  problems,
}: AiGroupCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[40rem]">
      {/* 卡片头部 */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="px-3 py-1 bg-white text-primary-600 text-sm font-medium rounded-full border border-primary-200">
            {count} 题
          </span>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
        {problems.map((problem) => (
          <Link
            key={problem.id}
            to={`/ai/${problem.id}`}
            className="block px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Circle className="text-gray-300 flex-shrink-0" size={18} />
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


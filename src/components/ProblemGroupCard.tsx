import { Link } from "react-router-dom";
import { Problem, Difficulty } from "@/types";
import { Circle, Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Tooltip } from "antd";

interface ProblemGroupCardProps {
  title: string;
  count: number;
  problems: Problem[];
  getDifficultyColor: (difficulty: Difficulty) => string;
  getDifficultyText: (difficulty: Difficulty) => string;
}

export function ProblemGroupCard({
  title,
  count,
  problems,
  getDifficultyColor,
  getDifficultyText,
}: ProblemGroupCardProps) {
  const { isCompleted, isFavorite } = useAppStore();

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
            to={`/problem/${problem.id}`}
            className="block px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              {/* 左侧：状态 + 编号 + 标题 */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isCompleted(problem.id) ? (
                  <svg 
                    className="flex-shrink-0" 
                    viewBox="0 0 1024 1024" 
                    xmlns="http://www.w3.org/2000/svg" 
                    style={{ width: '1.25rem', height: '1.25rem', display: 'inline-block' }}
                  >
                    <path d="M512 118.272c-216.576 0-393.728 177.152-393.728 393.728s177.152 393.728 393.728 393.728 393.728-177.152 393.728-393.728-177.152-393.728-393.728-393.728zM748.544 409.6l-228.352 228.352-43.52 43.52c-4.096 7.68-11.776 7.68-19.456 7.68s-15.872-4.096-19.456-7.68l-43.52-43.52-118.272-114.176c-7.68-4.096-7.68-11.776-7.68-19.456s4.096-15.872 7.68-19.456l43.52-43.52c4.096-4.096 11.776-7.68 19.456-7.68s15.872 4.096 19.456 7.68l94.72 94.72 208.896-208.896c7.68-7.68 15.872-11.776 23.552-11.776 7.68 0 15.872 4.096 19.456 7.68l43.52 43.52c7.68 7.68 7.68 15.872 7.68 23.552 0 7.68-4.096 15.36-7.68 19.456z" fill="#19BE6B" />
                    <path d="M512 0C228.352 0 0 228.352 0 512s228.352 512 512 512 512-228.352 512-512S795.648 0 512 0z m0 905.728c-216.576 0-393.728-177.152-393.728-393.728S295.424 118.272 512 118.272s393.728 177.152 393.728 393.728-177.152 393.728-393.728 393.728z" fill="#FFFFFF" />
                  </svg>
                ) : (
                  <Circle className="text-gray-300 flex-shrink-0" size={18} />
                )}
                
                <span className="text-gray-500 font-mono text-sm flex-shrink-0">
                  #{problem.leetcodeNumber}
                </span>
                
                <Tooltip title={problem.title} placement="top">
                  <h4 className="text-base font-medium text-gray-900 truncate">
                    {problem.title}
                  </h4>
                </Tooltip>
                
                {isFavorite(problem.id) && (
                  <Heart className="text-red-500 flex-shrink-0" size={16} fill="currentColor" />
                )}
              </div>

              {/* 右侧：难度 */}
              <span
                className={`px-3 py-1 text-xs font-medium border rounded-full flex-shrink-0 ${getDifficultyColor(
                  problem.difficulty
                )}`}
              >
                {getDifficultyText(problem.difficulty)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

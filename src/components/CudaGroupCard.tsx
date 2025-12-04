import { Link } from "react-router-dom";
import { CudaProblem } from "@/types/cuda";
import { Circle } from "lucide-react";

interface CudaGroupCardProps {
    title: string;
    count: number;
    problems: CudaProblem[];
}

export function CudaGroupCard({
    title,
    count,
    problems,
}: CudaGroupCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            {/* 卡片头部 */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <span className="px-3 py-1 bg-white text-primary-600 text-sm font-medium rounded-full border border-primary-200">
                        {count} 算子
                    </span>
                </div>
            </div>

            {/* 题目列表 */}
            <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                {problems.map((problem) => (
                    <Link
                        key={problem.id}
                        to={`/cuda/${problem.id}`}
                        className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-start gap-3">
                            <Circle className="text-gray-300 flex-shrink-0 mt-1 group-hover:text-primary-500 transition-colors" size={16} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-base font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                        {problem.title}
                                    </h4>
                                    {/* <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" /> */}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                    {problem.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {problem.tags.slice(0, 3).map((tag, index) => (
                                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

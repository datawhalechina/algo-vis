import { useMemo } from "react";
import { Link } from "react-router-dom";
import { aiProblems } from "@/problemAI/data";
import { AIDomain, aiDomainNames } from "@/types/ai";
import { Difficulty } from "@/types";

function getDifficultyClasses(difficulty: Difficulty) {
  switch (difficulty) {
    case Difficulty.EASY:
      return {
        badge: "text-green-600 bg-green-50 border-green-200",
        label: "简单",
      };
    case Difficulty.MEDIUM:
      return {
        badge: "text-yellow-600 bg-yellow-50 border-yellow-200",
        label: "中等",
      };
    case Difficulty.HARD:
      return {
        badge: "text-red-600 bg-red-50 border-red-200",
        label: "困难",
      };
    default:
      return {
        badge: "text-gray-600 bg-gray-50 border-gray-200",
        label: difficulty,
      };
  }
}

function AiHomePage() {
  const grouped = useMemo(() => {
    const orderedDomains = Object.values(AIDomain);
    const map = new Map<AIDomain, typeof aiProblems>();
    orderedDomains.forEach((domain) => {
      map.set(domain as AIDomain, []);
    });

    aiProblems.forEach((problem) => {
      if (!map.has(problem.domain)) {
        map.set(problem.domain, []);
      }
      map.get(problem.domain)!.push(problem);
    });

    return Array.from(map.entries()).filter(([, items]) => items.length > 0);
  }, []);

  return (
    <div className="w-full px-4 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">
          AI 模型可视化题库
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          与热题 100 相同的卡片/列表布局，只按「视觉」「语音」「语言」「多模态」等方向分组，
          方便直接切换到你需要的模型推演示例。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {grouped.map(([domain, domainProblems]) => (
          <div
            key={domain}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {aiDomainNames[domain]}
              </h2>
              <span className="px-3 py-1 bg-white text-emerald-600 text-sm font-medium rounded-full border border-emerald-200">
                {domainProblems.length} 个案例
              </span>
            </div>

            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
              {domainProblems.map((problem) => {
                const difficulty = getDifficultyClasses(problem.difficulty);
                return (
                  <Link
                    key={problem.id}
                    to={`/ai/${problem.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-gray-900">
                          {problem.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {problem.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {problem.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full border border-primary-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium border rounded-full flex-shrink-0 ${difficulty.badge}`}
                      >
                        {difficulty.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AiHomePage;


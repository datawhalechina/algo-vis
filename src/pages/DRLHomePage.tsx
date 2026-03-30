import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { drlProblems } from "@/datadrl/data";
import { DRLCategory, drlCategoryNames } from "@/types/drl";
import { Filter } from "lucide-react";
import { DRLGroupCard } from "@/components/DRLGroupCard";
import { useAppStore } from "@/store/useAppStore";
import { useScrollRestore } from "@/hooks/useScrollRestore";

function DRLHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<DRLCategory | "all">(
    (searchParams.get("category") as DRLCategory) || "all"
  );

  const { getProgressStats } = useAppStore();

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams, { replace: true });
  };

  useScrollRestore("/drl");

  const stats = useMemo(() => {
    const categories = new Set(drlProblems.map((p) => p.category)).size;
    const tags = new Set(drlProblems.flatMap((p) => p.tags)).size;
    return { total: drlProblems.length, categories, tags };
  }, []);

  const progressStats = getProgressStats(drlProblems.length);

  const groupedProblems = useMemo(() => {
    const map = new Map<DRLCategory, typeof drlProblems>();

    Object.values(DRLCategory).forEach((cat) => {
      map.set(cat as DRLCategory, []);
    });

    drlProblems.forEach((problem) => {
      if (selectedCategory === "all" || selectedCategory === problem.category) {
        map.get(problem.category)!.push(problem);
      }
    });

    return Array.from(map.entries())
      .filter(([, items]) => items.length > 0)
      .sort((a, b) => {
        const order = Object.values(DRLCategory);
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      });
  }, [selectedCategory]);

  const categoryStats = useMemo(() => {
    const s: Record<string, number> = {};
    drlProblems.forEach((p) => {
      s[p.category] = (s[p.category] || 0) + 1;
    });
    return s;
  }, []);

  return (
    <div className="w-full px-4 md:px-10 lg:px-24 xl:px-32 2xl:px-40">
      <div className="mb-8 pt-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          深度强化学习算法可视化
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          从 TD 学习到多智能体强化学习，系统掌握 DRL 核心算法原理与直觉
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-emerald-600 mb-2">
            {stats.total}
          </div>
          <div className="text-gray-600">算法题目</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {progressStats.completed}
          </div>
          <div className="text-gray-600">已完成</div>
          {stats.total > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {progressStats.completionRate}%
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-teal-600 mb-2">
            {stats.categories}
          </div>
          <div className="text-gray-600">算法分类</div>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">算法筛选</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory("all");
              updateSearchParams("category", "all");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === "all"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            全部 ({drlProblems.length})
          </button>
          {Object.values(DRLCategory).map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                updateSearchParams("category", category);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {drlCategoryNames[category]} ({categoryStats[category] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* 内容列表 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">算法分类概览</h2>
          <span className="text-sm text-gray-600">
            {groupedProblems.length} 个分类
          </span>
        </div>

        {groupedProblems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12 text-center text-gray-500">
            没有找到符合条件的题目
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {groupedProblems.map(([category, problems]) => (
              <DRLGroupCard
                key={category}
                title={drlCategoryNames[category]}
                count={problems.length}
                problems={problems}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">
          💡 学习路线建议
        </h3>
        <ul className="text-emerald-800 space-y-1 list-disc list-inside">
          <li>从 <strong>基础概念</strong> 开始，掌握 MDP、价值函数与策略的基本框架</li>
          <li>学习 <strong>TD 学习</strong>（Sarsa、Q-Learning），理解在线更新机制</li>
          <li>进阶 <strong>高级价值学习</strong>（DQN 系列），掌握深度强化学习核心技术</li>
          <li>挑战 <strong>策略梯度与 Actor-Critic</strong>，迈向连续控制与多智能体场景</li>
        </ul>
      </div>
    </div>
  );
}

export default DRLHomePage;

import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Bot, ListChecks, Sparkles, Filter } from "lucide-react";
import { problems } from "@/data";
import { aiProblems } from "@/problemAI/data";
import { useAppStore } from "@/store/useAppStore";
import { AIDomain, aiDomainNames } from "@/types/ai";

function HomePage() {
  const { getProgressStats } = useAppStore();
  const progressStats = getProgressStats(problems.length);
  const [selectedDomain, setSelectedDomain] = useState<AIDomain | "all">("all");

  const aiStats = useMemo(() => {
    const domains = new Set(aiProblems.map((p) => p.domain)).size;
    const tags = new Set(aiProblems.flatMap((p) => p.tags)).size;
    return {
      total: aiProblems.length,
      domains,
      tags,
    };
  }, []);

  const availableDomains = useMemo(() => {
    const domains = new Set(aiProblems.map((p) => p.domain));
    return Array.from(domains);
  }, []);

  const filteredAiProblems = useMemo(() => {
    if (selectedDomain === "all") return aiProblems;
    return aiProblems.filter((p) => p.domain === selectedDomain);
  }, [selectedDomain]);

  const aiDomainStats = useMemo(() => {
    const stats: Record<string, number> = {};
    aiProblems.forEach((p) => {
      stats[p.domain] = (stats[p.domain] || 0) + 1;
    });
    return stats;
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center py-16 sm:py-20 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>算法可视化平台</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
          算法可视化平台
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          通过交互式动画和可视化，深入理解经典算法与 AI 模型的内部机制
        </p>
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-8 lg:gap-12 lg:grid-cols-2 mb-16">
        {/* LeetCode 100 Card */}
        <Link
          to="/problems"
          className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full -mr-32 -mt-32 opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
                <ListChecks className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-primary-600 font-bold mb-1">
                  力扣 100 题
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  经典算法题
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              精选 LeetCode 热题 100，按题型自动分组，支持进度追踪、收藏管理和交互式动画演示
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {progressStats.total}
                </p>
                <p className="text-xs text-gray-500 font-medium">题目总数</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {progressStats.completed}
                </p>
                <p className="text-xs text-gray-500 font-medium">已完成</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-red-500 mb-1">
                  {progressStats.favorite}
                </p>
                <p className="text-xs text-gray-500 font-medium">收藏</p>
              </div>
            </div>
          </div>
        </Link>

        {/* AI Algorithm Card */}
        <Link
          to="/ai"
          className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full -mr-32 -mt-32 opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-primary-600 font-bold mb-1">
                  AI 算法
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  模型可视化
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              探索 AI 模型的内部机制，包括注意力权重、特征映射和推理过程的可视化演示
            </p>

            {/* Filter Section */}
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter className="w-4 h-4" />
                <span>算法类型筛选</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedDomain("all");
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDomain === "all"
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-primary-50 border border-gray-200"
                  }`}
                >
                  全部
                </button>
                {availableDomains.map((domain) => (
                  <button
                    key={domain}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedDomain(domain);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDomain === domain
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-primary-50 border border-gray-200"
                    }`}
                  >
                    {aiDomainNames[domain]}
                    <span className="ml-1.5 text-xs opacity-75">
                      ({aiDomainStats[domain] || 0})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {filteredAiProblems.length}
                </p>
                <p className="text-xs text-gray-500 font-medium">可视化案例</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-primary-600 mb-1">
                  {aiStats.domains}
                </p>
                <p className="text-xs text-gray-500 font-medium">模型方向</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-primary-600 mb-1">
                  {aiStats.tags}
                </p>
                <p className="text-xs text-gray-500 font-medium">重点标签</p>
              </div>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}

export default HomePage;



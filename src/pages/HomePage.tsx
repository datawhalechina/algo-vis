import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Bot, ListChecks, Sparkles, Cpu } from "lucide-react";
import { problems } from "@/data";
import { aiProblems } from "@/dataai/data";
import { cudaProblems } from "@/datacuda/data";
import { useAppStore } from "@/store/useAppStore";

function HomePage() {
  const { getProgressStats } = useAppStore();
  const progressStats = getProgressStats(problems.length);

  const categoryCount = useMemo(() => {
    return new Set(problems.flatMap((p) => p.category)).size;
  }, []);

  const methodCount = useMemo(() => {
    return new Set(problems.flatMap((p) => p.methods)).size;
  }, []);

  const aiStats = useMemo(() => {
    const domains = new Set(aiProblems.map((p) => p.domain)).size;
    const tags = new Set(aiProblems.flatMap((p) => p.tags)).size;
    return {
      total: aiProblems.length,
      domains,
      tags,
    };
  }, []);

  const cudaStats = useMemo(() => {
    const categories = new Set(cudaProblems.map((p) => p.category)).size;
    const tags = new Set(cudaProblems.flatMap((p) => p.tags)).size;
    return {
      total: cudaProblems.length,
      categories,
      tags,
    };
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="w-full  px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="text-center py-12 sm:py-16 lg:py-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 rounded-full text-sm font-semibold mb-2 shadow-sm border border-primary-100/50">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>算法可视化平台</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            算法可视化平台
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            通过交互式动画和可视化，深入理解经典算法与 AI 模型的内部机制
          </p>
        </section>

        {/* Main Content Grid */}
        <section className="grid gap-8 sm:gap-10 lg:gap-12 xl:gap-14 lg:grid-cols-3 mb-12 sm:mb-16 lg:mb-20 mt-8 sm:mt-12 max-w-[120rem] mx-auto">
          {/* LeetCode 100 Card */}
          <Link
            to="/problems"
            className="group relative bg-white border-2 border-emerald-100/50 rounded-3xl p-7 sm:p-9 lg:p-11 xl:p-12 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer hover:border-emerald-300"
          >
            {/* Background gradient decoration */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-emerald-100/40 to-green-100/30 rounded-full -mr-36 -mt-36 opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-50/30 to-transparent rounded-full -ml-24 -mb-24 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            
            <div className="relative space-y-5 sm:space-y-6 z-10">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <ListChecks className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-emerald-600 font-bold mb-1.5">
                    力扣 100 题
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    经典算法题
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium">
                精选 LeetCode 热题 100，按题型自动分组，支持进度追踪、收藏管理和交互式动画演示
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-emerald-100/50 group-hover:border-emerald-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {progressStats.total}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">题目总数</p>
                </div>
                <div className="bg-gradient-to-br from-white to-green-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-green-100/50 group-hover:border-green-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                    {categoryCount}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">题型分类</p>
                </div>
                <div className="bg-gradient-to-br from-white to-red-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-red-100/50 group-hover:border-red-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">
                    {methodCount}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">解法数量</p>
                </div>
              </div>
            </div>
          </Link>

          {/* AI Algorithm Card */}
          <Link
            to="/ai"
            className="group relative bg-white border-2 border-purple-100/50 rounded-3xl p-7 sm:p-9 lg:p-11 xl:p-12 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer hover:border-purple-300"
          >
            {/* Background gradient decoration */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-100/40 to-indigo-100/30 rounded-full -mr-36 -mt-36 opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-50/30 to-transparent rounded-full -ml-24 -mb-24 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            
            <div className="relative space-y-5 sm:space-y-6 z-10">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Bot className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-purple-600 font-bold mb-1.5">
                    AI 算法
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    模型可视化
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium">
                探索 AI 模型的内部机制，包括注意力权重、特征映射和推理过程的可视化演示
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-purple-100/50 group-hover:border-purple-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {aiStats.total}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">可视化案例</p>
                </div>
                <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-indigo-100/50 group-hover:border-indigo-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                    {aiStats.domains}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">模型方向</p>
                </div>
                <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-blue-100/50 group-hover:border-blue-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">
                    {aiStats.tags}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">重点标签</p>
                </div>
              </div>
            </div>
          </Link>

          {/* CUDA Operator Card */}
          <Link
            to="/cuda"
            className="group relative bg-white border-2 border-orange-100/50 rounded-3xl p-7 sm:p-9 lg:p-11 xl:p-12 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer hover:border-orange-300"
          >
            {/* Background gradient decoration */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-100/40 to-amber-100/30 rounded-full -mr-36 -mt-36 opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-50/30 to-transparent rounded-full -ml-24 -mb-24 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            
            <div className="relative space-y-5 sm:space-y-6 z-10">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                  <Cpu className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-orange-600 font-bold mb-1.5">
                    高性能计算
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                    CUDA 算子开发
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-medium">
                深入 GPU 硬件架构，掌握 CUDA 编程模型与性能优化技巧，从基础算子到深度学习内核的高效实现
              </p>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-orange-100/50 group-hover:border-orange-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {cudaStats.total}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">核心算子</p>
                </div>
                <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-amber-100/50 group-hover:border-amber-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
                    {cudaStats.categories}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">算子分类</p>
                </div>
                <div className="bg-gradient-to-br from-white to-yellow-50/30 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-yellow-100/50 group-hover:border-yellow-200 transition-colors">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
                    {cudaStats.tags}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">技术标签</p>
                </div>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}

export default HomePage;


import { Link, useSearchParams } from "react-router-dom";
import { problems, getCategoryStats, getMethodStats, categoryNames, methodNames } from "@/data";
import { Difficulty, Category, SolutionMethod } from "@/types";
import { Circle, Filter, LayoutGrid, Lightbulb, CheckCircle2, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 从 URL 查询参数恢复状态
  const [classifyMode, setClassifyMode] = useState<'category' | 'method'>(
    (searchParams.get('mode') as 'category' | 'method') || 'category'
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    (searchParams.get('category') as Category) || "all"
  );
  const [selectedMethod, setSelectedMethod] = useState<SolutionMethod | "all">(
    (searchParams.get('method') as SolutionMethod) || "all"
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">(
    (searchParams.get('difficulty') as Difficulty) || "all"
  );
  
  // 使用 Zustand store
  const { isCompleted, isFavorite, isInProgress, getProgressStats } = useAppStore();
  const progressStats = getProgressStats(problems.length);
  
  // 更新 URL 查询参数
  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === 'category') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams, { replace: true });
  };
  
  // 保存滚动位置
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('homePage_scrollY', window.scrollY.toString());
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 恢复滚动位置
  useEffect(() => {
    const savedScrollY = sessionStorage.getItem('homePage_scrollY');
    if (savedScrollY) {
      // 延迟恢复滚动位置，确保页面已渲染
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollY, 10));
      }, 0);
    }
  }, []);
  
  // 获取统计
  const categoryStats = getCategoryStats();
  const methodStats = getMethodStats();
  
  // 过滤题目
  const filteredProblems = problems.filter((problem) => {
    const categoryMatch = classifyMode === 'category' 
      ? (selectedCategory === "all" || problem.category.includes(selectedCategory))
      : true;
    const methodMatch = classifyMode === 'method'
      ? (selectedMethod === "all" || problem.methods.includes(selectedMethod))
      : true;
    const difficultyMatch = selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;
    return categoryMatch && methodMatch && difficultyMatch;
  });
  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return "text-green-600 bg-green-50 border-green-200";
      case Difficulty.MEDIUM:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case Difficulty.HARD:
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const getDifficultyText = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return "简单";
      case Difficulty.MEDIUM:
        return "中等";
      case Difficulty.HARD:
        return "困难";
    }
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto">
      {/* 头部介绍 */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          LeetCode 热题 100 算法可视化
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          通过动画和图解深入理解算法原理，让抽象的代码变得直观易懂
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {progressStats.total}
          </div>
          <div className="text-gray-600">题目总数</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {progressStats.completed}
          </div>
          <div className="text-gray-600">已完成</div>
          {progressStats.total > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {progressStats.completionRate}%
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {progressStats.inProgress}
          </div>
          <div className="text-gray-600">进行中</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {progressStats.favorite}
          </div>
          <div className="text-gray-600">已收藏</div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">题目筛选</h2>
          </div>
          
          {/* 分类模式切换 */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setClassifyMode('category');
                setSelectedMethod('all');
                updateSearchParams('mode', 'category');
                updateSearchParams('method', 'all');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
                classifyMode === 'category'
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid size={16} />
              <span>按题型</span>
            </button>
            <button
              onClick={() => {
                setClassifyMode('method');
                setSelectedCategory('all');
                updateSearchParams('mode', 'method');
                updateSearchParams('category', 'all');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
                classifyMode === 'method'
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Lightbulb size={16} />
              <span>按解法</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* 难度筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">难度</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedDifficulty("all");
                  updateSearchParams('difficulty', 'all');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedDifficulty === "all"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                全部 ({problems.length})
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty(Difficulty.EASY);
                  updateSearchParams('difficulty', Difficulty.EASY);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedDifficulty === Difficulty.EASY
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                简单 ({problems.filter(p => p.difficulty === Difficulty.EASY).length})
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty(Difficulty.MEDIUM);
                  updateSearchParams('difficulty', Difficulty.MEDIUM);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedDifficulty === Difficulty.MEDIUM
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                }`}
              >
                中等 ({problems.filter(p => p.difficulty === Difficulty.MEDIUM).length})
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty(Difficulty.HARD);
                  updateSearchParams('difficulty', Difficulty.HARD);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedDifficulty === Difficulty.HARD
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                困难 ({problems.filter(p => p.difficulty === Difficulty.HARD).length})
              </button>
            </div>
          </div>
          
          {/* 题型或解法筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {classifyMode === 'category' ? '题型分类（数据结构）' : '解决方式（算法思想）'}
            </label>
            <div className="flex flex-wrap gap-2">
              {classifyMode === 'category' ? (
                // 题型分类
                <>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      updateSearchParams('category', 'all');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedCategory === "all"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    全部题型
                  </button>
                  {Array.from(categoryStats.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          updateSearchParams('category', category);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedCategory === category
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {categoryNames[category]} ({count})
                      </button>
                    ))}
                </>
              ) : (
                // 解决方式分类
                <>
                  <button
                    onClick={() => {
                      setSelectedMethod("all");
                      updateSearchParams('method', 'all');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedMethod === "all"
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    全部解法
                  </button>
                  {Array.from(methodStats.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([method, count]) => (
                      <button
                        key={method}
                        onClick={() => {
                          setSelectedMethod(method);
                          updateSearchParams('method', method);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedMethod === method
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {methodNames[method]} ({count})
                      </button>
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">题目列表</h2>
            <span className="text-sm text-gray-600">
              显示 {filteredProblems.length} / {problems.length} 道题目
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredProblems.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              没有找到符合条件的题目
            </div>
          ) : (
            filteredProblems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problem/${problem.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {isCompleted(problem.id) ? (
                    <CheckCircle2 className="text-green-600" size={20} fill="currentColor" />
                  ) : isInProgress(problem.id) ? (
                    <Circle className="text-yellow-600" size={20} fill="currentColor" />
                  ) : (
                    <Circle className="text-gray-300" size={20} />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-mono text-sm">
                      #{problem.leetcodeNumber}
                    </span>
                    <h3 className="text-lg font-medium text-gray-900">
                      {problem.title}
                    </h3>
                    {isFavorite(problem.id) && (
                      <Heart className="text-red-500" size={16} fill="currentColor" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {classifyMode === 'category' 
                      ? problem.category.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                          >
                            {categoryNames[cat]}
                          </span>
                        ))
                      : problem.methods.map((method) => (
                          <span
                            key={method}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200"
                          >
                            {methodNames[method]}
                          </span>
                        ))
                    }
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium border rounded-full ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {getDifficultyText(problem.difficulty)}
                  </span>
                </div>
              </div>
            </Link>
            ))
          )}
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 使用提示
        </h3>
        <ul className="text-blue-800 space-y-1 list-disc list-inside">
          <li>点击题目进入可视化页面</li>
          <li>使用播放/暂停按钮控制动画</li>
          <li>可以单步执行来仔细观察每一步的变化</li>
          <li>代码高亮会同步显示当前执行的代码行</li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;


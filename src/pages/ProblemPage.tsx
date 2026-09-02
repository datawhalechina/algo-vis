import { Suspense, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Heart, BookOpen, Loader2 } from "lucide-react";
import { getProblemById, problems } from "@/data";
import { Difficulty } from "@/types";
import { getVisualizer } from "@/problems";
import SolutionSection from "@/components/SolutionSection";
import { useAppStore } from "@/store/useAppStore";
import { useScrollRestore } from "@/hooks/useScrollRestore";

/**
 * 加载中的占位组件
 */
function VisualizerLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-gray-600">加载可视化组件中...</p>
      </div>
    </div>
  );
}

/**
 * 可视化组件渲染器
 * 根据题目 ID 动态渲染对应的可视化组件（支持懒加载）
 */
function VisualizerRenderer({ problemId }: { problemId: number }) {
  const VisualizerComponent = getVisualizer(problemId);
  
  if (!VisualizerComponent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="mb-2 text-lg font-semibold">可视化加载失败</p>
          <Link to="/problems" className="text-sm font-semibold text-primary-700 hover:underline">
            返回题目列表重新选择
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <Suspense fallback={<VisualizerLoading />}>
      <VisualizerComponent />
    </Suspense>
  );
}

function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentId = Number(id);
  const problem = getProblemById(currentId);
  const descriptionContainerRef = useRef<HTMLDivElement>(null);
  
  // 使用 Zustand store
  const {
    isCompleted,
    isFavorite,
    isInProgress,
    markAsCompleted,
    markAsInProgress,
    toggleFavorite,
  } = useAppStore();

  // 使用 Zustand store 管理左侧描述区域的滚动位置
  useScrollRestore(`/problem/${currentId}`, descriptionContainerRef);
  
  const completed = isCompleted(currentId);
  const favorite = isFavorite(currentId);
  const inProgress = isInProgress(currentId);
  
  // 找到当前题目在列表中的索引
  const currentIndex = problems.findIndex(p => p.id === currentId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < problems.length - 1;
  
  const handlePrevious = () => {
    if (hasPrevious) {
      navigate(`/problem/${problems[currentIndex - 1].id}`);
    }
  };
  
  const handleNext = () => {
    if (hasNext) {
      navigate(`/problem/${problems[currentIndex + 1].id}`);
    }
  };
  
  const handleComplete = () => {
    markAsCompleted(currentId);
    if (hasNext) {
      handleNext();
    } else {
      navigate('/');
    }
  };
  
  const handleStartLearning = () => {
    markAsInProgress(currentId);
  };

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">题目未找到</h2>
        <Link to="/" className="text-primary-600 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

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
    <div className="min-h-[calc(100vh-80px)] bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3">
          {/* 左侧：返回按钮 */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            <span>返回题目列表</span>
          </Link>
          
          {/* 中间：题目标题 */}
          <div className="order-3 flex min-w-0 basis-full flex-wrap items-center gap-3 lg:order-none lg:basis-auto">
            <span className="text-gray-500 font-mono text-sm">
              #{problem.leetcodeNumber}
            </span>
            <h1 className="break-words text-lg font-bold text-gray-900">
              {problem.title}
            </h1>
            <span
              className={`px-2 py-1 text-xs font-medium border rounded-full ${getDifficultyColor(
                problem.difficulty
              )}`}
            >
              {getDifficultyText(problem.difficulty)}
            </span>
          </div>
          
          {/* 右侧：导航按钮组 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              aria-label="上一题"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              <span className="hidden sm:inline">上一题</span>
            </button>
            
            {/* 收藏按钮 */}
            <button
              type="button"
              onClick={() => toggleFavorite(currentId)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                favorite
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              aria-label={favorite ? "取消收藏" : "收藏题目"}
              title={favorite ? "取消收藏" : "收藏"}
            >
              <Heart size={16} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
            </button>
            
            {/* 开始学习/学完按钮 */}
            {!completed ? (
              <button
                type="button"
                onClick={inProgress ? handleComplete : handleStartLearning}
                aria-label={inProgress ? "学完并进入下一题" : "开始学习"}
                className={`inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg transition shadow-sm ${
                  inProgress
                    ? "text-white bg-green-600 hover:bg-green-700"
                    : "text-white bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {inProgress ? (
                  <>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">学完</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">开始学习</span>
                  </>
                )}
              </button>
            ) : (
              <div className="inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 size={16} />
                <span>已完成</span>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasNext}
              aria-label="下一题"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">下一题</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 左右分栏布局 */}
      <div className="mx-auto grid max-w-screen-2xl lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.22fr)]">
        {/* 左侧：题目描述和题解 */}
        <div ref={descriptionContainerRef} className="min-w-0 border-b border-gray-200 bg-gray-50 lg:border-b-0 lg:border-r">
          <div className="space-y-6 p-4 sm:p-6">
            {/* 题目信息 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-2">
                    {problem.category.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </div>

            {/* 示例 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">示例</h3>
              {problem.examples.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="font-mono text-sm">
                    <div className="mb-2">
                      <span className="text-gray-600 font-semibold">输入：</span>
                      <span className="text-gray-900">{example.input}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-600 font-semibold">输出：</span>
                      <span className="text-gray-900">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-gray-600 font-semibold">解释：</span>
                        <span className="text-gray-900">{example.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 约束条件 */}
            {problem.constraints && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">提示</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="leading-relaxed">{constraint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 题解部分 - 使用统一配置 */}
            {problem.solution && <SolutionSection solution={problem.solution} />}
          </div>
        </div>

        {/* 右侧：可视化区域 */}
        <section className="flex min-h-[44rem] min-w-0 flex-col overflow-hidden bg-white" aria-label="交互式算法演示">
          <VisualizerRenderer problemId={problem.id} />
        </section>
      </div>
    </div>
  );
}

export default ProblemPage;

import { Suspense } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Loader2,
  Sparkles,
} from "lucide-react";
import { aiProblems, getAiProblemById } from "@/problemAI/data";
import { aiDomainNames } from "@/types/ai";
import { Difficulty } from "@/types";
import { getAiVisualizer } from "@/problemAI";
import { useAppStore } from "@/store/useAppStore";

function VisualizerLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-gray-600">加载 AI 可视化组件中...</p>
      </div>
    </div>
  );
}

function AiVisualizerRenderer({ problemId }: { problemId: number }) {
  const VisualizerComponent = getAiVisualizer(problemId);

  if (!VisualizerComponent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">该 AI 案例的可视化正在开发中...</p>
          <p className="text-sm text-gray-400">敬请期待 🚀</p>
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

function getDifficultyBadge(difficulty: Difficulty) {
  switch (difficulty) {
    case Difficulty.EASY:
      return {
        label: "简单",
        className: "text-green-600 bg-green-50 border border-green-200",
      };
    case Difficulty.MEDIUM:
      return {
        label: "中等",
        className: "text-yellow-600 bg-yellow-50 border border-yellow-200",
      };
    case Difficulty.HARD:
      return {
        label: "困难",
        className: "text-red-600 bg-red-50 border border-red-200",
      };
    default:
      return {
        label: difficulty,
        className: "text-gray-600 bg-gray-50 border border-gray-200",
      };
  }
}

function AiProblemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentId = Number(id);
  const problem = getAiProblemById(currentId);

  const {
    isCompleted,
    isFavorite,
    isInProgress,
    markAsCompleted,
    markAsInProgress,
    toggleFavorite,
  } = useAppStore();

  const completed = isCompleted(currentId);
  const favorite = isFavorite(currentId);
  const inProgress = isInProgress(currentId);

  const currentIndex = aiProblems.findIndex((item) => item.id === currentId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < aiProblems.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      navigate(`/ai/${aiProblems[currentIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      navigate(`/ai/${aiProblems[currentIndex + 1].id}`);
    }
  };

  const handleComplete = () => {
    markAsCompleted(currentId);
    if (hasNext) {
      handleNext();
    } else {
      navigate("/ai");
    }
  };

  const handleStartLearning = () => {
    markAsInProgress(currentId);
  };

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI 案例未找到</h2>
        <Link to="/ai" className="text-primary-600 hover:underline">
          返回 AI 模块首页
        </Link>
      </div>
    );
  }

  const badge = getDifficultyBadge(problem.difficulty);

  return (
    <div className="h-[calc(100vh-80px)]">
      <div className="px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <Link
            to="/ai"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
          >
            <ArrowLeft size={20} />
            <span>返回 AI 列表</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono text-sm flex items-center gap-1">
              <Cpu size={16} />
              AI#{problem.id}
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              {problem.title}
            </h2>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}
            >
              {badge.label}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full text-indigo-600 bg-indigo-50 border border-indigo-200">
              {aiDomainNames[problem.domain]}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>上一个</span>
            </button>

            <button
              onClick={() => toggleFavorite(currentId)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                favorite
                  ? "bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              title={favorite ? "取消收藏" : "收藏"}
            >
              <Sparkles size={16} />
            </button>

            {!completed ? (
              <button
                onClick={inProgress ? handleComplete : handleStartLearning}
                className={`inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg transition shadow-sm ${
                  inProgress
                    ? "text-white bg-green-600 hover:bg-green-700"
                    : "text-white bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {inProgress ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>学完</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={16} />
                    <span>开始学习</span>
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
              onClick={handleNext}
              disabled={!hasNext}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>下一个</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-56px)]">
        <div className="w-1/2 border-gray-200 overflow-y-auto bg-gray-50 border-r">
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                场景简介
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {problem.description}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                学习目标
              </h3>
              <ul className="space-y-2 text-gray-700 list-disc list-inside">
                {problem.learningGoals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                输入输出
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    输入
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    {problem.inputs.map((inputDesc) => (
                      <li key={inputDesc}>{inputDesc}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    输出
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    {problem.outputs.map((outputDesc) => (
                      <li key={outputDesc}>{outputDesc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                示例
              </h3>
              {problem.examples.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                  <div className="font-mono text-sm">
                    <div className="mb-2">
                      <span className="text-gray-600 font-semibold">
                        输入：
                      </span>
                      <span className="text-gray-900">{example.input}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-600 font-semibold">
                        输出：
                      </span>
                      <span className="text-gray-900">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-gray-600 font-semibold">
                          解释：
                        </span>
                        <span className="text-gray-900">
                          {example.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {problem.heroNote && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <div className="text-sm text-indigo-700">{problem.heroNote}</div>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 bg-white overflow-hidden flex flex-col">
          <AiVisualizerRenderer problemId={problem.id} />
        </div>
      </div>
    </div>
  );
}

export default AiProblemPage;


import { Suspense, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  BrainCircuit,
} from "lucide-react";
import { drlProblems, getDrlProblemById } from "@/datadrl/data";
import { drlCategoryNames } from "@/types/drl";
import { Difficulty } from "@/types";
import { getDrlVisualizer } from "@/problemsdrl";
import { useAppStore } from "@/store/useAppStore";
import { useScrollRestore } from "@/hooks/useScrollRestore";

function VisualizerLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-gray-600">加载 DRL 可视化组件中...</p>
      </div>
    </div>
  );
}

function DRLVisualizerRenderer({ problemId }: { problemId: number }) {
  const VisualizerComponent = getDrlVisualizer(problemId);

  if (!VisualizerComponent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">该算法的可视化正在开发中...</p>
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
      return { label: "简单", className: "text-green-600 bg-green-50 border border-green-200" };
    case Difficulty.MEDIUM:
      return { label: "中等", className: "text-yellow-600 bg-yellow-50 border border-yellow-200" };
    case Difficulty.HARD:
      return { label: "困难", className: "text-red-600 bg-red-50 border border-red-200" };
    default:
      return { label: difficulty, className: "text-gray-600 bg-gray-50 border border-gray-200" };
  }
}

function DRLProblemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentId = Number(id);
  const problem = getDrlProblemById(currentId);
  const descriptionContainerRef = useRef<HTMLDivElement>(null);

  const {
    isCompleted,
    isFavorite,
    isInProgress,
    markAsCompleted,
    markAsInProgress,
    toggleFavorite,
  } = useAppStore();

  useScrollRestore(`/drl/${currentId}`, descriptionContainerRef);

  const completed = isCompleted(currentId);
  const favorite = isFavorite(currentId);
  const inProgress = isInProgress(currentId);

  const currentIndex = drlProblems.findIndex((item) => item.id === currentId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < drlProblems.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) navigate(`/drl/${drlProblems[currentIndex - 1].id}`);
  };

  const handleNext = () => {
    if (hasNext) navigate(`/drl/${drlProblems[currentIndex + 1].id}`);
  };

  const handleComplete = () => {
    markAsCompleted(currentId);
    if (hasNext) {
      handleNext();
    } else {
      navigate("/drl");
    }
  };

  const handleStartLearning = () => {
    markAsInProgress(currentId);
  };

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">算法未找到</h2>
        <Link to="/drl" className="text-emerald-600 hover:underline">
          返回深度强化学习首页
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
            to="/drl"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition font-medium"
          >
            <ArrowLeft size={20} />
            <span>返回 DRL 列表</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono text-sm flex items-center gap-1">
              <BrainCircuit size={16} />
              DRL#{problem.id}
            </span>
            <h2 className="text-lg font-bold text-gray-900">{problem.title}</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
              {badge.label}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full text-emerald-600 bg-emerald-50 border border-emerald-200">
              {drlCategoryNames[problem.category]}
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
                    : "text-white bg-emerald-600 hover:bg-emerald-700"
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
        <div
          ref={descriptionContainerRef}
          className="w-1/2 border-gray-200 overflow-y-auto bg-gray-50 border-r"
        >
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">算法简介</h3>
              <p className="text-gray-700 leading-relaxed">{problem.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">学习目标</h3>
              <ul className="space-y-2 text-gray-700 list-disc list-inside">
                {problem.learningGoals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">输入输出</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">输入</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    {problem.inputs.map((inputDesc) => (
                      <li key={inputDesc}>{inputDesc}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">输出</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    {problem.outputs.map((outputDesc) => (
                      <li key={outputDesc}>{outputDesc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">示例</h3>
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

            {problem.heroNote && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                <div className="text-sm text-emerald-700">{problem.heroNote}</div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">标签</h3>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-white overflow-hidden flex flex-col">
          <DRLVisualizerRenderer problemId={problem.id} />
        </div>
      </div>
    </div>
  );
}

export default DRLProblemPage;

import { Suspense, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Route,
  Sparkles,
} from "lucide-react";
import { MathText } from "@/components/MathText";
import {
  DRL_CURRICULUM,
  getDrlChapterByProblemId,
} from "@/config/drlCurriculum";
import { getDrlLessonBlueprint } from "@/config/drlLessonBlueprints";
import { getDrlProblemById } from "@/datadrl/data";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import { getDrlVisualizer } from "@/problemsdrl";
import { useAppStore } from "@/store/useAppStore";
import { Difficulty } from "@/types";

const orderedProblemIds = DRL_CURRICULUM.flatMap((chapter) => chapter.problemIds);

function VisualizerLoading() {
  return (
    <div className="flex min-h-96 items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-gray-600">正在加载交互讲解...</p>
      </div>
    </div>
  );
}

function DRLVisualizerRenderer({ problemId }: { problemId: number }) {
  const VisualizerComponent = getDrlVisualizer(problemId);
  return (
    <Suspense fallback={<VisualizerLoading />}>
      <VisualizerComponent key={problemId} />
    </Suspense>
  );
}

function getDifficultyBadge(difficulty: Difficulty) {
  switch (difficulty) {
    case Difficulty.EASY:
      return { label: "入门", className: "border-green-200 bg-green-50 text-green-700" };
    case Difficulty.MEDIUM:
      return { label: "进阶", className: "border-amber-200 bg-amber-50 text-amber-700" };
    case Difficulty.HARD:
      return { label: "挑战", className: "border-red-200 bg-red-50 text-red-700" };
    default:
      return { label: difficulty, className: "border-gray-200 bg-gray-50 text-gray-700" };
  }
}

function DRLProblemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentId = Number(id);
  const problem = getDrlProblemById(currentId);
  const chapter = getDrlChapterByProblemId(currentId);
  const blueprint = getDrlLessonBlueprint(currentId);
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

  if (!problem || !chapter || !blueprint) {
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">课程未找到</h2>
        <Link to="/drl" className="font-semibold text-emerald-700 hover:underline">
          返回强化学习课程
        </Link>
      </div>
    );
  }

  const completed = isCompleted(currentId);
  const favorite = isFavorite(currentId);
  const inProgress = isInProgress(currentId);
  const currentIndex = orderedProblemIds.indexOf(currentId);
  const previousId = currentIndex > 0 ? orderedProblemIds[currentIndex - 1] : undefined;
  const nextId =
    currentIndex >= 0 && currentIndex < orderedProblemIds.length - 1
      ? orderedProblemIds[currentIndex + 1]
      : undefined;
  const badge = getDifficultyBadge(problem.difficulty);

  const handleComplete = () => {
    markAsCompleted(currentId);
    navigate(nextId ? `/drl/${nextId}` : "/drl");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/drl"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              返回课程目录
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => previousId && navigate(`/drl/${previousId}`)}
                disabled={!previousId}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span className="hidden sm:inline">上一课</span>
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(currentId)}
                className={`flex h-9 w-9 items-center justify-center rounded-md border transition ${
                  favorite
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
                aria-label={favorite ? "取消收藏" : "收藏课程"}
                title={favorite ? "取消收藏" : "收藏课程"}
              >
                <Sparkles size={17} aria-hidden="true" />
              </button>
              {!completed ? (
                <button
                  type="button"
                  onClick={inProgress ? handleComplete : () => markAsInProgress(currentId)}
                  className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-white transition ${
                    inProgress ? "bg-green-700 hover:bg-green-800" : "bg-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {inProgress ? <CheckCircle2 size={16} /> : <BookOpen size={16} />}
                  {inProgress ? "完成并继续" : "开始学习"}
                </button>
              ) : (
                <span className="inline-flex h-9 items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  已完成
                </span>
              )}
              <button
                type="button"
                onClick={() => nextId && navigate(`/drl/${nextId}`)}
                disabled={!nextId}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden sm:inline">下一课</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Route size={14} aria-hidden="true" />
                  第 {chapter.order} 章 · {chapter.title}
                </span>
                {chapter.kind === "extension" && (
                  <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
                    现代扩展
                  </span>
                )}
              </div>
              <h1 className="break-words text-xl font-bold text-gray-950 sm:text-2xl">
                {problem.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 font-mono text-xs text-gray-500">
                <BrainCircuit size={14} aria-hidden="true" />
                DRL#{problem.id}
              </span>
              <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${badge.className}`}>
                {badge.label}
              </span>
              <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
                先修：{chapter.prerequisite}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-screen-2xl lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.22fr)]">
        <div ref={descriptionContainerRef} className="border-b border-gray-200 bg-white lg:border-b-0 lg:border-r">
          <div className="divide-y divide-gray-200 px-5 sm:px-7">
            <section className="py-6">
              <p className="mb-2 text-xs font-bold uppercase text-emerald-700">本课要解决什么</p>
              <div className="text-base leading-8 text-gray-700">
                <MathText text={problem.description} />
              </div>
            </section>

            <section className="py-6">
              <h2 className="mb-3 text-base font-bold text-gray-900">核心公式</h2>
              <div className="max-w-full overflow-x-auto rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-5 text-center text-lg text-gray-950">
                <MathText text={`$$${blueprint.formula}$$`} />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {blueprint.takeaway}
              </p>
            </section>

            <section className="py-6">
              <h2 className="mb-4 text-base font-bold text-gray-900">学完你会</h2>
              <ol className="space-y-3">
                {problem.learningGoals.map((goal, index) => (
                  <li key={goal} className="flex gap-3 text-sm leading-6 text-gray-700">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                      {index + 1}
                    </span>
                    <span className="min-w-0"><MathText text={goal} /></span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid gap-6 py-6 sm:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-bold text-gray-900">输入</h2>
                <ul className="space-y-2 text-sm leading-6 text-gray-600">
                  {problem.inputs.map((inputDescription) => (
                    <li key={inputDescription} className="border-l-2 border-sky-300 pl-3">
                      <MathText text={inputDescription} />
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-bold text-gray-900">输出</h2>
                <ul className="space-y-2 text-sm leading-6 text-gray-600">
                  {problem.outputs.map((outputDescription) => (
                    <li key={outputDescription} className="border-l-2 border-emerald-300 pl-3">
                      <MathText text={outputDescription} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="py-6">
              <h2 className="mb-4 text-base font-bold text-gray-900">看一个例子</h2>
              <div className="space-y-4">
                {problem.examples.map((example, index) => (
                  <div key={`${problem.id}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6">
                    <div className="grid gap-3">
                      <div>
                        <span className="mr-2 font-semibold text-gray-500">输入</span>
                        <span className="text-gray-900"><MathText text={example.input} /></span>
                      </div>
                      <div>
                        <span className="mr-2 font-semibold text-gray-500">输出</span>
                        <span className="text-gray-900"><MathText text={example.output} /></span>
                      </div>
                      {example.explanation && (
                        <p className="border-t border-gray-200 pt-3 text-gray-600">
                          <MathText text={example.explanation} />
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {problem.heroNote && (
              <aside className="py-6">
                <div className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                  <MathText text={problem.heroNote} />
                </div>
              </aside>
            )}

            <section className="py-6">
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="min-w-0 bg-white" aria-label="交互式步骤讲解">
          <DRLVisualizerRenderer problemId={problem.id} />
        </section>
      </div>
    </div>
  );
}

export default DRLProblemPage;

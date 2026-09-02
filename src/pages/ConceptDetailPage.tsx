import { Suspense, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Loader2,
  Sparkles,
} from "lucide-react";
import { MathText } from "@/components/MathText";
import { getConceptLessonBlueprint } from "@/config/conceptLessonBlueprints";
import { concepts, getBookById, getConceptById } from "@/dataconcepts/data";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import { getConceptVisualizer } from "@/concepts";
import { useAppStore } from "@/store/useAppStore";
import { Difficulty } from "@/types";
import { conceptCategoryNames } from "@/types/concepts";

function getDifficultyBadge(difficulty: Difficulty) {
  switch (difficulty) {
    case Difficulty.EASY:
      return { label: "入门", className: "border-green-200 bg-green-50 text-green-700" };
    case Difficulty.MEDIUM:
      return { label: "进阶", className: "border-amber-200 bg-amber-50 text-amber-700" };
    case Difficulty.HARD:
      return { label: "挑战", className: "border-red-200 bg-red-50 text-red-700" };
  }
}

function ConceptVisualizer({ conceptId }: { conceptId: number }) {
  const Visualizer = getConceptVisualizer(conceptId);
  if (!Visualizer) return null;
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-96 items-center justify-center text-gray-600">
          <Loader2 className="mr-2 animate-spin" aria-hidden="true" />
          正在加载交互讲解...
        </div>
      )}
    >
      <Visualizer key={conceptId} />
    </Suspense>
  );
}

export default function ConceptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const conceptId = Number(id);
  const concept = getConceptById(conceptId);
  const blueprint = getConceptLessonBlueprint(conceptId);
  const book = concept ? getBookById(concept.bookId) : undefined;
  const descriptionRef = useRef<HTMLDivElement>(null);
  const {
    isCompleted,
    isFavorite,
    isInProgress,
    markAsCompleted,
    markAsInProgress,
    toggleFavorite,
  } = useAppStore();

  useScrollRestore(`/concepts/${conceptId}`, descriptionRef);

  if (!concept || !blueprint || !book) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">概念未找到</h1>
        <Link to="/concepts" className="font-semibold text-blue-700 hover:underline">返回知识书架</Link>
      </div>
    );
  }

  const orderedIds = concepts.map((item) => item.id);
  const currentIndex = orderedIds.indexOf(conceptId);
  const previousId = currentIndex > 0 ? orderedIds[currentIndex - 1] : undefined;
  const nextId = currentIndex < orderedIds.length - 1 ? orderedIds[currentIndex + 1] : undefined;
  const completed = isCompleted(conceptId);
  const inProgress = isInProgress(conceptId);
  const favorite = isFavorite(conceptId);
  const badge = getDifficultyBadge(concept.difficulty);

  const completeLesson = () => {
    markAsCompleted(conceptId);
    navigate(nextId ? `/concepts/${nextId}` : "/concepts");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to={`/concepts/book/${book.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              返回 {book.title}
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => previousId && navigate(`/concepts/${previousId}`)}
                disabled={!previousId}
                aria-label="上一个概念"
                className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 disabled:opacity-40"
                title="上一个概念"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                <span className="hidden sm:inline">上一节</span>
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(conceptId)}
                className={`flex h-9 w-9 items-center justify-center rounded-md border ${favorite ? "border-amber-300 bg-amber-50 text-amber-700" : "border-gray-300 bg-white text-gray-600"}`}
                aria-label={favorite ? "取消收藏" : "收藏概念"}
                title={favorite ? "取消收藏" : "收藏概念"}
              >
                <Sparkles size={17} aria-hidden="true" />
              </button>
              {!completed ? (
                <button
                  type="button"
                  onClick={inProgress ? completeLesson : () => markAsInProgress(conceptId)}
                  className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-white ${inProgress ? "bg-green-700" : "bg-blue-700"}`}
                >
                  {inProgress ? <CheckCircle2 size={16} /> : <BookOpen size={16} />}
                  {inProgress ? "完成并继续" : "开始学习"}
                </button>
              ) : (
                <span className="inline-flex h-9 items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={16} aria-hidden="true" />已完成
                </span>
              )}
              <button
                type="button"
                onClick={() => nextId && navigate(`/concepts/${nextId}`)}
                disabled={!nextId}
                aria-label="下一个概念"
                className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 disabled:opacity-40"
                title="下一个概念"
              >
                <span className="hidden sm:inline">下一节</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold text-blue-700">{book.title}</p>
              <h1 className="break-words text-xl font-bold text-gray-950 sm:text-2xl">{concept.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 font-mono text-xs text-gray-500">
                <Layers3 size={14} aria-hidden="true" />概念 #{concept.id}
              </span>
              <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                {conceptCategoryNames[concept.category]}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-screen-2xl lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.22fr)]">
        <div ref={descriptionRef} className="min-w-0 border-b border-gray-200 bg-white lg:border-b-0 lg:border-r">
          <div className="divide-y divide-gray-200 px-5 sm:px-7">
            <section className="py-6">
              <p className="mb-2 text-xs font-bold text-blue-700">这个概念解决什么</p>
              <p className="text-base leading-8 text-gray-700">{concept.description}</p>
            </section>
            <section className="py-6">
              <h2 className="mb-3 text-base font-bold text-gray-900">核心公式</h2>
              <div className="overflow-x-auto rounded-lg border border-blue-200 bg-blue-50 px-4 py-5 text-center text-lg">
                <MathText text={`$$${blueprint.formula}$$`} />
              </div>
            </section>
            <section className="py-6">
              <h2 className="mb-4 text-base font-bold text-gray-900">学完你会</h2>
              <ol className="space-y-3">
                {concept.keyPoints.map((point, index) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-gray-700">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ol>
            </section>
            <section className="py-6">
              <h2 className="mb-3 text-sm font-bold text-gray-900">继续串联</h2>
              <div className="flex flex-wrap gap-2">
                {concept.relatedConcepts.map((related) => (
                  <span key={related} className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">{related}</span>
                ))}
              </div>
            </section>
            {concept.heroNote && (
              <aside className="py-6">
                <div className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">{concept.heroNote}</div>
              </aside>
            )}
          </div>
        </div>
        <section className="min-w-0 bg-white" aria-label="交互式概念讲解">
          <ConceptVisualizer conceptId={conceptId} />
        </section>
      </div>
    </div>
  );
}

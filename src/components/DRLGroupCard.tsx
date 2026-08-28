import { ArrowUpRight, CheckCircle2, Circle, Clock3, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { DRLProblem } from "@/types/drl";

interface DRLGroupCardProps {
  title: string;
  count?: number;
  problems: DRLProblem[];
  chapterNumber?: number;
  summary?: string;
  prerequisite?: string;
  kind?: "course" | "extension";
  anchorId?: string;
}

export function DRLGroupCard({
  title,
  count,
  problems,
  chapterNumber,
  summary,
  prerequisite,
  kind = "course",
  anchorId,
}: DRLGroupCardProps) {
  const { isCompleted, isInProgress } = useAppStore();
  const completedCount = problems.filter((problem) => isCompleted(problem.id)).length;
  const lessonCount = count ?? problems.length;
  const isExtension = kind === "extension";

  return (
    <article
      id={anchorId}
      className="flex scroll-mt-6 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-5">
        <div className="flex items-start gap-4">
          {chapterNumber !== undefined && (
            <span
              className={`flex h-10 w-10 flex-none items-center justify-center rounded-md text-sm font-bold ${
                isExtension
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-700 text-white"
              }`}
            >
              {String(chapterNumber).padStart(2, "0")}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold leading-6 text-gray-900 sm:text-lg">
                {title}
              </h3>
              {isExtension && (
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                  现代扩展
                </span>
              )}
            </div>
            {summary && (
              <p className="mt-2 text-sm leading-6 text-gray-600">{summary}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">{lessonCount} 节</span>
          {prerequisite && (
            <span className="inline-flex items-center gap-1.5">
              <Route size={14} aria-hidden="true" />
              先修：{prerequisite}
            </span>
          )}
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 size={14} aria-hidden="true" />
              已完成 {completedCount}/{lessonCount}
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {problems.map((problem, index) => {
          const completed = isCompleted(problem.id);
          const inProgress = isInProgress(problem.id);
          return (
            <Link
              key={problem.id}
              to={`/drl/${problem.id}`}
              className="group flex min-h-14 items-center gap-3 px-5 py-3 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
            >
              {completed ? (
                <CheckCircle2 className="flex-none text-emerald-600" size={18} aria-hidden="true" />
              ) : inProgress ? (
                <Clock3 className="flex-none text-amber-600" size={18} aria-hidden="true" />
              ) : (
                <Circle className="flex-none text-gray-300" size={18} aria-hidden="true" />
              )}
              <span className="flex-none text-xs font-semibold text-gray-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-gray-800 group-hover:text-emerald-800">
                {problem.title}
              </span>
              <ArrowUpRight
                className="flex-none text-gray-300 transition-colors group-hover:text-emerald-600"
                size={16}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </article>
  );
}

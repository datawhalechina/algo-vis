import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Circle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { DRL_CURRICULUM } from "@/config/drlCurriculum";
import { drlProblems } from "@/datadrl/data";

interface DRLSummaryCardProps {
  totalCount: number;
}

export function DRLSummaryCard({ totalCount }: DRLSummaryCardProps) {
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const problemById = useMemo(
    () => new Map(drlProblems.map((problem) => [problem.id, problem])),
    [],
  );
  const chapters = DRL_CURRICULUM.filter((chapter) => chapter.kind === "course");

  return (
    <div className="flex max-h-[40rem] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-none items-center justify-between border-b border-gray-200 bg-emerald-50 px-5 py-4">
        <div>
          <h3 className="font-bold text-gray-900">强化学习基础主线</h3>
          <p className="mt-1 text-xs text-gray-600">按先修关系组织的 12 章课程</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs font-semibold text-emerald-700">
            {totalCount} 节
          </span>
          <Link
            to="/drl?track=course"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-white transition hover:bg-emerald-800"
            aria-label="查看强化学习完整课程"
            title="查看完整课程"
          >
            <ExternalLink size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
        {chapters.map((chapter) => {
          const isOpen = openChapter === chapter.id;
          const problems = chapter.problemIds.flatMap((problemId) => {
            const problem = problemById.get(problemId);
            return problem ? [problem] : [];
          });

          return (
            <div key={chapter.id}>
              <button
                type="button"
                onClick={() => setOpenChapter(isOpen ? null : chapter.id)}
                className="group flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
                aria-expanded={isOpen}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-xs font-bold text-emerald-700">
                    {String(chapter.order).padStart(2, "0")}
                  </span>
                  <span className="truncate text-sm font-semibold text-gray-800 group-hover:text-emerald-700">
                    {chapter.shortTitle}
                  </span>
                </span>
                {isOpen ? (
                  <ChevronDown size={15} className="flex-none text-emerald-600" />
                ) : (
                  <ChevronRight size={15} className="flex-none text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50 py-1">
                  {problems.map((problem) => (
                    <Link
                      key={problem.id}
                      to={`/drl/${problem.id}`}
                      className="flex items-center gap-2 px-6 py-2 text-sm text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <Circle size={6} className="flex-none fill-emerald-400 text-emerald-400" />
                      <span className="truncate">{problem.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

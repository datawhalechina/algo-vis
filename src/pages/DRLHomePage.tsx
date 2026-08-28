import { useMemo, useState } from "react";
import { ExternalLink, Filter, Route, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DRLGroupCard } from "@/components/DRLGroupCard";
import {
  DRL_CURRICULUM,
  DRL_SOURCE_URL,
  DRLCurriculumKind,
} from "@/config/drlCurriculum";
import { drlProblems } from "@/datadrl/data";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import { useAppStore } from "@/store/useAppStore";

type TrackFilter = "all" | DRLCurriculumKind;

const trackOptions: Array<{ value: TrackFilter; label: string }> = [
  { value: "all", label: "全部章节" },
  { value: "course", label: "基础主线" },
  { value: "extension", label: "现代扩展" },
];

function DRLHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTrack = searchParams.get("track");
  const [selectedTrack, setSelectedTrack] = useState<TrackFilter>(
    initialTrack === "course" || initialTrack === "extension" ? initialTrack : "all",
  );
  const completedProblems = useAppStore((state) => state.completedProblems);

  useScrollRestore("/drl");

  const problemById = useMemo(
    () => new Map(drlProblems.map((problem) => [problem.id, problem])),
    [],
  );

  const visibleChapters = useMemo(
    () =>
      DRL_CURRICULUM.filter(
        (chapter) => selectedTrack === "all" || chapter.kind === selectedTrack,
      ),
    [selectedTrack],
  );

  const completedCount = drlProblems.filter((problem) =>
    completedProblems.has(problem.id),
  ).length;

  const selectTrack = (track: TrackFilter) => {
    setSelectedTrack(track);
    const next = new URLSearchParams(searchParams);
    if (track === "all") next.delete("track");
    else next.set("track", track);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 pb-14 sm:px-6 lg:px-10">
      <header className="border-b border-gray-200 py-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Route size={18} aria-hidden="true" />
              从直觉到系统实现
            </div>
            <h1 className="text-3xl font-bold text-gray-950 sm:text-4xl">
              深度强化学习可视化课程
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              沿推荐路径掌握价值学习、策略梯度与 Actor-Critic，再进入 LLM 对齐和分布式训练系统。每课从直觉、符号和公式逐步走到完整推演。
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-4 py-3 text-center sm:px-6">
              <div className="text-xl font-bold text-gray-950">{DRL_CURRICULUM.length}</div>
              <div className="mt-1 text-xs text-gray-500">章节</div>
            </div>
            <div className="px-4 py-3 text-center sm:px-6">
              <div className="text-xl font-bold text-gray-950">{drlProblems.length}</div>
              <div className="mt-1 text-xs text-gray-500">课程</div>
            </div>
            <div className="px-4 py-3 text-center sm:px-6">
              <div className="text-xl font-bold text-emerald-700">{completedCount}</div>
              <div className="mt-1 text-xs text-gray-500">完成</div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-7" aria-labelledby="recommended-path-title">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="recommended-path-title" className="text-lg font-bold text-gray-900">
              推荐学习路径
            </h2>
            <p className="mt-1 text-sm text-gray-500">课程顺序体现概念依赖，各章也可独立进入。</p>
          </div>
          <a
            href={DRL_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            参考：王树森 DRL 课程
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {DRL_CURRICULUM.map((chapter) => (
            <a
              key={chapter.id}
              href={`#chapter-${chapter.id}`}
              className={`flex min-w-40 items-center gap-3 rounded-md border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                chapter.kind === "extension"
                  ? "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400"
                  : "border-gray-200 bg-white text-gray-700 hover:border-emerald-400"
              }`}
            >
              <span className="text-xs font-bold opacity-60">
                {String(chapter.order).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold leading-5">{chapter.shortTitle}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-200 py-5" aria-label="课程筛选">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter size={17} aria-hidden="true" />
            查看范围
          </div>
          <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-100 p-1 sm:w-auto">
            {trackOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectTrack(option.value)}
                className={`min-w-0 flex-1 rounded-md px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  selectedTrack === option.value
                    ? "bg-white text-gray-950 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                aria-pressed={selectedTrack === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-950">课程目录</h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedTrack === "extension" ? "现代强化学习工程专题" : "每章标明先修知识与学习进度"}
            </p>
          </div>
          <span className="text-sm text-gray-500">{visibleChapters.length} 章</span>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
          {visibleChapters.map((chapter) => (
            <DRLGroupCard
              key={chapter.id}
              anchorId={`chapter-${chapter.id}`}
              title={chapter.title}
              chapterNumber={chapter.order}
              summary={chapter.summary}
              prerequisite={chapter.prerequisite}
              kind={chapter.kind}
              problems={chapter.problemIds.flatMap((problemId) => {
                const problem = problemById.get(problemId);
                return problem ? [problem] : [];
              })}
            />
          ))}
        </div>
      </main>

      <aside className="flex items-start gap-3 border-t border-gray-200 pt-6 text-sm leading-6 text-gray-600">
        <Sparkles className="mt-0.5 flex-none text-amber-600" size={18} aria-hidden="true" />
        <p>
          前 12 章按王树森公开课程结构重新组织；“LLM RL 对齐”和“LLM 分布式强化学习系统”是面向当前工程实践补充的现代扩展。
        </p>
      </aside>
    </div>
  );
}

export default DRLHomePage;

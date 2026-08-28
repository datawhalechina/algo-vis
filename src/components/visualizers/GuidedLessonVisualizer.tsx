import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Bug,
  CheckCircle2,
  Lightbulb,
  Route,
  Sigma,
} from "lucide-react";
import { MathText } from "@/components/MathText";
import {
  createGuidedLessonSteps,
  type GuidedLessonBlueprint,
  type GuidedLessonPhase,
} from "@/config/guidedLessonTypes";
import { useVisualization } from "@/hooks/useVisualization";
import type { ProblemInput } from "@/types/visualization";
import { VisualizationLayout } from "./VisualizationLayout";

interface GuidedLessonVisualizerProps {
  blueprint: GuidedLessonBlueprint | undefined;
  sectionLabel: string;
}

const phaseMeta: Record<
  GuidedLessonPhase,
  { label: string; icon: typeof Lightbulb; badge: string }
> = {
  intuition: { label: "直觉", icon: Lightbulb, badge: "border-sky-200 bg-sky-50 text-sky-800" },
  symbols: { label: "符号", icon: BookOpenCheck, badge: "border-violet-200 bg-violet-50 text-violet-800" },
  formula: { label: "公式", icon: Sigma, badge: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  transition: { label: "逐步推演", icon: Route, badge: "border-blue-200 bg-blue-50 text-blue-800" },
  reflection: { label: "误区", icon: AlertTriangle, badge: "border-amber-200 bg-amber-50 text-amber-800" },
  debug: { label: "调试", icon: Bug, badge: "border-rose-200 bg-rose-50 text-rose-800" },
  summary: { label: "小结", icon: CheckCircle2, badge: "border-teal-200 bg-teal-50 text-teal-800" },
};

export function GuidedLessonVisualizer({
  blueprint,
  sectionLabel,
}: GuidedLessonVisualizerProps) {
  const lessonSteps = useMemo(() => createGuidedLessonSteps(blueprint), [blueprint]);
  const generateSteps = useMemo(
    () => () =>
      lessonSteps.map((step, index) => ({
        id: index,
        description: step.description,
        data: {},
        variables: {
          phase: step.phase,
          stepTitle: step.title,
          formula: step.formula ?? "",
          activeFlowIndex: step.activeFlowIndex ?? 0,
          finished: step.finished ?? false,
        },
      })),
    [lessonSteps],
  );
  const visualization = useVisualization<ProblemInput>(generateSteps, {});

  if (!blueprint) {
    return (
      <div className="flex min-h-80 items-center justify-center p-8 text-center text-gray-600">
        该课程内容不存在，请返回列表重新选择。
      </div>
    );
  }

  const current = lessonSteps[visualization.currentStep] ?? lessonSteps[0];
  const currentPhase = current?.phase ?? "intuition";
  const PhaseIcon = phaseMeta[currentPhase].icon;
  const activeFlowIndex = current?.activeFlowIndex ?? 0;

  return (
    <div data-testid="guided-lesson" data-lesson-id={blueprint.id} className="h-full min-h-[560px]">
      <VisualizationLayout
        visualization={visualization}
        inputTypes={[]}
        inputFields={[]}
      >
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-700">{sectionLabel}</p>
              <h3 className="mt-1 text-base font-bold text-gray-900 sm:text-lg">{blueprint.title}</h3>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${phaseMeta[currentPhase].badge}`}>
              <PhaseIcon size={16} aria-hidden="true" />
              {phaseMeta[currentPhase].label}
            </span>
          </header>

          <div
            className="p-4 sm:p-6"
            data-testid="lesson-stage"
            data-current-step={visualization.currentStep}
            data-current-phase={currentPhase}
            data-active-flow-index={currentPhase === "transition" ? activeFlowIndex : undefined}
          >
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              当前步骤：{current?.title}
            </p>
            {currentPhase === "intuition" && (
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-5">
                  <p className="mb-2 text-xs font-bold text-sky-700">从一个具体画面开始</p>
                  <p className="leading-7 text-gray-800">{blueprint.intuition}</p>
                </div>
                <ArrowRight className="mx-auto rotate-90 text-sky-500 md:rotate-0" aria-hidden="true" />
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-5">
                  <p className="mb-2 text-xs font-bold text-teal-700">今天要带走的结论</p>
                  <p className="leading-7 text-gray-800">{blueprint.takeaway}</p>
                </div>
              </div>
            )}

            {currentPhase === "symbols" && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {blueprint.symbols.map((item) => (
                  <div key={item.symbol} className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 min-h-10 overflow-x-auto text-lg text-violet-800">
                      <MathText text={`$${item.symbol}$`} />
                    </div>
                    <p className="text-sm leading-6 text-gray-600">{item.meaning}</p>
                  </div>
                ))}
              </div>
            )}

            {(currentPhase === "formula" || currentPhase === "summary") && (
              <div className="space-y-4">
                <div
                  data-testid="lesson-formula"
                  className="overflow-x-auto rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-base text-gray-900 sm:text-xl"
                >
                  <MathText text={`$$${blueprint.formula}$$`} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {blueprint.symbols.map((item) => (
                    <div key={item.symbol} className="min-w-0 rounded-md border border-gray-200 p-3">
                      <div className="overflow-x-auto font-semibold text-emerald-800">
                        <MathText text={`$${item.symbol}$`} />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{item.meaning}</p>
                    </div>
                  ))}
                </div>
                {currentPhase === "summary" && (
                  <p className="rounded-lg bg-teal-700 px-5 py-4 font-medium leading-7 text-white">
                    {blueprint.takeaway}
                  </p>
                )}
              </div>
            )}

            {currentPhase === "transition" && (
              <div>
                <div className="mb-5 overflow-x-auto rounded-lg bg-gray-950 px-4 py-5 text-center text-base text-white">
                  <MathText text={`$$${blueprint.formula}$$`} />
                </div>
                <div className="flex w-full max-w-full items-center gap-2 overflow-x-auto pb-2">
                  {blueprint.flow.map((label, index) => (
                    <div key={`${index}-${label}`} className="flex flex-none items-center gap-2">
                      <button
                        type="button"
                        data-testid={`flow-joint-${index}`}
                        onClick={() => visualization.jumpToStep(3 + index)}
                        aria-pressed={index === activeFlowIndex}
                        className={`w-36 flex-none rounded-lg border px-3 py-4 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          index === activeFlowIndex
                            ? "border-blue-700 bg-blue-700 text-white shadow-md"
                            : index < activeFlowIndex
                            ? "border-teal-200 bg-teal-50 text-teal-800"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                        }`}
                      >
                        <span className="mb-2 block text-xs opacity-70">关节 {index + 1}</span>
                        {label}
                      </button>
                      {index < blueprint.flow.length - 1 && (
                        <ArrowRight size={18} className="flex-none text-gray-300" aria-hidden="true" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentPhase === "reflection" && (
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <AlertTriangle aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-700">常见误区</p>
                  <p className="mt-2 text-base leading-7 text-gray-800">{blueprint.misconception}</p>
                </div>
              </div>
            )}

            {currentPhase === "debug" && (
              <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <Bug aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-700">调试检查单</p>
                  <p className="mt-2 text-base leading-7 text-gray-800">{blueprint.debugTip}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </VisualizationLayout>
    </div>
  );
}

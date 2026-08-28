import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Lightbulb,
  Route,
  Sigma,
} from "lucide-react";
import { MathText } from "@/components/MathText";
import {
  createGuidedLessonSteps,
  getDrlLessonBlueprint,
  GuidedLessonPhase,
} from "@/config/drlLessonBlueprints";
import { useVisualization } from "@/hooks/useVisualization";
import { ProblemInput } from "@/types/visualization";
import { VisualizationLayout } from "./VisualizationLayout";

const phaseMeta: Record<
  GuidedLessonPhase,
  { label: string; icon: typeof Lightbulb }
> = {
  intuition: { label: "直觉", icon: Lightbulb },
  symbols: { label: "符号", icon: BookOpenCheck },
  formula: { label: "公式", icon: Sigma },
  transition: { label: "推演", icon: Route },
  reflection: { label: "辨析", icon: AlertTriangle },
  summary: { label: "小结", icon: CheckCircle2 },
};

function GuidedDRLLessonVisualizer() {
  const { id } = useParams<{ id: string }>();
  const problemId = Number(id);
  const blueprint = getDrlLessonBlueprint(problemId);
  const generateSteps = useMemo(
    () => () =>
      createGuidedLessonSteps(problemId).map((step, index) => ({
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
    [problemId],
  );
  const visualization = useVisualization<ProblemInput>(generateSteps, {});

  if (!blueprint) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-gray-600">
        该课程内容暂不可用。
      </div>
    );
  }

  const current = createGuidedLessonSteps(problemId)[visualization.currentStep];
  const currentPhase = current?.phase ?? "intuition";
  const PhaseIcon = phaseMeta[currentPhase].icon;
  const activeFlowIndex = current?.activeFlowIndex ?? 0;

  return (
    <VisualizationLayout
      visualization={visualization}
      inputTypes={[]}
      inputFields={[]}
    >
      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-700">交互讲解</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{blueprint.title}</h3>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <PhaseIcon size={16} aria-hidden="true" />
            {phaseMeta[currentPhase].label}
          </span>
        </header>

        <div className="p-5 sm:p-6">
          {currentPhase === "intuition" && (
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-5">
                <p className="mb-2 text-xs font-bold text-sky-700">现实场景</p>
                <p className="leading-7 text-gray-800">{blueprint.intuition}</p>
              </div>
              <ArrowRight className="mx-auto rotate-90 text-sky-500 md:rotate-0" aria-hidden="true" />
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                <p className="mb-2 text-xs font-bold text-emerald-700">抽象目标</p>
                <p className="leading-7 text-gray-800">{blueprint.takeaway}</p>
              </div>
            </div>
          )}

          {currentPhase === "symbols" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {blueprint.symbols.map((item) => (
                <div key={item.symbol} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 min-h-10 overflow-x-auto text-lg text-emerald-800">
                    <MathText text={`$${item.symbol}$`} />
                  </div>
                  <p className="text-sm leading-6 text-gray-600">{item.meaning}</p>
                </div>
              ))}
            </div>
          )}

          {(currentPhase === "formula" || currentPhase === "summary") && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-lg text-gray-900 sm:text-xl">
                <MathText text={`$$${blueprint.formula}$$`} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {blueprint.symbols.map((item) => (
                  <div key={item.symbol} className="rounded-md border border-gray-200 p-3">
                    <div className="font-semibold text-emerald-800"><MathText text={`$${item.symbol}$`} /></div>
                    <p className="mt-1 text-sm text-gray-600">{item.meaning}</p>
                  </div>
                ))}
              </div>
              {currentPhase === "summary" && (
                <p className="rounded-lg bg-emerald-700 px-5 py-4 font-medium leading-7 text-white">
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
              <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
                {blueprint.flow.map((label, index) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className={`w-32 rounded-lg border px-3 py-4 text-center text-sm font-semibold transition ${
                        index === activeFlowIndex
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                          : index < activeFlowIndex
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-gray-200 bg-white text-gray-500"
                      }`}
                    >
                      <span className="mb-2 block text-xs opacity-70">阶段 {index + 1}</span>
                      {label}
                    </div>
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
                <p className="text-xs font-bold uppercase text-amber-700">常见误区</p>
                <p className="mt-2 text-base leading-7 text-gray-800">{blueprint.misconception}</p>
                <p className="mt-4 border-l-2 border-emerald-500 pl-4 text-sm leading-6 text-gray-600">
                  回到前面的公式或推演步骤，对照变量与数据流重新检查一次。
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </VisualizationLayout>
  );
}

export default GuidedDRLLessonVisualizer;

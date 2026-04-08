import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateProsodySteps, SentenceType } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface ProsodyInput extends ProblemInput {
  sentence_type: string;
}

const PHASE_MAP: Record<string, { label: string; color: string }> = {
  init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
  f0_extract: { label: "F0提取", color: "bg-orange-100 text-orange-700" },
  rhythm: { label: "节奏分析", color: "bg-amber-100 text-amber-700" },
  stress: { label: "重音标注", color: "bg-red-100 text-red-700" },
  analyze: { label: "统计计算", color: "bg-blue-100 text-blue-700" },
  complete: { label: "分析完成", color: "bg-emerald-100 text-emerald-700" },
};

const PHASE_ORDER = ["init", "f0_extract", "rhythm", "stress", "analyze", "complete"];

function F0Chart({
  f0Values,
  stressMarks,
}: {
  f0Values: number[];
  stressMarks: boolean[];
}) {
  if (!f0Values || f0Values.length === 0) return null;

  const minF0 = Math.min(...f0Values);
  const maxF0 = Math.max(...f0Values);
  const rangeF0 = maxF0 - minF0 || 1;
  const chartH = 80;
  const chartW = f0Values.length * 20;

  const points = f0Values
    .map((v, i) => {
      const x = i * 20 + 10;
      const y = chartH - ((v - minF0) / rangeF0) * (chartH - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg width={chartW} height={chartH + 24} className="block">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = chartH - t * (chartH - 10) - 5;
          const hz = Math.round(minF0 + t * rangeF0);
          return (
            <g key={t}>
              <line x1={0} y1={y} x2={chartW} y2={y} stroke="#e5e7eb" strokeWidth={1} />
              <text x={2} y={y - 2} fontSize={8} fill="#9ca3af">
                {hz}Hz
              </text>
            </g>
          );
        })}

        {/* Stress highlights */}
        {stressMarks.map((stressed, i) =>
          stressed ? (
            <rect
              key={i}
              x={i * 20}
              y={0}
              width={20}
              height={chartH}
              fill="rgba(251,146,60,0.15)"
              rx={2}
            />
          ) : null
        )}

        {/* F0 line */}
        <polyline
          points={points}
          fill="none"
          stroke="#f97316"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Dots */}
        {f0Values.map((v, i) => {
          const x = i * 20 + 10;
          const y = chartH - ((v - minF0) / rangeF0) * (chartH - 10) - 5;
          const isRising =
            i < f0Values.length - 1 ? f0Values[i + 1] > v : false;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={stressMarks[i] ? 5 : 3}
              fill={isRising ? "#ef4444" : "#3b82f6"}
              stroke="#fff"
              strokeWidth={1}
            />
          );
        })}

        {/* Frame labels */}
        {f0Values.map((_, i) => (
          <text
            key={i}
            x={i * 20 + 10}
            y={chartH + 16}
            fontSize={8}
            textAnchor="middle"
            fill="#9ca3af"
          >
            {i}
          </text>
        ))}
      </svg>
    </div>
  );
}

function RhythmBar({ pattern, stressMarks }: { pattern: number[]; stressMarks: boolean[] }) {
  if (!pattern || pattern.length === 0) return null;
  return (
    <div className="flex items-end gap-0.5">
      {pattern.map((w, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-0.5"
          style={{ width: 16 }}
        >
          <div
            style={{
              height: w * 12,
              backgroundColor: stressMarks[i] ? "#f97316" : "#93c5fd",
              borderRadius: 2,
            }}
          />
          {stressMarks[i] && (
            <span className="text-[8px] font-bold text-orange-600">S</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ProsodyVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10057);

  return (
    <ConfigurableVisualizer<ProsodyInput, Record<string, never>>
      config={{
        defaultInput: { sentence_type: "疑问句" },

        algorithm: (input) => {
          const st = (input.sentence_type as SentenceType) || "疑问句";
          return generateProsodySteps(st);
        },

        inputTypes: [{ type: "string", key: "sentence_type", label: "语句类型" }],
        inputFields: [
          {
            type: "string",
            key: "sentence_type",
            label: "语句类型",
            placeholder: "疑问句",
          },
        ],

        testCases: [
          { label: "疑问句（你好吗?）", value: { sentence_type: "疑问句" } },
          { label: "陈述句（今天天气很好）", value: { sentence_type: "陈述句" } },
          { label: "感叹句（太棒了!）", value: { sentence_type: "感叹句" } },
          { label: "命令句（快点走!）", value: { sentence_type: "命令句" } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sentenceType = (variables?.sentenceType as string) ?? "疑问句";
          const f0Values = (variables?.f0Values as unknown as number[]) ?? [];
          const stressMarks = (variables?.stressMarks as unknown as boolean[]) ?? [];
          const rhythmPattern = (variables?.rhythmPattern as unknown as number[]) ?? [];
          const meanF0 = variables?.meanF0 as number | undefined;
          const f0Range = variables?.f0Range as number | undefined;
          const rhythmRate = variables?.rhythmRate as number | undefined;
          const prosodyDesc = (variables?.prosodyDesc as string) ?? "";

          const pi = PHASE_MAP[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
          const phaseIdx = PHASE_ORDER.indexOf(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      韵律分析（Prosody Analysis）
                    </h3>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                      <InlineMath math="F_0 = \frac{1}{T_0}" />
                      <InlineMath math="\Delta F_0 = F_0(t) - F_0(t-1)" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-lg">
                      {sentenceType}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>
                      {pi.label}
                    </span>
                  </div>
                </div>
                {prosodyDesc && (
                  <p className="text-xs text-gray-500 mt-2 italic">{prosodyDesc}</p>
                )}
              </div>

              {/* F0 Contour Chart */}
              {f0Values.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    F0 基频轮廓{" "}
                    <span className="text-xs font-normal text-gray-500">
                      （橙圆=重音帧，红点=上升，蓝点=下降）
                    </span>
                  </h4>
                  <F0Chart f0Values={f0Values} stressMarks={stressMarks} />
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      帧数: {f0Values.length}
                    </span>
                    <span className="text-xs text-gray-500">
                      F0范围:{" "}
                      {f0Values.length > 0
                        ? `${Math.min(...f0Values).toFixed(0)}–${Math.max(...f0Values).toFixed(0)} Hz`
                        : "—"}
                    </span>
                  </div>
                </div>
              )}

              {/* Rhythm Pattern */}
              {rhythmPattern.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    节奏模式{" "}
                    <span className="text-xs font-normal text-gray-500">
                      （橙=重音音节，蓝=非重音，高度表示时长权重）
                    </span>
                  </h4>
                  <RhythmBar pattern={rhythmPattern} stressMarks={stressMarks} />
                </div>
              )}

              {/* Stats */}
              {meanF0 !== undefined && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">
                    韵律统计特征
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                      <div className="text-lg font-bold text-orange-600">
                        {meanF0} Hz
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        平均F0 <InlineMath math="\bar{F}_0" />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                      <div className="text-lg font-bold text-red-600">
                        {f0Range} Hz
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        F0范围 <InlineMath math="\max-\min" />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                      <div className="text-lg font-bold text-blue-600">
                        {rhythmRate}/s
                      </div>
                      <div className="text-xs text-gray-500 mt-1">节奏率</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete summary */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    韵律特征向量（完整）
                  </h4>
                  <BlockMath
                    math={`\\text{Prosody}_{\\text{${sentenceType}}} = [\\bar{F}_0=${meanF0},\\ \\Delta F_0=${f0Range},\\ r=${rhythmRate}]`}
                  />
                  <p className="text-xs text-emerald-600 mt-2">
                    该三维特征向量可直接输入分类器进行语气/情感识别，或作为TTS系统的韵律控制参数。
                  </p>
                </div>
              )}

              {/* Pipeline progress */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">分析流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化" },
                    { id: "f0_extract", label: "② F0提取" },
                    { id: "rhythm", label: "③ 节奏分析" },
                    { id: "stress", label: "④ 重音标注" },
                    { id: "analyze", label: "⑤ 统计计算" },
                    { id: "complete", label: "⑥ 输出特征" },
                  ].map((step, idx, arr) => {
                    const stepIdx = PHASE_ORDER.indexOf(step.id);
                    const isDone = phaseIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-lg font-medium transition-all ${
                            step.id === phase
                              ? "bg-orange-500 text-white shadow-sm"
                              : isDone
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < arr.length - 1 && (
                          <span className="text-gray-300">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default ProsodyVisualizer;

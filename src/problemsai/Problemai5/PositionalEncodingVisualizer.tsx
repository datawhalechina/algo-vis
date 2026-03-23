import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generatePositionalEncodingSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface PositionalEncodingInput extends ProblemInput {
  seqLen: number;
  dModel: number;
}

const DEFAULT_SEQ_LEN = 8;
const DEFAULT_D_MODEL = 16;

function getHeatColor(val: number): string {
  // val in [-1, 1] → hue 220 (blue) to 0 (red)
  const normalized = (val + 1) / 2; // 0..1
  const hue = 220 - normalized * 220;
  const sat = 75;
  const light = 85 - normalized * 28;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function getTextColor(val: number): string {
  const normalized = (val + 1) / 2;
  return normalized > 0.6 ? "#fff" : "#1e293b";
}

function fmt(v: number, digits = 3): string {
  if (isNaN(v)) return "--";
  return v.toFixed(digits);
}

interface PEMatrixGridProps {
  matrix: number[][];
  currentPos?: number;
  currentDimPair?: number;
  phase: string;
}

function PEMatrixGrid({ matrix, currentPos, currentDimPair, phase }: PEMatrixGridProps) {
  if (!matrix || matrix.length === 0) return null;
  const seqLen = matrix.length;
  const dModel = matrix[0]?.length ?? 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">位置编码矩阵 PE</h4>
        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-mono">
          {seqLen}×{dModel}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-10 text-gray-400 font-normal pr-2">pos\dim</th>
              {Array.from({ length: dModel }, (_, j) => (
                <th
                  key={j}
                  className={`w-12 text-center font-normal pb-1 ${
                    phase === "compute" && currentDimPair !== undefined &&
                    (j === currentDimPair || j === currentDimPair + 1)
                      ? "text-purple-700 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  d{j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const isCurrentPos = phase === "compute" && currentPos === i;
              return (
                <tr key={i}>
                  <td
                    className={`pr-2 text-right font-mono font-semibold ${
                      isCurrentPos ? "text-purple-700" : "text-gray-400"
                    }`}
                  >
                    {i}
                  </td>
                  {row.map((val, j) => {
                    const isCurrentCell =
                      phase === "compute" &&
                      currentPos === i &&
                      currentDimPair !== undefined &&
                      (j === currentDimPair || j === currentDimPair + 1);
                    const bg = val !== 0 || phase !== "init" ? getHeatColor(val) : "#f8fafc";
                    const tc = val !== 0 || phase !== "init" ? getTextColor(val) : "#94a3b8";
                    return (
                      <td
                        key={j}
                        className={`w-12 h-8 text-center font-mono border border-white/60 rounded transition-all ${
                          isCurrentCell ? "ring-2 ring-purple-500 font-bold z-10" : ""
                        }`}
                        style={{ backgroundColor: bg, color: tc }}
                        title={`PE[${i}][${j}] = ${val}`}
                      >
                        {fmt(val, 2)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Heatmap legend */}
      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
        <span>−1</span>
        <div
          className="h-2 w-24 rounded"
          style={{
            background:
              "linear-gradient(to right, hsl(220,75%,85%), hsl(110,75%,71%), hsl(0,75%,57%))",
          }}
        />
        <span>+1</span>
        <span className="ml-2">热力色：蓝(负) → 绿(零) → 红(正)</span>
      </div>
    </div>
  );
}

function WaveformView({ matrix, seqLen }: { matrix: number[][]; seqLen: number }) {
  if (!matrix || matrix.length === 0) return null;

  // Show first 4 dim pairs as wave curves (simplified bar chart per dim)
  const dims = Math.min(4, Math.floor((matrix[0]?.length ?? 0) / 2)) * 2;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-1">各维度波形（前 {dims} 维）</h4>
      <p className="text-xs text-gray-500 mb-3">
        低维索引频率高（变化快），高维索引频率低（变化慢）
      </p>
      <div className="space-y-3">
        {Array.from({ length: Math.floor(dims / 2) }, (_, pairIdx) => {
          const dim = pairIdx * 2;
          return (
            <div key={dim}>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] text-gray-500 font-mono w-20">
                  dim {dim}/{dim + 1}
                </span>
                <span className="text-[10px] text-blue-500">sin</span>
                <span className="text-[10px] text-orange-400 ml-1">cos</span>
              </div>
              <div className="flex gap-0.5 items-end h-8">
                {matrix.map((row, pos) => {
                  const sinVal = row[dim] ?? 0;
                  const cosVal = row[dim + 1] ?? 0;
                  const sinH = Math.abs(sinVal) * 14 + 2;
                  const cosH = Math.abs(cosVal) * 14 + 2;
                  return (
                    <div key={pos} className="flex gap-px items-end" style={{ width: `${100 / seqLen}%` }}>
                      <div
                        title={`pos=${pos}, sin=${fmt(sinVal)}`}
                        style={{ height: sinH, backgroundColor: sinVal >= 0 ? "#3b82f6" : "#93c5fd" }}
                        className="flex-1 rounded-t"
                      />
                      <div
                        title={`pos=${pos}, cos=${fmt(cosVal)}`}
                        style={{ height: cosH, backgroundColor: cosVal >= 0 ? "#f97316" : "#fed7aa" }}
                        className="flex-1 rounded-t"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    compute: { label: "逐维计算", color: "bg-purple-100 text-purple-700" },
    complete: { label: "编码完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function PositionalEncodingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10005);

  return (
    <ConfigurableVisualizer<PositionalEncodingInput, Record<string, never>>
      config={{
        defaultInput: {
          seqLen: DEFAULT_SEQ_LEN,
          dModel: DEFAULT_D_MODEL,
        },
        algorithm: (input) => {
          const seqLen =
            typeof input.seqLen === "number"
              ? Math.max(1, Math.min(input.seqLen, 20))
              : parseInt(String(input.seqLen), 10) || DEFAULT_SEQ_LEN;
          const dModel =
            typeof input.dModel === "number"
              ? Math.max(2, Math.min(input.dModel, 32))
              : parseInt(String(input.dModel), 10) || DEFAULT_D_MODEL;
          const dModelEven = dModel % 2 === 0 ? dModel : dModel - 1;
          return generatePositionalEncodingSteps(seqLen, Math.max(2, dModelEven));
        },
        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度 seq_len" },
          { type: "number", key: "dModel", label: "模型维度 d_model（偶数）" },
        ],
        inputFields: [
          {
            type: "number",
            key: "seqLen",
            label: "序列长度 seq_len（1-20）",
            placeholder: String(DEFAULT_SEQ_LEN),
          },
          {
            type: "number",
            key: "dModel",
            label: "模型维度 d_model（偶数，2-32）",
            placeholder: String(DEFAULT_D_MODEL),
          },
        ],
        testCases: [
          {
            label: "示例（8 tokens, d=16）",
            value: { seqLen: DEFAULT_SEQ_LEN, dModel: DEFAULT_D_MODEL },
          },
          {
            label: "小型（4 tokens, d=8）",
            value: { seqLen: 4, dModel: 8 },
          },
          {
            label: "中型（12 tokens, d=16）",
            value: { seqLen: 12, dModel: 16 },
          },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const seqLen = (variables?.seqLen as number) ?? DEFAULT_SEQ_LEN;
          const dModel = (variables?.dModel as number) ?? DEFAULT_D_MODEL;
          const currentPos = variables?.currentPos as number | undefined;
          const currentDimPair = variables?.currentDimPair as number | undefined;
          const divTerm = variables?.divTerm as number | undefined;
          const sinVal = variables?.sinVal as number | undefined;
          const cosVal = variables?.cosVal as number | undefined;
          const peMatrix = (variables?.peMatrix as number[][] | undefined) ?? [];

          const flowSteps = [
            { id: "init", label: "① 初始化" },
            { id: "compute", label: "② 逐维计算 sin/cos" },
            { id: "complete", label: "③ PE 矩阵完成" },
          ];

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题与公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">位置编码</h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      PE[pos, 2i] = sin(pos / 10000^(2i/d_model))
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      PE[pos, 2i+1] = cos(pos / 10000^(2i/d_model))
                    </p>
                  </div>
                  <PhaseTag phase={phase} />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                  <span>
                    seq_len = <span className="font-semibold text-gray-900">{seqLen}</span>
                  </span>
                  <span>
                    d_model = <span className="font-semibold text-gray-900">{dModel}</span>
                  </span>
                  {phase === "compute" && currentPos !== undefined && (
                    <>
                      <span>
                        当前位置 pos ={" "}
                        <span className="font-semibold text-purple-700">{currentPos}</span>
                      </span>
                      <span>
                        维度对 i ={" "}
                        <span className="font-semibold text-purple-700">{currentDimPair}</span>
                      </span>
                      {divTerm !== undefined && (
                        <span>
                          10000^(2i/d) ={" "}
                          <span className="font-mono text-gray-800">{fmt(divTerm, 2)}</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 当前计算步骤详情 */}
              {phase === "compute" &&
                currentPos !== undefined &&
                currentDimPair !== undefined &&
                sinVal !== undefined && (
                  <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">当前计算</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white rounded p-2 border border-purple-100">
                        <p className="text-gray-500 mb-1">
                          PE[{currentPos}][{currentDimPair}]（sin）
                        </p>
                        <p className="font-mono text-purple-800 font-semibold">
                          sin({currentPos} / {fmt(divTerm ?? 1, 2)}) ={" "}
                          <span className="text-blue-700">{fmt(sinVal)}</span>
                        </p>
                      </div>
                      {cosVal !== undefined && (
                        <div className="bg-white rounded p-2 border border-purple-100">
                          <p className="text-gray-500 mb-1">
                            PE[{currentPos}][{(currentDimPair ?? 0) + 1}]（cos）
                          </p>
                          <p className="font-mono text-purple-800 font-semibold">
                            cos({currentPos} / {fmt(divTerm ?? 1, 2)}) ={" "}
                            <span className="text-orange-600">{fmt(cosVal)}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* PE 矩阵热力图 */}
              {peMatrix.length > 0 && (
                <PEMatrixGrid
                  matrix={peMatrix}
                  currentPos={currentPos}
                  currentDimPair={currentDimPair}
                  phase={phase}
                />
              )}

              {/* 波形可视化（完成后显示） */}
              {phase === "complete" && peMatrix.length > 0 && (
                <WaveformView matrix={peMatrix} seqLen={seqLen} />
              )}

              {/* 完成提示 */}
              {phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-1">编码完成</h4>
                  <p className="text-xs text-emerald-700">
                    PE 矩阵（{seqLen}×{dModel}）已计算完毕。将其与 token 嵌入矩阵逐元素相加：
                    <span className="font-mono font-semibold ml-1">input = embedding + PE</span>
                    ，从而为 Transformer 注入序列位置信息。
                  </p>
                </div>
              )}

              {/* 计算流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {flowSteps.map((step, idx, arr) => {
                    const phaseOrder = ["init", "compute", "complete"];
                    const currentIdx = phaseOrder.indexOf(phase);
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = currentIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                            step.id === phase
                              ? "bg-purple-600 text-white shadow-sm"
                              : isDone
                              ? "bg-purple-100 text-purple-700"
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

export default PositionalEncodingVisualizer;

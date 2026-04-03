import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateSegmentationSteps, SegMap, EncoderLevel, CLASS_NAMES } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SegInput extends ProblemInput {
  _dummy: number;
}

const CLASS_COLORS = [
  "#94a3b8", // 背景 - gray
  "#3b82f6", // 人物 - blue
  "#f59e0b", // 车辆 - amber
  "#ef4444", // 建筑 - red
  "#10b981", // 植被 - emerald
];

const ARCH_STAGES = [
  { label: "输入", shape: "8×8×3", color: "#6366f1" },
  { label: "Encoder L1", shape: "8×8×64", color: "#3b82f6" },
  { label: "Encoder L2", shape: "4×4×128", color: "#0ea5e9" },
  { label: "Bottleneck", shape: "2×2×256", color: "#06b6d4" },
  { label: "Decoder L2", shape: "4×4×128", color: "#10b981" },
  { label: "Decoder L1", shape: "8×8×64", color: "#84cc16" },
  { label: "输出", shape: "8×8×C", color: "#f59e0b" },
];

function SegGridDisplay({ segMap }: { segMap: SegMap }) {
  const CELL = 28;
  return (
    <svg
      viewBox={`0 0 ${segMap.cols * CELL} ${segMap.rows * CELL}`}
      className="w-full rounded border"
      style={{ maxHeight: 240 }}
    >
      {segMap.labels.map((row, r) =>
        row.map((cls, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * CELL}
            y={r * CELL}
            width={CELL}
            height={CELL}
            fill={CLASS_COLORS[cls] || "#ccc"}
            opacity={0.85}
          />
        ))
      )}
    </svg>
  );
}

function FeatureMapDisplay({ level, active }: { level: EncoderLevel; active: boolean }) {
  const CELL = Math.min(32, Math.floor(120 / level.cols));
  return (
    <div className={`rounded border p-2 text-center ${active ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white"}`}>
      <div className="text-xs text-gray-500 mb-1">{level.name}</div>
      <svg
        viewBox={`0 0 ${level.cols * CELL} ${level.rows * CELL}`}
        className="w-full"
        style={{ maxHeight: 80 }}
      >
        {level.activation.map((row, r) =>
          row.map((val, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * CELL}
              y={r * CELL}
              width={CELL - 1}
              height={CELL - 1}
              fill={`rgba(99,102,241,${val.toFixed(2)})`}
            />
          ))
        )}
      </svg>
    </div>
  );
}

function SemanticSegmentationVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10033);

  return (
    <ConfigurableVisualizer<SegInput, Record<string, never>>
      config={{
        defaultInput: { _dummy: 0 },
        algorithm: () => generateSegmentationSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认示例", value: { _dummy: 0 } }],
        render: ({ variables, visualization }) => {
          const stepDescription = visualization.currentStepData?.description;
          const phase = (variables?.phase as string) || "init";
          const segMap = variables?.segMap as SegMap | undefined;
          const activeLevelIdx = variables?.activeLevelIdx as number | undefined;
          const classNames = (variables?.classNames as string[] | undefined) || CLASS_NAMES;

          const encoderLevels: EncoderLevel[] = [
            { name: "输入图像", rows: 8, cols: 8, activation: Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => Math.sin(r * 0.8) * Math.cos(c * 0.6) * 0.5 + 0.5)) },
            { name: "跳跃连接 L1", rows: 8, cols: 8, activation: Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => Math.sin((r + 2) * 0.8) * Math.cos((c + 2) * 0.6) * 0.5 + 0.5)) },
            { name: "跳跃连接 L2", rows: 4, cols: 4, activation: Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => Math.sin((r + 3) * 0.8) * Math.cos((c + 3) * 0.6) * 0.5 + 0.5)) },
            { name: "Bottleneck", rows: 2, cols: 2, activation: [[0.9, 0.8], [0.7, 0.95]] },
            { name: "解码 L2 (4×4)", rows: 4, cols: 4, activation: Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => Math.sin((r + 5) * 0.8) * Math.cos((c + 5) * 0.6) * 0.5 + 0.5)) },
            { name: "解码 L1 (8×8)", rows: 8, cols: 8, activation: Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => Math.sin((r + 6) * 0.8) * Math.cos((c + 6) * 0.6) * 0.5 + 0.5)) },
          ];

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">语义分割关键公式</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>像素类别预测：</span>
                    <InlineMath math={"\\hat{y}_{i,j} = \\arg\\max_c\\ \\text{softmax}(\\mathbf{z}_{i,j})_c"} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>上采样（转置卷积）：</span>
                    <InlineMath math={"F_{up} = F_{low} \\uparrow_s + F_{skip}"} />
                    <span className="text-gray-400">（跳跃连接补充空间细节）</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>损失函数：</span>
                    <InlineMath math={"\\mathcal{L} = -\\sum_{i,j} \\log p(y_{i,j} | \\mathbf{x})"} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 编码器-解码器架构 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">U-Net 编码器-解码器架构</h4>
                  <div className="flex flex-col gap-1">
                    {ARCH_STAGES.map((stage, i) => {
                      const isActive = activeLevelIdx !== undefined && i === activeLevelIdx;
                      const isDone = (phase === "done" || phase === "softmax");
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className={`flex-1 rounded px-2 py-1.5 text-xs font-medium flex justify-between items-center transition-all ${
                              isActive
                                ? "ring-2 ring-indigo-400 scale-105"
                                : isDone
                                ? "opacity-80"
                                : i <= (activeLevelIdx ?? -1)
                                ? "opacity-100"
                                : "opacity-40"
                            }`}
                            style={{ backgroundColor: stage.color + "22", borderLeft: `3px solid ${stage.color}` }}
                          >
                            <span style={{ color: stage.color }}>{stage.label}</span>
                            <span className="text-gray-400 font-mono">{stage.shape}</span>
                          </div>
                          {/* 跳跃连接箭头 */}
                          {i === 1 && <div className="text-xs text-gray-400">← 跳跃</div>}
                          {i === 2 && <div className="text-xs text-gray-400">← 跳跃</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 特征图 / 分割结果 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  {(phase === "done" || phase === "softmax") && segMap ? (
                    <>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">分割结果（像素级分类）</h4>
                      <SegGridDisplay segMap={segMap} />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {classNames.map((name, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: CLASS_COLORS[i] }} />
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : activeLevelIdx !== undefined && activeLevelIdx < encoderLevels.length ? (
                    <>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">当前特征图</h4>
                      <FeatureMapDisplay level={encoderLevels[activeLevelIdx]} active={true} />
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {encoderLevels
                          .filter((_, i) => i !== activeLevelIdx)
                          .slice(0, 4)
                          .map((level, i) => (
                            <FeatureMapDisplay key={i} level={level} active={false} />
                          ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic flex items-center justify-center h-40">
                      等待处理...
                    </div>
                  )}
                </div>
              </div>

              <div className={`rounded-lg border p-3 text-sm ${phase === "done" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
                {stepDescription || "初始化..."}
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default SemanticSegmentationVisualizer;

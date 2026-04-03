import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateFPNSteps, FPNLevel, BACKBONE_LEVELS, FPN_LEVELS } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface FPNInput extends ProblemInput {
  _dummy: number;
}

const BACKBONE_COLOR = "#6366f1";
const FPN_COLOR = "#10b981";

function FeatureBlock({
  level,
  color,
  active,
  done,
}: {
  level: FPNLevel;
  color: string;
  active: boolean;
  done: boolean;
}) {
  const CELL = Math.min(20, Math.floor(80 / Math.max(level.cols, 1)));
  const svgW = level.cols * CELL;
  const svgH = level.rows * CELL;
  return (
    <div
      className={`rounded border p-1.5 transition-all ${
        active ? "ring-2 scale-105" : done ? "opacity-90" : "opacity-40"
      }`}
      style={{
        borderColor: color,
        backgroundColor: color + "11",
      }}
    >
      <div className="text-xs font-bold mb-1" style={{ color }}>
        {level.name}
      </div>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={svgW}
        height={svgH}
        className="rounded"
      >
        {level.features.map((row, r) =>
          row.map((val, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * CELL}
              y={r * CELL}
              width={CELL - 1}
              height={CELL - 1}
              fill={color}
              opacity={val * 0.8 + 0.1}
            />
          ))
        )}
      </svg>
      <div className="text-xs text-gray-400 mt-1">
        {level.rows}×{level.cols}×{level.channels}
      </div>
    </div>
  );
}

function FPNVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10034);

  return (
    <ConfigurableVisualizer<FPNInput, Record<string, never>>
      config={{
        defaultInput: { _dummy: 0 },
        algorithm: () => generateFPNSteps(),
        inputTypes: [],
        inputFields: [],
        testCases: [{ label: "默认示例", value: { _dummy: 0 } }],
        render: ({ variables, visualization }) => {
          const stepDescription = visualization.currentStepData?.description;
          const phase = (variables?.phase as string) || "init";
          const activeCIdx = (variables?.activeCIdx as number) ?? -1;
          const activePIdx = (variables?.activePIdx as number) ?? -1;
          const fpnLevels = (variables?.fpnLevels as FPNLevel[] | undefined) || [];

          const isDone = phase === "done";

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">FPN 自顶向下融合公式</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>横向连接（1×1 卷积）：</span>
                    <InlineMath math={"L_i = \\text{Conv}_{1\\times1}(C_i)"} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>自顶向下融合：</span>
                    <InlineMath math={"P_i = L_i + \\text{Upsample}(P_{i+1})"} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>最终输出（3×3 卷积消除混叠）：</span>
                    <InlineMath math={"P_i \\leftarrow \\text{Conv}_{3\\times3}(P_i)"} />
                  </div>
                </div>
              </div>

              {/* 网络结构可视化 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">特征金字塔网络结构</h4>

                {/* 骨干网络特征 */}
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-2 font-medium">骨干网络（Bottom-up）</div>
                  <div className="flex gap-3 items-end flex-wrap">
                    {BACKBONE_LEVELS.map((level, i) => (
                      <div key={level.name} className="flex flex-col items-center gap-1">
                        {i > 0 && (
                          <div className="text-xs text-gray-400">↓ 2×</div>
                        )}
                        <FeatureBlock
                          level={level}
                          color={BACKBONE_COLOR}
                          active={i === activeCIdx}
                          done={i <= activeCIdx || isDone || phase === "top_down" || phase === "p6"}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 连接箭头 */}
                {(phase === "top_down" || phase === "top_down_start" || phase === "p6" || isDone) && (
                  <div className="text-center text-xs text-gray-400 my-2 flex items-center justify-center gap-2">
                    <span className="border-t border-dashed border-emerald-400 flex-1" />
                    <span className="text-emerald-600 font-medium">← 横向连接 + 自顶向下上采样</span>
                    <span className="border-t border-dashed border-emerald-400 flex-1" />
                  </div>
                )}

                {/* FPN 输出特征 */}
                {fpnLevels.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2 font-medium">FPN 输出（Top-down）</div>
                    <div className="flex gap-3 items-end flex-wrap">
                      {FPN_LEVELS.map((level, i) => {
                        const built = fpnLevels.find((l) => l.name === level.name);
                        return (
                          <FeatureBlock
                            key={level.name}
                            level={level}
                            color={FPN_COLOR}
                            active={i === activePIdx}
                            done={!!built}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 多尺度检测说明 */}
              {(isDone || phase === "p6") && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">多尺度目标检测</h4>
                  <div className="text-sm text-emerald-700 space-y-1">
                    {FPN_LEVELS.map((level, i) => (
                      <div key={level.name} className="flex justify-between">
                        <span className="font-mono">{level.name}</span>
                        <span>适合检测{["大", "中", "中", "小", "超小"][i] || ""}目标</span>
                        <span className="text-emerald-500">{level.rows}×{level.cols} 分辨率</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`rounded-lg border p-3 text-sm ${isDone ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
                {stepDescription || "初始化..."}
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default FPNVisualizer;

import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateROIPoolingSteps, FeatureMap, ROI, PooledCell } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface ROIPoolingInput extends ProblemInput {
  poolH: number;
  poolW: number;
}

// 默认 8×8 特征图
const DEFAULT_FEATURE_MAP: FeatureMap = {
  rows: 8,
  cols: 8,
  values: [
    [0.1, 0.3, 0.8, 0.9, 0.2, 0.1, 0.4, 0.3],
    [0.2, 0.7, 0.9, 0.8, 0.3, 0.2, 0.5, 0.4],
    [0.4, 0.8, 1.0, 0.9, 0.6, 0.5, 0.6, 0.5],
    [0.3, 0.6, 0.9, 0.8, 0.7, 0.6, 0.7, 0.5],
    [0.1, 0.3, 0.5, 0.4, 0.8, 0.9, 0.8, 0.6],
    [0.2, 0.2, 0.3, 0.3, 0.9, 1.0, 0.9, 0.7],
    [0.3, 0.3, 0.2, 0.2, 0.7, 0.8, 0.7, 0.6],
    [0.1, 0.2, 0.1, 0.1, 0.4, 0.5, 0.4, 0.3],
  ],
};

const DEFAULT_ROIS: ROI[] = [
  { id: 0, x1: 1, y1: 1, x2: 4, y2: 4 },
  { id: 1, x1: 3, y1: 3, x2: 7, y2: 7 },
];

function heatColor(val: number): string {
  const r = Math.round(255 * val);
  const g = Math.round(255 * (1 - val) * 0.5);
  const b = Math.round(255 * (1 - val));
  return `rgb(${r},${g},${b})`;
}

const ROI_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

function ROIPoolingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10031);

  return (
    <ConfigurableVisualizer<ROIPoolingInput, Record<string, never>>
      config={{
        defaultInput: { poolH: 3, poolW: 3 },
        algorithm: (input) => {
          const poolH = Math.max(1, Math.min(7, Math.floor(input.poolH || 3)));
          const poolW = Math.max(1, Math.min(7, Math.floor(input.poolW || 3)));
          return generateROIPoolingSteps(DEFAULT_FEATURE_MAP, DEFAULT_ROIS, poolH, poolW);
        },
        inputTypes: [
          { type: "number", key: "poolH", label: "池化高度" },
          { type: "number", key: "poolW", label: "池化宽度" },
        ],
        inputFields: [
          { type: "number", key: "poolH", label: "池化高度 (poolH)", placeholder: "3" },
          { type: "number", key: "poolW", label: "池化宽度 (poolW)", placeholder: "3" },
        ],
        testCases: [
          { label: "3×3 输出", value: { poolH: 3, poolW: 3 } },
          { label: "2×2 输出", value: { poolH: 2, poolW: 2 } },
          { label: "4×4 输出", value: { poolH: 4, poolW: 4 } },
        ],
        render: ({ variables, visualization }) => {
          const stepDescription = visualization.currentStepData?.description;
          const featureMap = (variables?.featureMap as FeatureMap | undefined) || DEFAULT_FEATURE_MAP;
          const rois = (variables?.rois as ROI[] | undefined) || DEFAULT_ROIS;
          const activeRoiId = variables?.activeRoiId as number | undefined;
          const activeBinRow = variables?.activeBinRow as number | undefined;
          const activeBinCol = variables?.activeBinCol as number | undefined;
          const cells = (variables?.cells as PooledCell[] | undefined) || [];
          const allPooled = variables?.allPooled as { roiId: number; cells: PooledCell[] }[] | undefined;
          const poolH = (variables?.poolH as number) || 3;
          const poolW = (variables?.poolW as number) || 3;
          const phase = (variables?.phase as string) || "init";
          const activeBin = variables?.activeBin as { ph: number; pw: number; bx1: number; by1: number; bx2: number; by2: number } | undefined;

          const CELL = 36;
          const FM = featureMap;
          const svgW = FM.cols * CELL + 2;
          const svgH = FM.rows * CELL + 2;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 公式说明 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">ROI Pooling 公式</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <span>每个 bin 区域映射：</span>
                    <InlineMath math={"\\text{bin}_{i,j} = \\left[x_1 + \\frac{j \\cdot W_{roi}}{pw},\\; x_1 + \\frac{(j+1) \\cdot W_{roi}}{pw}\\right]"} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>池化输出：</span>
                    <InlineMath math={"y_{i,j} = \\max_{(r,c) \\in \\text{bin}_{i,j}} f(r, c)"} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 特征图 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">特征图（热力图）</h4>
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 300 }}>
                    {FM.values.map((row, r) =>
                      row.map((val, c) => (
                        <rect
                          key={`${r}-${c}`}
                          x={c * CELL + 1}
                          y={r * CELL + 1}
                          width={CELL - 1}
                          height={CELL - 1}
                          fill={heatColor(val)}
                          opacity={0.85}
                        />
                      ))
                    )}
                    {/* ROI 边框 */}
                    {rois.map((roi) => {
                      const color = ROI_COLORS[roi.id % ROI_COLORS.length];
                      const isActive = roi.id === activeRoiId;
                      return (
                        <rect
                          key={`roi-${roi.id}`}
                          x={roi.x1 * CELL + 1}
                          y={roi.y1 * CELL + 1}
                          width={(roi.x2 - roi.x1) * CELL - 1}
                          height={(roi.y2 - roi.y1) * CELL - 1}
                          fill="none"
                          stroke={color}
                          strokeWidth={isActive ? 3 : 1.5}
                          strokeDasharray={isActive ? "none" : "4 2"}
                          opacity={isActive ? 1 : 0.6}
                        />
                      );
                    })}
                    {/* 当前 bin 高亮 */}
                    {activeBin && (
                      <rect
                        x={activeBin.bx1 * CELL + 1}
                        y={activeBin.by1 * CELL + 1}
                        width={(activeBin.bx2 - activeBin.bx1) * CELL - 1}
                        height={(activeBin.by2 - activeBin.by1) * CELL - 1}
                        fill="rgba(255,255,0,0.35)"
                        stroke="#facc15"
                        strokeWidth={2}
                      />
                    )}
                  </svg>
                  <div className="mt-2 flex gap-3 flex-wrap text-xs">
                    {rois.map((roi) => (
                      <div key={roi.id} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded border-2" style={{ borderColor: ROI_COLORS[roi.id % ROI_COLORS.length] }} />
                        <span>ROI #{roi.id}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-yellow-300" />
                      <span>当前 bin</span>
                    </div>
                  </div>
                </div>

                {/* 池化输出 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    {activeRoiId !== undefined ? `ROI #${activeRoiId} 池化输出（${poolH}×${poolW}）` : `池化输出（${poolH}×${poolW}）`}
                  </h4>
                  {cells.length > 0 ? (
                    <div
                      className="inline-grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${poolW}, ${CELL}px)` }}
                    >
                      {Array.from({ length: poolH }, (_, r) =>
                        Array.from({ length: poolW }, (_, c) => {
                          const cell = cells.find((cl) => cl.binRow === r && cl.binCol === c);
                          const isActive = r === activeBinRow && c === activeBinCol;
                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`flex items-center justify-center text-xs font-mono rounded border ${
                                isActive
                                  ? "bg-yellow-200 border-yellow-500 font-bold"
                                  : cell
                                  ? "bg-blue-50 border-blue-200"
                                  : "bg-gray-100 border-gray-200 text-gray-400"
                              }`}
                              style={{ width: CELL, height: CELL }}
                            >
                              {cell ? cell.maxVal.toFixed(2) : "—"}
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">等待处理...</div>
                  )}

                  {/* 已完成的 ROI */}
                  {allPooled && allPooled.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">已完成：</div>
                      <div className="flex gap-2">
                        {allPooled.map((p) => (
                          <div
                            key={p.roiId}
                            className="px-2 py-1 rounded text-xs"
                            style={{ backgroundColor: ROI_COLORS[p.roiId % ROI_COLORS.length] + "22", border: `1px solid ${ROI_COLORS[p.roiId % ROI_COLORS.length]}` }}
                          >
                            ROI #{p.roiId} ✓
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 步骤描述 */}
              <div className={`rounded-lg border p-3 text-sm ${phase === "done" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
                {stepDescription || "初始化中..."}
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default ROIPoolingVisualizer;

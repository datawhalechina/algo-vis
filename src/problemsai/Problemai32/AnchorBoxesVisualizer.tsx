import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateAnchorBoxSteps, AnchorBox } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface AnchorInput extends ProblemInput {
  gridH: number;
  gridW: number;
  stride: number;
}

const DEFAULT_SCALES = [1, 2];
const DEFAULT_RATIOS = [0.5, 1.0, 2.0];

const ANCHOR_COLORS = [
  "#3b82f6", "#f59e0b", "#10b981",
  "#ef4444", "#8b5cf6", "#ec4899",
];

function AnchorBoxesVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10032);

  return (
    <ConfigurableVisualizer<AnchorInput, Record<string, never>>
      config={{
        defaultInput: { gridH: 4, gridW: 4, stride: 16 },
        algorithm: (input) => {
          const gridH = Math.max(2, Math.min(8, Math.floor(input.gridH || 4)));
          const gridW = Math.max(2, Math.min(8, Math.floor(input.gridW || 4)));
          const stride = Math.max(4, Math.min(64, Math.floor(input.stride || 16)));
          return generateAnchorBoxSteps(gridH, gridW, stride, DEFAULT_SCALES, DEFAULT_RATIOS, {
            row: Math.floor(gridH / 2),
            col: Math.floor(gridW / 2),
          });
        },
        inputTypes: [
          { type: "number", key: "gridH", label: "网格行数" },
          { type: "number", key: "gridW", label: "网格列数" },
          { type: "number", key: "stride", label: "步长" },
        ],
        inputFields: [
          { type: "number", key: "gridH", label: "特征图行数 (2-8)", placeholder: "4" },
          { type: "number", key: "gridW", label: "特征图列数 (2-8)", placeholder: "4" },
          { type: "number", key: "stride", label: "步长 stride", placeholder: "16" },
        ],
        testCases: [
          { label: "4×4 / stride=16", value: { gridH: 4, gridW: 4, stride: 16 } },
          { label: "6×6 / stride=8", value: { gridH: 6, gridW: 6, stride: 8 } },
          { label: "3×3 / stride=32", value: { gridH: 3, gridW: 3, stride: 32 } },
        ],
        render: ({ variables, visualization }) => {
          const stepDescription = visualization.currentStepData?.description;
          const gridH = (variables?.gridH as number) || 4;
          const gridW = (variables?.gridW as number) || 4;
          const stride = (variables?.stride as number) || 16;
          const imgH = (variables?.imgH as number) || gridH * stride;
          const imgW = (variables?.imgW as number) || gridW * stride;
          const scales = (variables?.scales as number[]) || DEFAULT_SCALES;
          const ratios = (variables?.ratios as number[]) || DEFAULT_RATIOS;
          const phase = (variables?.phase as string) || "init";
          const allAnchors = (variables?.allAnchors as AnchorBox[] | undefined) || [];
          const cellAnchors = (variables?.cellAnchors as AnchorBox[] | undefined) || [];
          const selectedCell = variables?.selectedCell as { row: number; col: number } | undefined;
          const activeAnchor = variables?.activeAnchor as AnchorBox | undefined;

          // 画布尺寸：缩放到适合显示
          const CANVAS = 280;
          const scaleX = CANVAS / imgW;
          const scaleY = CANVAS / imgH;

          const numAnchorsPerCell = scales.length * ratios.length;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">锚框生成公式</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>面积：</span>
                    <InlineMath math={"A = (s \\cdot \\text{stride})^2"} />
                    <span className="text-gray-400">（s 为尺度缩放系数）</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>宽高：</span>
                    <InlineMath math={"w = \\sqrt{A \\cdot r},\\quad h = \\sqrt{A / r}"} />
                    <span className="text-gray-400">（r 为宽高比）</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>中心：</span>
                    <InlineMath math={"c_x = (j + 0.5)\\cdot \\text{stride},\\quad c_y = (i + 0.5)\\cdot \\text{stride}"} />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* 锚框可视化 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    {selectedCell
                      ? `Cell (${selectedCell.row}, ${selectedCell.col}) 的锚框`
                      : "锚框分布"}
                  </h4>
                  <svg
                    viewBox={`0 0 ${CANVAS} ${CANVAS}`}
                    className="w-full rounded border bg-slate-50"
                    style={{ maxHeight: 300 }}
                  >
                    {/* 网格线 */}
                    {Array.from({ length: gridH + 1 }, (_, i) => (
                      <line
                        key={`h${i}`}
                        x1={0} y1={i * stride * scaleY}
                        x2={CANVAS} y2={i * stride * scaleY}
                        stroke="#e5e7eb" strokeWidth={0.5}
                      />
                    ))}
                    {Array.from({ length: gridW + 1 }, (_, j) => (
                      <line
                        key={`v${j}`}
                        x1={j * stride * scaleX} y1={0}
                        x2={j * stride * scaleX} y2={CANVAS}
                        stroke="#e5e7eb" strokeWidth={0.5}
                      />
                    ))}

                    {/* 选中 cell 高亮 */}
                    {selectedCell && (
                      <rect
                        x={selectedCell.col * stride * scaleX}
                        y={selectedCell.row * stride * scaleY}
                        width={stride * scaleX}
                        height={stride * scaleY}
                        fill="rgba(99,102,241,0.1)"
                        stroke="#6366f1"
                        strokeWidth={1.5}
                      />
                    )}

                    {/* 绘制选中 cell 的锚框 */}
                    {cellAnchors.map((anchor, i) => {
                      const isActive = activeAnchor && anchor.scale === activeAnchor.scale && anchor.ratio === activeAnchor.ratio;
                      const color = ANCHOR_COLORS[i % ANCHOR_COLORS.length];
                      return (
                        <rect
                          key={i}
                          x={(anchor.cx - anchor.w / 2) * scaleX}
                          y={(anchor.cy - anchor.h / 2) * scaleY}
                          width={anchor.w * scaleX}
                          height={anchor.h * scaleY}
                          fill="none"
                          stroke={color}
                          strokeWidth={isActive ? 2.5 : 1.5}
                          strokeDasharray={isActive ? "none" : "3 2"}
                          opacity={isActive ? 1 : 0.7}
                        />
                      );
                    })}

                    {/* 如果全部生成完，展示所有 cell 的中心点 */}
                    {(phase === "generated" || phase === "done") &&
                      Array.from({ length: gridH }, (_, r) =>
                        Array.from({ length: gridW }, (_, c) => (
                          <circle
                            key={`cp-${r}-${c}`}
                            cx={(c + 0.5) * stride * scaleX}
                            cy={(r + 0.5) * stride * scaleY}
                            r={2}
                            fill="#6366f1"
                            opacity={0.6}
                          />
                        ))
                      )}
                  </svg>

                  {/* 图例 */}
                  <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                    {scales.flatMap((s) =>
                      ratios.map((r) => {
                        const idx = scales.indexOf(s) * ratios.length + ratios.indexOf(r);
                        return (
                          <div key={`${s}-${r}`} className="flex items-center gap-1">
                            <div className="w-4 h-0 border-t-2" style={{ borderColor: ANCHOR_COLORS[idx % ANCHOR_COLORS.length] }} />
                            <span className="text-gray-500">s={s},r={r}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">统计</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">特征图大小</span>
                      <span className="font-mono">{gridH}×{gridW}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">步长</span>
                      <span className="font-mono">{stride}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">原图大小</span>
                      <span className="font-mono">{imgH}×{imgW}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">每格锚框数</span>
                      <span className="font-mono">{scales.length}×{ratios.length}={numAnchorsPerCell}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span className="text-gray-700">总锚框数</span>
                      <span className="font-mono text-indigo-600">
                        {gridH}×{gridW}×{numAnchorsPerCell}={gridH * gridW * numAnchorsPerCell}
                      </span>
                    </div>
                  </div>

                  {/* 当前活跃锚框信息 */}
                  {activeAnchor && (
                    <div className="bg-indigo-50 rounded border border-indigo-200 p-3 text-xs space-y-1">
                      <div className="font-semibold text-indigo-800">当前锚框</div>
                      <div>尺度 <InlineMath math={`s=${activeAnchor.scale}`} />，比率 <InlineMath math={`r=${activeAnchor.ratio}`} /></div>
                      <div>宽={activeAnchor.w.toFixed(1)}, 高={activeAnchor.h.toFixed(1)}</div>
                      <div>中心=({activeAnchor.cx}, {activeAnchor.cy})</div>
                    </div>
                  )}

                  {/* 已生成总数 */}
                  {allAnchors.length > 0 && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 rounded border border-emerald-200 p-2">
                      已生成 {allAnchors.length} 个锚框
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

export default AnchorBoxesVisualizer;

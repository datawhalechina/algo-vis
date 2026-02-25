import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateNMSSteps, BBox } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface NMSInput extends ProblemInput {
  boxes: string;
  iouThreshold: number;
  scoreThreshold: number;
}

const defaultBoxes = JSON.stringify([
  { x1: 10, y1: 10, x2: 50, y2: 50, score: 0.9 },
  { x1: 12, y1: 12, x2: 52, y2: 52, score: 0.85 },
  { x1: 100, y1: 100, x2: 150, y2: 150, score: 0.75 },
  { x1: 105, y1: 105, x2: 155, y2: 155, score: 0.7 },
  { x1: 200, y1: 50, x2: 250, y2: 100, score: 0.6 },
]);

function parseBoxes(raw: string): BBox[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((b, i) => ({
        x1: b.x1 || 0,
        y1: b.y1 || 0,
        x2: b.x2 || 0,
        y2: b.y2 || 0,
        score: b.score || 0,
        id: i,
      }));
    }
  } catch {
    console.warn("解析检测框失败");
  }
  return parseBoxes(defaultBoxes);
}

function getBoxColor(boxId: number, selected: BBox[], suppressed: number[], currentId?: number, compareId?: number): string {
  if (boxId === currentId) return "stroke-blue-500 stroke-[3]";
  if (boxId === compareId) return "stroke-amber-500 stroke-[2]";
  if (selected.some((b) => b.id === boxId)) return "stroke-emerald-500 stroke-[2]";
  if (suppressed.includes(boxId)) return "stroke-red-300 stroke-[1] opacity-40";
  return "stroke-gray-400 stroke-[1]";
}

function NMSVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10030);

  return (
    <ConfigurableVisualizer<NMSInput, Record<string, never>>
      config={{
        defaultInput: {
          boxes: defaultBoxes,
          iouThreshold: 0.5,
          scoreThreshold: 0.3,
        },
        algorithm: (input) => {
          const boxes = parseBoxes(input.boxes);
          const iouThreshold = Math.max(0, Math.min(1, input.iouThreshold || 0.5));
          const scoreThreshold = Math.max(0, Math.min(1, input.scoreThreshold || 0.3));
          return generateNMSSteps(boxes, iouThreshold, scoreThreshold);
        },
        inputTypes: [
          { type: "string", key: "boxes", label: "检测框（JSON）" },
          { type: "number", key: "iouThreshold", label: "IoU 阈值", min: 0 },
          { type: "number", key: "scoreThreshold", label: "置信度阈值", min: 0 },
        ],
        inputFields: [
          { type: "string", key: "boxes", label: "检测框（JSON）", placeholder: defaultBoxes },
          { type: "number", key: "iouThreshold", label: "IoU 阈值", placeholder: "0.5" },
          { type: "number", key: "scoreThreshold", label: "置信度阈值", placeholder: "0.3" },
        ],
        testCases: [
          { label: "默认示例", value: { boxes: defaultBoxes, iouThreshold: 0.5, scoreThreshold: 0.3 } },
          { label: "低 IoU 阈值", value: { boxes: defaultBoxes, iouThreshold: 0.3, scoreThreshold: 0.3 } },
          { label: "高 IoU 阈值", value: { boxes: defaultBoxes, iouThreshold: 0.7, scoreThreshold: 0.3 } },
        ],
        render: ({ variables }) => {
          const boxes = (variables?.boxes as BBox[] | undefined) || parseBoxes(defaultBoxes);
          const selected = (variables?.selected as BBox[] | undefined) || [];
          const suppressed = (variables?.suppressed as number[] | undefined) || [];
          const currentBoxId = variables?.currentBoxId as number | undefined;
          const compareBoxId = variables?.compareBoxId as number | undefined;
          const iou = variables?.iou as number | undefined;
          const phase = (variables?.phase as string) || "init";

          const maxX = Math.max(...boxes.map((b) => b.x2), 300);
          const maxY = Math.max(...boxes.map((b) => b.y2), 200);
          const scale = Math.min(400 / maxX, 300 / maxY);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">非极大值抑制（NMS）</h3>
                <p className="text-sm text-gray-600">
                  从重叠的检测框中筛选最优结果：按置信度排序，保留最高分框，抑制与其 IoU 超过阈值的框。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">检测框可视化</h4>
                  <svg
                    viewBox={`0 0 ${maxX * scale + 20} ${maxY * scale + 20}`}
                    className="w-full h-64 bg-slate-50 rounded border"
                  >
                    {boxes.map((box) => (
                      <g key={box.id}>
                        <rect
                          x={box.x1 * scale + 10}
                          y={box.y1 * scale + 10}
                          width={(box.x2 - box.x1) * scale}
                          height={(box.y2 - box.y1) * scale}
                          fill="none"
                          className={getBoxColor(box.id, selected, suppressed, currentBoxId, compareBoxId)}
                        />
                        <text
                          x={box.x1 * scale + 12}
                          y={box.y1 * scale + 22}
                          className="text-[10px] fill-gray-700"
                        >
                          #{box.id} ({box.score.toFixed(2)})
                        </text>
                      </g>
                    ))}
                  </svg>
                  <div className="mt-2 flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-emerald-500 rounded"></div>
                      <span>已选择</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-red-300 opacity-40 rounded"></div>
                      <span>已抑制</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-blue-500 rounded"></div>
                      <span>当前框</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">检测框列表</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {boxes.map((box) => {
                      const isSelected = selected.some((b) => b.id === box.id);
                      const isSuppressed = suppressed.includes(box.id);
                      const isCurrent = box.id === currentBoxId;
                      const isCompare = box.id === compareBoxId;
                      return (
                        <div
                          key={box.id}
                          className={`p-2 rounded border text-sm ${
                            isCurrent
                              ? "bg-blue-100 border-blue-400"
                              : isCompare
                              ? "bg-amber-100 border-amber-400"
                              : isSelected
                              ? "bg-emerald-50 border-emerald-300"
                              : isSuppressed
                              ? "bg-red-50 border-red-200 opacity-50"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="font-mono">#{box.id}</span>
                            <span className="font-semibold">{box.score.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            ({box.x1},{box.y1}) - ({box.x2},{box.y2})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {(phase === "suppress" || phase === "keep") && iou !== undefined && (
                <div
                  className={`rounded-lg border p-4 ${
                    phase === "suppress"
                      ? "bg-red-50 border-red-200"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <div className="text-sm">
                    <span className="font-semibold">IoU 计算：</span>
                    <span className="ml-2 font-mono">
                      框 #{currentBoxId} ∩ 框 #{compareBoxId} = {iou?.toFixed(4)}
                    </span>
                    <span className="ml-2">
                      {phase === "suppress" ? "→ 超过阈值，抑制" : "→ 未超过阈值，保留"}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">NMS 结果</h4>
                <div className="text-sm text-amber-700">
                  保留框：{selected.length} 个
                  {selected.length > 0 && (
                    <span className="ml-2">
                      [{selected.map((b) => `#${b.id}`).join(", ")}]
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default NMSVisualizer;

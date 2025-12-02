import type { CSSProperties } from "react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";
import { generateVisionAttentionSteps } from "./algorithm";

interface VisionAttentionInput extends ProblemInput {
  patches: string | number[][];
  queryIndex: number;
  temperature: number;
}

const defaultPatchPreset =
  "[[0.82,0.31,0.15],[0.24,0.68,0.41],[0.93,0.12,0.48],[0.37,0.59,0.26]]";

function parsePatches(raw: string | number[][]): number[][] {
  if (Array.isArray(raw)) {
    return raw as number[][];
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (row: unknown) =>
          Array.isArray(row) && row.every((value) => typeof value === "number")
      )
    ) {
      return parsed as number[][];
    }
  } catch (error) {
    console.warn("解析 patches 失败，使用默认值。", error);
  }
  return JSON.parse(defaultPatchPreset) as number[][];
}

function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return Math.min(Math.max(Math.floor(index), 0), length - 1);
}

function normalizeNumber(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(num) ? num : fallback;
}

function getWeightColor(weight: number, isQuery: boolean): string {
  if (isQuery) {
    return "from-violet-500/90 to-violet-600/90";
  }
  if (weight <= 0) {
    return "from-slate-200 to-slate-300";
  }
  if (weight > 0.6) return "from-emerald-400 to-emerald-500";
  if (weight > 0.3) return "from-blue-400 to-blue-500";
  if (weight > 0.1) return "from-sky-300 to-sky-400";
  return "from-slate-200 to-slate-300";
}

function formatNumber(value?: number, digits = 3): string {
  if (value === undefined || Number.isNaN(value)) {
    return "--";
  }
  return value.toFixed(digits);
}

function getHeatmapStyle(weight: number): CSSProperties {
  const safeWeight = Math.max(0, Math.min(weight, 1));
  const hue = 210 - safeWeight * 160; // blue → red as weight increases
  const saturation = 75;
  const lightness = 92 - safeWeight * 35;
  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    boxShadow: safeWeight > 0.6 ? "0 0 12px rgba(59,130,246,0.35)" : undefined,
  };
}

function VisionAttentionVisualizer() {
  return (
    <ConfigurableVisualizer<VisionAttentionInput, Record<string, never>>
      config={{
        defaultInput: {
          patches: defaultPatchPreset,
          queryIndex: 0,
          temperature: 0.8,
        },
        algorithm: (input) => {
          const patches = parsePatches(input.patches);
          const queryIndex = clampIndex(
            normalizeNumber(input.queryIndex, 0),
            patches.length
          );
          const temperature = Math.max(
            0.01,
            normalizeNumber(input.temperature, 1)
          );
          return generateVisionAttentionSteps(
            patches,
            queryIndex,
            temperature
          );
        },
        inputTypes: [
          { type: "string", key: "patches", label: "Patch 向量（JSON）" },
          { type: "number", key: "queryIndex", label: "Query 索引", min: 0 },
          {
            type: "number",
            key: "temperature",
            label: "温度",
            min: 0,
          },
        ],
        inputFields: [
          {
            type: "string",
            key: "patches",
            label: "Patch 向量（JSON）",
            placeholder: defaultPatchPreset,
          },
          {
            type: "number",
            key: "queryIndex",
            label: "Query 索引",
            placeholder: "0",
          },
          {
            type: "number",
            key: "temperature",
            label: "温度",
            placeholder: "0.8",
          },
        ],
        testCases: [
          {
            label: "默认示例",
            value: {
              patches: defaultPatchPreset,
              queryIndex: 0,
              temperature: 0.8,
            },
          },
          {
            label: "高温度",
            value: {
              patches:
                "[[0.65,0.22,0.45],[0.3,0.71,0.33],[0.5,0.54,0.25],[0.9,0.12,0.67]]",
              queryIndex: 2,
              temperature: 1.6,
            },
          },
        ],
        render: ({ visualization, variables }) => {
          const currentInput = visualization.input as VisionAttentionInput;
          const rawPatches = currentInput.patches;
          const patches = parsePatches(rawPatches);
          const queryIndex = clampIndex(
            normalizeNumber(currentInput.queryIndex, 0),
            patches.length
          );
          const weights = (variables?.weights as number[]) || [];
          const scores = (variables?.scores as number[]) || [];
          const scaledScores = (variables?.scaledScores as number[]) || [];
          const contextVector = (variables?.contextVector as number[]) || [];

          return (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Vision Transformer 注意力推理
                </h3>
                <p className="text-sm text-gray-600">
                  Query 选择某个 patch，依次与所有 Key 做点积 →
                  温度缩放 →
                  Softmax 得到注意力权重 →
                  加权求和得到上下文向量。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Patch 空间
                    </h4>
                    <span className="text-xs text-gray-500">
                      {patches.length} 个 patch · 每个维度 {patches[0]?.length || 0}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {patches.map((vector, idx) => {
                      const weight = weights[idx] ?? 0;
                      const isQuery = idx === queryIndex;
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl p-4 text-white shadow-md transition transform ${
                            isQuery ? "scale-105" : ""
                          } bg-gradient-to-br ${getWeightColor(
                            weight,
                            isQuery
                          )}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold">
                              Patch #{idx}
                            </div>
                            {isQuery && (
                              <span className="text-xs px-2 py-0.5 bg-white/30 rounded-full font-semibold">
                                Query
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono space-y-1">
                            {vector.map((value, dim) => (
                              <div key={dim} className="flex justify-between">
                                <span>f{dim}</span>
                                <span>{formatNumber(value, 2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-xs font-semibold">
                            权重：{formatNumber(weight)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      点积分数
                    </h4>
                    <div className="space-y-1">
                      {patches.map((_, idx) => (
                        <div
                          key={`score-${idx}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-500">Q · K#{idx}</span>
                          <span className="font-mono text-gray-900">
                            {formatNumber(scores[idx])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      温度缩放后
                    </h4>
                    <div className="space-y-1">
                      {patches.map((_, idx) => (
                        <div
                          key={`scaled-${idx}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-500">score′#{idx}</span>
                          <span className="font-mono text-gray-900">
                            {formatNumber(scaledScores[idx])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      权重（Softmax）
                    </h4>
                    <div className="space-y-1">
                      {patches.map((_, idx) => (
                        <div
                          key={`weight-${idx}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-500">α#{idx}</span>
                          <span className="font-mono text-gray-900">
                            {formatNumber(weights[idx])}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      注意力热力图
                    </h4>
                    <p className="text-xs text-gray-500">
                      颜色越接近红色代表权重越高，蓝色则说明贡献较小。
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    温度：{formatNumber(normalizeNumber(currentInput.temperature, 1), 2)}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="inline-flex items-end gap-3">
                    {patches.map((_, idx) => {
                      const weight = weights[idx] ?? 0;
                      const isQuery = idx === queryIndex;
                      return (
                        <div key={`heat-${idx}`} className="flex flex-col items-center text-xs">
                          <div className="mb-2 text-gray-500">
                            #{idx} {isQuery ? "(Q)" : ""}
                          </div>
                          <div
                            className="w-12 h-16 rounded-lg border border-gray-200 flex items-center justify-center font-mono text-[10px] text-gray-900"
                            style={getHeatmapStyle(weight)}
                          >
                            {formatNumber(weight, 2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      上下文向量
                    </h4>
                    <p className="text-xs text-gray-500">
                      ∑ α<sub>i</sub> · V<sub>i</sub>
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {variables?.finished ? "✓ 计算完成" : "计算中..."}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {contextVector.length > 0 ? (
                    contextVector.map((value, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center"
                      >
                        <div className="text-xs text-emerald-700 mb-1">
                          维度 {idx}
                        </div>
                        <div className="text-lg font-semibold text-emerald-700">
                          {formatNumber(value)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      等待第一步执行...
                    </div>
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

export default VisionAttentionVisualizer;


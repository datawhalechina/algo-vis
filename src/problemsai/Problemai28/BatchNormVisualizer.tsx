import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateBatchNormSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface BatchNormInput extends ProblemInput {
  batch: string | number[][];
  gamma: number;
  beta: number;
  epsilon: number;
}

const defaultBatch = "[[2,4,6],[3,5,7],[4,6,8],[5,7,9]]";

function parseMatrix(raw: string | number[][]): number[][] {
  if (Array.isArray(raw)) return raw as number[][];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((row: unknown) => Array.isArray(row))) {
      return parsed as number[][];
    }
  } catch {
    console.warn("解析矩阵失败");
  }
  return JSON.parse(defaultBatch) as number[][];
}

function formatNum(val: number | undefined, digits = 3): string {
  if (val === undefined || Number.isNaN(val)) return "--";
  return val.toFixed(digits);
}

function BatchNormVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10028);

  return (
    <ConfigurableVisualizer<BatchNormInput, Record<string, never>>
      config={{
        defaultInput: {
          batch: defaultBatch,
          gamma: 1,
          beta: 0,
          epsilon: 0.00001,
        },
        algorithm: (input) => {
          const batchData = parseMatrix(input.batch);
          const gamma = input.gamma ?? 1;
          const beta = input.beta ?? 0;
          const epsilon = input.epsilon ?? 0.00001;
          return generateBatchNormSteps(batchData, gamma, beta, epsilon);
        },
        inputTypes: [
          { type: "string", key: "batch", label: "批次数据（JSON）" },
          { type: "number", key: "gamma", label: "γ (缩放)" },
          { type: "number", key: "beta", label: "β (平移)" },
          { type: "number", key: "epsilon", label: "ε (稳定项)" },
        ],
        inputFields: [
          { type: "string", key: "batch", label: "批次数据（JSON）", placeholder: defaultBatch },
          { type: "number", key: "gamma", label: "γ (缩放)", placeholder: "1" },
          { type: "number", key: "beta", label: "β (平移)", placeholder: "0" },
          { type: "number", key: "epsilon", label: "ε (稳定项)", placeholder: "0.00001" },
        ],
        testCases: [
          { label: "默认示例", value: { batch: defaultBatch, gamma: 1, beta: 0, epsilon: 0.00001 } },
          { label: "缩放γ=2", value: { batch: defaultBatch, gamma: 2, beta: 0, epsilon: 0.00001 } },
          { label: "平移β=1", value: { batch: defaultBatch, gamma: 1, beta: 1, epsilon: 0.00001 } },
        ],
        render: ({ variables }) => {
          const batch = (variables?.batch as number[][] | undefined) || parseMatrix(defaultBatch);
          const means = (variables?.means as number[] | undefined) || [];
          const variances = (variables?.variances as number[] | undefined) || [];
          const normalized = (variables?.normalized as number[][] | undefined) || [];
          const output = (variables?.output as number[][] | undefined) || [];
          const phase = (variables?.phase as string) || "init";
          const gamma = (variables?.gamma as number) ?? 1;
          const beta = (variables?.beta as number) ?? 0;

          const featureDim = batch[0]?.length || 0;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">批量归一化</h3>
                <p className="text-sm text-gray-600">
                  对每个特征维度独立计算均值和方差，标准化后通过可学习参数 γ 和 β 恢复表达能力。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">输入批次</h4>
                  <div className="overflow-x-auto">
                    <table className="border-collapse w-full">
                      <thead>
                        <tr>
                          <th className="text-xs text-gray-500 p-2">样本</th>
                          {Array.from({ length: featureDim }, (_, i) => (
                            <th key={i} className="text-xs text-gray-500 p-2">特征{i}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {batch.map((sample, i) => (
                          <tr key={i}>
                            <td className="text-xs text-gray-500 p-2 text-center">{i}</td>
                            {sample.map((val, j) => (
                              <td
                                key={j}
                                className="text-center text-sm font-mono p-2 border bg-slate-50"
                              >
                                {formatNum(val, 2)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">统计量</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-2">均值 μ（每维度）</div>
                      <div className="flex gap-2 flex-wrap">
                        {means.length > 0 ? (
                          means.map((m, i) => (
                            <div
                              key={i}
                              className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm font-mono"
                            >
                              μ{i}={formatNum(m)}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">等待计算...</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-2">方差 σ²（每维度）</div>
                      <div className="flex gap-2 flex-wrap">
                        {variances.length > 0 ? (
                          variances.map((v, i) => (
                            <div
                              key={i}
                              className="px-3 py-2 bg-amber-50 border border-amber-200 rounded text-sm font-mono"
                            >
                              σ²{i}={formatNum(v)}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">等待计算...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {(phase === "normalize" || phase === "scale" || phase === "done") && normalized.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">标准化结果 x̂</h4>
                  <div className="overflow-x-auto">
                    <table className="border-collapse w-full">
                      <thead>
                        <tr>
                          <th className="text-xs text-gray-500 p-2">样本</th>
                          {Array.from({ length: featureDim }, (_, i) => (
                            <th key={i} className="text-xs text-gray-500 p-2">特征{i}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {normalized.map((sample, i) => (
                          <tr key={i}>
                            <td className="text-xs text-gray-500 p-2 text-center">{i}</td>
                            {sample.map((val, j) => (
                              <td
                                key={j}
                                className="text-center text-sm font-mono p-2 border bg-emerald-50"
                              >
                                {formatNum(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(phase === "scale" || phase === "done") && output.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    最终输出 y = γ × x̂ + β（γ={gamma}, β={beta}）
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="border-collapse w-full">
                      <thead>
                        <tr>
                          <th className="text-xs text-gray-500 p-2">样本</th>
                          {Array.from({ length: featureDim }, (_, i) => (
                            <th key={i} className="text-xs text-gray-500 p-2">特征{i}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {output.map((sample, i) => (
                          <tr key={i}>
                            <td className="text-xs text-gray-500 p-2 text-center">{i}</td>
                            {sample.map((val, j) => (
                              <td
                                key={j}
                                className="text-center text-sm font-mono p-2 border bg-violet-50"
                              >
                                {formatNum(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-4">
                <h4 className="text-sm font-semibold text-cyan-800 mb-2">公式</h4>
                <div className="text-sm text-cyan-700 font-mono space-y-1">
                  <div>x̂ = (x - μ) / √(σ² + ε)</div>
                  <div>y = γ × x̂ + β</div>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default BatchNormVisualizer;

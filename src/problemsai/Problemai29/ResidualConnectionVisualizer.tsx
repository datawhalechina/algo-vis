import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateResidualSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface ResidualInput extends ProblemInput {
  input: string | number[];
  convWeights1: string | number[];
  convWeights2: string | number[];
  useProjection: boolean;
}

const defaultInput = "[1,2,3,4]";
const defaultWeights1 = "[0.5,0.8,0.3,0.6]";
const defaultWeights2 = "[0.4,0.7,0.2,0.5]";

function parseArray(raw: string | number[]): number[] {
  if (Array.isArray(raw)) return raw as number[];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as number[];
  } catch {
    console.warn("解析数组失败");
  }
  return JSON.parse(defaultInput) as number[];
}

function formatNum(val: number | undefined, digits = 3): string {
  if (val === undefined || Number.isNaN(val)) return "--";
  return val.toFixed(digits);
}

function ResidualConnectionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10029);

  return (
    <ConfigurableVisualizer<ResidualInput, Record<string, never>>
      config={{
        defaultInput: {
          input: defaultInput,
          convWeights1: defaultWeights1,
          convWeights2: defaultWeights2,
          useProjection: false,
        },
        algorithm: (input) => {
          const inputArr = parseArray(input.input);
          const weights1 = parseArray(input.convWeights1);
          const weights2 = parseArray(input.convWeights2);
          return generateResidualSteps(inputArr, weights1, weights2, input.useProjection);
        },
        inputTypes: [
          { type: "string", key: "input", label: "输入向量（JSON）" },
          { type: "string", key: "convWeights1", label: "卷积权重1（JSON）" },
          { type: "string", key: "convWeights2", label: "卷积权重2（JSON）" },
          { type: "boolean", key: "useProjection", label: "使用投影" },
        ],
        inputFields: [
          { type: "string", key: "input", label: "输入向量（JSON）", placeholder: defaultInput },
          { type: "string", key: "convWeights1", label: "卷积权重1", placeholder: defaultWeights1 },
          { type: "string", key: "convWeights2", label: "卷积权重2", placeholder: defaultWeights2 },
          { type: "boolean", key: "useProjection", label: "使用投影层" },
        ],
        testCases: [
          {
            label: "默认（恒等映射）",
            value: { input: defaultInput, convWeights1: defaultWeights1, convWeights2: defaultWeights2, useProjection: false },
          },
          {
            label: "带投影层",
            value: { input: defaultInput, convWeights1: defaultWeights1, convWeights2: defaultWeights2, useProjection: true },
          },
        ],
        render: ({ variables }) => {
          const input = (variables?.input as number[] | undefined) || parseArray(defaultInput);
          const shortcut = (variables?.shortcut as number[] | undefined) || [];
          const conv1Out = (variables?.conv1Out as number[] | undefined) || [];
          const relu1Out = (variables?.relu1Out as number[] | undefined) || [];
          const conv2Out = (variables?.conv2Out as number[] | undefined) || [];
          const finalShortcut = (variables?.finalShortcut as number[] | undefined) || shortcut;
          const residualSum = (variables?.residualSum as number[] | undefined) || [];
          const output = (variables?.output as number[] | undefined) || [];
          const phase = (variables?.phase as string) || "init";

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">残差连接</h3>
                <p className="text-sm text-gray-600">
                  通过跳跃连接将输入直接加到输出，使梯度能够无衰减地流过深层网络。
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">残差块结构</h4>
                <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
                  <div className="px-3 py-2 bg-slate-100 rounded border">输入 x</div>
                  <span className="text-gray-400">→</span>
                  <div className="px-3 py-2 bg-blue-100 rounded border border-blue-300">Conv1</div>
                  <span className="text-gray-400">→</span>
                  <div className="px-3 py-2 bg-amber-100 rounded border border-amber-300">ReLU</div>
                  <span className="text-gray-400">→</span>
                  <div className="px-3 py-2 bg-blue-100 rounded border border-blue-300">Conv2</div>
                  <span className="text-gray-400">→</span>
                  <div className="px-3 py-2 bg-emerald-100 rounded border border-emerald-300">+ x</div>
                  <span className="text-gray-400">→</span>
                  <div className="px-3 py-2 bg-amber-100 rounded border border-amber-300">ReLU</div>
                  <span className="text-gray-400">→</span>
                  <div className="px-3 py-2 bg-violet-100 rounded border border-violet-300">输出</div>
                </div>
                <div className="flex justify-center mt-2">
                  <div className="text-xs text-gray-500 border-t border-dashed border-gray-300 pt-2 px-4">
                    ↑ 跳跃连接（shortcut）
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">主路径计算</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-20">输入 x:</span>
                      <div className="flex gap-1 flex-wrap">
                        {input.map((v, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 rounded font-mono text-xs">
                            {formatNum(v, 2)}
                          </span>
                        ))}
                      </div>
                    </div>
                    {conv1Out.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">Conv1:</span>
                        <div className="flex gap-1 flex-wrap">
                          {conv1Out.map((v, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-50 rounded font-mono text-xs">
                              {formatNum(v, 2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {relu1Out.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">ReLU:</span>
                        <div className="flex gap-1 flex-wrap">
                          {relu1Out.map((v, i) => (
                            <span key={i} className="px-2 py-1 bg-amber-50 rounded font-mono text-xs">
                              {formatNum(v, 2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {conv2Out.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">Conv2:</span>
                        <div className="flex gap-1 flex-wrap">
                          {conv2Out.map((v, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-50 rounded font-mono text-xs">
                              {formatNum(v, 2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">残差相加</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-20">Shortcut:</span>
                      <div className="flex gap-1 flex-wrap">
                        {(finalShortcut.length > 0 ? finalShortcut : shortcut).map((v, i) => (
                          <span key={i} className="px-2 py-1 bg-emerald-50 rounded font-mono text-xs">
                            {formatNum(v, 2)}
                          </span>
                        ))}
                      </div>
                    </div>
                    {residualSum.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">F(x)+x:</span>
                        <div className="flex gap-1 flex-wrap">
                          {residualSum.map((v, i) => (
                            <span key={i} className="px-2 py-1 bg-emerald-100 rounded font-mono text-xs">
                              {formatNum(v, 2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {output.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20 font-semibold">输出:</span>
                        <div className="flex gap-1 flex-wrap">
                          {output.map((v, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-violet-100 rounded font-mono text-xs font-semibold"
                            >
                              {formatNum(v, 2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 rounded-lg border border-rose-200 p-4">
                <h4 className="text-sm font-semibold text-rose-800 mb-2">为什么残差连接有效？</h4>
                <ul className="text-sm text-rose-700 space-y-1">
                  <li>• <strong>梯度直通</strong>：反向传播时梯度可直接通过跳跃连接传递</li>
                  <li>• <strong>恒等映射</strong>：即使卷积层学习为零，网络仍输出输入</li>
                  <li>• <strong>深层训练</strong>：使得训练数百层网络成为可能（ResNet-152+）</li>
                </ul>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default ResidualConnectionVisualizer;

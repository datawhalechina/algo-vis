import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateT2ISteps, T2ISample } from "./algorithm";

interface T2IInput extends ProblemInput {
  prompt: string;
  steps: number;
  guidance: number;
}

// 用彩色 emoji 点阵构造 8×8 "图像"
function buildSample(prompt: string): T2ISample {
  const p = prompt.toLowerCase();
  let theme = "cat";
  let targetGrid: string[][] = [];
  let palette: string[] = [];

  if (p.includes("cat")) {
    theme = "cat";
    palette = ["#fcd34d", "#f97316", "#111827"];
    targetGrid = [
      ["", "🟧", "", "", "", "", "🟧", ""],
      ["🟧", "🟧", "🟧", "🟧", "🟧", "🟧", "🟧", "🟧"],
      ["🟧", "⬛", "🟧", "🟧", "🟧", "🟧", "⬛", "🟧"],
      ["🟧", "🟧", "🟧", "⬛", "⬛", "🟧", "🟧", "🟧"],
      ["🟧", "🟧", "🟧", "🟧", "🟧", "🟧", "🟧", "🟧"],
      ["", "🟧", "🟧", "🟧", "🟧", "🟧", "🟧", ""],
      ["", "", "🟧", "🟧", "🟧", "🟧", "", ""],
      ["", "", "", "🟧", "🟧", "", "", ""],
    ];
  } else if (p.includes("sun") || p.includes("flower")) {
    theme = "sunflower";
    palette = ["#facc15", "#ca8a04", "#10b981"];
    targetGrid = [
      ["", "", "🟨", "🟨", "🟨", "🟨", "", ""],
      ["", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨", ""],
      ["🟨", "🟨", "🟫", "🟫", "🟫", "🟫", "🟨", "🟨"],
      ["🟨", "🟨", "🟫", "🟫", "🟫", "🟫", "🟨", "🟨"],
      ["", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨", ""],
      ["", "", "🟩", "🟩", "🟩", "🟩", "", ""],
      ["", "", "", "🟩", "🟩", "", "", ""],
      ["", "", "", "🟩", "🟩", "", "", ""],
    ];
  } else if (p.includes("house") || p.includes("home")) {
    theme = "house";
    palette = ["#ef4444", "#f59e0b", "#1e40af"];
    targetGrid = [
      ["", "", "", "🟥", "🟥", "", "", ""],
      ["", "", "🟥", "🟥", "🟥", "🟥", "", ""],
      ["", "🟥", "🟥", "🟥", "🟥", "🟥", "🟥", ""],
      ["🟨", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨"],
      ["🟨", "🟨", "🟦", "🟦", "🟨", "🟨", "🟫", "🟨"],
      ["🟨", "🟨", "🟦", "🟦", "🟨", "🟨", "🟫", "🟨"],
      ["🟨", "🟨", "🟨", "🟨", "🟨", "🟨", "🟫", "🟨"],
      ["🟨", "🟨", "🟨", "🟨", "🟨", "🟨", "🟫", "🟨"],
    ];
  } else {
    // default: smiling face
    theme = "face";
    palette = ["#fde68a", "#f59e0b"];
    targetGrid = [
      ["", "", "🟨", "🟨", "🟨", "🟨", "", ""],
      ["", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨", ""],
      ["🟨", "🟨", "⬛", "🟨", "🟨", "⬛", "🟨", "🟨"],
      ["🟨", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨"],
      ["🟨", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨", "🟨"],
      ["🟨", "⬛", "🟨", "🟨", "🟨", "🟨", "⬛", "🟨"],
      ["", "🟨", "⬛", "⬛", "⬛", "⬛", "🟨", ""],
      ["", "", "🟨", "🟨", "🟨", "🟨", "", ""],
    ];
  }

  return { prompt, targetGrid, theme, palette };
}

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    encode_text: { label: "文本编码", color: "bg-indigo-100 text-indigo-700" },
    noise: { label: "采样噪声", color: "bg-rose-100 text-rose-700" },
    denoise: { label: "迭代去噪", color: "bg-amber-100 text-amber-700" },
    complete: { label: "生成完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function TextToImageVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10064);

  return (
    <ConfigurableVisualizer<T2IInput, Record<string, never>>
      config={{
        defaultInput: { prompt: "a cat", steps: 6, guidance: 7.5 },
        algorithm: (input) => {
          const sample = buildSample(String(input.prompt));
          const steps =
            typeof input.steps === "number"
              ? input.steps
              : parseInt(String(input.steps)) || 6;
          const guidance =
            typeof input.guidance === "number"
              ? input.guidance
              : parseFloat(String(input.guidance)) || 7.5;
          return generateT2ISteps(sample, steps, guidance);
        },
        inputTypes: [
          { type: "string", key: "prompt", label: "Prompt" },
          { type: "number", key: "steps", label: "去噪步数" },
          { type: "number", key: "guidance", label: "引导强度" },
        ],
        inputFields: [
          {
            type: "string",
            key: "prompt",
            label: "Prompt（cat / sunflower / house）",
            placeholder: "a cat",
          },
          { type: "number", key: "steps", label: "去噪步数 T", placeholder: "6" },
          {
            type: "number",
            key: "guidance",
            label: "引导强度 w",
            placeholder: "7.5",
          },
        ],
        testCases: [
          { label: "🐱 a cat", value: { prompt: "a cat", steps: 6, guidance: 7.5 } },
          { label: "🌻 a sunflower", value: { prompt: "a sunflower", steps: 8, guidance: 7.5 } },
          { label: "🏠 a house", value: { prompt: "a house", steps: 6, guidance: 5.0 } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sample = variables?.sample as T2ISample | undefined;
          const T = (variables?.T as number) ?? 6;
          const guidance = (variables?.guidance as number) ?? 7.5;
          const grid = (variables?.grid as number[][] | undefined) ?? [];
          const currentT = variables?.currentT as number | undefined;
          const progress = variables?.progress as number | undefined;

          if (!sample) return null;

          const showGrid = ["noise", "denoise", "complete"].includes(phase);
          const noiseLevel =
            phase === "complete"
              ? 0
              : progress !== undefined
              ? 1 - progress
              : phase === "noise"
              ? 1
              : 0;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "说\"一只猫\"，凭空画出一张图？",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          一张图有成千上万个像素，可能的像素组合是<b>天文数字</b>。
                          直接"让模型输出所有像素"几乎没法学。怎么才能可控地生成符合描述的图？
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "反向思考：从噪声里\"雕\"出一张图",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          <b>扩散模型的魔法</b>：先假设一张真实的图 <InlineMath math="z_0" /> 经过 T 步逐渐加噪，
                          最终变成纯高斯噪声 <InlineMath math="z_T" />——这个过程是<b>已知的</b>。
                        </p>
                        <p>
                          那么反过来：<b>从纯噪声 <InlineMath math="z_T" /> 出发，一步步"去噪"，就能还原（或生成）一张真实图</b>！
                          就像米开朗基罗说的"雕像本就在石头里，我只是去掉多余的部分"。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——用文字控制每一步去噪",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          训练一个<b>神经网络 UNet</b> <InlineMath math="\epsilon_\theta" />，
                          让它学会在每步 t 预测<b>"这里应该减掉多少噪声"</b>。
                          关键是：它的输入除了当前噪声图 <InlineMath math="z_t" /> 和时间 t，还有<b>文字嵌入 c</b>。
                        </p>
                        <p>
                          换句话说，UNet 在学"<b>给定文字条件下，这张噪声图里埋着一只什么</b>"。
                          文字不同，它就把噪声雕向不同形状。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "Classifier-Free Guidance：强化文字的声音",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          实战中会同时算两次：一次<b>有文字条件</b>的噪声 <InlineMath math="\epsilon_\theta(z_t, t, c)" />，
                          一次<b>无条件</b>的 <InlineMath math="\epsilon_\theta(z_t, t, \varnothing)" />。
                        </p>
                        <p>
                          用引导强度 <b>w</b> 把两者"外推"：
                          <InlineMath math="\tilde{\epsilon} = \epsilon_\varnothing + w(\epsilon_c - \epsilon_\varnothing)" />。
                          w 越大 → 图像越"服从"文字，但多样性下降；w 太小 → 图多样但不贴近文字。
                          最后 VAE 解码器把去噪后的潜在 <InlineMath math="z_0" /> 转回像素。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    文本到图像生成（Latent Diffusion）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`z_{t-1} = \frac{1}{\sqrt{\alpha_t}}\left(z_t - \frac{1-\alpha_t}{\sqrt{1-\bar{\alpha}_t}}\,\epsilon_\theta(z_t, t, c)\right) + \sigma_t\,\mathbf{n}`} />
                <BlockMath math={String.raw`\tilde{\epsilon}_\theta = \epsilon_\theta(z_t, t, \varnothing) + w\cdot\left[\epsilon_\theta(z_t, t, c) - \epsilon_\theta(z_t, t, \varnothing)\right]`} />
                <p className="text-xs text-gray-500 mt-1">
                  Prompt: <span className="font-mono text-gray-800">"{sample.prompt}"</span>
                  {" | 步数 T="}{T}{" | 引导强度 w="}{guidance}
                </p>
              </div>

              {/* 图像画布 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-800">
                    潜在空间 z_t （8×8 网格）
                  </h4>
                  {currentT !== undefined && (
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-mono">
                      t = {currentT}
                    </span>
                  )}
                </div>
                <div className="flex justify-center">
                  <div className="inline-block">
                    <div className="grid grid-cols-8 gap-0.5 bg-gray-900 p-1 rounded-lg">
                      {showGrid
                        ? (grid.length ? grid : sample.targetGrid.map((row) => row.map(() => 1))).map((row, i) =>
                            row.map((val, j) => {
                              const targetCell = sample.targetGrid[i]?.[j] ?? "";
                              const showTarget =
                                phase === "complete" || (phase === "denoise" && val < 0.5);
                              const pureNoise = phase === "noise";
                              const noiseIntensity = Math.max(0, Math.min(Number(val), 1));
                              return (
                                <div
                                  key={`${i}-${j}`}
                                  className="w-8 h-8 flex items-center justify-center text-base rounded-sm"
                                  style={{
                                    backgroundColor:
                                      pureNoise || noiseIntensity > 0.7
                                        ? `hsl(${Math.round(noiseIntensity * 360)}, 60%, ${40 + noiseIntensity * 20}%)`
                                        : noiseIntensity > 0.3
                                        ? `rgba(107, 114, 128, ${noiseIntensity})`
                                        : "#fafafa",
                                    opacity: 1,
                                  }}
                                >
                                  {showTarget && targetCell ? targetCell : ""}
                                </div>
                              );
                            })
                          )
                        : sample.targetGrid.map((row, i) =>
                            row.map((_, j) => (
                              <div
                                key={`${i}-${j}`}
                                className="w-8 h-8 bg-gray-800 rounded-sm"
                              />
                            ))
                          )}
                    </div>
                  </div>
                </div>
                {noiseLevel !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>噪声强度</span>
                      <span className="font-mono">{(noiseLevel * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-rose-500 rounded-full transition-all"
                        style={{ width: `${noiseLevel * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 去噪时间轴 */}
              {showGrid && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    去噪时间轴（从 t=T 到 t=0）
                  </h4>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: T + 1 }, (_, i) => {
                      const step = T - i;
                      const isDone = currentT !== undefined && step >= currentT;
                      const isCurrent = currentT === step;
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-8 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                            isCurrent
                              ? "bg-amber-500 text-white ring-2 ring-amber-300"
                              : isDone
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          t={step}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-gray-500">
                    <span>纯噪声</span>
                    <span>清晰图像</span>
                  </div>
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① Prompt" },
                    { id: "encode_text", label: "② 文本编码 c" },
                    { id: "noise", label: "③ 采样 z_T" },
                    { id: "denoise", label: "④ 迭代去噪" },
                    { id: "complete", label: "⑤ VAE 解码" },
                  ].map((step, idx, arr) => {
                    const isDone = arr.findIndex((s) => s.id === phase) >= idx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium ${
                            step.id === phase
                              ? "bg-blue-600 text-white shadow-sm"
                              : isDone
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
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

export default TextToImageVisualizer;

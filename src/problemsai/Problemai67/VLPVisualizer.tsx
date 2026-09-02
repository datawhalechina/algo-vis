import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { IntuitionFlow } from "@/components/visualizers/IntuitionFlow";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { generateVLPSteps, VLPSample } from "./algorithm";

interface VLPInput extends ProblemInput {
  sample: string;
}

const SAMPLES: Record<string, VLPSample> = {
  cat_matched: {
    imageLabel: "A cat sitting on a chair",
    imageEmoji: "🐱",
    imageFeat: [0.8, 0.2, 0.6, 0.1],
    tokens: ["A", "[MASK]", "sitting", "on", "a", "chair"],
    origTokens: ["A", "cat", "sitting", "on", "a", "chair"],
    maskedIdx: 1,
    maskCandidates: [
      { word: "cat", logit: 4.2 },
      { word: "dog", logit: 2.1 },
      { word: "bird", logit: 1.0 },
      { word: "man", logit: 0.5 },
    ],
    itmLabel: true,
    itmLogit: 2.5,
  },
  dog_matched: {
    imageLabel: "A dog running in the park",
    imageEmoji: "🐶",
    imageFeat: [0.2, 0.9, 0.5, 0.3],
    tokens: ["A", "dog", "running", "in", "the", "[MASK]"],
    origTokens: ["A", "dog", "running", "in", "the", "park"],
    maskedIdx: 5,
    maskCandidates: [
      { word: "park", logit: 3.8 },
      { word: "yard", logit: 2.5 },
      { word: "street", logit: 1.5 },
      { word: "house", logit: 0.5 },
    ],
    itmLabel: true,
    itmLogit: 2.2,
  },
  mismatched: {
    imageLabel: "A cat image, text about a truck",
    imageEmoji: "🐱",
    imageFeat: [0.8, 0.2, 0.6, 0.1],
    tokens: ["A", "red", "truck", "on", "the", "[MASK]"],
    origTokens: ["A", "red", "truck", "on", "the", "road"],
    maskedIdx: 5,
    maskCandidates: [
      { word: "road", logit: 2.0 },
      { word: "cat", logit: 1.5 },
      { word: "floor", logit: 1.2 },
      { word: "park", logit: 0.8 },
    ],
    itmLabel: false,
    itmLogit: -1.8,
  },
};

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    encode: { label: "双模态编码", color: "bg-blue-100 text-blue-700" },
    mask: { label: "MLM Mask", color: "bg-rose-100 text-rose-700" },
    cross: { label: "跨模态交互", color: "bg-violet-100 text-violet-700" },
    mlm: { label: "MLM 预测", color: "bg-amber-100 text-amber-700" },
    itm: { label: "ITM 匹配", color: "bg-pink-100 text-pink-700" },
    loss: { label: "联合损失", color: "bg-orange-100 text-orange-700" },
    complete: { label: "完成", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function VLPVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10067);

  return (
    <ConfigurableVisualizer<VLPInput, Record<string, never>>
      config={{
        defaultInput: { sample: "cat_matched" },
        algorithm: (input) => {
          const key = String(input.sample) as keyof typeof SAMPLES;
          const s = SAMPLES[key] ?? SAMPLES.cat_matched;
          return generateVLPSteps(s);
        },
        inputTypes: [{ type: "string", key: "sample", label: "样本" }],
        inputFields: [
          {
            type: "string",
            key: "sample",
            label: "样本（cat_matched / dog_matched / mismatched）",
            placeholder: "cat_matched",
          },
        ],
        testCases: [
          { label: "🐱 Matched (猫)", value: { sample: "cat_matched" } },
          { label: "🐶 Matched (狗)", value: { sample: "dog_matched" } },
          { label: "❌ Mismatched (不匹配)", value: { sample: "mismatched" } },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sample = variables?.sample as VLPSample | undefined;
          const maskProbs = variables?.maskProbs as number[] | undefined;
          const bestWord = variables?.bestWord as string | undefined;
          const itmProb = variables?.itmProb as number | undefined;
          const mlmLoss = variables?.mlmLoss as number | undefined;
          const itmLoss = variables?.itmLoss as number | undefined;
          const totalLoss = variables?.totalLoss as number | undefined;

          if (!sample) return null;

          const showMask = ["mask", "cross", "mlm", "itm", "loss", "complete"].includes(phase);
          const showMLM = ["mlm", "itm", "loss", "complete"].includes(phase);
          const showITM = ["itm", "loss", "complete"].includes(phase);
          const showLoss = ["loss", "complete"].includes(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <IntuitionFlow
                chapters={[
                  {
                    number: "1",
                    icon: "🤔",
                    title: "为什么要\"预训练\"视觉-语言模型？",
                    accent: "rose",
                    body: (
                      <>
                        <p>
                          每个下游任务（VQA、caption、retrieval）都从零开始训练模型，
                          <b>数据量不够、参数共享不了、效果也差</b>。
                          就像人学外语：先练<b>听说读写基本功</b>，再做具体任务更容易。
                        </p>
                        <p className="text-slate-600">
                          视觉-语言预训练（VLP）就是让一个大模型在海量<b>图文对</b>上学"基本功"，
                          然后各下游任务都微调它。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "2",
                    icon: "💡",
                    title: "靠\"自监督任务\"——不需要人工标注",
                    accent: "amber",
                    body: (
                      <>
                        <p>
                          互联网上有海量<b>图片 + 对应 caption</b>的天然配对（比如 alt-text）。
                          但这种数据<b>没有"答案标签"</b>。怎么学？
                        </p>
                        <p>
                          答：<b>自己造任务</b>——
                          遮住文本里某个词让模型猜（MLM），打乱图文让模型判断是否匹配（ITM），
                          拉近匹配对推远不匹配对（ITC）。<b>一份数据，三种信号</b>。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "3",
                    icon: "🔑",
                    title: "\"啊哈！\"——MLM 强迫模型\"看图说话\"",
                    accent: "purple",
                    body: (
                      <>
                        <p>
                          把文本里的 "cat" 换成 [MASK]：<b>"A [MASK] sitting on a chair"</b>。
                          光看剩下的文字猜 [MASK] 可能是 cat / dog / man……很难确定。
                        </p>
                        <p>
                          但如果同时<b>给模型看到图里是只猫</b>，
                          它才能自信地填上 "cat"。
                          这就迫使模型<b>必须建立图像-文字对齐</b>才能完成任务——这就是 MLM 在 VLP 里的魔力。
                        </p>
                      </>
                    ),
                  },
                  {
                    number: "4",
                    icon: "🧩",
                    title: "多任务联合训练",
                    accent: "emerald",
                    body: (
                      <>
                        <p>
                          同时优化：
                          <InlineMath math="\mathcal{L}_{total} = \mathcal{L}_{MLM} + \mathcal{L}_{ITM} + \mathcal{L}_{ITC}" />。
                          三个任务从不同角度约束模型，<b>互补</b>。
                        </p>
                        <p>
                          预训练完成后，模型像瑞士军刀：冻结参数 + 加个小分类头，就能做 VQA、caption、retrieval。
                          BLIP、ALIGN、CoCa 都是这条路线。
                        </p>
                      </>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    视觉-语言预训练（BLIP/ALIGN 风格）
                  </h3>
                  <PhaseTag phase={phase} />
                </div>
                <BlockMath math={String.raw`\mathcal{L}_{MLM} = -\sum_{i\in M}\log P(w_i \mid x_{\setminus M}, I),\quad \mathcal{L}_{ITM} = -\log P(y \mid I, T)`} />
                <BlockMath math={String.raw`\mathcal{L}_{total} = \mathcal{L}_{MLM} + \mathcal{L}_{ITM} + \mathcal{L}_{ITC}`} />
              </div>

              {/* 图像 + 文本 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">图像 I</h4>
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{sample.imageEmoji}</div>
                    <div>
                      <div className="text-sm text-gray-800">
                        "{sample.imageLabel}"
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 mt-1">
                        ViT patches → p_1..p_L
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    文本 T（带 [MASK]）
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {sample.tokens.map((tok, i) => {
                      const isMask = tok === "[MASK]";
                      return (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-md text-xs font-mono border ${
                            isMask
                              ? "bg-rose-100 text-rose-800 border-rose-400 ring-2 ring-rose-300"
                              : "bg-indigo-50 text-indigo-800 border-indigo-200"
                          }`}
                        >
                          {tok}
                        </span>
                      );
                    })}
                  </div>
                  {showMask && (
                    <p className="text-[11px] text-rose-700 mt-2">
                      原始词：<span className="font-mono">"{sample.origTokens[sample.maskedIdx]}"</span>
                    </p>
                  )}
                </div>
              </div>

              {/* MLM 预测 */}
              {showMLM && maskProbs && (
                <div className="bg-white rounded-lg border border-amber-300 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-amber-800 mb-3">
                    MLM 预测 <InlineMath math="P(w|x_{\setminus M}, I)" />
                  </h4>
                  <div className="space-y-1.5">
                    {sample.maskCandidates.map((c, i) => {
                      const p = maskProbs[i] ?? 0;
                      const isBest = c.word === bestWord;
                      const isGT = c.word === sample.origTokens[sample.maskedIdx];
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span
                            className={`w-16 font-mono ${
                              isBest ? "font-bold text-emerald-700" : "text-gray-700"
                            }`}
                          >
                            {c.word}
                            {isGT && <span className="text-emerald-600 ml-1">✓</span>}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isBest ? "bg-emerald-500" : "bg-gray-400"
                              }`}
                              style={{ width: `${p * 100}%` }}
                            />
                          </div>
                          <span
                            className={`w-12 text-right font-mono ${
                              isBest ? "font-bold text-emerald-700" : "text-gray-600"
                            }`}
                          >
                            {(p * 100).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ITM */}
              {showITM && itmProb !== undefined && (
                <div className="bg-white rounded-lg border border-pink-300 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-pink-800 mb-3">
                    ITM 匹配分数 <InlineMath math="\sigma(\text{[CLS]})" />
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-pink-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-pink-700 mb-1">匹配概率</div>
                      <div className="text-2xl font-bold text-pink-800">
                        {(itmProb * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-700 mb-1">模型判断</div>
                      <div
                        className={`text-lg font-bold ${
                          itmProb > 0.5 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {itmProb > 0.5 ? "Matched" : "Not Matched"}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-700 mb-1">Ground Truth</div>
                      <div
                        className={`text-lg font-bold ${
                          sample.itmLabel ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {sample.itmLabel ? "Matched" : "Not Matched"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 损失 */}
              {showLoss && totalLoss !== undefined && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    预训练损失
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-amber-700 mb-1">
                        <InlineMath math="\mathcal{L}_{MLM}" />
                      </div>
                      <div className="text-lg font-bold text-amber-800">{mlmLoss}</div>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-pink-700 mb-1">
                        <InlineMath math="\mathcal{L}_{ITM}" />
                      </div>
                      <div className="text-lg font-bold text-pink-800">{itmLoss}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-emerald-700 mb-1">
                        <InlineMath math="\mathcal{L}_{total}" />
                      </div>
                      <div className="text-lg font-bold text-emerald-800">{totalLoss}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 图像+文本" },
                    { id: "encode", label: "② 双编码" },
                    { id: "mask", label: "③ MLM mask" },
                    { id: "cross", label: "④ 跨模态" },
                    { id: "mlm", label: "⑤ MLM 预测" },
                    { id: "itm", label: "⑥ ITM 匹配" },
                    { id: "loss", label: "⑦ 联合损失" },
                    { id: "complete", label: "⑧ 完成" },
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

export default VLPVisualizer;

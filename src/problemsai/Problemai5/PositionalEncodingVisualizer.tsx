import { InlineMath, BlockMath } from "react-katex";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generatePositionalEncodingSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface PositionalEncodingInput extends ProblemInput {
  seqLen: number;
  dModel: number;
}

const DEFAULT_SEQ_LEN = 8;
const DEFAULT_D_MODEL = 16;

// 矩阵列数限制（防止溢出）
const MAX_DISPLAY_COLS = 10;

function getHeatColor(val: number): string {
  const normalized = (val + 1) / 2;
  const hue = 220 - normalized * 220;
  const sat = 75;
  const light = 85 - normalized * 28;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function getTextColor(val: number): string {
  const normalized = (val + 1) / 2;
  return normalized > 0.6 ? "#fff" : "#1e293b";
}

function fmt(v: number, digits = 3): string {
  if (isNaN(v)) return "--";
  return v.toFixed(digits);
}

// ─── 解释面板：seq_len ────────────────────────────────────────────
function ExplainSeqLen({ seqLen }: { seqLen: number }) {
  const exampleTokens = ["The", "cat", "sat", "on", "the", "mat", ".", "…"];
  const tokens = exampleTokens.slice(0, Math.min(seqLen, exampleTokens.length));
  while (tokens.length < seqLen) tokens.push(`t${tokens.length}`);

  return (
    <div className="bg-white rounded-lg border border-purple-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">输入变量</span>
        <h4 className="text-sm font-semibold text-gray-900">
          <InlineMath math={`\\text{seq\\_len} = ${seqLen}`} />
        </h4>
      </div>
      <p className="text-xs text-gray-600">
        <span className="font-semibold">seq_len</span> 是句子里 token（词/字）的数量。下面每个格子代表一个 token，位置下标 <InlineMath math={"\\text{pos}"} /> 从 0 开始。
      </p>
      <div className="flex flex-wrap gap-2">
        {tokens.map((tok, pos) => (
          <div key={pos} className="flex flex-col items-center gap-1">
            <div className="px-3 py-2 rounded-lg border-2 border-purple-300 bg-purple-50 text-xs font-semibold text-purple-800 min-w-[2.5rem] text-center">
              {tok}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">pos={pos}</span>
          </div>
        ))}
        {seqLen > exampleTokens.length && (
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-400 min-w-[2.5rem] text-center">…</div>
            <span className="text-[10px] text-gray-400 font-mono">…</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <span className="text-lg">💡</span>
        <span>每个位置都会得到一个独立的位置编码向量，让模型知道"这个词排在第几位"。</span>
      </div>
    </div>
  );
}

// ─── 解释面板：d_model ────────────────────────────────────────────
function ExplainDModel({ dModel }: { dModel: number }) {
  const showDims = Math.min(dModel, 10);

  return (
    <div className="bg-white rounded-lg border border-blue-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">输入变量</span>
        <h4 className="text-sm font-semibold text-gray-900">
          <InlineMath math={`d_{\\text{model}} = ${dModel}`} />
        </h4>
      </div>
      <p className="text-xs text-gray-600">
        <span className="font-semibold">d_model</span> 是向量的维度数，即每个 token 的嵌入向量由多少个数字组成。位置编码向量也是同样维度，才能与嵌入逐元素相加。
      </p>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="px-4 py-3 rounded-lg border-2 border-blue-300 bg-blue-50 text-sm font-semibold text-blue-800 text-center">
          "cat"
        </div>
        <span className="text-gray-400 text-lg">→</span>
        <div className="flex gap-1 items-center">
          <span className="text-gray-400 font-mono text-sm">[</span>
          {Array.from({ length: showDims }, (_, j) => (
            <div
              key={j}
              className="w-7 h-8 rounded text-center text-[10px] font-mono flex items-center justify-center border border-blue-200"
              style={{ backgroundColor: `hsl(${210 + j * 8}, 60%, ${88 - j * 1.5}%)`, color: "#1e40af" }}
            >
              e{j}
            </div>
          ))}
          {dModel > showDims && (
            <span className="text-gray-400 text-xs ml-1">…+{dModel - showDims}</span>
          )}
          <span className="text-gray-400 font-mono text-sm">]</span>
          <span className="ml-2 text-xs text-gray-500">共 <span className="font-semibold text-blue-700">{dModel}</span> 维</span>
        </div>
      </div>
      <div className="text-xs text-gray-600 bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-100">
        <p className="font-semibold text-blue-800">维度分组规则：</p>
        <p>每两个相邻维度组成一个"维度对"，共 {Math.floor(dModel / 2)} 对：</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Array.from({ length: Math.min(Math.floor(dModel / 2), 5) }, (_, i) => (
            <div key={i} className="flex gap-0.5">
              <span className="px-1.5 py-0.5 bg-blue-400 text-white rounded-l text-[10px] font-mono">
                {i * 2}→sin
              </span>
              <span className="px-1.5 py-0.5 bg-orange-400 text-white rounded-r text-[10px] font-mono">
                {i * 2 + 1}→cos
              </span>
            </div>
          ))}
          {Math.floor(dModel / 2) > 5 && (
            <span className="text-gray-400 text-[10px] self-center">… 共 {Math.floor(dModel / 2)} 对</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <span className="text-lg">💡</span>
        <span>偶数维用 <span className="font-semibold text-blue-600">sin</span>，奇数维用 <span className="font-semibold text-orange-500">cos</span>，对应同一频率的两个正交分量。</span>
      </div>
    </div>
  );
}

// ─── 解释面板：公式分解 ───────────────────────────────────────────
function ExplainFormula({ seqLen, dModel }: { seqLen: number; dModel: number }) {
  const numPairs = Math.floor(dModel / 2);
  const lastI = numPairs - 1;
  const lastExp = Number(((lastI * 2) / dModel).toFixed(2));
  const lastDiv = Number(Math.pow(10000, lastExp).toFixed(0));

  return (
    <div className="bg-white rounded-lg border border-amber-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">公式解读</span>
        <h4 className="text-sm font-semibold text-gray-900">位置编码公式拆解</h4>
      </div>

      {/* 渲染公式 */}
      <div className="bg-amber-50 rounded-lg p-4 space-y-3 border border-amber-100 overflow-x-auto">
        <BlockMath math={String.raw`PE_{(pos,\,2i)} = \sin\!\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)`} />
        <BlockMath math={String.raw`PE_{(pos,\,2i+1)} = \cos\!\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)`} />
      </div>

      {/* 各变量解释 */}
      <div className="space-y-2 text-xs">
        {[
          {
            latex: String.raw`\text{pos}`,
            range: `0 ～ ${seqLen - 1}`,
            color: "bg-purple-50 text-purple-800 border-purple-200",
            desc: "当前 token 在序列中的位置下标，0 表示第一个词。",
            example: `本例共 ${seqLen} 个位置：0, 1, …, ${seqLen - 1}`,
          },
          {
            latex: "i",
            range: `0 ～ ${numPairs - 1}`,
            color: "bg-blue-50 text-blue-800 border-blue-200",
            desc: "维度对下标，决定这对 sin/cos 使用哪个频率。i 越小频率越高（波形变化越快）。",
            example: `本例 d_model=${dModel}，共 ${numPairs} 个维度对`,
          },
          {
            latex: "10000",
            range: "常数",
            color: "bg-green-50 text-green-800 border-green-200",
            desc: "基频常数，使各维度覆盖从高频到低频的宽广范围。",
            example: "i=0 时除数最小、频率最高；i 越大除数越大、频率越低",
          },
          {
            latex: String.raw`10000^{2i/d_{\text{model}}}`,
            range: `1 ～ ≈${lastDiv}`,
            color: "bg-orange-50 text-orange-800 border-orange-200",
            desc: "除项，随 i 增大而增大，使 pos 的变化对高维影响更小，产生低频效果。",
            example: `i=0 → 1，i=${lastI} → 10000^${lastExp}≈${lastDiv}`,
          },
        ].map(({ latex, range, color, desc, example }) => (
          <div key={latex} className={`rounded-lg border p-3 ${color}`}>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-sm"><InlineMath math={latex} /></span>
              <span className="text-[10px] opacity-60">范围：{range}</span>
            </div>
            <p className="opacity-90">{desc}</p>
            <p className="opacity-60 mt-0.5 text-[10px]">→ {example}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 解释面板：输出使用方式 ───────────────────────────────────────
function ExplainOutput({ seqLen, dModel, peMatrix }: { seqLen: number; dModel: number; peMatrix: number[][] }) {
  const showCols = Math.min(dModel, 6);
  const showRows = Math.min(seqLen, 4);

  const fakeEmbed: number[][] = Array.from({ length: showRows }, (_, i) =>
    Array.from({ length: showCols }, (_, j) => Number((Math.sin(i * 1.3 + j * 0.7) * 0.5).toFixed(2)))
  );

  return (
    <div className="bg-white rounded-lg border border-emerald-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">输出说明</span>
        <h4 className="text-sm font-semibold text-gray-900">PE 矩阵如何被使用？</h4>
      </div>

      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 overflow-x-auto">
        <BlockMath math={String.raw`\text{Input} = \text{Embedding}(x) + PE`} />
      </div>

      <p className="text-xs text-gray-600">
        PE 矩阵与 token 嵌入矩阵<span className="font-semibold">逐元素相加</span>后送入 Transformer，使每个向量同时携带语义与位置信息。
      </p>

      {/* 三列矩阵图示 */}
      <div className="overflow-x-auto">
        <div className="flex items-start gap-3 min-w-max text-[10px]">
          {[
            {
              title: "Token Embedding",
              subtitle: "（模型学习）",
              rows: fakeEmbed,
              rowLabel: (i: number) => `t${i}`,
              labelColor: "text-blue-500",
              cellStyle: () => ({ backgroundColor: "#eff6ff", color: "#1e40af" }),
            },
            null, // "+" 符号
            {
              title: "位置编码 PE",
              subtitle: "（公式固定）",
              rows: peMatrix.slice(0, showRows).map(r => r.slice(0, showCols)),
              rowLabel: (i: number) => `p${i}`,
              labelColor: "text-purple-500",
              cellStyle: (v: number) => ({ backgroundColor: getHeatColor(v), color: getTextColor(v) }),
            },
            null, // "=" 符号
            {
              title: "Transformer 输入",
              subtitle: "（语义 + 位置）",
              rows: fakeEmbed.map((row, i) =>
                row.map((v, j) => Number((v + (peMatrix[i]?.[j] ?? 0)).toFixed(2)))
              ),
              rowLabel: (i: number) => `x${i}`,
              labelColor: "text-emerald-600",
              cellStyle: () => ({ backgroundColor: "#ecfdf5", color: "#065f46" }),
            },
          ].map((item, idx) => {
            if (item === null) {
              return (
                <div key={idx} className="self-center text-2xl text-gray-400 font-light px-1">
                  {idx === 1 ? "+" : "="}
                </div>
              );
            }
            return (
              <div key={idx} className="text-center">
                <p className="font-semibold text-gray-700 mb-0.5">{item.title}</p>
                <p className="text-gray-400 mb-1">{item.subtitle}</p>
                <table className="border-collapse">
                  <tbody>
                    {item.rows.map((row, i) => (
                      <tr key={i}>
                        <td className={`pr-1 font-mono text-right w-6 ${item.labelColor}`}>{item.rowLabel(i)}</td>
                        {row.map((v, j) => (
                          <td
                            key={j}
                            className="w-9 h-7 text-center font-mono border border-white/60 rounded"
                            style={item.cellStyle(v)}
                          >
                            {v.toFixed(1)}
                          </td>
                        ))}
                        {showCols < dModel && <td className="pl-1 text-gray-300">…</td>}
                      </tr>
                    ))}
                    {showRows < seqLen && (
                      <tr><td colSpan={showCols + 2} className="text-center text-gray-300 pt-1">…</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
        <span className="text-lg mt-0.5">💡</span>
        <div className="space-y-1">
          <p>每个 token 的最终向量<span className="font-semibold">同时包含两种信息</span>：</p>
          <p>① <span className="font-semibold text-blue-700">语义信息</span> — 这个词是什么意思（来自 Embedding）</p>
          <p>② <span className="font-semibold text-purple-700">位置信息</span> — 这个词排第几位（来自 PE）</p>
        </div>
      </div>
    </div>
  );
}

// ─── PE 矩阵热力图（限制列数防溢出） ─────────────────────────────
interface PEMatrixGridProps {
  matrix: number[][];
  currentPos?: number;
  currentDimPair?: number;
  phase: string;
}

function PEMatrixGrid({ matrix, currentPos, currentDimPair, phase }: PEMatrixGridProps) {
  if (!matrix || matrix.length === 0) return null;
  const seqLen = matrix.length;
  const dModel = matrix[0]?.length ?? 0;
  const displayCols = Math.min(dModel, MAX_DISPLAY_COLS);
  const hidden = dModel - displayCols;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">位置编码矩阵 PE</h4>
        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-mono">
          {seqLen}×{dModel}
          {hidden > 0 && ` (显示前 ${displayCols} 列)`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-gray-400 font-normal pr-2 text-right w-10 pb-1">pos↓ dim→</th>
              {Array.from({ length: displayCols }, (_, j) => (
                <th
                  key={j}
                  className={`w-11 text-center font-normal pb-1 ${
                    phase === "compute" &&
                    currentDimPair !== undefined &&
                    (j === currentDimPair || j === currentDimPair + 1)
                      ? "text-purple-700 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {j}
                </th>
              ))}
              {hidden > 0 && (
                <th className="text-gray-300 font-normal pb-1 pl-1 text-xs">+{hidden}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const isCurrentPos = phase === "compute" && currentPos === i;
              return (
                <tr key={i}>
                  <td
                    className={`pr-2 text-right font-mono font-semibold w-10 ${
                      isCurrentPos ? "text-purple-700" : "text-gray-400"
                    }`}
                  >
                    {i}
                  </td>
                  {row.slice(0, displayCols).map((val, j) => {
                    const isCurrentCell =
                      phase === "compute" &&
                      currentPos === i &&
                      currentDimPair !== undefined &&
                      (j === currentDimPair || j === currentDimPair + 1);
                    return (
                      <td
                        key={j}
                        className={`w-11 h-8 text-center font-mono border border-white/60 rounded transition-all ${
                          isCurrentCell ? "ring-2 ring-purple-500 font-bold" : ""
                        }`}
                        style={{ backgroundColor: getHeatColor(val), color: getTextColor(val) }}
                        title={`PE[${i}][${j}] = ${val}`}
                      >
                        {fmt(val, 2)}
                      </td>
                    );
                  })}
                  {hidden > 0 && (
                    <td className="pl-1 text-gray-300 text-[10px]">…</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
        <span>−1</span>
        <div
          className="h-2 w-24 rounded"
          style={{
            background: "linear-gradient(to right, hsl(220,75%,85%), hsl(110,75%,71%), hsl(0,75%,57%))",
          }}
        />
        <span>+1</span>
        <span className="ml-2">蓝(负) → 绿(零) → 红(正)</span>
      </div>
    </div>
  );
}

// ─── 波形图（完成后） ─────────────────────────────────────────────
function WaveformView({ matrix, seqLen }: { matrix: number[][]; seqLen: number }) {
  if (!matrix || matrix.length === 0) return null;
  const dims = Math.min(4, Math.floor((matrix[0]?.length ?? 0) / 2)) * 2;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800 mb-1">各维度波形（前 {dims} 维）</h4>
      <p className="text-xs text-gray-500 mb-3">
        低维（i 小）频率高，波形变化快；高维（i 大）频率低，波形变化慢。
      </p>
      <div className="space-y-3">
        {Array.from({ length: Math.floor(dims / 2) }, (_, pairIdx) => {
          const dim = pairIdx * 2;
          return (
            <div key={dim}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-gray-500 w-32">
                  <InlineMath math={`i=${pairIdx}\\;(\\text{dim }${dim}/${dim + 1})`} />
                </span>
                <span className="text-[10px] text-blue-500">■ sin</span>
                <span className="text-[10px] text-orange-400 ml-1">■ cos</span>
              </div>
              <div className="flex gap-0.5 items-end h-8">
                {matrix.map((row, pos) => {
                  const sinVal = row[dim] ?? 0;
                  const cosVal = row[dim + 1] ?? 0;
                  const sinH = Math.abs(sinVal) * 14 + 2;
                  const cosH = Math.abs(cosVal) * 14 + 2;
                  return (
                    <div key={pos} className="flex gap-px items-end" style={{ width: `${100 / seqLen}%` }}>
                      <div
                        title={`pos=${pos}, sin=${fmt(sinVal)}`}
                        style={{ height: sinH, backgroundColor: sinVal >= 0 ? "#3b82f6" : "#93c5fd" }}
                        className="flex-1 rounded-t"
                      />
                      <div
                        title={`pos=${pos}, cos=${fmt(cosVal)}`}
                        style={{ height: cosH, backgroundColor: cosVal >= 0 ? "#f97316" : "#fed7aa" }}
                        className="flex-1 rounded-t"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 阶段标签 ─────────────────────────────────────────────────────
function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    "explain-seq-len": { label: "变量说明 seq_len", color: "bg-purple-100 text-purple-700" },
    "explain-d-model": { label: "变量说明 d_model", color: "bg-blue-100 text-blue-700" },
    "explain-formula": { label: "公式解读", color: "bg-amber-100 text-amber-700" },
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    compute: { label: "逐维计算", color: "bg-purple-100 text-purple-700" },
    complete: { label: "PE 矩阵完成", color: "bg-emerald-100 text-emerald-700" },
    "explain-output": { label: "输出说明", color: "bg-emerald-100 text-emerald-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────
function PositionalEncodingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10005);

  return (
    <ConfigurableVisualizer<PositionalEncodingInput, Record<string, never>>
      config={{
        defaultInput: {
          seqLen: DEFAULT_SEQ_LEN,
          dModel: DEFAULT_D_MODEL,
        },
        algorithm: (input) => {
          const seqLen =
            typeof input.seqLen === "number"
              ? Math.max(1, Math.min(input.seqLen, 20))
              : parseInt(String(input.seqLen), 10) || DEFAULT_SEQ_LEN;
          const dModel =
            typeof input.dModel === "number"
              ? Math.max(2, Math.min(input.dModel, 32))
              : parseInt(String(input.dModel), 10) || DEFAULT_D_MODEL;
          const dModelEven = dModel % 2 === 0 ? dModel : dModel - 1;
          return generatePositionalEncodingSteps(seqLen, Math.max(2, dModelEven));
        },
        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度 seq_len" },
          { type: "number", key: "dModel", label: "模型维度 d_model（偶数）" },
        ],
        inputFields: [
          {
            type: "number",
            key: "seqLen",
            label: "序列长度 seq_len（1-20）",
            placeholder: String(DEFAULT_SEQ_LEN),
          },
          {
            type: "number",
            key: "dModel",
            label: "模型维度 d_model（偶数，2-32）",
            placeholder: String(DEFAULT_D_MODEL),
          },
        ],
        testCases: [
          {
            label: "示例（8 tokens, d=16）",
            value: { seqLen: DEFAULT_SEQ_LEN, dModel: DEFAULT_D_MODEL },
          },
          {
            label: "小型（4 tokens, d=8）",
            value: { seqLen: 4, dModel: 8 },
          },
          {
            label: "中型（12 tokens, d=16）",
            value: { seqLen: 12, dModel: 16 },
          },
        ],
        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "explain-seq-len";
          const seqLen = (variables?.seqLen as number) ?? DEFAULT_SEQ_LEN;
          const dModel = (variables?.dModel as number) ?? DEFAULT_D_MODEL;
          const currentPos = variables?.currentPos as number | undefined;
          const currentDimPair = variables?.currentDimPair as number | undefined;
          const divTerm = variables?.divTerm as number | undefined;
          const sinVal = variables?.sinVal as number | undefined;
          const cosVal = variables?.cosVal as number | undefined;
          const peMatrix = (variables?.peMatrix as number[][] | undefined) ?? [];

          const flowSteps = [
            { id: "explain-seq-len", label: "① seq_len" },
            { id: "explain-d-model", label: "② d_model" },
            { id: "explain-formula", label: "③ 公式" },
            { id: "init", label: "④ 初始化" },
            { id: "compute", label: "⑤ 计算 sin/cos" },
            { id: "complete", label: "⑥ PE 完成" },
            { id: "explain-output", label: "⑦ 输出使用" },
          ];
          const phaseOrder = flowSteps.map((s) => s.id);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题栏 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">位置编码 Positional Encoding</h3>
                    <div className="text-xs text-gray-500 mt-1 overflow-x-auto">
                      <InlineMath math={String.raw`PE_{(pos,\,2i)} = \sin\!\bigl(pos / 10000^{2i/d_{\text{model}}}\bigr)`} />
                    </div>
                  </div>
                  <PhaseTag phase={phase} />
                </div>
                {phase === "compute" && currentPos !== undefined && (
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                    <span><InlineMath math={`pos = ${currentPos}`} /></span>
                    <span><InlineMath math={`i = ${currentDimPair}`} /></span>
                    {divTerm !== undefined && (
                      <span><InlineMath math={`10000^{2i/d} = ${fmt(divTerm, 2)}`} /></span>
                    )}
                  </div>
                )}
              </div>

              {/* 输入变量解释动画 */}
              {phase === "explain-seq-len" && <ExplainSeqLen seqLen={seqLen} />}
              {phase === "explain-d-model" && <ExplainDModel dModel={dModel} />}
              {phase === "explain-formula" && <ExplainFormula seqLen={seqLen} dModel={dModel} />}

              {/* 初始化 */}
              {phase === "init" && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    创建 {seqLen}×{dModel} 全零矩阵
                  </h4>
                  <p className="text-xs text-gray-500">
                    将对每个位置（行）和每个维度对（列）依次填入 sin/cos 值。
                  </p>
                </div>
              )}

              {/* 计算阶段：当前 sin/cos 详情 */}
              {phase === "compute" &&
                currentPos !== undefined &&
                currentDimPair !== undefined &&
                sinVal !== undefined && (
                  <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">当前计算</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white rounded p-3 border border-purple-100 space-y-1">
                        <p className="text-gray-500">
                          <InlineMath math={`PE_{(${currentPos},\\,${currentDimPair})}`} />
                        </p>
                        <div className="overflow-x-auto">
                          <InlineMath
                            math={String.raw`\sin\!\left(\frac{${currentPos}}{${fmt(divTerm ?? 1, 2)}}\right) = \textbf{${fmt(sinVal)}}`}
                          />
                        </div>
                      </div>
                      {cosVal !== undefined && (
                        <div className="bg-white rounded p-3 border border-purple-100 space-y-1">
                          <p className="text-gray-500">
                            <InlineMath math={`PE_{(${currentPos},\\,${(currentDimPair ?? 0) + 1})}`} />
                          </p>
                          <div className="overflow-x-auto">
                            <InlineMath
                              math={String.raw`\cos\!\left(\frac{${currentPos}}{${fmt(divTerm ?? 1, 2)}}\right) = \textbf{${fmt(cosVal)}}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* PE 矩阵热力图 */}
              {["compute", "complete", "explain-output"].includes(phase) && peMatrix.length > 0 && (
                <PEMatrixGrid
                  matrix={peMatrix}
                  currentPos={currentPos}
                  currentDimPair={currentDimPair}
                  phase={phase}
                />
              )}

              {/* 波形图 */}
              {phase === "complete" && peMatrix.length > 0 && (
                <WaveformView matrix={peMatrix} seqLen={seqLen} />
              )}

              {/* 输出说明动画 */}
              {phase === "explain-output" && peMatrix.length > 0 && (
                <ExplainOutput seqLen={seqLen} dModel={dModel} peMatrix={peMatrix} />
              )}

              {/* 动画流程进度条 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">动画流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {flowSteps.map((step, idx, arr) => {
                    const currentIdx = phaseOrder.indexOf(phase);
                    const stepIdx = phaseOrder.indexOf(step.id);
                    const isDone = currentIdx >= stepIdx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                            step.id === phase
                              ? "bg-purple-600 text-white shadow-sm"
                              : isDone
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < arr.length - 1 && (
                          <span className="text-gray-300">→</span>
                        )}
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

export default PositionalEncodingVisualizer;

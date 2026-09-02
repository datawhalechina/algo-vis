import { VisualizationStep } from "@/types";

export interface CaptioningScene {
  label: string;
  emoji: string;
  // Grid regions (3x3) with region labels
  regions: { name: string; color: string }[];
  vocab: string[];
  // target caption tokens (idx into vocab)
  caption: string[];
  // for each output token, attention distribution over 9 regions
  attention: number[][];
}

function softmax(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateImageCaptioningSteps(
  scene: CaptioningScene
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `图像描述生成任务：为图像 "${scene.label}" 生成自然语言描述。整体结构为 Encoder-Decoder + 注意力机制。`,
    data: { scene },
    variables: { phase: "init", scene },
  });

  // Step 2: CNN 提取特征
  steps.push({
    id: stepId++,
    description: `CNN Encoder 提取视觉特征 V ∈ ℝ^{L×D}，图像被划分为 9 个区域（L=9），每个区域产生一个 D 维特征向量。`,
    data: { scene },
    variables: { phase: "cnn_encode", scene },
  });

  // Step 3: 初始化 decoder（<START>）
  const generated: string[] = ["<START>"];
  steps.push({
    id: stepId++,
    description: `Decoder 初始状态：输入 <START> token，LSTM/Transformer 隐状态 h_0 由视觉特征初始化。`,
    data: { generated: [...generated] },
    variables: {
      phase: "decode_start",
      scene,
      generated: [...generated],
      attention: [] as number[][],
    },
  });

  // Step 4 ~ N: 自回归生成每个 token
  const allAttention: number[][] = [];
  for (let t = 0; t < scene.caption.length; t++) {
    // 原始注意力分数经 softmax
    const attnRaw = scene.attention[t] ?? new Array(scene.regions.length).fill(1);
    const attn = softmax(attnRaw);
    allAttention.push(attn);

    // 解码当前 token
    const token = scene.caption[t];
    generated.push(token);

    steps.push({
      id: stepId++,
      description: `第 ${t + 1} 步：计算注意力权重 α_t = softmax(f(h_{t-1}, V))，得到上下文向量 c_t = Σ α_{t,i} · v_i，预测 token "${token}"。`,
      data: { generated: [...generated], attention: allAttention.map((a) => [...a]) },
      variables: {
        phase: "decode_step",
        scene,
        generated: [...generated],
        attention: allAttention.map((a) => [...a]),
        currentStep: t,
        currentToken: token,
      },
    });
  }

  // 最终 EOS
  generated.push("<END>");
  steps.push({
    id: stepId++,
    description: `生成 <END> token，解码终止。最终描述：${scene.caption.join(" ")}`,
    data: { generated: [...generated] },
    variables: {
      phase: "complete",
      scene,
      generated: [...generated],
      attention: allAttention.map((a) => [...a]),
      finished: true,
    },
  });

  return steps;
}

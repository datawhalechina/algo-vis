import { VisualizationStep } from "@/types";

export interface T2ISample {
  prompt: string;
  // final 8x8 emoji grid (target image)
  targetGrid: string[][];
  // theme description for title
  theme: string;
  // palette colors to progressively reveal
  palette: string[];
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoiseGrid(rand: () => number, h: number, w: number): number[][] {
  const g: number[][] = [];
  for (let i = 0; i < h; i++) {
    g[i] = [];
    for (let j = 0; j < w; j++) {
      g[i][j] = Number(rand().toFixed(3));
    }
  }
  return g;
}

function mixGrids(
  noise: number[][],
  targetMask: number[][],
  t: number
): number[][] {
  // t in [0,1], larger = more noise
  const out: number[][] = [];
  for (let i = 0; i < noise.length; i++) {
    out[i] = [];
    for (let j = 0; j < noise[i].length; j++) {
      out[i][j] = Number(
        (noise[i][j] * t + targetMask[i][j] * (1 - t)).toFixed(3)
      );
    }
  }
  return out;
}

export function generateT2ISteps(
  sample: T2ISample,
  totalSteps: number,
  guidanceScale: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const T = Math.max(2, totalSteps);

  const H = sample.targetGrid.length;
  const W = sample.targetGrid[0].length;

  const rand = mulberry32(42);
  const noise = makeNoiseGrid(rand, H, W);

  // 构造目标 mask：根据目标 grid 中字符位置赋值（非空=1, 空=0）
  const targetMask = sample.targetGrid.map((row) =>
    row.map((c) => (c && c.trim() !== "" ? 1 : 0))
  );

  // Step 1: 初始化
  steps.push({
    id: stepId++,
    description: `文本到图像生成：根据 prompt "${sample.prompt}" 生成图像。总扩散步数 T=${T}，引导强度 guidance=${guidanceScale}。`,
    data: { sample, T, guidance: guidanceScale },
    variables: {
      phase: "init",
      sample,
      T,
      guidance: guidanceScale,
    },
  });

  // Step 2: 文本编码
  steps.push({
    id: stepId++,
    description: `文本编码器 E_text 将 "${sample.prompt}" 编码为文本嵌入 c ∈ ℝ^d，用于引导生成过程。`,
    data: {},
    variables: {
      phase: "encode_text",
      sample,
      T,
      guidance: guidanceScale,
    },
  });

  // Step 3: 初始噪声
  steps.push({
    id: stepId++,
    description: `采样初始潜在噪声 z_T ~ 𝒩(0, I)，形状 ${H}×${W}。这是扩散过程的起点。`,
    data: { noise },
    variables: {
      phase: "noise",
      sample,
      T,
      guidance: guidanceScale,
      grid: noise.map((r) => [...r]),
      currentT: T,
    },
  });

  // Step 4: 逐步去噪
  for (let step = T - 1; step >= 0; step--) {
    const progress = step / T; // 1 -> 0
    const grid = mixGrids(noise, targetMask, progress);

    steps.push({
      id: stepId++,
      description: `去噪第 ${T - step}/${T} 步（t=${step}）：UNet 预测 ε_θ(z_t, t, c)，计算 z_{t-1} = (z_t - σ·ε̂) / α。引导强度 ${guidanceScale} 控制文本条件作用强度。`,
      data: { grid },
      variables: {
        phase: "denoise",
        sample,
        T,
        guidance: guidanceScale,
        grid,
        currentT: step,
        progress: Number(((T - step) / T).toFixed(3)),
      },
    });
  }

  // 最终生成
  steps.push({
    id: stepId++,
    description: `VAE 解码器 D_img 将最终潜在向量 z_0 解码为图像像素。生成完成！`,
    data: { finished: true },
    variables: {
      phase: "complete",
      sample,
      T,
      guidance: guidanceScale,
      grid: targetMask,
      currentT: 0,
      progress: 1,
      finished: true,
    },
  });

  return steps;
}

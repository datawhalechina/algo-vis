import { VisualizationStep } from "@/types";

export interface CLIPItem {
  kind: "image" | "text";
  label: string;
  emoji: string;
  embedding: number[];
}

function l2norm(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => Number((x / n).toFixed(4)));
}

function cosineSim(a: number[], b: number[]): number {
  const na = l2norm(a);
  const nb = l2norm(b);
  let s = 0;
  for (let i = 0; i < na.length; i++) s += na[i] * nb[i];
  return Number(s.toFixed(4));
}

function softmaxRow(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateCLIPSteps(
  images: CLIPItem[],
  texts: CLIPItem[],
  temperature: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const tau = Math.max(temperature, 0.01);

  const N = images.length;

  steps.push({
    id: stepId++,
    description: `初始化 CLIP 批次：${N} 个图像-文本对。每对 (I_i, T_i) 为正样本，其余 ${N * (N - 1)} 对为负样本。`,
    data: { images, texts, N },
    variables: {
      phase: "init",
      images,
      texts,
      N,
      tau,
    },
  });

  // Step 2: 图像编码
  const imgEmbs: number[][] = [];
  for (let i = 0; i < N; i++) {
    imgEmbs.push(l2norm(images[i].embedding));
    steps.push({
      id: stepId++,
      description: `图像编码器 f_img 将图像 "${images[i].label}" 编码为向量并 L2 归一化：||I_${i}||=1。`,
      data: { imgEmbs: imgEmbs.map((e) => [...e]) },
      variables: {
        phase: "encode_image",
        images,
        texts,
        imgEmbs: imgEmbs.map((e) => [...e]),
        N,
        tau,
        currentIdx: i,
      },
    });
  }

  // Step 3: 文本编码
  const txtEmbs: number[][] = [];
  for (let i = 0; i < N; i++) {
    txtEmbs.push(l2norm(texts[i].embedding));
    steps.push({
      id: stepId++,
      description: `文本编码器 f_txt 将文本 "${texts[i].label}" 编码为向量并 L2 归一化：||T_${i}||=1。`,
      data: { txtEmbs: txtEmbs.map((e) => [...e]) },
      variables: {
        phase: "encode_text",
        images,
        texts,
        imgEmbs: imgEmbs.map((e) => [...e]),
        txtEmbs: txtEmbs.map((e) => [...e]),
        N,
        tau,
        currentIdx: i,
      },
    });
  }

  // Step 4: 相似度矩阵 S = I · T^T / tau
  const sim: number[][] = [];
  for (let i = 0; i < N; i++) {
    sim[i] = [];
    for (let j = 0; j < N; j++) {
      sim[i][j] = Number((cosineSim(imgEmbs[i], txtEmbs[j]) / tau).toFixed(4));
    }
  }
  steps.push({
    id: stepId++,
    description: `计算相似度矩阵：S_{ij} = (I_i · T_j) / τ，τ=${tau}。对角线为正样本相似度，非对角线为负样本。`,
    data: { sim },
    variables: {
      phase: "similarity",
      images,
      texts,
      imgEmbs,
      txtEmbs,
      sim,
      N,
      tau,
    },
  });

  // Step 5: Softmax (I2T)
  const probsI2T = sim.map((row) => softmaxRow(row));
  steps.push({
    id: stepId++,
    description: `图像→文本方向：对 S 的每一行做 Softmax，得到 p(T_j|I_i)。目标是让 p(T_i|I_i) 最大。`,
    data: { probsI2T },
    variables: {
      phase: "softmax_i2t",
      images,
      texts,
      imgEmbs,
      txtEmbs,
      sim,
      probsI2T,
      N,
      tau,
    },
  });

  // Step 6: Softmax (T2I)
  const simT = sim[0].map((_, j) => sim.map((row) => row[j]));
  const probsT2I_cols = simT.map((row) => softmaxRow(row));
  const probsT2I: number[][] = [];
  for (let i = 0; i < N; i++) {
    probsT2I[i] = [];
    for (let j = 0; j < N; j++) probsT2I[i][j] = probsT2I_cols[j][i];
  }
  steps.push({
    id: stepId++,
    description: `文本→图像方向：对 S 的每一列做 Softmax，得到 p(I_i|T_j)。同样目标让 p(I_j|T_j) 最大。`,
    data: { probsT2I },
    variables: {
      phase: "softmax_t2i",
      images,
      texts,
      imgEmbs,
      txtEmbs,
      sim,
      probsI2T,
      probsT2I,
      N,
      tau,
    },
  });

  // Step 7: Loss
  let lossI2T = 0;
  let lossT2I = 0;
  for (let i = 0; i < N; i++) {
    lossI2T += -Math.log(Math.max(probsI2T[i][i], 1e-8));
    lossT2I += -Math.log(Math.max(probsT2I[i][i], 1e-8));
  }
  lossI2T = Number((lossI2T / N).toFixed(4));
  lossT2I = Number((lossT2I / N).toFixed(4));
  const loss = Number(((lossI2T + lossT2I) / 2).toFixed(4));

  steps.push({
    id: stepId++,
    description: `对比损失：L = (L_{i2t} + L_{t2i}) / 2 = (${lossI2T} + ${lossT2I}) / 2 = ${loss}。训练通过最小化 L 将匹配对拉近，不匹配对推远。`,
    data: { loss, lossI2T, lossT2I },
    variables: {
      phase: "loss",
      images,
      texts,
      imgEmbs,
      txtEmbs,
      sim,
      probsI2T,
      probsT2I,
      lossI2T,
      lossT2I,
      loss,
      N,
      tau,
    },
  });

  steps.push({
    id: stepId++,
    description: `CLIP 训练完成！对角线（正样本）被拉近，非对角线（负样本）被推远，构建起共享的视觉-语言嵌入空间。`,
    data: { finished: true },
    variables: {
      phase: "complete",
      images,
      texts,
      imgEmbs,
      txtEmbs,
      sim,
      probsI2T,
      probsT2I,
      lossI2T,
      lossT2I,
      loss,
      finished: true,
      N,
      tau,
    },
  });

  return steps;
}

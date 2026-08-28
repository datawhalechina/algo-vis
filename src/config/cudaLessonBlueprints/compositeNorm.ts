import type { GuidedLessonBlueprint } from "../guidedLessonTypes";

export const compositeNormLessonBlueprints: GuidedLessonBlueprint[] = [
  {
    id: 701,
    title: "LayerNorm",
    intuition: "把每一行特征当成一组成绩：先求这一组的平均值和离散程度，再把每项移到统一尺度，最后用可学习参数重新拉伸和平移。",
    formula: "\\mu=\\frac{1}{H}\\sum_i x_i,\\quad \\sigma^2=\\frac{1}{H}\\sum_i(x_i-\\mu)^2,\\quad \\hat{x}_i=\\frac{x_i-\\mu}{\\sqrt{\\sigma^2+\\varepsilon}},\\quad y_i=\\gamma_i\\hat{x}_i+\\beta_i",
    symbols: [
      { symbol: "H", meaning: "一行中参与归一化的隐藏维度" },
      { symbol: "\\mu", meaning: "该行特征的均值" },
      { symbol: "\\sigma^2", meaning: "该行特征的方差" },
      { symbol: "\\hat{x}_i", meaning: "仿射变换前、均值约为 0 且方差约为 1 的归一化值" },
      { symbol: "\\gamma_i,\\beta_i", meaning: "第 i 维可学习的缩放与平移参数" },
      { symbol: "\\varepsilon", meaning: "防止除零的小正数" },
    ],
    flow: [
      "一个 block 领取一行特征",
      "线程从全局内存合并读取并形成局部统计量",
      "warp shuffle 与 shared memory 同步归约均值方差",
      "广播统计量并在寄存器得到仿射前的归一化值 hat{x}_i",
      "读取 gamma/beta，计算 y_i=gamma_i*hat{x}_i+beta_i 后写回",
    ],
    misconception: "LayerNorm 沿隐藏维度独立归一化每个样本，不是跨 batch 统计；直接用 E[x^2]-E[x]^2 还可能因相消损失精度。",
    debugTip: "逐行打印 count、mean、M2/variance，并对仿射前 hat{x} 复算：均值应接近 0，方差在 epsilon 很小时接近 1；最终 y 经 gamma/beta 后不要求仍满足这两个统计量，常量行也必须有限。",
    takeaway: "LayerNorm 把均值与方差归约、广播归一化和仿射变换串成一条需要稳定统计量的 CUDA 流水线。",
  },
  {
    id: 702,
    title: "Softmax",
    intuition: "先找出一行里最大的分数并整体减掉它，再把指数值归一化；相对大小不变，却能避免大指数溢出。",
    formula: "m=\\max_i x_i,\\qquad p_i=\\frac{e^{x_i-m}}{\\sum_j e^{x_j-m}}",
    symbols: [
      { symbol: "x_i", meaning: "一行 logits 中第 i 个原始分数" },
      { symbol: "m", meaning: "该行 logits 的最大值" },
      { symbol: "p_i", meaning: "归一化后第 i 类的概率" },
      { symbol: "\\sum_j e^{x_j-m}", meaning: "该行稳定指数值的归一化分母" },
    ],
    flow: [
      "一个 warp 或 block 领取一行 logits",
      "线程从全局内存合并读取并同步归约行最大值",
      "线程计算 exp(x_i-m) 与局部和",
      "再次同步归约指数总和",
      "线程相除并合并写回概率输出",
    ],
    misconception: "减去最大值不是近似，也不会改变 Softmax 概率；若每个线程使用自己的局部最大值而未完成全行归约，结果才会错误。",
    debugTip: "对 [1000,1001,1002] 记录全行 max=1002、移位值 [-2,-1,0] 和指数总和；输出必须全为有限数且概率和接近 1。",
    takeaway: "稳定 Softmax 严格遵循 Max、Exp、Sum、Div，并在两次全行归约后分别同步再继续。",
  },
];

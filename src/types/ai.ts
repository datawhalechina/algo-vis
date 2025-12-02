import { Difficulty } from "./index";

export enum AIDomain {
  // ========== 应用领域 ==========
  // 按应用场景分类，面向实际应用
  VISION = "vision",
  NLP = "nlp",
  LLM = "llm",
  SPEECH = "speech",
  MULTIMODAL = "multimodal",

  // ========== 模型架构 ==========
  // 按神经网络架构分类
  CNN = "cnn",
  RNN = "rnn",
  TRANSFORMER = "transformer",
  GRAPH_NEURAL_NETWORK = "graph_neural_network",

  // ========== 生成模型 ==========
  // 生成式AI相关模型
  DIFFUSION = "diffusion",
  GAN = "gan",
  VAE = "vae",

  // ========== 学习范式 ==========
  // 按学习方式和训练方法分类
  REINFORCEMENT_LEARNING = "reinforcement_learning",
  SELF_SUPERVISED = "self_supervised",
  TRANSFER_LEARNING = "transfer_learning",
  CONTINUAL_LEARNING = "continual_learning",
  META_LEARNING = "meta_learning",
  FEDERATED_LEARNING = "federated_learning",

  // ========== 研究方向 ==========
  // 前沿研究方向和交叉领域
  EXPLAINABLE_AI = "explainable_ai",
  NEURAL_RENDERING = "neural_rendering",
  NEURAL_ARCHITECTURE_SEARCH = "neural_architecture_search",
}

export const aiDomainNames: Record<AIDomain, string> = {
  // ========== 应用领域 ==========
  [AIDomain.VISION]: "计算机视觉",
  [AIDomain.NLP]: "自然语言处理",
  [AIDomain.LLM]: "大语言模型",
  [AIDomain.SPEECH]: "语音",
  [AIDomain.MULTIMODAL]: "多模态",

  // ========== 模型架构 ==========
  [AIDomain.CNN]: "卷积神经网络",
  [AIDomain.RNN]: "循环神经网络",
  [AIDomain.TRANSFORMER]: "Transformer",
  [AIDomain.GRAPH_NEURAL_NETWORK]: "图神经网络",

  // ========== 生成模型 ==========
  [AIDomain.DIFFUSION]: "扩散模型",
  [AIDomain.GAN]: "生成对抗网络",
  [AIDomain.VAE]: "变分自编码器",

  // ========== 学习范式 ==========
  [AIDomain.REINFORCEMENT_LEARNING]: "强化学习",
  [AIDomain.SELF_SUPERVISED]: "自监督学习",
  [AIDomain.TRANSFER_LEARNING]: "迁移学习",
  [AIDomain.CONTINUAL_LEARNING]: "持续学习",
  [AIDomain.META_LEARNING]: "元学习",
  [AIDomain.FEDERATED_LEARNING]: "联邦学习",

  // ========== 研究方向 ==========
  [AIDomain.EXPLAINABLE_AI]: "可解释性AI",
  [AIDomain.NEURAL_RENDERING]: "神经渲染",
  [AIDomain.NEURAL_ARCHITECTURE_SEARCH]: "神经架构搜索",
};

export interface AIProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface AIProblem {
  id: number;
  slug: string;
  title: string;
  domain: AIDomain;
  difficulty: Difficulty;
  description: string;
  learningGoals: string[];
  inputs: string[];
  outputs: string[];
  tags: string[];
  examples: AIProblemExample[];
  heroNote?: string;
}

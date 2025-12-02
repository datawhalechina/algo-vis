import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * Graph Neural Network（图神经网络）相关题目数据
 * 覆盖经典题型与业界热门应用
 */
export const gnnProblems: AIProblem[] = [
  {
    id: 10102,
    slug: "gcn-message-passing",
    title: "GCN 消息传递机制",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.EASY,
    description:
      "以可视化方式展示 Graph Convolutional Network（GCN）中一次消息传递 / 聚合的流程，帮助理解邻接矩阵归一化、特征聚合与线性变换的关系。",
    learningGoals: [
      "掌握 GCN 的归一化邻接矩阵构造",
      "理解节点特征聚合与线性变换的步骤",
      "观察多层堆叠带来的信息扩散半径",
      "区分自环添加与权重共享的作用",
    ],
    inputs: [
      "adjacency：带权邻接矩阵",
      "node_features：节点特征矩阵",
      "layers：GCN 层数及隐藏维度",
    ],
    outputs: [
      "normalized_adjacency：对称归一化结果",
      "aggregation_steps：每层聚合可视化",
      "node_embeddings：节点嵌入演化轨迹",
    ],
    tags: ["GCN", "消息传递", "图卷积"],
    examples: [
      {
        input: "3-hop 子图，layers = 2",
        output: "节点可访问 2-hop 内所有信息",
        explanation: "GCN 每层聚合 1-hop 邻居，堆叠两层后覆盖 2-hop 邻域。",
      },
    ],
    heroNote: "GCN 是图学习的入门模型，核心在于规范化后的邻居聚合。",
  },
  {
    id: 10103,
    slug: "cora-node-classification",
    title: "Cora 节点分类实验",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "复现经典 Cora 引文网络的节点分类流程，包含数据拆分、训练曲线、混淆矩阵与错误案例，帮助理解图半监督学习的评估要点。",
    learningGoals: [
      "熟悉 Cora/Citeseer 等标准数据集特性",
      "掌握半监督节点分类的训练与验证划分",
      "分析不同隐藏维度/丢弃率对性能的影响",
      "利用可视化定位易混类别与误判节点",
    ],
    inputs: [
      "dataset：Cora / Citeseer / PubMed",
      "train_ratio：有标签节点比例",
      "hidden_dim：隐层宽度",
      "dropout：丢弃率",
    ],
    outputs: [
      "training_curve：损失与准确率",
      "confusion_matrix：类别混淆",
      "misclassified_nodes：误判节点列表",
    ],
    tags: ["节点分类", "半监督", "基准数据集"],
    examples: [
      {
        input: "dataset = Cora, train_ratio = 0.052",
        output: "Val Acc ≈ 81%",
        explanation: "复现 Kipf & Welling 论文默认划分时的参考精度。",
      },
    ],
    heroNote: "节点分类是评估图模型的经典试金石，便于横向比较模型表现。",
  },
  {
    id: 10104,
    slug: "graphsage-neighbor-sampling",
    title: "GraphSAGE 邻居采样",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 GraphSAGE 在大规模图上的分层邻居采样与可微聚合流程，解释为何该方法适合工业级图数据。",
    learningGoals: [
      "理解分层邻居采样策略（fan-out）",
      "对比 Mean / LSTM / Pool 聚合器差异",
      "分析采样深度与批大小对显存、准确率的影响",
      "掌握推理阶段 GraphSAGE 的缓存与重用技巧",
    ],
    inputs: [
      "fanouts：每层采样邻居数量",
      "aggregator：mean / pool / lstm",
      "batch_size：节点批大小",
    ],
    outputs: [
      "sampling_tree：采样子图结构",
      "memory_estimation：显存消耗估算",
      "embedding_stability：不同采样的方差",
    ],
    tags: ["GraphSAGE", "采样", "工业部署"],
    examples: [
      {
        input: "fanouts = [10, 25]",
        output: "子图包含 1 + 10 + 250 ≈ 261 节点",
        explanation: "两层采样 fan-out 连乘用于估计批次子图规模。",
      },
    ],
    heroNote:
      "GraphSAGE 将消息传递限制在采样子图，是工业超大图训练的常用套路。",
  },
  {
    id: 10105,
    slug: "gat-multi-head-attention",
    title: "GAT 多头注意力热力图",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "可视化 Graph Attention Network（GAT）对邻居的注意力分布，比较多头拼接与平均对表示学习的影响。",
    learningGoals: [
      "理解节点对不同邻居分配注意力权重",
      "区分多头注意力的拼接与平均模式",
      "观察对高 / 低度节点的权重分布差异",
      "分析注意力 Dropout 对稳定性的作用",
    ],
    inputs: [
      "num_heads：注意力头数",
      "concat：是否拼接头输出",
      "leaky_relu_alpha：注意力激活系数",
      "dropout：注意力丢弃率",
    ],
    outputs: [
      "attention_heatmap：邻居权重热力图",
      "head_variance：不同头之间的方差",
      "embedding_quality：与 GCN 的对比指标",
    ],
    tags: ["GAT", "注意力", "可视化"],
    examples: [
      {
        input: "num_heads = 8, concat = true",
        output: "输出通道 = head_dim × 8",
        explanation: "多头拼接会线性增大输出维度，常用于浅层 GAT。",
      },
    ],
    heroNote: "注意力权重可解释性强，便于分析实际图谱中的关键连边。",
  },
  {
    id: 10106,
    slug: "graph-autoencoder-link-prediction",
    title: "图自编码器链路预测",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "构建 Graph AutoEncoder / Variational Graph AutoEncoder (GAE/VGAE) 进行链路预测，展示训练负采样、重建损失与 ROC 曲线。",
    learningGoals: [
      "掌握编码器-解码器式图表示学习",
      "理解负采样与重建目标设计",
      "通过 ROC / AUC 评估链路预测效果",
      "分析隐空间维度对可分性的影响",
    ],
    inputs: [
      "encoder_type：GCN / GAT",
      "latent_dim：隐空间维度",
      "negative_ratio：负样本比例",
    ],
    outputs: [
      "reconstruction_loss：训练损失曲线",
      "roc_curve：预测性能",
      "latent_space_projection：节点嵌入可视化",
    ],
    tags: ["链路预测", "GAE", "VGAE"],
    examples: [
      {
        input: "latent_dim = 32, negative_ratio = 1.0",
        output: "AUC ≈ 0.92 on Cora",
        explanation: "与 Kipf 论文中 VGAE 结果接近的参考指标。",
      },
    ],
    heroNote: "链路预测在推荐、社交反作弊中高频出现，是 GNN 工程必备场景。",
  },
  {
    id: 10107,
    slug: "diffpool-hierarchical-graph",
    title: "DiffPool 层级图池化",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.HARD,
    description:
      "演示 Differentiable Pooling（DiffPool）如何学习性地产生层级图结构，比较与 TopKPool、SAGPool 的差异，用于图级分类任务。",
    learningGoals: [
      "理解可微分的软聚类矩阵 S 生成方式",
      "掌握池化后特征与邻接的更新公式",
      "观察层级池化对图级分类的提升",
      "比较不同池化策略的可解释性与代价",
    ],
    inputs: [
      "pool_ratio：每层保留节点比例",
      "assignment_loss_weight：正则系数",
      "pool_layers：池化层数",
    ],
    outputs: [
      "assignment_matrix：节点到超节点映射",
      "hierarchical_graphs：多尺度图结构",
      "classification_metrics：图级精度",
    ],
    tags: ["DiffPool", "图级分类", "层级结构"],
    examples: [
      {
        input: "pool_ratio = 0.25, pool_layers = 2",
        output: "2 层后节点数缩减至原来的 6.25%",
        explanation: "每层保留 25%，连续两层得到 0.25^2 的节点数量。",
      },
    ],
    heroNote: "层级池化让 GNN 能够处理结构更复杂的图级任务，如分子分类。",
  },
  {
    id: 10108,
    slug: "temporal-gnn-event-stream",
    title: "动态图事件流建模",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.HARD,
    description:
      "实现 Temporal Graph Networks / TGAT 在事件时间轴上的消息传递，支持按时间窗口回放，展示滚动快照与记忆模块。",
    learningGoals: [
      "理解时间编码与持续记忆在动态图中的作用",
      "掌握事件驱动的增量更新（Edge/Node event）",
      "对比 snapshot vs. continuous-time 两类建模方式",
      "量化实时推理延迟与召回折中",
    ],
    inputs: [
      "time_window：回放窗口长度",
      "memory_size：节点记忆容量",
      "event_rate：单位时间事件数量",
    ],
    outputs: [
      "temporal_embeddings：时间感知表示",
      "latency_breakdown：推理延迟拆解",
      "event_attention：关键事件权重",
    ],
    tags: ["动态图", "TGAT", "实时风控"],
    examples: [
      {
        input: "time_window = 24h, event_rate = 1e5",
        output: "实时推理延迟 < 120ms",
        explanation:
          "Temporal batching + neighbor cache 可控制大规模事件推理延迟。",
      },
    ],
    heroNote: "动态图模型被社交、风控、供应链实时画像广泛采用，需求持续上升。",
  },
  {
    id: 10109,
    slug: "gnn-powered-recommender",
    title: "GNN 推荐召回管线",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.MEDIUM,
    description:
      "搭建用户-物品异构图的 GNN 召回模块，展示多类型边、metapath 聚合及冷启动策略，覆盖工业界热门的 Graph Recommendation 方案。",
    learningGoals: [
      "理解异构图 schema 与特征拼接方式",
      "掌握 metapath / HGT / HAN 等聚合差异",
      "评估向量召回（ANN）与图召回协同效果",
      "制定冷启动与增量更新策略",
    ],
    inputs: [
      "edge_types：边类型及权重",
      "metapaths：需聚合的元路径集合",
      "ann_index：向量检索参数",
    ],
    outputs: [
      "node_embeddings：用户/物品表征",
      "recall_metrics：NDCG/Recall@K",
      "cold_start_plan：新节点建模方案",
    ],
    tags: ["推荐系统", "异构图", "工业案例"],
    examples: [
      {
        input: "metapaths = ['U-I-U', 'U-I-C-I-U']",
        output: "Recall@50 提升 6%",
        explanation: "组合短长元路径可同时捕获直接互动与内容相似度。",
      },
    ],
    heroNote:
      "图召回正成为电商、内容平台的标配组件，可与 CTR/CVR 模型解耦演进。",
  },
  {
    id: 10110,
    slug: "graph-transformer-and-rag",
    title: "Graph Transformer × RAG 热点实践",
    domain: AIDomain.GRAPH_NEURAL_NETWORK,
    difficulty: Difficulty.HARD,
    description:
      "结合 Graph Transformer 与 Graph RAG（Retrieval Augmented Generation）工作流，展示从知识图谱构建、图注意力编码到 LLM 检索增强的端到端链路。",
    learningGoals: [
      "理解 Graph Transformer 对长程依赖的优势",
      "构建实体-关系-属性三元组知识图谱",
      "将图嵌入接入 RAG 索引并与 LLM 解答融合",
      "评估图增强 RAG 对召回精度与幻觉率的影响",
    ],
    inputs: [
      "kg_triplets：知识图谱三元组",
      "transformer_layers：图 Transformer 层数",
      "rag_topk：RAG 检索 top-k",
    ],
    outputs: [
      "graph_embeddings：图 Transformer 产生的节点表示",
      "rag_contexts：注入 LLM 的上下文片段",
      "answer_quality：答案准确率与幻觉率统计",
    ],
    tags: ["Graph Transformer", "Graph RAG", "LLM"],
    examples: [
      {
        input: "rag_topk = 5, transformer_layers = 6",
        output: "Answer Acc 提升 9%，幻觉率下降 4%",
        explanation: "图结构检索提供结构化证据，显著降低自由文本检索遗漏。",
      },
    ],
    heroNote:
      "Graph RAG + Transformer 是 2024-2025 年业界最火的知识智能组合拳。",
  },
];

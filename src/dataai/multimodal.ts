import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * Multimodal（多模态）相关题目数据
 * 多模态学习经典题型
 */
export const multimodalProblems: AIProblem[] = [
  {
    id: 10060,
    slug: "clip-contrastive-learning",
    title: "CLIP 对比学习",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示 CLIP（Contrastive Language-Image Pre-training）如何通过对比学习将图像和文本映射到统一的向量空间。理解如何通过图像-文本对的正负样本对比来学习跨模态表示。",
    learningGoals: [
      "理解对比学习的基本原理",
      "掌握图像编码器和文本编码器的协同训练",
      "理解正负样本对的构建",
      "观察图像-文本相似度的计算过程",
    ],
    inputs: [
      "image：输入图像",
      "text：输入文本",
      "image_encoder：图像编码器（如 Vision Transformer）",
      "text_encoder：文本编码器（如 Transformer）",
    ],
    outputs: [
      "image_embedding：图像嵌入向量",
      "text_embedding：文本嵌入向量",
      "similarity_score：图像-文本相似度",
      "contrastive_loss：对比损失",
    ],
    tags: ["CLIP", "对比学习", "多模态", "预训练"],
    examples: [
      {
        input: "image = 一只猫的图片，text = 'a cat'",
        output: "similarity_score = 0.95（高相似度）",
        explanation:
          "CLIP 通过对比学习将匹配的图像-文本对拉近，不匹配的推远，从而学习到跨模态的语义表示。",
      },
    ],
    heroNote: "CLIP 是多模态学习的里程碑，开创了零样本图像分类的新范式。",
  },
  {
    id: 10061,
    slug: "image-captioning",
    title: "图像描述生成",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示图像描述生成（Image Captioning）如何为图像生成自然语言描述。理解编码器-解码器架构如何将视觉特征转换为文本序列，以及注意力机制在其中的作用。",
    learningGoals: [
      "理解图像描述生成的任务目标",
      "掌握视觉特征提取和文本生成的过程",
      "理解注意力机制如何连接图像和文本",
      "观察不同图像生成的描述质量",
    ],
    inputs: [
      "image：输入图像",
      "caption_model：图像描述模型（如 Show and Tell、Transformer）",
      "vocabulary：词汇表",
    ],
    outputs: [
      "visual_features：图像的视觉特征",
      "caption_tokens：生成的描述词序列",
      "attention_weights：注意力权重（图像区域到词语的映射）",
      "generated_caption：生成的完整描述",
    ],
    tags: ["图像描述", "Image Captioning", "编码器-解码器", "应用"],
    examples: [
      {
        input: "image = 一只猫坐在窗台上",
        output: "generated_caption = 'A cat is sitting on the windowsill'",
        explanation:
          "模型提取图像特征，通过解码器生成描述文本，注意力机制帮助模型关注图像中的关键区域。",
      },
    ],
    heroNote:
      "图像描述生成是视觉-语言理解的重要应用，广泛应用于图像检索、辅助视觉障碍者等场景。",
  },
  {
    id: 10062,
    slug: "visual-question-answering",
    title: "视觉问答（VQA）",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示视觉问答（Visual Question Answering）系统如何根据图像和问题生成答案。理解如何融合视觉和文本特征，以及多模态注意力机制如何帮助模型关注相关信息。",
    learningGoals: [
      "理解视觉问答的任务目标",
      "掌握视觉和文本特征的融合方法",
      "理解多模态注意力机制",
      "观察不同问题的推理过程",
    ],
    inputs: [
      "image：输入图像",
      "question：问题文本",
      "vqa_model：VQA 模型（如 BUTD、MCAN）",
    ],
    outputs: [
      "visual_features：图像特征",
      "question_features：问题特征",
      "multimodal_features：融合后的多模态特征",
      "answer：预测的答案",
      "attention_visualization：注意力可视化",
    ],
    tags: ["VQA", "视觉问答", "多模态融合", "应用"],
    examples: [
      {
        input: "image = 厨房场景，question = 'What color is the refrigerator?'",
        output: "answer = 'white'",
        explanation:
          "模型理解图像内容，结合问题语义，通过多模态融合和注意力机制定位到冰箱并识别其颜色。",
      },
    ],
    heroNote: "VQA 是视觉-语言理解的核心任务，测试模型的多模态推理能力。",
  },
  {
    id: 10063,
    slug: "multimodal-retrieval",
    title: "多模态检索",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示多模态检索系统如何实现图像-文本的跨模态检索。理解如何通过共享的嵌入空间实现图像检索文本、文本检索图像的双向检索。",
    learningGoals: [
      "理解多模态检索的任务目标",
      "掌握跨模态相似度计算",
      "理解图像-文本嵌入空间的构建",
      "观察检索结果的排序过程",
    ],
    inputs: [
      "query：查询（图像或文本）",
      "database：数据库（图像或文本集合）",
      "embedding_model：嵌入模型（如 CLIP）",
    ],
    outputs: [
      "query_embedding：查询的嵌入向量",
      "database_embeddings：数据库的嵌入向量",
      "similarity_scores：相似度分数",
      "retrieved_results：检索结果（按相似度排序）",
    ],
    tags: ["多模态检索", "跨模态检索", "CLIP", "应用"],
    examples: [
      {
        input: "query = 'a red car'（文本），database = 图像集合",
        output: "retrieved_results = 红色汽车的图片（按相似度排序）",
        explanation:
          "通过计算文本嵌入与图像嵌入的相似度，找到最匹配的图像，实现文本到图像的检索。",
      },
    ],
    heroNote: "多模态检索广泛应用于图像搜索、商品推荐、内容发现等场景。",
  },
  {
    id: 10064,
    slug: "text-to-image-generation",
    title: "文本到图像生成",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示文本到图像生成系统如何根据文本描述生成对应的图像。理解扩散模型（如 DALL-E、Stable Diffusion）如何将文本语义转换为视觉内容。",
    learningGoals: [
      "理解文本到图像生成的任务目标",
      "掌握文本编码和图像生成的流程",
      "理解扩散模型的去噪过程",
      "观察不同文本提示生成的图像",
    ],
    inputs: [
      "text_prompt：文本提示",
      "generation_model：生成模型（如 DALL-E、Stable Diffusion）",
      "guidance_scale：引导强度",
    ],
    outputs: [
      "text_embedding：文本嵌入向量",
      "noise_latent：初始噪声潜在向量",
      "denoised_latent：去噪后的潜在向量",
      "generated_image：生成的图像",
    ],
    tags: ["文本到图像", "DALL-E", "扩散模型", "生成式AI"],
    examples: [
      {
        input: "text_prompt = 'a red cat sitting on a blue chair'",
        output: "generated_image = 符合描述的图像",
        explanation:
          "模型理解文本语义，通过扩散过程逐步去噪，生成与文本描述匹配的图像。",
      },
    ],
    heroNote:
      "文本到图像生成是生成式AI的前沿应用，DALL-E、Midjourney 等都基于此技术。",
  },
  {
    id: 10065,
    slug: "video-understanding",
    title: "视频理解",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示视频理解系统如何分析视频内容，包括动作识别、事件检测、视频描述等任务。理解如何融合时序信息和空间信息来理解视频。",
    learningGoals: [
      "理解视频理解的任务目标",
      "掌握时序特征提取方法",
      "理解空间-时序特征的融合",
      "观察不同视频片段的特征表示",
    ],
    inputs: [
      "video：输入视频（帧序列）",
      "video_model：视频理解模型（如 3D CNN、Video Transformer）",
      "task_type：任务类型（动作识别/事件检测/描述生成）",
    ],
    outputs: [
      "frame_features：每帧的特征",
      "temporal_features：时序特征",
      "spatiotemporal_features：时空融合特征",
      "prediction：预测结果（动作/事件/描述）",
    ],
    tags: ["视频理解", "动作识别", "时序建模", "应用"],
    examples: [
      {
        input: "video = 一个人跑步的视频片段",
        output: "prediction = 'running'（动作识别）",
        explanation:
          "模型提取每帧的空间特征，融合时序信息，识别出视频中的动作类别。",
      },
    ],
    heroNote: "视频理解广泛应用于视频检索、内容审核、智能监控等场景。",
  },
  {
    id: 10066,
    slug: "multimodal-fusion",
    title: "多模态融合",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示多模态融合如何将不同模态（图像、文本、音频等）的特征融合为统一的表示。理解早期融合、晚期融合和注意力融合等不同融合策略。",
    learningGoals: [
      "理解多模态融合的基本概念",
      "掌握不同融合策略的特点",
      "理解注意力机制在融合中的作用",
      "观察融合后特征的质量",
    ],
    inputs: [
      "image_features：图像特征",
      "text_features：文本特征",
      "audio_features：音频特征（可选）",
      "fusion_strategy：融合策略（early/late/attention）",
    ],
    outputs: [
      "fused_features：融合后的特征",
      "fusion_weights：融合权重",
      "attention_weights：注意力权重（如果使用注意力融合）",
    ],
    tags: ["多模态融合", "特征融合", "注意力机制", "基础"],
    examples: [
      {
        input:
          "image_features = [1, 512], text_features = [10, 512], fusion_strategy = 'attention'",
        output: "fused_features = [1, 512]",
        explanation:
          "通过注意力机制动态融合图像和文本特征，根据任务需求自适应地分配权重。",
      },
    ],
    heroNote: "多模态融合是多模态学习的基础，不同的融合策略适用于不同的任务。",
  },
  {
    id: 10067,
    slug: "vision-language-pretraining",
    title: "视觉-语言预训练",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示视觉-语言预训练模型（如 BLIP、ALIGN）如何在大规模图像-文本对上学习通用的跨模态表示。理解掩码语言建模、图像-文本匹配等预训练任务。",
    learningGoals: [
      "理解视觉-语言预训练的目标",
      "掌握掩码语言建模在视觉-语言中的应用",
      "理解图像-文本匹配任务",
      "观察预训练模型在下游任务上的表现",
    ],
    inputs: [
      "image：输入图像",
      "text：输入文本",
      "pretrained_model：预训练模型（如 BLIP、ALIGN）",
    ],
    outputs: [
      "image_embedding：图像嵌入",
      "text_embedding：文本嵌入",
      "multimodal_representation：多模态表示",
      "task_specific_output：任务特定输出",
    ],
    tags: ["预训练", "BLIP", "ALIGN", "视觉-语言"],
    examples: [
      {
        input: "image = 图像，text = 对应的描述，task = 图像-文本匹配",
        output: "match_score = 0.92（高匹配度）",
        explanation:
          "预训练模型学习到图像和文本的通用表示，能够准确判断图像-文本对的匹配程度。",
      },
    ],
    heroNote:
      "视觉-语言预训练模型是当前多模态学习的主流方法，显著提升了各种下游任务的性能。",
  },
  {
    id: 10068,
    slug: "image-text-matching",
    title: "图像-文本匹配",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示图像-文本匹配任务如何判断图像和文本是否匹配。理解如何通过计算图像和文本嵌入的相似度来判断匹配程度，这是多模态检索和检索增强生成的基础。",
    learningGoals: [
      "理解图像-文本匹配的任务目标",
      "掌握相似度计算方法",
      "理解匹配阈值的选择",
      "观察不同匹配程度的案例",
    ],
    inputs: [
      "image：输入图像",
      "text：输入文本",
      "matching_model：匹配模型（如 CLIP、BLIP）",
    ],
    outputs: [
      "image_embedding：图像嵌入向量",
      "text_embedding：文本嵌入向量",
      "similarity_score：相似度分数",
      "match_label：匹配标签（匹配/不匹配）",
    ],
    tags: ["图像-文本匹配", "相似度计算", "CLIP", "基础任务"],
    examples: [
      {
        input: "image = 一只狗的图片，text = 'a cat'",
        output: "similarity_score = 0.3, match_label = '不匹配'",
        explanation:
          "通过计算图像和文本嵌入的余弦相似度，判断两者是否匹配，相似度低表示不匹配。",
      },
    ],
    heroNote: "图像-文本匹配是多模态学习的基础任务，是许多高级应用的前提。",
  },
  {
    id: 10069,
    slug: "multimodal-transformer",
    title: "多模态 Transformer",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示多模态 Transformer 如何统一处理图像和文本输入。理解如何将图像和文本编码为序列，通过交叉注意力机制实现跨模态交互，如 LXMERT、UNITER 等模型。",
    learningGoals: [
      "理解多模态 Transformer 的架构",
      "掌握图像和文本的序列化编码",
      "理解交叉注意力机制",
      "观察跨模态交互的过程",
    ],
    inputs: [
      "image：输入图像（转换为 patch 序列）",
      "text：输入文本（token 序列）",
      "multimodal_transformer：多模态 Transformer 模型",
    ],
    outputs: [
      "image_tokens：图像 token 序列",
      "text_tokens：文本 token 序列",
      "cross_attention_weights：交叉注意力权重",
      "multimodal_output：多模态输出表示",
    ],
    tags: ["多模态 Transformer", "LXMERT", "交叉注意力", "架构"],
    examples: [
      {
        input: "image = 图像（224x224），text = '描述图像内容'",
        output: "multimodal_output = 融合后的多模态表示",
        explanation:
          "图像被分割为 patch tokens，文本被转换为 word tokens，通过交叉注意力实现跨模态交互。",
      },
    ],
    heroNote:
      "多模态 Transformer 统一了视觉和语言的表示，是当前多模态学习的主流架构。",
  },
  {
    id: 10070,
    slug: "visual-grounding",
    title: "视觉定位（Visual Grounding）",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示视觉定位任务如何根据文本描述在图像中定位对应的区域。理解如何通过文本查询找到图像中的相关区域，这是视觉-语言理解的重要能力。",
    learningGoals: [
      "理解视觉定位的任务目标",
      "掌握区域特征提取方法",
      "理解文本-区域匹配过程",
      "观察定位框的生成过程",
    ],
    inputs: [
      "image：输入图像",
      "text_query：文本查询（如 'red car'）",
      "grounding_model：视觉定位模型（如 MDETR、GLIP）",
    ],
    outputs: [
      "region_proposals：候选区域",
      "region_features：区域特征",
      "matching_scores：文本-区域匹配分数",
      "grounded_bbox：定位的边界框",
    ],
    tags: ["视觉定位", "Visual Grounding", "目标定位", "应用"],
    examples: [
      {
        input: "image = 包含多辆车的图像，text_query = 'the red car'",
        output: "grounded_bbox = [x1, y1, x2, y2]（红色汽车的边界框）",
        explanation:
          "模型理解文本查询的语义，在图像中找到最匹配的区域，返回对应的边界框。",
      },
    ],
    heroNote:
      "视觉定位是视觉-语言理解的核心能力，广泛应用于图像编辑、机器人导航等场景。",
  },
  {
    id: 10071,
    slug: "multimodal-dialogue",
    title: "多模态对话",
    domain: AIDomain.MULTIMODAL,
    difficulty: Difficulty.HARD,
    description:
      "展示多模态对话系统如何基于图像和对话历史进行多轮对话。理解如何融合视觉和文本上下文，生成与图像相关的回复，如 GPT-4V、LLaVA 等模型。",
    learningGoals: [
      "理解多模态对话的任务目标",
      "掌握视觉和文本上下文的融合",
      "理解多轮对话的状态管理",
      "观察对话生成的推理过程",
    ],
    inputs: [
      "image：输入图像",
      "conversation_history：对话历史",
      "current_question：当前问题",
      "dialogue_model：多模态对话模型（如 GPT-4V、LLaVA）",
    ],
    outputs: [
      "visual_context：视觉上下文",
      "text_context：文本上下文",
      "fused_context：融合后的上下文",
      "response：生成的回复",
    ],
    tags: ["多模态对话", "GPT-4V", "LLaVA", "对话系统"],
    examples: [
      {
        input:
          "image = 餐厅场景，conversation_history = [], current_question = 'What is in this image?'",
        output:
          "response = 'This image shows a restaurant with tables and chairs.'",
        explanation:
          "模型理解图像内容，结合对话历史，生成与图像相关的自然语言回复。",
      },
    ],
    heroNote:
      "多模态对话是 AI 助手的重要能力，GPT-4V、Claude 等都支持图像对话。",
  },
];

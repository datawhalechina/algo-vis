import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * NLP（自然语言处理）相关题目数据
 * 自然语言处理经典题型
 */
export const nlpProblems: AIProblem[] = [
  {
    id: 10035,
    slug: "word-embedding",
    title: "词嵌入（Word Embedding）",
    domain: AIDomain.NLP,
    difficulty: Difficulty.EASY,
    description:
      "可视化词嵌入如何将离散的词语映射到连续的向量空间。理解词嵌入如何捕获词语的语义和语法关系，以及如何通过向量运算发现词语间的相似性。",
    learningGoals: [
      "理解词嵌入的基本概念和作用",
      "掌握词语到向量的映射过程",
      "理解词嵌入如何捕获语义相似性",
      "观察词向量空间中的几何关系",
    ],
    inputs: [
      "vocabulary：词汇表，包含所有词语",
      "embedding_dim：嵌入向量的维度",
      "word：要查询的词语",
    ],
    outputs: [
      "word_vector：词语对应的向量表示",
      "similar_words：相似词语列表（通过余弦相似度）",
      "word_analogies：词语类比关系（如：king - man + woman ≈ queen）",
    ],
    tags: ["词嵌入", "Word2Vec", "语义表示", "基础"],
    examples: [
      {
        input: "word = 'king', embedding_dim = 300",
        output: "word_vector = [0.2, -0.1, 0.5, ...] (300维向量)",
        explanation:
          "每个词语被映射到一个固定维度的向量，语义相似的词语在向量空间中距离较近。",
      },
    ],
    heroNote: "词嵌入是 NLP 的基础，为后续的文本理解任务提供语义表示。",
  },
  {
    id: 10036,
    slug: "word2vec-skip-gram",
    title: "Word2Vec Skip-gram",
    domain: AIDomain.NLP,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 Word2Vec 的 Skip-gram 模型如何通过预测上下文词语来学习词嵌入。理解中心词如何预测周围词语，以及负采样如何加速训练。",
    learningGoals: [
      "理解 Skip-gram 模型的训练目标",
      "掌握中心词预测上下文词的机制",
      "理解负采样的作用和实现",
      "观察训练过程中词向量的变化",
    ],
    inputs: [
      "center_word：中心词",
      "context_window：上下文窗口大小",
      "vocabulary_size：词汇表大小",
      "embedding_dim：词向量维度",
    ],
    outputs: [
      "center_embedding：中心词的嵌入向量",
      "context_predictions：对上下文词的预测概率",
      "negative_samples：负采样样本",
      "loss：训练损失",
    ],
    tags: ["Word2Vec", "Skip-gram", "词嵌入", "无监督学习"],
    examples: [
      {
        input: "center_word = 'king', context_window = 2",
        output: "预测上下文词：['the', 'of', 'queen', 'man']",
        explanation:
          "模型学习通过中心词 'king' 预测其周围的词语，从而学习到词语的语义关系。",
      },
    ],
    heroNote: "Skip-gram 是 Word2Vec 的核心算法，通过预测上下文学习词嵌入。",
  },
  {
    id: 10037,
    slug: "word2vec-cbow",
    title: "Word2Vec CBOW",
    domain: AIDomain.NLP,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 Word2Vec 的 CBOW（Continuous Bag of Words）模型如何通过上下文词语预测中心词来学习词嵌入。理解 CBOW 与 Skip-gram 的区别。",
    learningGoals: [
      "理解 CBOW 模型的训练目标",
      "掌握上下文词预测中心词的机制",
      "理解 CBOW 与 Skip-gram 的差异",
      "观察不同窗口大小对结果的影响",
    ],
    inputs: [
      "context_words：上下文词语列表",
      "center_word：要预测的中心词",
      "vocabulary_size：词汇表大小",
      "embedding_dim：词向量维度",
    ],
    outputs: [
      "context_embeddings：上下文词的嵌入向量",
      "averaged_embedding：上下文向量的平均值",
      "center_prediction：对中心词的预测概率",
      "loss：训练损失",
    ],
    tags: ["Word2Vec", "CBOW", "词嵌入", "无监督学习"],
    examples: [
      {
        input:
          "context_words = ['the', 'of', 'queen', 'man'], center_word = 'king'",
        output: "预测中心词 'king' 的概率最高",
        explanation:
          "模型学习通过上下文词语预测中心词，CBOW 通常比 Skip-gram 训练更快但精度略低。",
      },
    ],
    heroNote: "CBOW 是 Word2Vec 的另一种训练方式，适合处理高频词。",
  },
  {
    id: 10038,
    slug: "text-classification",
    title: "文本分类",
    domain: AIDomain.NLP,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示文本分类任务如何将文本分配到预定义的类别中。理解如何从文本中提取特征，使用分类器进行预测，以及如何评估分类性能。",
    learningGoals: [
      "理解文本分类的基本流程",
      "掌握文本特征提取方法（TF-IDF、词嵌入等）",
      "理解分类器的决策过程",
      "观察不同特征对分类结果的影响",
    ],
    inputs: [
      "text：输入文本",
      "feature_extractor：特征提取器（TF-IDF 或词嵌入）",
      "classifier：分类器（如朴素贝叶斯、SVM、神经网络）",
    ],
    outputs: [
      "features：提取的文本特征",
      "class_probabilities：各类别的预测概率",
      "predicted_class：预测的类别",
      "confidence_score：置信度分数",
    ],
    tags: ["文本分类", "特征提取", "TF-IDF", "情感分析"],
    examples: [
      {
        input: "text = '这部电影真的很棒！', 类别 = ['正面', '负面']",
        output: "predicted_class = '正面', confidence = 0.92",
        explanation:
          "通过分析文本中的关键词和语义，分类器判断该评论为正面情感。",
      },
    ],
    heroNote:
      "文本分类是 NLP 的基础任务，广泛应用于情感分析、垃圾邮件检测等场景。",
  },
  {
    id: 10039,
    slug: "named-entity-recognition",
    title: "命名实体识别（NER）",
    domain: AIDomain.NLP,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示命名实体识别（NER）如何从文本中识别和分类命名实体，如人名、地名、组织名等。理解序列标注任务和 BIO 标注体系。",
    learningGoals: [
      "理解命名实体识别的任务目标",
      "掌握 BIO 标注体系（B-Begin, I-Inside, O-Outside）",
      "理解序列标注模型的预测过程",
      "观察不同实体类型的识别结果",
    ],
    inputs: [
      "text：输入文本",
      "model：NER 模型（如 BiLSTM-CRF、BERT）",
      "entity_types：实体类型列表（如 PERSON, LOCATION, ORGANIZATION）",
    ],
    outputs: [
      "tokens：分词后的词语列表",
      "predictions：每个词语的标签预测",
      "entities：识别出的命名实体列表",
      "entity_spans：实体在文本中的位置",
    ],
    tags: ["NER", "序列标注", "信息抽取", "BIO"],
    examples: [
      {
        input: "text = '苹果公司位于加利福尼亚州库比蒂诺'",
        output:
          "entities = [('苹果公司', ORGANIZATION), ('加利福尼亚州', LOCATION), ('库比蒂诺', LOCATION)]",
        explanation:
          "模型识别出组织名和地名，每个实体都有对应的类型标签和位置信息。",
      },
    ],
    heroNote: "NER 是信息抽取的基础，广泛应用于知识图谱构建、问答系统等任务。",
  },
  {
    id: 10040,
    slug: "sentiment-analysis",
    title: "情感分析",
    domain: AIDomain.NLP,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示情感分析如何判断文本的情感倾向（正面、负面、中性）。理解如何从文本中提取情感特征，以及如何处理否定词、程度词等复杂情况。",
    learningGoals: [
      "理解情感分析的任务目标",
      "掌握情感词典的使用方法",
      "理解否定词和程度词的处理",
      "观察不同模型的情感预测过程",
    ],
    inputs: [
      "text：输入文本",
      "sentiment_model：情感分析模型",
      "sentiment_lexicon：情感词典（可选）",
    ],
    outputs: [
      "sentiment_score：情感分数（-1 到 1）",
      "sentiment_label：情感标签（正面/负面/中性）",
      "confidence：置信度",
      "key_phrases：关键情感短语",
    ],
    tags: ["情感分析", "文本分类", "情感词典", "应用"],
    examples: [
      {
        input: "text = '这个产品非常好用，强烈推荐！'",
        output: "sentiment_label = '正面', sentiment_score = 0.85",
        explanation:
          "通过分析文本中的积极词汇（'非常好用'、'强烈推荐'），模型判断为正面情感。",
      },
    ],
    heroNote: "情感分析广泛应用于产品评论分析、社交媒体监控、市场调研等领域。",
  },
  {
    id: 10041,
    slug: "text-similarity",
    title: "文本相似度计算",
    domain: AIDomain.NLP,
    difficulty: Difficulty.EASY,
    description:
      "展示如何计算两个文本之间的相似度。理解不同的相似度度量方法（余弦相似度、编辑距离、语义相似度等）及其适用场景。",
    learningGoals: [
      "理解文本相似度的概念",
      "掌握余弦相似度的计算方法",
      "理解编辑距离（Levenshtein Distance）",
      "观察不同相似度度量的差异",
    ],
    inputs: [
      "text1：第一个文本",
      "text2：第二个文本",
      "similarity_method：相似度计算方法",
    ],
    outputs: [
      "similarity_score：相似度分数（0 到 1）",
      "common_words：共同词语",
      "word_vectors：文本的向量表示",
      "distance_metric：距离度量值",
    ],
    tags: ["文本相似度", "余弦相似度", "编辑距离", "应用"],
    examples: [
      {
        input: "text1 = '机器学习很有趣', text2 = '深度学习很精彩'",
        output: "similarity_score = 0.65（基于词嵌入的语义相似度）",
        explanation:
          "虽然词语不完全相同，但通过语义相似度可以识别出两句话都表达了积极的学习体验。",
      },
    ],
    heroNote: "文本相似度计算是信息检索、重复检测、推荐系统等任务的基础。",
  },
  {
    id: 10042,
    slug: "sequence-to-sequence",
    title: "序列到序列（Seq2Seq）",
    domain: AIDomain.NLP,
    difficulty: Difficulty.HARD,
    description:
      "展示序列到序列模型如何将输入序列转换为输出序列，这是机器翻译、文本摘要等任务的基础架构。理解编码器-解码器结构的工作原理。",
    learningGoals: [
      "理解 Seq2Seq 模型的基本架构",
      "掌握编码器如何将输入序列编码为上下文向量",
      "理解解码器如何生成输出序列",
      "观察注意力机制在 Seq2Seq 中的作用",
    ],
    inputs: [
      "input_sequence：输入序列（如源语言句子）",
      "encoder：编码器（RNN/LSTM/GRU）",
      "decoder：解码器（RNN/LSTM/GRU）",
    ],
    outputs: [
      "encoder_states：编码器的隐藏状态序列",
      "context_vector：上下文向量（编码器的最后状态）",
      "decoder_states：解码器的隐藏状态序列",
      "output_sequence：生成的输出序列",
    ],
    tags: ["Seq2Seq", "编码器-解码器", "机器翻译", "序列生成"],
    examples: [
      {
        input: "input_sequence = ['Hello', 'world'], 任务 = 机器翻译",
        output: "output_sequence = ['Bonjour', 'le', 'monde']",
        explanation:
          "编码器将源语言句子编码为上下文向量，解码器基于该向量生成目标语言句子。",
      },
    ],
    heroNote: "Seq2Seq 是机器翻译、文本摘要、对话系统等任务的核心架构。",
  },
  {
    id: 10043,
    slug: "attention-mechanism-nlp",
    title: "注意力机制（NLP）",
    domain: AIDomain.NLP,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示注意力机制在 NLP 任务中如何让模型关注输入序列的不同部分。理解注意力权重如何动态分配，以及如何提升 Seq2Seq 模型的性能。",
    learningGoals: [
      "理解注意力机制在 NLP 中的作用",
      "掌握注意力权重的计算过程",
      "理解注意力如何改善长序列处理",
      "观察注意力权重与输入输出的对应关系",
    ],
    inputs: [
      "encoder_states：编码器的所有隐藏状态",
      "decoder_state：解码器当前时刻的隐藏状态",
      "attention_function：注意力函数（如点积注意力）",
    ],
    outputs: [
      "attention_weights：注意力权重分布",
      "context_vector：加权后的上下文向量",
      "aligned_inputs：对齐的输入位置",
    ],
    tags: ["注意力机制", "Seq2Seq", "机器翻译", "序列模型"],
    examples: [
      {
        input: "encoder_states = [h1, h2, h3, h4], decoder_state = s1",
        output:
          "attention_weights = [0.1, 0.3, 0.5, 0.1], context_vector = 加权和",
        explanation:
          "解码器在生成每个词时，通过注意力机制关注编码器不同位置的信息，权重高的位置对当前输出影响更大。",
      },
    ],
    heroNote: "注意力机制显著提升了 Seq2Seq 模型在长序列任务上的表现。",
  },
  {
    id: 10044,
    slug: "text-summarization",
    title: "文本摘要",
    domain: AIDomain.NLP,
    difficulty: Difficulty.HARD,
    description:
      "展示文本摘要任务如何从长文本中提取关键信息生成简短摘要。理解抽取式摘要和生成式摘要的区别，以及如何评估摘要质量。",
    learningGoals: [
      "理解文本摘要的任务目标",
      "掌握抽取式摘要和生成式摘要的区别",
      "理解如何识别文本中的关键句子",
      "观察摘要生成的过程",
    ],
    inputs: [
      "source_text：源文本（长文档）",
      "summary_model：摘要模型（如 Seq2Seq、BERT）",
      "max_length：摘要的最大长度",
    ],
    outputs: [
      "extracted_sentences：抽取的关键句子（抽取式）",
      "generated_summary：生成的摘要（生成式）",
      "sentence_scores：句子重要性分数",
      "summary_length：摘要长度",
    ],
    tags: ["文本摘要", "信息抽取", "Seq2Seq", "应用"],
    examples: [
      {
        input: "source_text = 一篇 1000 字的新闻文章",
        output: "generated_summary = 100 字的摘要，包含关键信息",
        explanation:
          "模型识别文章中的关键信息，生成简洁的摘要，保留原文的核心内容。",
      },
    ],
    heroNote: "文本摘要是 NLP 的重要应用，广泛应用于新闻摘要、文档总结等场景。",
  },
  {
    id: 10045,
    slug: "machine-translation",
    title: "机器翻译",
    domain: AIDomain.NLP,
    difficulty: Difficulty.HARD,
    description:
      "展示机器翻译系统如何将一种语言的文本转换为另一种语言。理解神经机器翻译（NMT）的工作原理，包括编码器-解码器架构和注意力机制。",
    learningGoals: [
      "理解机器翻译的任务目标",
      "掌握神经机器翻译的架构",
      "理解注意力机制在翻译中的作用",
      "观察源语言到目标语言的映射过程",
    ],
    inputs: [
      "source_text：源语言文本",
      "source_language：源语言代码",
      "target_language：目标语言代码",
      "translation_model：翻译模型",
    ],
    outputs: [
      "translated_text：翻译后的文本",
      "attention_alignments：注意力对齐矩阵",
      "word_alignments：词语对齐关系",
      "translation_confidence：翻译置信度",
    ],
    tags: ["机器翻译", "Seq2Seq", "注意力机制", "应用"],
    examples: [
      {
        input:
          "source_text = 'Hello world', source_language = 'en', target_language = 'zh'",
        output: "translated_text = '你好世界'",
        explanation:
          "模型将英语句子编码为语义表示，然后解码生成对应的中文翻译。",
      },
    ],
    heroNote:
      "神经机器翻译是 NLP 的重要应用，Google Translate、DeepL 等都基于此技术。",
  },
  {
    id: 10046,
    slug: "part-of-speech-tagging",
    title: "词性标注（POS Tagging）",
    domain: AIDomain.NLP,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示词性标注如何为文本中的每个词语分配词性标签（如名词、动词、形容词等）。理解序列标注任务和隐马尔可夫模型（HMM）的应用。",
    learningGoals: [
      "理解词性标注的任务目标",
      "掌握常见的词性标签体系（如 Penn Treebank）",
      "理解序列标注模型的预测过程",
      "观察不同词性标签的分布",
    ],
    inputs: [
      "text：输入文本",
      "pos_model：词性标注模型（如 HMM、BiLSTM-CRF）",
      "tagset：词性标签集",
    ],
    outputs: [
      "tokens：分词后的词语列表",
      "pos_tags：每个词语的词性标签",
      "tag_probabilities：标签预测概率",
      "tagged_text：标注后的文本",
    ],
    tags: ["词性标注", "序列标注", "HMM", "基础任务"],
    examples: [
      {
        input: "text = 'The cat sat on the mat'",
        output:
          "pos_tags = ['DT', 'NN', 'VBD', 'IN', 'DT', 'NN'] (限定词、名词、动词、介词等)",
        explanation: "模型为每个词语分配词性标签，帮助理解句子的语法结构。",
      },
    ],
    heroNote: "词性标注是 NLP 的基础任务，为句法分析、语义分析等提供重要信息。",
  },
  {
    id: 10047,
    slug: "dependency-parsing",
    title: "依存句法分析",
    domain: AIDomain.NLP,
    difficulty: Difficulty.HARD,
    description:
      "展示依存句法分析如何识别句子中词语之间的依存关系，构建依存句法树。理解如何通过依存关系理解句子的语法结构。",
    learningGoals: [
      "理解依存句法分析的任务目标",
      "掌握常见的依存关系类型（如主谓、动宾、定中）",
      "理解依存句法树的构建过程",
      "观察不同句式的依存结构",
    ],
    inputs: [
      "text：输入文本",
      "parser：依存句法分析器（如基于图的解析器、基于转移的解析器）",
    ],
    outputs: [
      "dependency_tree：依存句法树",
      "dependency_relations：依存关系列表",
      "head_words：每个词语的中心词",
      "parse_tree_visualization：句法树可视化",
    ],
    tags: ["依存句法分析", "句法分析", "语法树", "高级任务"],
    examples: [
      {
        input: "text = 'The cat sat on the mat'",
        output:
          "dependency_tree = sat(ROOT) -> cat(nsubj), sat -> on(prep), on -> mat(pobj)",
        explanation:
          "分析出 'sat' 是根节点，'cat' 是主语，'on' 是介词，'mat' 是介词宾语。",
      },
    ],
    heroNote:
      "依存句法分析帮助理解句子的语法结构，是语义分析、问答系统等任务的基础。",
  },
];

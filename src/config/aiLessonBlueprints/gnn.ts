import type { GuidedLessonBlueprint } from "../guidedLessonTypes";

export const gnnLessonBlueprints: GuidedLessonBlueprint[] = [
  {
    id: 10102,
    title: "GCN 消息传递机制",
    intuition:
      "把每个节点看成一个学生：它先保留自己的笔记，再收集邻居的笔记，按连接数量校准后合成新的理解。",
    formula:
      "H^{(l+1)}=\\sigma\\!\\left(\\widetilde D^{-1/2}\\widetilde A\\widetilde D^{-1/2}H^{(l)}W^{(l)}\\right),\\quad \\widetilde A=A+I",
    symbols: [
      { symbol: "A", meaning: "原始邻接矩阵" },
      { symbol: "\\widetilde A", meaning: "加入自环后的邻接矩阵" },
      { symbol: "\\widetilde D", meaning: "由加入自环后的度数构成的对角矩阵" },
      { symbol: "H^{(l)}", meaning: "第 l 层节点特征" },
      { symbol: "W^{(l)}", meaning: "第 l 层共享线性变换" },
    ],
    flow: [
      "为每个节点加入自环",
      "计算新的节点度数",
      "对邻接矩阵对称归一化",
      "聚合邻居并线性变换",
      "激活得到新节点表示",
      "继续堆叠并观察多跳扩散",
    ],
    misconception:
      "GCN 不是简单把邻居特征相加；自环和度归一化会共同控制自己与不同度数邻居的贡献。",
    debugTip:
      "打印 A+I 的对角线、度向量和归一化邻接矩阵；确认无向图下矩阵仍对称，再逐步核对 A_norm@H 与其乘 W 后的形状和数值。",
    takeaway:
      "GCN 用归一化邻接矩阵把一跳邻居信息稳定地汇入每个节点。",
  },
  {
    id: 10103,
    title: "Cora 节点分类实验",
    intuition:
      "少数论文已经贴好研究主题标签，GCN 借助论文内容和引用关系，把这些标签线索传播给尚未标注的论文。",
    formula:
      "\\mathcal L=-\\frac{1}{|V_{\\mathrm{train}}|}\\sum_{v\\in V_{\\mathrm{train}}}\\sum_{c=1}^{C}y_{vc}\\log p_{vc}",
    symbols: [
      { symbol: "V_{\\mathrm{train}}", meaning: "参与监督损失的训练节点集合" },
      { symbol: "C", meaning: "论文类别数量" },
      { symbol: "y_{vc}", meaning: "节点 v 是否属于类别 c 的标签" },
      { symbol: "p_{vc}", meaning: "模型预测节点 v 属于类别 c 的概率" },
    ],
    flow: [
      "标准化论文特征与图结构",
      "执行两层 GCN 前向并得到类别概率",
      "仅用训练节点计算损失",
      "反向传播并更新模型参数",
      "在验证集选择配置",
      "在测试集计算指标",
      "定位混淆类别与误判节点",
    ],
    misconception:
      "半监督节点分类不是只让训练节点进入图；验证和测试节点可以参与消息传递，但其标签绝不能进入训练损失。",
    debugTip:
      "打印 train/val/test 掩码交集并确认都为空，核对各集合每类节点数；再检查训练损失索引只命中 train mask，混淆矩阵元素总和等于测试节点数。",
    takeaway:
      "Cora 实验用少量标签和完整引用图检验 GNN 的半监督节点分类能力。",
  },
  {
    id: 10104,
    title: "GraphSAGE 邻居采样",
    intuition:
      "面对拥有海量邻居的节点，GraphSAGE 不把整张图都搬进来，而是每层抽取固定数量的邻居作为代表，再逐层汇总。",
    formula:
      "h_v^{(k)}=\\sigma\\!\\left(W^{(k)}\\left[h_v^{(k-1)}\\mathbin{\\Vert}\\operatorname{AGG}_k\\!\\left(\\{h_u^{(k-1)}:u\\in S_k(v)\\}\\right)\\right]\\right)",
    symbols: [
      { symbol: "S_k(v)", meaning: "第 k 层为节点 v 采样的邻居集合" },
      { symbol: "\\operatorname{AGG}_k", meaning: "均值、池化或 LSTM 聚合器" },
      { symbol: "h_v^{(k)}", meaning: "节点 v 在第 k 层的新表示" },
      { symbol: "\\mathbin{\\Vert}", meaning: "自身表示与邻居摘要的拼接" },
    ],
    flow: [
      "从目标节点开始",
      "按 fan-out 分层采样",
      "从最外层向内聚合",
      "拼接自身与邻居摘要",
      "统计采样子图的显存占用",
      "缓存推理所需邻居与中间表示",
      "输出目标节点嵌入",
    ],
    misconception:
      "fan-out=[10,25] 不代表每个目标只读取 35 个节点；不同层的采样会形成乘法增长，重复邻居才会降低实际数量。",
    debugTip:
      "逐层打印采样到的节点 ID、去重前后数量和边方向，确认每个父节点邻居数不超过 fan-out；固定随机种子重复运行，并比较同一目标嵌入的差异。",
    takeaway:
      "GraphSAGE 用有界邻居采样换取大图上可控的批次规模和归纳能力。",
  },
  {
    id: 10105,
    title: "GAT 多头注意力热力图",
    intuition:
      "普通图卷积按结构预设邻居权重，GAT 则让节点自己判断哪些邻居更值得听，多位观察者还能给出不同判断。",
    formula:
      "e_{ij}^{(r)}=\\operatorname{LeakyReLU}\\!\\left((a^{(r)})^{\\mathsf T}[W^{(r)}h_i\\mathbin{\\Vert}W^{(r)}h_j]\\right),\\quad \\alpha_{ij}^{(r)}=\\frac{\\exp e_{ij}^{(r)}}{\\sum_{k\\in\\mathcal N(i)}\\exp e_{ik}^{(r)}},\\quad h_i'=\\mathop{\\Vert}_{r=1}^{R}\\sigma\\!\\left(\\sum_{j\\in\\mathcal N(i)}\\alpha_{ij}^{(r)}W^{(r)}h_j\\right)",
    symbols: [
      { symbol: "e_{ij}^{(r)}", meaning: "第 r 个头中，节点 i 对邻居 j 的未归一化注意力分数" },
      { symbol: "\\alpha_{ij}^{(r)}", meaning: "第 r 个头中，在节点 i 邻域内经 softmax 归一化后的权重" },
      { symbol: "W", meaning: "共享节点特征投影" },
      { symbol: "\\mathcal N(i)", meaning: "节点 i 可关注的邻居集合" },
      { symbol: "r,R", meaning: "注意力头编号与头总数" },
    ],
    flow: [
      "投影中心与邻居特征",
      "为每条边计算分数",
      "在目标节点邻域内 softmax",
      "各头独立聚合邻居",
      "拼接或平均头输出",
    ],
    misconception:
      "GAT 的注意力权重只在同一目标节点的邻域内归一化，不能把不同节点热力图中的绝对数值直接横向比较。",
    debugTip:
      "按目标节点和头分组求 alpha 总和，应各自接近 1；确认非边位置没有权重，并核对 concat 输出维度为 heads*head_dim、mean 输出维度为 head_dim。",
    takeaway:
      "GAT 学习每个邻居的相对贡献，多头机制提供互补的图关系视角。",
  },
  {
    id: 10106,
    title: "图自编码器链路预测",
    intuition:
      "编码器把节点放进一个隐空间，关系紧密的节点靠得更近；解码器再用两点的相似度判断它们之间是否应该有边。",
    formula:
      "Z=\\operatorname{GNN}(X,A_{\\mathrm{train}}),\\quad p_{ij}=\\sigma(z_i^{\\mathsf T}z_j),\\quad \\mathcal L_{rec}=-\\sum_{(i,j)\\in E^+}\\log p_{ij}-\\sum_{(i,j)\\in E^-}\\log(1-p_{ij})",
    symbols: [
      { symbol: "A_{\\mathrm{train}}", meaning: "移除验证和测试边后的训练图" },
      { symbol: "Z", meaning: "编码器产生的全部节点嵌入" },
      { symbol: "z_i^{\\mathsf T}z_j", meaning: "节点 i 与 j 的内积相似度" },
      { symbol: "p(A_{ij}=1\\mid Z)", meaning: "节点对之间存在边的预测概率" },
      { symbol: "E^+,E^-", meaning: "训练正边与采样得到的训练负边" },
    ],
    flow: [
      "划分训练与留出边",
      "采样不存在的负边",
      "GNN 编码节点表示",
      "内积解码节点对",
      "计算重建损失",
      "反向传播并更新编码器",
      "用 ROC-AUC 评估排序",
    ],
    misconception:
      "随机负采样不能直接从所有节点对随意抽取；抽到真实边或把测试正边留在编码图中都会造成评估泄漏。",
    debugTip:
      "逐项验证留出正边不在 A_train 中、负边不在原图且不是自环；再分别打印正负样本分数分布，并用同一留出集合重算 ROC-AUC。",
    takeaway:
      "图自编码器把结构压缩成节点嵌入，再通过节点对相似度重建潜在连边。",
  },
  {
    id: 10107,
    title: "DiffPool 层级图池化",
    intuition:
      "DiffPool 像把一群节点软分组：一个节点可以按不同比例属于多个小组，每个小组再成为更粗粒度图中的超节点。",
    formula:
      "S=\\operatorname{softmax}(\\operatorname{GNN}_{\\mathrm{pool}}(A,X)),\\quad X'=S^{\\mathsf T}Z,\\quad A'=S^{\\mathsf T}AS,\\quad \\mathcal L_{aux}=\\lVert A-SS^{\\mathsf T}\\rVert_F+\\frac1n\\sum_i H(S_i)",
    symbols: [
      { symbol: "S", meaning: "节点到超节点的软分配矩阵" },
      { symbol: "Z", meaning: "待汇聚的节点嵌入" },
      { symbol: "X'", meaning: "池化后的超节点特征" },
      { symbol: "A'", meaning: "池化后的超节点邻接矩阵" },
    ],
    flow: [
      "预测节点嵌入 Z",
      "预测软分配矩阵 S",
      "汇聚超节点特征",
      "重建超节点间连接",
      "在更粗图上继续学习",
      "读出图向量并完成图分类",
      "与 TopKPool 和 SAGPool 对照",
    ],
    misconception:
      "DiffPool 不是按固定分数删除节点；它学习软聚类，并同时更新特征矩阵和邻接矩阵。",
    debugTip:
      "确认 S 形状为 [n,k] 且每行和约为 1，随后核对 X' 为 [k,d]、A' 为 [k,k]；无向图还应检查 A' 近似对称，并记录分配熵与 link loss。",
    takeaway:
      "DiffPool 通过可学习的软分组把原图逐层压缩成可用于图级任务的层级表示。",
  },
  {
    id: 10108,
    title: "动态图事件流建模",
    intuition:
      "动态图不是一叠互不相干的快照，而是一条按时间到达的事件流；节点记忆要在每次互动后更新，并随间隔长短理解新旧信息。",
    formula:
      "\\begin{aligned}z_v(t_q)&=\\operatorname{AGG}_{e:u\\to v,\\,t_e<t_q}[m_u(t_e^-)\\mathbin{\\Vert}x_e\\mathbin{\\Vert}\\phi(t_q-t_e)]\\\\\\widehat y(t_q)&=g(z_u(t_q),z_v(t_q))\\\\m_v(t_q^+)&=\\operatorname{GRU}(m_v(t_q^-),\\operatorname{msg}(e_q))\\end{aligned}",
    symbols: [
      { symbol: "m_v(t^-)", meaning: "事件发生前节点 v 的记忆" },
      { symbol: "x_e", meaning: "当前边或节点事件的特征" },
      { symbol: "t_e", meaning: "事件 e 的时间戳" },
      { symbol: "\\phi(t-t_e)", meaning: "事件距当前时刻的时间编码" },
    ],
    flow: [
      "按时间排序事件",
      "读取参与节点旧记忆",
      "只聚合查询时刻之前的事件",
      "用旧记忆生成当前预测",
      "提交当前事件并更新记忆",
    ],
    misconception:
      "动态图训练不能随机打乱事件后仍按普通静态图处理；未来事件进入当前邻域或记忆会直接造成时间泄漏。",
    debugTip:
      "预测前逐批断言所有消息时间严格满足 t_e<t_query，并确认当前事件 e_q 尚未进入邻域或记忆；随后打印更新前记忆、当前预测、提交后的记忆与 last_update。",
    takeaway:
      "时序 GNN 按事件顺序更新节点记忆，用时间编码区分相同关系在不同时间的意义。",
  },
  {
    id: 10109,
    title: "GNN 推荐召回管线",
    intuition:
      "用户和物品组成多种关系的网络：模型沿购买、浏览或内容相似等路径收集线索，再用用户向量去大规模物品库中找近邻。",
    formula:
      "h_v'=\\sum_{r\\in\\mathcal R}\\sum_{u\\in\\mathcal N_r(v)}\\alpha_{vu}^{(r)}W_rh_u,\\quad \\operatorname{score}(u,i)=h_u^{\\mathsf T}h_i",
    symbols: [
      { symbol: "\\mathcal R", meaning: "异构图中的关系类型集合" },
      { symbol: "\\mathcal N_r(v)", meaning: "经关系 r 与节点 v 相连的邻居" },
      { symbol: "\\alpha_{vu}^{(r)}", meaning: "关系 r 下邻居 u 的聚合权重" },
      { symbol: "h_u^{\\mathsf T}h_i", meaning: "用户与物品的召回相似度" },
    ],
    flow: [
      "校验用户物品图 schema",
      "沿关系或元路径聚合",
      "生成用户与物品向量",
      "建立物品 ANN 索引",
      "召回候选并计算 Recall@K",
    ],
    misconception:
      "离线嵌入质量高不代表召回管线就正确；索引陈旧、训练正样本泄漏或冷启动节点无特征都会让线上结果失真。",
    debugTip:
      "抽样打印每种边类型的源/目标节点类型及聚合邻居数；再对一小批用户用暴力内积 top-k 对照 ANN 结果，计算索引召回率并单列冷启动用户覆盖率。",
    takeaway:
      "GNN 推荐先用异构关系学习向量，再由 ANN 把图表示转成可服务的候选集合。",
  },
  {
    id: 10110,
    title: "Graph Transformer × RAG 热点实践",
    intuition:
      "文本 RAG 可用稀疏、稠密或混合检索翻找段落，Graph RAG 还会沿实体关系找证据；Graph Transformer 则帮助每个实体综合远近节点后再参与检索。",
    formula:
      "\\alpha_{ij}=\\operatorname{softmax}_{j\\in\\mathcal N(i)}\\!\\left(\\frac{Q_iK_j^{\\mathsf T}}{\\sqrt d}+b_{r(i,j)}\\right),\\quad \\mathcal C=\\operatorname{TopK}_{v}\\,\\operatorname{sim}(q,z_v)",
    symbols: [
      { symbol: "b_{r(i,j)}", meaning: "由节点 i、j 的关系类型产生的注意力偏置" },
      { symbol: "\\mathcal N(i)", meaning: "节点 i 可关注的图邻域" },
      { symbol: "z_v", meaning: "Graph Transformer 编码的实体表示" },
      { symbol: "\\mathcal C", meaning: "送入生成模型的 top-k 图证据集合" },
    ],
    flow: [
      "抽取并规范化知识三元组",
      "编码带关系的图表示",
      "按问题检索实体与路径",
      "整理可引用证据上下文",
      "生成答案并核验依据",
    ],
    misconception:
      "Graph RAG 不会因为使用知识图谱就自动消除幻觉；检索遗漏、错误三元组和上下文拼接错误仍会传给生成模型。",
    debugTip:
      "对样例问题打印 top-k 实体 ID、相似度、关系路径和原始证据文本，确认每条上下文可回溯到真实三元组；再关闭图关系偏置对照 Recall@K 与无依据答案率。",
    takeaway:
      "Graph Transformer 学习结构化实体表示，Graph RAG 再把可追踪的图证据交给生成模型。",
  },
];

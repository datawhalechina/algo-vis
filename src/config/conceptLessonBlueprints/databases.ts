import type { ConceptLessonBlueprint } from "./types";

export const databaseLessons: ConceptLessonBlueprint[] = [
  {
    id: 40019,
    slug: "relational-model",
    bookId: 4,
    category: "database",
    difficulty: "easy",
    title: "关系模型",
    description:
      "从关系、元组、属性和键出发，理解数据库如何用表格结构表达数据及其约束。",
    keyPoints: ["关系模式规定属性与值域", "关系实例是满足模式的元组集合", "键保证唯一性，关系代数组合查询"],
    relatedConcepts: ["主键与外键", "关系代数", "数据库规范化"],
    tags: ["数据库", "关系模型", "关系代数"],
    heroNote: "先把表看成满足约束的元组集合，再学习 SQL 会更清楚。",
    intuition:
      "把关系想成一张有严格表头的登记表：每列规定可填写的值域，每行是一条完整记录，而键就像不会重复的证件号。",
    formula:
      "R(A_1,\\ldots,A_n),\\qquad r(R)\\subseteq D_1\\times\\cdots\\times D_n",
    symbols: [
      { symbol: "R(A_1,\\ldots,A_n)", meaning: "只规定属性名称和结构的关系模式" },
      { symbol: "r(R)", meaning: "某一时刻模式 R 下实际保存的元组集合，也叫关系实例" },
      { symbol: "A_i", meaning: "关系中的第 i 个属性名称" },
      { symbol: "D_i", meaning: "属性 A_i 允许取值的域" },
    ],
    flow: ["定义模式中的属性与值域", "形成满足模式的关系实例", "用键检查元组唯一性", "通过选择与投影得到新关系实例"],
    misconception:
      "关系不等同于随意的二维表；列有确定语义和取值域，元组在理论上也没有固定顺序。",
    debugTip:
      "对一次查询依次打印输入行数、选择条件后的行数和投影后的列名，并统计主键去重前后数量；数量变化不符合预期时就能定位出错算子。",
    takeaway: "关系模式规定数据形状，关系实例保存受模式与键约束的元组，并可参与关系运算。",
  },
  {
    id: 40020,
    slug: "b-plus-tree-index",
    bookId: 4,
    category: "database",
    difficulty: "medium",
    title: "B+ 树索引",
    description:
      "理解 B+ 树如何借助高扇出、平衡路径和有序叶子页减少磁盘访问并支持范围查询。",
    keyPoints: ["内部节点只负责导航", "所有记录入口位于同层叶子", "叶子链表支持连续范围扫描"],
    relatedConcepts: ["页式存储", "聚簇索引", "范围查询"],
    tags: ["数据库", "索引", "B+树"],
    heroNote: "索引的价值不只是少比较几次，而是少读取昂贵的数据页。",
    intuition:
      "把 B+ 树想成图书馆的多级目录：先在总目录缩小楼层，再在分区目录定位书架，最后沿相邻书架连续取书。",
    formula:
      "\\begin{gathered}F\\ge3,\\quad L\\ge2,\\quad f_{\\min}=\\lceil F/2\\rceil,\\quad \\ell_{\\min}=\\lceil L/2\\rceil\\\\2\\ell_{\\min}f_{\\min}^{h-1}\\le N\\le LF^h\\quad(h\\ge1)\\\\\\max\\left\\{1,\\left\\lceil\\log_F\\frac NL\\right\\rceil\\right\\}\\le h\\le1+\\left\\lfloor\\log_{f_{\\min}}\\frac{N}{2\\ell_{\\min}}\\right\\rfloor,\\qquad h=O(\\log_{f_{\\min}}N)\\\\R_{\\mathrm{cold}}=h+1\\quad(h\\ge0)\\end{gathered}",
    symbols: [
      { symbol: "N", meaning: "索引中需要定位的键数量" },
      { symbol: "F,L", meaning: "内部页最多的子指针数，以及叶子页最多的键条目数" },
      { symbol: "f_{\\min},\\ell_{\\min}", meaning: "按非根页至少半满的约定，内部页与叶子页的最小占用量" },
      { symbol: "h", meaning: "从第 0 层根页到叶子页的边数；根本身就是叶子时 h=0" },
      { symbol: "R_{\\mathrm{cold}}", meaning: "缓存全空时一次点查读取的索引页数，根页和叶子页都计入" },
    ],
    flow: ["从第 0 层根页读取分隔键", "按目标键选择一个子页", "每下一层读取一个索引页", "在第 h 层叶子定位键", "范围查询再沿叶链读取后续叶子页"],
    misconception:
      "树高不能由平均扇出和键数写成一个精确对数；容量、最低占用率和根页例外共同给出界。冷缓存点查的 h+1 次只计算根到叶的索引页，若还要读取独立数据页需另加一次。",
    debugTip:
      "跟踪目标键、每层页号、页内键区间、实际占用率和选中的子指针；冷缓存时核对根到叶恰读 h+1 个索引页，并把缓存命中、后续叶子页和独立数据页分别计数。",
    takeaway: "页容量与最低占用率把 B+ 树高度限制在对数级；冷缓存点查读取根到叶共 h+1 个索引页。",
  },
  {
    id: 40021,
    slug: "transaction-acid",
    bookId: 4,
    category: "database",
    difficulty: "medium",
    title: "事务 ACID",
    description:
      "通过转账示例掌握原子性、一致性、隔离性和持久性如何共同保护一组数据库操作。",
    keyPoints: ["原子性保证全部成功或全部撤销", "一致性要求事务保持业务约束", "隔离与持久性分别处理并发和故障"],
    relatedConcepts: ["预写日志", "并发控制", "崩溃恢复"],
    tags: ["数据库", "事务", "ACID"],
    heroNote: "事务把多次读写包成一个可信的状态转换。",
    intuition:
      "把事务想成银行柜台的一次转账：扣款和入账必须作为一个整体完成，旁人不能看到半成品，停电后已确认的结果也不能丢。",
    formula: "a'=a-x,\\qquad b'=b+x,\\qquad a'+b'=a+b",
    symbols: [
      { symbol: "a", meaning: "转账前付款账户的余额" },
      { symbol: "b", meaning: "转账前收款账户的余额" },
      { symbol: "x", meaning: "本次转账金额" },
      { symbol: "a',b'", meaning: "事务完成后的两个账户余额" },
    ],
    flow: ["开启事务并读取余额", "校验余额与业务约束", "记录日志并更新两账户", "提交后确认结果或失败时回滚"],
    misconception:
      "上面的余额守恒式只展示 ACID 中的一致性约束，不能单独证明原子性、隔离性或持久性；这里的一致性也不是副本数据立刻一致。",
    debugTip:
      "记录事务 ID、提交状态、两账户更新前后值和对应日志序号；在两次写入之间注入失败，核对恢复后只能看到旧值或完整新值，且余额总和不变。",
    takeaway: "ACID 让一组读写成为可隔离、可恢复且始终维护约束的完整状态转换。",
  },
  {
    id: 40022,
    slug: "isolation-levels-and-mvcc",
    bookId: 4,
    category: "database",
    difficulty: "hard",
    title: "隔离级别与 MVCC",
    description:
      "理解不同隔离级别允许哪些并发现象，以及 MVCC 如何依据快照从版本链选择可见记录。",
    keyPoints: ["隔离级别决定可观察的并发现象", "快照定义事务可见边界", "MVCC 用多版本降低读写阻塞"],
    relatedConcepts: ["事务 ACID", "锁与死锁", "可串行化"],
    tags: ["数据库", "MVCC", "隔离级别"],
    heroNote: "并发读取的关键问题不是最新，而是这个事务应该看见哪个版本。",
    intuition:
      "把 MVCC 想成共享文档的历史版本：每位读者按进入时拿到的时间切片阅读，写作者生成新版本，而不是直接涂掉读者正在看的页面。",
    formula:
      "\\operatorname{visible}(v,S)=\\bigl(b(v)\\le S\\bigr)\\land\\bigl(e(v)=\\varnothing\\lor S<e(v)\\bigr)",
    symbols: [
      { symbol: "v", meaning: "版本链中的某个行版本" },
      { symbol: "S", meaning: "当前事务快照的可见时间边界" },
      { symbol: "b(v)", meaning: "版本 v 开始生效的时间标记" },
      { symbol: "e(v)", meaning: "版本 v 失效的时间标记，空集表示仍有效" },
    ],
    flow: ["事务取得一致性快照", "沿记录版本链检查时间标记", "返回首个满足可见规则的版本", "写冲突再由锁或验证机制处理"],
    misconception:
      "上式只是便于入门的简化时间戳 MVCC 可见性模型，不代表所有数据库的快照规则或全部隔离级别；真实系统还会考虑事务状态、活跃事务集合，写写冲突也常需锁或验证。",
    debugTip:
      "复现异常时保存各事务 ID、快照边界以及每个行版本的创建者和删除者标记，逐版本代入可见性条件，并对照实际返回版本与锁等待记录。",
    takeaway: "隔离级别规定并发可见性，MVCC 则通过快照和版本链实现这种可见性。",
  },
  {
    id: 40023,
    slug: "query-optimization",
    bookId: 4,
    category: "database",
    difficulty: "hard",
    title: "查询优化",
    description:
      "学习优化器如何枚举访问路径和连接顺序，利用基数估计与成本模型选择执行计划。",
    keyPoints: ["等价 SQL 可能拥有许多物理计划", "基数估计驱动算子成本", "统计信息误差会沿计划逐层放大"],
    relatedConcepts: ["关系代数", "B+ 树索引", "连接算法"],
    tags: ["数据库", "查询优化器", "执行计划"],
    heroNote: "连接会组合输入并产生中间行，基数就是这些结果的行数；优化器据此挑选预计代价最低的执行路径。",
    intuition:
      "把查询优化想成规划送货路线：结果必须送到同一地点，但先走哪条路、先装哪批货，会让总时间相差几个数量级。",
    formula:
      "P^*=\\arg\\min_{P\\in\\mathcal{P}(Q)}\\left(C_{\\mathrm{I/O}}(P)+C_{\\mathrm{CPU}}(P)+C_{\\mathrm{NET}}(P)\\right)",
    symbols: [
      { symbol: "Q", meaning: "待执行的逻辑查询" },
      { symbol: "\\mathcal{P}(Q)", meaning: "与查询 Q 等价的候选物理计划集合" },
      { symbol: "P^*", meaning: "成本模型选出的执行计划" },
      { symbol: "C_{\\mathrm{I/O}},C_{\\mathrm{CPU}},C_{\\mathrm{NET}}", meaning: "计划的磁盘、计算和网络成本估计" },
    ],
    flow: ["把 SQL 转换为逻辑算子树", "枚举索引与连接顺序", "估计各节点输出行数", "累计候选计划成本", "执行最低估计成本的计划"],
    misconception:
      "优化器选的是统计信息和成本模型下的预计最优计划，并不保证面对过期统计或相关列时仍是实际最快。",
    debugTip:
      "运行 EXPLAIN ANALYZE，逐节点对比估计行数与实际行数，找到第一个偏差超过一个数量级的节点，再核查该列统计、过滤选择率和可用索引。",
    takeaway: "查询优化的核心是用基数估计比较等价物理计划，而估计误差常是慢查询根因。",
  },
  {
    id: 40024,
    slug: "replication-and-sharding",
    bookId: 4,
    category: "database",
    difficulty: "hard",
    title: "复制与分片",
    description:
      "区分复制与分片解决的问题，理解请求路由、日志同步、故障切换和跨分片操作的代价。",
    keyPoints: ["复制用冗余提升可用性和读能力", "分片把不同键分散到多个节点", "一致性与跨分片事务带来协调成本"],
    relatedConcepts: ["一致性协议", "分布式事务", "哈希分区"],
    tags: ["数据库", "复制", "分片"],
    heroNote: "复制是在多处保存同一份数据，分片是在多处分摊不同数据。",
    intuition:
      "复制像把同一本档案做多份备份，分片像按姓氏把不同档案分到多个柜台；前者防丢和分担读，后者扩展总容量。",
    formula: "\\operatorname{shard}(k)=h(k)\\bmod m,\\qquad N_{\\text{copies}}=r",
    symbols: [
      { symbol: "k", meaning: "用于路由一条记录的分片键" },
      { symbol: "h(k)", meaning: "分片键经过哈希函数得到的整数" },
      { symbol: "m", meaning: "参与取模路由的分片数量" },
      { symbol: "r", meaning: "每份数据保留的副本数量" },
    ],
    flow: ["根据分片键计算目标分片", "主副本执行并记录变更日志", "日志传递给跟随副本", "按确认策略返回客户端", "故障时选择新主或重新路由"],
    misconception:
      "增加副本不会自动增加写入容量，而分片也不会自动获得高可用；两种机制通常需要组合并分别治理。",
    debugTip:
      "为一次请求记录分片键、计算出的分片号、主节点和提交日志序号，再逐副本检查已回放序号与延迟；跨分片请求还要核对每个参与者状态。",
    takeaway: "复制增加同一数据的冗余，分片拆分数据规模，两者用不同协调成本换取可用性与扩展性。",
  },
];

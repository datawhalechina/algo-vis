import type { ConceptLessonSeed } from "./types";

export const dataStructuresAlgorithmsLessons: ConceptLessonSeed[] = [
  {
    id: 40001,
    slug: "array-locality",
    bookId: 1,
    category: "data_structure",
    difficulty: "easy",
    title: "数组与局部性",
    description:
      "从连续地址、索引寻址和缓存行三个角度，理解数组为何能快速随机访问并适合顺序扫描。",
    keyPoints: [
      "数组元素占据连续内存",
      "索引可直接换算为元素地址",
      "顺序访问能充分利用缓存局部性",
    ],
    relatedConcepts: ["缓存层次", "指针运算", "矩阵存储"],
    tags: ["数组", "内存布局", "缓存局部性"],
    heroNote: "同一批元素，访问顺序不同，也可能产生明显不同的运行时间。",
    intuition:
      "把数组想成一排连续编号的储物柜：知道第一个柜子的位置和每格宽度，就能直接走到任意一格；按编号依次打开时，还能一次带来附近多格的数据。",
    formula: "\\operatorname{addr}(A[i])=b+i\\cdot w",
    symbols: [
      { symbol: "A[i]", meaning: "数组 A 中下标为 i 的元素" },
      { symbol: "b", meaning: "数组首元素的起始地址" },
      { symbol: "w", meaning: "每个数组元素占用的字节数" },
      { symbol: "i", meaning: "从零开始的元素下标" },
    ],
    flow: ["取得首地址 b", "用 i 乘元素宽度 w", "相加定位 A[i]", "顺序读取相邻缓存行"],
    misconception:
      "数组的 O(1) 随机访问只表示寻址步骤不随长度增长，不表示每次访问都一定命中缓存或耗时完全相同。",
    debugTip:
      "打印连续三个元素的地址，逐项检查 addr(A[i+1])-addr(A[i]) 是否恒等于 w；再用性能计数器比较顺序扫描和跨步扫描的缓存未命中数。",
    takeaway: "数组用连续布局换来直接寻址，顺序访问还能把空间局部性转化为缓存效率。",
  },
  {
    id: 40002,
    slug: "linked-lists",
    bookId: 1,
    category: "data_structure",
    difficulty: "easy",
    title: "链表",
    description:
      "理解节点如何借助指针串联，以及链表在访问、插入、删除和内存布局上的真实代价。",
    keyPoints: [
      "节点通过 next 指针保持顺序",
      "已知前驱时插入和删除只需改动常数个指针",
      "按下标访问必须从表头逐节点前进",
    ],
    relatedConcepts: ["指针", "内存分配", "LRU 缓存"],
    tags: ["链表", "节点", "指针"],
    heroNote: "链表省去整体搬移，却把位置查找变成沿指针逐步追踪。",
    intuition:
      "链表像一场寻宝：每张纸条只写着下一张纸条的位置。插入新纸条只需改两处指向，但想找到第 i 张，仍要从第一张开始一路跟随。",
    formula: "T_{\\mathrm{access}}(i)=\\Theta(i),\\qquad T_{\\mathrm{insert}}=\\Theta(1)",
    symbols: [
      { symbol: "i", meaning: "目标节点距离表头的步数" },
      { symbol: "T_{\\mathrm{access}}", meaning: "按位置访问节点所需时间" },
      { symbol: "T_{\\mathrm{insert}}", meaning: "已知插入位置前驱时的插入时间" },
    ],
    flow: ["从 head 取得首节点", "读取当前节点的 next", "重复前进直到目标", "重连前驱与后继指针"],
    misconception:
      "链表插入是 O(1) 的前提是已经拿到插入点或其前驱；若先按位置查找，整次操作仍可能是 O(n)。",
    debugTip:
      "每次改链后从 head 逐节点记录地址，检查访问节点数不超过预期长度、尾节点 next 为 null，并用集合确认没有地址被重复访问形成环。",
    takeaway: "链表以逐节点寻址的代价，换取了已知位置处无需搬移元素的插入和删除。",
  },
  {
    id: 40003,
    slug: "stacks-and-queues",
    bookId: 1,
    category: "data_structure",
    difficulty: "easy",
    title: "栈与队列",
    description:
      "通过元素进入和离开的顺序，对比栈的后进先出与队列的先进先出及其典型用途。",
    keyPoints: [
      "栈只从同一端压入和弹出",
      "队列从尾部加入并从头部取出",
      "二者都可用数组或链表实现",
    ],
    relatedConcepts: ["函数调用栈", "广度优先搜索", "单调栈"],
    tags: ["栈", "队列", "访问顺序"],
    heroNote: "选择栈还是队列，本质上是在决定谁应当最先被处理。",
    intuition:
      "栈像叠放的餐盘，最后放上的最先拿走；队列像排队检票，最早到达的人最先离开。两者保存相同元素，却规定了不同的处理次序。",
    formula: "x_{\\mathrm{stack}}=x_n,\\qquad x_{\\mathrm{queue}}=x_1",
    symbols: [
      { symbol: "x_1", meaning: "最早进入容器的元素" },
      { symbol: "x_n", meaning: "最近进入容器的元素" },
      { symbol: "x_{\\mathrm{stack}}", meaning: "栈下一次弹出的元素" },
      { symbol: "x_{\\mathrm{queue}}", meaning: "队列下一次移出的元素" },
    ],
    flow: ["按顺序加入 x_1 到 x_n", "定位栈顶或队头", "移出对应元素", "更新 top 或 front"],
    misconception:
      "栈和队列不是特定的底层容器；数组和链表都能实现它们，关键区别是允许在哪一端进行操作。",
    debugTip:
      "每次操作后打印 size、top、front、rear 和当前元素序列；用输入 1、2、3 检查栈弹出 3、2、1，而队列移出 1、2、3。",
    takeaway: "栈按最近优先处理，队列按到达先后处理，操作规则决定了算法的探索顺序。",
  },
  {
    id: 40004,
    slug: "tree-traversal",
    bookId: 1,
    category: "algorithm",
    difficulty: "medium",
    title: "树遍历",
    description:
      "掌握深度优先与层序遍历如何系统访问树节点；本节交互流程聚焦一次完整的递归深度优先遍历。",
    keyPoints: [
      "前中后序的差别是处理根节点的时机",
      "递归调用栈保存尚未完成的子树",
      "层序遍历用队列逐层展开节点",
    ],
    relatedConcepts: ["递归", "栈与队列", "二叉搜索树"],
    tags: ["树", "DFS", "BFS"],
    heroNote: "遍历顺序不是记忆口诀，而是节点处理动作在递归流程中的位置。",
    intuition:
      "把树看成一座有岔路的展馆：深度优先会沿一条路走到底再回头，层序遍历则先看完同一层的房间，再进入下一层。",
    formula: "T(n)=T(n_L)+T(n_R)+\\Theta(1)=\\Theta(n)",
    symbols: [
      { symbol: "n", meaning: "当前树包含的节点总数" },
      { symbol: "n_L", meaning: "左子树的节点数" },
      { symbol: "n_R", meaning: "右子树的节点数" },
      { symbol: "T(n)", meaning: "完整遍历 n 个节点所需时间" },
    ],
    flow: [
      "进入根节点并压入递归栈",
      "递归遍历左子树",
      "回到根节点并执行 visit",
      "递归遍历右子树",
      "记录 exit 并返回父节点",
    ],
    misconception:
      "前序、中序和后序访问的节点集合相同，变化的是处理根节点的时刻；它们并不是三种不同的树结构。",
    debugTip:
      "为每个节点记录 enter、visit、exit 三个事件，并在本次 DFS 推演中逐步打印递归栈；确认每个节点恰好 visit 一次，且中序 visit 发生在左右子树之间。另学 BFS 时再单独打印层序队列。",
    takeaway: "树遍历用栈深入或用队列分层，处理节点的时机决定最终序列。",
  },
  {
    id: 40005,
    slug: "graph-search",
    bookId: 1,
    category: "algorithm",
    difficulty: "medium",
    title: "图搜索",
    description:
      "理解 BFS 与 DFS 如何借助前沿集合和访问标记，在含环图中完整而不重复地探索顶点。",
    keyPoints: [
      "visited 集合阻止重复访问和无限绕环",
      "BFS 的队列保证按边数逐层扩展",
      "DFS 的栈适合深入、回溯和结构分析",
    ],
    relatedConcepts: ["栈与队列", "最短路径", "连通分量"],
    tags: ["图", "BFS", "DFS"],
    heroNote: "搜索策略由前沿容器决定，正确性则依赖访问标记的时机。",
    intuition:
      "在城市路网找地点时，BFS 像从起点一圈圈扩大范围，DFS 像沿一条路尽量走远再折返；两者都要标记去过的路口，避免兜圈。",
    formula: "T_{\\mathrm{BFS/DFS}}=\\Theta(|V_R|+|E_R|)\\quad\\text{(adjacency list)}",
    symbols: [
      { symbol: "V_R", meaning: "从起点可达并被本次搜索访问的顶点集合；遍历全图时就是 V" },
      { symbol: "E_R", meaning: "邻接表中由这些可达顶点扫描到的边集合；遍历全图时就是 E" },
      { symbol: "|V_R|", meaning: "本次实际访问的顶点数量" },
      { symbol: "|E_R|", meaning: "本次实际扫描的边数量" },
    ],
    flow: ["将起点标记并加入前沿", "取出一个待探索顶点", "检查并标记未访问邻居", "直到前沿为空"],
    misconception:
      "不能等顶点出队或出栈后才标记 visited，否则同一顶点可能被多个邻居重复加入前沿，造成额外工作。",
    debugTip:
      "每轮打印当前顶点、frontier 内容和 visited 集合；检查顶点首次入队时就已标记，并统计每条邻接边被扫描的次数是否符合图的方向性。",
    takeaway: "BFS 与 DFS 共享访问框架，队列或栈决定探索次序，visited 保证搜索能够终止。",
  },
  {
    id: 40006,
    slug: "dynamic-programming",
    bookId: 1,
    category: "algorithm",
    difficulty: "hard",
    title: "动态规划",
    description:
      "从状态、转移和计算顺序出发，把存在重叠子问题的搜索改写为可复用的系统计算。",
    keyPoints: [
      "状态必须包含决定后续结果所需的信息",
      "转移从已知子问题组合出当前答案",
      "记忆化与递推都避免重复计算",
    ],
    relatedConcepts: ["递归", "最短路径", "背包问题"],
    tags: ["动态规划", "状态转移", "最优子结构"],
    heroNote: "动态规划最难的不是填表，而是定义一个信息恰好够用的状态。",
    intuition:
      "动态规划像把做过的练习答案写进表格：以后遇到同一个小问题就直接查表，再把几个小答案按规则拼成更大问题的答案。",
    formula: "dp[s]=\\min_{a\\in A(s)}\\left\\{c(s,a)+dp[f(s,a)]\\right\\}",
    symbols: [
      { symbol: "dp[s]", meaning: "从状态 s 出发可取得的最小总代价；本课用最小成本问题作为 DP 示例" },
      { symbol: "s", meaning: "当前子问题的状态" },
      { symbol: "A(s)", meaning: "状态 s 可选择的动作集合" },
      { symbol: "c(s,a)", meaning: "在状态 s 选择动作 a 的即时成本" },
      { symbol: "f(s,a)", meaning: "执行动作后到达的下一状态" },
    ],
    flow: ["定义状态与答案含义", "列出基础状态", "枚举可行转移", "按依赖顺序保存结果"],
    misconception:
      "看到递归或重复循环并不自动意味着能用动态规划；还要确认子问题重叠，并且状态足以支持正确转移。",
    debugTip:
      "用最小输入手算 dp 表，逐格打印当前状态、候选动作、每个候选值和最终选择；若结果错误，先检查基础状态与依赖计算顺序。",
    takeaway: "这里以最小成本型转移为例；动态规划先准确描述状态，再按转移复用子问题结果，把重复搜索压缩成有序计算。",
  },
];

import type { ConceptLessonSeed } from "./types";

export const operatingSystemsLessons: ConceptLessonSeed[] = [
  {
    id: 40007,
    slug: "processes-and-threads",
    bookId: 2,
    category: "operating_system",
    difficulty: "easy",
    title: "进程与线程",
    description:
      "区分进程拥有的隔离资源与线程保存的执行状态，理解同一进程内线程为何能共享数据。",
    keyPoints: [
      "进程提供资源归属和地址空间隔离",
      "线程是处理器调度的执行序列",
      "同进程线程共享内存但各有栈和寄存器",
    ],
    relatedConcepts: ["上下文切换", "虚拟内存", "线程同步"],
    tags: ["进程", "线程", "并发"],
    heroNote: "进程划定资源边界，线程描述这个边界内正在推进的工作。",
    intuition:
      "把进程想成一间带物资的工作室，线程是其中各自拿着任务清单的工人：大家共享房间和工具，但每个人有自己的进度、工作台和临时记录。",
    formula: "P=(M,F,\\{T_i\\}),\\qquad T_i=(PC_i,SP_i,R_i)",
    symbols: [
      { symbol: "P", meaning: "一个进程及其拥有的资源" },
      { symbol: "M", meaning: "进程的虚拟地址空间" },
      { symbol: "F", meaning: "进程持有的打开文件等资源" },
      { symbol: "T_i", meaning: "进程内第 i 个线程及其独立执行现场" },
      { symbol: "PC_i", meaning: "线程 i 下一条要执行的指令位置" },
      { symbol: "SP_i", meaning: "线程 i 的栈指针" },
      { symbol: "R_i", meaning: "线程 i 当前保存的处理器寄存器集合" },
    ],
    flow: ["创建进程资源容器", "在线程中保存执行状态", "调度某个线程运行", "通过共享内存协作"],
    misconception:
      "线程共享进程地址空间不等于共享所有状态；每个线程仍有独立的程序计数器、寄存器和调用栈。",
    debugTip:
      "在两个线程中打印进程 ID、线程 ID、共享变量地址和局部变量地址；确认进程 ID 与共享地址相同，而线程 ID 和各自栈地址不同。",
    takeaway: "进程负责隔离和持有资源，线程携带独立执行现场并在进程内共享资源。",
  },
  {
    id: 40008,
    slug: "context-switching",
    bookId: 2,
    category: "operating_system",
    difficulty: "medium",
    title: "上下文切换",
    description:
      "拆解 CPU 从一个线程切换到另一个线程时，保存现场、选择任务与恢复现场的完整成本。",
    keyPoints: [
      "切出前必须保存可恢复的处理器状态",
      "调度器选择下一个可运行任务",
      "缓存和地址空间变化会带来间接开销",
    ],
    relatedConcepts: ["进程与线程", "调度", "CPU 缓存"],
    tags: ["上下文切换", "调度器", "寄存器"],
    heroNote: "上下文切换不完成业务工作，却是实现抢占式并发不可缺少的机制。",
    intuition:
      "上下文切换像两名学生共用一张桌子：前一人先保存书页和草稿位置，管理员决定轮到谁，后一人再摆回自己的材料继续做题。",
    formula: "T_{\\mathrm{switch}}=T_{\\mathrm{save}}+T_{\\mathrm{schedule}}+T_{\\mathrm{restore}}+T_{\\mathrm{indirect}}",
    symbols: [
      { symbol: "T_{\\mathrm{switch}}", meaning: "一次上下文切换的总耗时" },
      { symbol: "T_{\\mathrm{save}}", meaning: "保存当前任务寄存器现场的耗时" },
      { symbol: "T_{\\mathrm{schedule}}", meaning: "调度器选择下一任务的耗时" },
      { symbol: "T_{\\mathrm{restore}}", meaning: "恢复下一任务寄存器现场的耗时" },
      { symbol: "T_{\\mathrm{indirect}}", meaning: "缓存和地址转换失效等间接耗时" },
    ],
    flow: ["触发中断或主动阻塞", "保存当前寄存器现场", "选择下一个可运行任务", "恢复现场并继续执行"],
    misconception:
      "上下文切换成本不只有保存和恢复寄存器；切换地址空间后出现的 TLB 与缓存未命中也会延迟后续执行。",
    debugTip:
      "记录切换前后的线程 ID、程序计数器、栈指针和时间戳，并分别统计自愿与非自愿切换次数；检查恢复后的 PC 是否等于先前保存值。",
    takeaway: "上下文切换通过保存和恢复执行现场实现任务交替，同时会产生直接与缓存相关的间接成本。",
  },
  {
    id: 40009,
    slug: "cpu-scheduling",
    bookId: 2,
    category: "operating_system",
    difficulty: "medium",
    title: "调度",
    description:
      "用到达时间、运行时间和完成时间衡量调度策略，理解响应性、公平性与吞吐量之间的取舍。",
    keyPoints: [
      "就绪队列保存等待 CPU 的任务",
      "时间片支持抢占和任务交替",
      "周转时间与等待时间刻画不同体验",
    ],
    relatedConcepts: ["上下文切换", "优先级反转", "多级反馈队列"],
    tags: ["CPU 调度", "时间片", "就绪队列"],
    heroNote: "调度没有对所有负载都最优的单一策略，指标选择会改变所谓的好结果。",
    intuition:
      "CPU 调度像只有一个窗口的办事大厅：短任务优先能降低平均等待，轮流限时办理让每个人更快得到响应，但频繁换人也会付出切换成本。",
    formula: "T_{\\mathrm{turn}}=T_{\\mathrm{finish}}-T_{\\mathrm{arrival}},\\qquad T_{\\mathrm{wait}}=T_{\\mathrm{turn}}-T_{\\mathrm{run}}",
    symbols: [
      { symbol: "T_{\\mathrm{arrival}}", meaning: "任务进入系统的时刻" },
      { symbol: "T_{\\mathrm{finish}}", meaning: "任务完成的时刻" },
      { symbol: "T_{\\mathrm{turn}}", meaning: "任务从到达到完成的周转时间" },
      { symbol: "T_{\\mathrm{wait}}", meaning: "任务处于就绪但未运行的累计时间" },
      { symbol: "T_{\\mathrm{run}}", meaning: "本课无 I/O 阻塞的单 CPU burst 场景中，任务实际占用 CPU 的总时长" },
    ],
    flow: ["任务到达就绪队列", "策略选择运行任务", "运行至完成或时间片结束", "更新等待与周转指标"],
    misconception:
      "这里的 wait=turn-run 采用无 I/O 阻塞的单 CPU burst 模型；一般任务还要从周转时间中扣除阻塞时间。最小化平均周转也不等于让每个任务都公平。",
    debugTip:
      "为每个任务画出到达、运行区间和完成时刻，逐个重算 turn、run、wait；同时检查任意时刻是否最多只有一个任务占用单核 CPU。",
    takeaway: "调度策略安排就绪任务使用 CPU，并在响应、周转、公平和切换成本之间做权衡。",
  },
  {
    id: 40010,
    slug: "virtual-memory",
    bookId: 2,
    category: "operating_system",
    difficulty: "hard",
    title: "虚拟内存",
    description:
      "理解虚拟地址如何拆成页号与页内偏移，并经页表和 TLB 映射到实际物理内存。",
    keyPoints: [
      "虚拟页号通过页表映射到物理页框",
      "页内偏移在地址转换中保持不变",
      "TLB 缓存近期页表项以降低转换成本",
    ],
    relatedConcepts: ["页表", "TLB", "页面置换"],
    tags: ["虚拟内存", "分页", "地址转换"],
    heroNote: "程序看到连续的虚拟空间，背后可能映射到分散的物理页框。",
    intuition:
      "虚拟地址像书中的页码和行号：先用页码查目录找到实际装订位置，再保留同一个行内偏移，就能定位物理内存中的字节。",
    formula: "p=\\left\\lfloor\\frac{v}{P}\\right\\rfloor,\\quad d=v\\bmod P,\\quad PA=\\operatorname{frame}[p]\\cdot P+d",
    symbols: [
      { symbol: "v", meaning: "待转换的虚拟地址" },
      { symbol: "P", meaning: "一个页面包含的字节数" },
      { symbol: "p", meaning: "由虚拟地址高位得到的虚拟页号" },
      { symbol: "d", meaning: "页面内部偏移" },
      { symbol: "\\operatorname{frame}[p]", meaning: "页表中虚拟页 p 对应的物理页框号；仅在页表项有效且权限允许时可用" },
      { symbol: "PA", meaning: "转换后的物理地址" },
    ],
    flow: ["拆出虚拟页号与偏移", "先查询 TLB", "未命中时读取并校验页表项", "无效时触发缺页处理，权限失败时触发保护异常", "仅对有效且获准的页框拼接原偏移"],
    misconception:
      "分页转换不会改变页内偏移；页表负责替换的是虚拟页号对应的页框号，而不是重新排列页内每个字节。",
    debugTip:
      "选定页大小 P 后打印 p、d、页表项和最终 PA；检查 0<=d<P，并确认 PA mod P 与原虚拟地址 v mod P 完全相同。",
    takeaway: "虚拟内存通过页表替换地址中的页号，同时保留偏移，为进程提供隔离且灵活的地址空间。",
  },
  {
    id: 40011,
    slug: "synchronization-and-deadlock",
    bookId: 2,
    category: "operating_system",
    difficulty: "hard",
    title: "同步与死锁",
    description:
      "理解并发访问为何需要互斥与顺序约束，并用等待关系识别多个线程无法继续推进的死锁。",
    keyPoints: [
      "临界区同一时刻只能由受限数量线程进入",
      "锁与信号量建立线程间执行顺序",
      "单实例资源的等待图成环意味着死锁",
    ],
    relatedConcepts: ["竞态条件", "互斥锁", "银行家算法"],
    tags: ["同步", "死锁", "临界区"],
    heroNote: "并发错误往往不在单条语句，而在多个操作之间未被约束的交错顺序。",
    intuition:
      "同步像会议室门锁，确保关键操作不会互相踩踏；死锁则像两个人各拿着对方需要的钥匙，又都不肯先放手，于是谁也无法继续。",
    formula: "\\sum_i \\mathbf{1}[T_i\\in C]\\le 1,\\qquad \\mathrm{deadlock}\\iff G_W\\text{ contains a cycle}",
    symbols: [
      { symbol: "T_i", meaning: "第 i 个并发线程" },
      { symbol: "C", meaning: "受互斥保护的临界区" },
      { symbol: "G_W", meaning: "单实例资源场景中的线程等待图" },
      { symbol: "\\mathbf{1}[T_i\\in C]", meaning: "线程 i 位于临界区时取一，否则取零" },
    ],
    flow: ["线程请求共享资源", "同步原语检查进入条件", "持锁线程执行临界区", "释放资源或形成等待边"],
    misconception:
      "线程运行缓慢或长期等待不一定是死锁；死锁要求相关线程构成无法自行打破的循环等待，且都不能继续推进。",
    debugTip:
      "记录每个线程当前持有的锁和正在等待的锁，构造 wait-for 边并执行环检测；同时检查同一时刻临界区进入计数是否超过一。",
    takeaway: "同步约束并发交错以保护共享状态，死锁分析则要追踪持有关系与循环等待。",
  },
  {
    id: 40012,
    slug: "file-systems-and-io",
    bookId: 2,
    category: "operating_system",
    difficulty: "medium",
    title: "文件系统与 I/O",
    description:
      "从文件偏移到数据块映射，理解文件系统如何组织持久化数据并通过缓存完成输入输出。",
    keyPoints: [
      "文件元数据把逻辑块映射到存储块",
      "文件偏移可拆为块号和块内偏移",
      "页缓存与缓冲写入改变实际设备访问时机",
    ],
    relatedConcepts: ["inode", "页缓存", "磁盘调度"],
    tags: ["文件系统", "I/O", "块存储"],
    heroNote: "应用读写的是字节范围，文件系统负责把它们落到具体数据块和设备请求上。",
    intuition:
      "文件像一本按固定大小分册保存的长书：读取某个字节时，先算它属于第几册，再找到册内位置；目录和元数据负责指出每册实际放在哪里。",
    formula: "b=\\left\\lfloor\\frac{o}{B}\\right\\rfloor,\\qquad d=o\\bmod B",
    symbols: [
      { symbol: "o", meaning: "应用请求的文件字节偏移" },
      { symbol: "B", meaning: "文件系统数据块大小" },
      { symbol: "b", meaning: "偏移所在的文件逻辑块号" },
      { symbol: "d", meaning: "目标字节在块内的位置" },
    ],
    flow: ["解析路径并找到元数据", "把文件偏移拆成块号与偏移", "查询块映射与页缓存", "缺页时提交设备 I/O"],
    misconception:
      "write 返回通常只表示数据已进入内核缓存，不一定已经持久化到设备；需要按语义使用 fsync 等同步机制。",
    debugTip:
      "记录请求的 offset、length、逻辑块号、物理块号和缓存命中状态；跨块读取时检查每段长度之和是否等于原请求长度。",
    takeaway: "文件系统把命名字节流映射到持久化数据块，并用缓存和异步 I/O 隐藏设备延迟。",
  },
];

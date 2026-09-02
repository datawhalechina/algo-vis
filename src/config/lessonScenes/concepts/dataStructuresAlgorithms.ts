import {
  check,
  connection,
  entity,
  transfer,
  type ConceptFrameProfile,
  type ConceptSceneProfileTable,
} from "./profile.ts";

function progressiveFrames(
  stages: Array<{
    sources: string[];
    targets: string[];
    values: ConceptFrameProfile["values"];
    result: string;
    check: ReturnType<typeof check>;
    checks?: ReturnType<typeof check>[];
    connections?: string[];
    transfers?: ConceptFrameProfile["transfers"];
    inputs?: string[];
    outputs?: string[];
    metrics?: string[];
    expression?: string;
  }>,
): ConceptFrameProfile[] {
  return stages.map((stage) => ({
    sourceEntityIds: stage.sources,
    targetEntityIds: stage.targets,
    values: stage.values,
    visibleConnectionIds: stage.connections ?? [],
    transfers: stage.transfers ?? [],
    result: stage.result,
    check: stage.check,
    checks: stage.checks,
    inputEntityIds: stage.inputs,
    outputEntityIds: stage.outputs,
    metricEntityIds: stage.metrics,
    expression: stage.expression,
  }));
}

export const dataStructuresAlgorithmSceneProfiles = {
  40001: {
    kind: "array",
    entities: [
      entity("base-address", "首地址 b", "input", 0),
      entity("target-index", "目标下标 i", "input", 3),
      entity("element-width", "元素宽度 w", "input", 4),
      entity("byte-offset", "字节偏移 i*w", "intermediate", 0, 1),
      entity("target-element", "A[i] 地址", "output", "pending"),
      entity("cache-line", "同缓存行元素", "output", [], 3),
    ],
    connections: [
      connection("index-to-offset", "target-index", "byte-offset", "下标"),
      connection("width-to-offset", "element-width", "byte-offset", "元素宽度"),
      connection("base-to-target", "base-address", "target-element", "基址"),
      connection("offset-to-target", "byte-offset", "target-element", "偏移"),
      connection("target-to-cache-line", "target-element", "cache-line", "顺序读取"),
    ],
    formulaBindings: {
      "A[i]": ["target-element"],
      b: ["base-address"],
      w: ["element-width"],
      i: ["target-index"],
    },
    frames: progressiveFrames([
      {
        sources: ["base-address", "target-index"], targets: ["base-address"], values: { "base-address": 4096 },
        result: "数组起点为 4096", check: check("base-address", 4096, "基址必须保持 4096"),
        checks: [check("target-index", 3, "目标下标是 3")],
      },
      {
        sources: ["target-index", "element-width"], targets: ["byte-offset"], values: { "byte-offset": 12 },
        connections: ["index-to-offset", "width-to-offset"],
        transfers: [
          transfer("index-for-offset", "target-index", "byte-offset", 3, "下标参与乘法"),
          transfer("width-for-offset", "element-width", "byte-offset", 4, "元素宽度参与乘法"),
        ],
        result: "偏移为 3*4=12 字节", check: check("byte-offset", 12, "偏移等于 i*w"),
      },
      {
        sources: ["base-address", "byte-offset"], targets: ["target-element"], values: { "target-element": 4108 },
        connections: ["base-to-target", "offset-to-target"],
        transfers: [
          transfer("base-for-address", "base-address", "target-element", 4096, "基址参与相加"),
          transfer("offset-for-address", "byte-offset", "target-element", 12, "偏移参与相加"),
        ],
        result: "A[3] 地址为 4108", check: check("target-element", 4108, "目标地址等于 b+i*w"),
      },
      {
        sources: ["target-element", "element-width"], targets: ["cache-line"],
        values: { "cache-line": [4108, 4112, 4116, 4120] }, connections: ["target-to-cache-line"],
        transfers: [transfer("load-cache-line", "target-element", "cache-line", 4108, "从目标地址装入缓存行")],
        result: "顺序访问复用同一缓存行的 4 个元素", check: check("cache-line", [4108, 4112, 4116, 4120], "缓存行地址连续"),
        checks: [check("element-width", 4, "相邻元素间隔为 4 字节")],
      },
    ]),
    explanations: [
      "数组从连续区域的 4096 字节地址开始，目标是下标 3。",
      "下标 3 乘元素宽度 4，显式产生 12 字节偏移。",
      "基址 4096 与偏移 12 一起决定 A[3] 的地址 4108。",
      "从 4108 顺序读取会继续触及同一缓存行附近的连续地址。",
    ],
  },
  40002: {
    kind: "graph",
    entities: [
      entity("head", "head", "input", "node-10"),
      entity("node-10", "节点 10", "intermediate", 10),
      entity("node-20", "节点 20", "intermediate", 20),
      entity("node-30", "节点 30", "output", 30),
      entity("node-25", "新节点 25", "intermediate", 25, 3),
      entity("access-steps", "访问步数 i", "control", 0),
      entity("insert-pointer-updates", "已知前驱时需改写的 next 指针数", "control", 2, 3),
    ],
    connections: [
      connection("head-to-10", "head", "node-10", "head"),
      connection("next-10-20", "node-10", "node-20", "next"),
      connection("next-20-30", "node-20", "node-30", "next"),
      connection("next-20-25", "node-20", "node-25", "next"),
      connection("next-25-30", "node-25", "node-30", "next"),
    ],
    formulaBindings: {
      i: ["access-steps"],
      "T_{\\mathrm{access}}": ["access-steps"],
      "T_{\\mathrm{insert}}": ["insert-pointer-updates"],
    },
    frames: progressiveFrames([
      {
        sources: ["head", "node-10"], targets: ["node-10", "access-steps"], values: { "access-steps": 1 },
        connections: ["head-to-10"], transfers: [transfer("follow-head", "head", "node-10", "node-10", "解引用 head")],
        result: "从 head 到达节点 10", check: check("node-10", 10, "head 指向值 10"),
      },
      {
        sources: ["node-10", "access-steps"], targets: ["node-20", "access-steps"], values: { "access-steps": 2 },
        connections: ["next-10-20"], transfers: [transfer("follow-10", "node-10", "node-20", 10, "沿 next 前进")],
        result: "沿 next 到达节点 20", check: check("access-steps", 2, "累计访问两个节点"),
      },
      {
        sources: ["node-20", "access-steps"], targets: ["node-30", "access-steps"], values: { "access-steps": 3 },
        connections: ["next-10-20", "next-20-30"], transfers: [transfer("follow-20", "node-20", "node-30", 20, "沿 next 到达目标")],
        result: "第三次解引用到达节点 30", check: check("access-steps", 3, "访问代价随步数增长"),
      },
      {
        sources: ["node-20", "node-30", "node-25", "insert-pointer-updates"],
        targets: ["node-25", "node-30"],
        values: {},
        connections: ["next-10-20", "next-20-25", "next-25-30"],
        transfers: [
          transfer("link-20-25", "node-20", "node-25", 20, "前驱改指向新节点"),
          transfer("link-25-30", "node-25", "node-30", 25, "新节点指向原后继"),
        ],
        result: "只改写 2 个 next 指针，链表重连为 10 -> 20 -> 25 -> 30",
        check: check("insert-pointer-updates", 2, "已知前驱时只需常数次指针改写"),
        checks: [check("node-25", 25, "新节点值为 25"), check("node-30", 30, "原后继仍为 30")],
        expression: "T_{\\mathrm{insert}}=2\\text{ 次指针改写}=\\Theta(1)",
      },
    ]),
    explanations: [
      "head 保存首节点引用，解引用后从值 10 开始。",
      "只有读取节点 10 的 next 才能到达值 20。",
      "再次沿 next 到达 30，访问步数累计为 3。",
      "先建立 25 到 30，再把 20 改指向 25；旧的 20 到 30 边不再可见。",
    ],
  },
  40003: {
    kind: "array",
    entities: [
      entity("input-sequence", "输入序列", "input", [1, 2, 3]),
      entity("stack", "栈", "intermediate", []),
      entity("queue", "队列", "intermediate", []),
      entity("stack-top", "栈顶 top", "control", 0, 1),
      entity("queue-front", "队头 front", "control", 0, 1),
      entity("stack-output", "栈移出值", "output", 0, 2),
      entity("queue-output", "队列移出值", "output", 0, 2),
    ],
    connections: [
      connection("input-to-stack", "input-sequence", "stack", "push"),
      connection("input-to-queue", "input-sequence", "queue", "enqueue"),
      connection("stack-to-output", "stack-top", "stack-output", "pop"),
      connection("queue-to-output", "queue-front", "queue-output", "dequeue"),
      connection("stack-to-top", "stack", "stack-top", "top"),
      connection("queue-to-front", "queue", "queue-front", "front"),
    ],
    formulaBindings: {
      x_1: ["input-sequence", "queue-output"],
      x_n: ["input-sequence", "stack-output"],
      "x_{\\mathrm{stack}}": ["stack-output"],
      "x_{\\mathrm{queue}}": ["queue-output"],
    },
    frames: progressiveFrames([
      {
        sources: ["input-sequence"], targets: ["stack", "queue"], values: { stack: [1, 2, 3], queue: [1, 2, 3] },
        connections: ["input-to-stack", "input-to-queue"], transfers: [
          transfer("push-all", "input-sequence", "stack", [1, 2, 3], "依次压栈"),
          transfer("enqueue-all", "input-sequence", "queue", [1, 2, 3], "依次入队"),
        ], result: "两个容器都保存 [1,2,3]", check: check("stack", [1, 2, 3], "栈保存全部输入"),
      },
      {
        sources: ["stack", "queue"], targets: ["stack-top", "queue-front"], values: { "stack-top": 3, "queue-front": 1 },
        connections: ["stack-to-top", "queue-to-front"],
        transfers: [transfer("locate-top", "stack", "stack-top", [1, 2, 3], "定位末端"), transfer("locate-front", "queue", "queue-front", [1, 2, 3], "定位首端")],
        result: "栈顶为 3，队头为 1", check: check("stack-top", 3, "top 指向最后加入值"),
      },
      {
        sources: ["stack-top", "queue-front"], targets: ["stack-output", "queue-output"], values: { "stack-output": 3, "queue-output": 1 },
        connections: ["stack-to-output", "queue-to-output"], transfers: [
          transfer("pop-value", "stack-top", "stack-output", 3, "从栈顶弹出 3"),
          transfer("dequeue-value", "queue-front", "queue-output", 1, "从队头移出 1"),
        ], result: "LIFO 输出 3；FIFO 输出 1", check: check("stack-output", 3, "栈输出 3"),
      },
      {
        sources: ["stack", "queue", "stack-output", "queue-output"], targets: ["stack", "queue", "stack-top", "queue-front"],
        values: { stack: [1, 2], queue: [2, 3], "stack-top": 2, "queue-front": 2 },
        connections: ["stack-to-top", "queue-to-front"],
        transfers: [], result: "移出后 top 和 front 都指向 2", check: check("stack-top", 2, "新栈顶为 2"),
        checks: [check("queue-front", 2, "新队头为 2"), check("stack-output", 3, "栈此前输出 3"), check("queue-output", 1, "队列此前输出 1")],
      },
    ]),
    explanations: [
      "相同输入 1、2、3 同时进入栈和队列。",
      "栈定位最近加入的 3，队列定位最早加入的 1。",
      "两个分支同时执行，分别显式输出 3 和 1。",
      "移除后栈为 [1,2]、队列为 [2,3]，两个端点独立更新为 2。",
    ],
  },
  40004: {
    kind: "graph",
    entities: [
      entity("root", "根 4", "input", 4),
      entity("left", "左子 2", "intermediate", 2),
      entity("right", "右子 6", "intermediate", 6),
      entity("left-subtree-node-count", "左子树节点数 n_L", "intermediate", "pending"),
      entity("right-subtree-node-count", "右子树节点数 n_R", "intermediate", "pending"),
      entity("tree-node-count", "整棵树节点数 n", "output", "pending"),
      entity("call-stack", "递归栈", "control", []),
      entity("visit-order", "中序输出", "output", []),
      entity("visited-count", "已访问节点数", "output", 0),
    ],
    connections: [
      connection("root-left", "root", "left", "left"),
      connection("root-right", "root", "right", "right"),
      connection("left-output", "left", "visit-order"),
      connection("root-output", "root", "visit-order"),
      connection("right-output", "right", "visit-order"),
      connection("left-size", "left", "left-subtree-node-count", "计数"),
      connection("right-size", "right", "right-subtree-node-count", "计数"),
      connection("visited-total", "visited-count", "tree-node-count", "完成后汇总"),
    ],
    formulaBindings: {
      n: ["tree-node-count"],
      n_L: ["left-subtree-node-count"],
      n_R: ["right-subtree-node-count"],
      "T(n)": ["visited-count"],
    },
    frames: progressiveFrames([
      {
        sources: ["root", "call-stack"], targets: ["call-stack"],
        values: { "call-stack": [4] },
        result: "递归栈压入根 4；三个规模量尚待遍历计数",
        check: check("call-stack", [4], "根已入栈"),
        checks: [check("tree-node-count", "pending", "整树节点数尚未汇总")],
      },
      {
        sources: ["root", "left"],
        targets: ["call-stack", "visit-order", "visited-count", "left-subtree-node-count"],
        values: {
          "call-stack": [4, 2], "visit-order": [2], "visited-count": 1,
          "left-subtree-node-count": 1,
        },
        connections: ["root-left", "left-output", "left-size"],
        transfers: [
          transfer("visit-left", "left", "visit-order", 2, "输出左子"),
          transfer("count-left", "left", "left-subtree-node-count", 2, "确认左子树中的节点"),
        ],
        result: "访问左子 2，并计得左子树节点数 n_L=1",
        check: check("visit-order", [2], "左子最先输出"),
        checks: [
          check("left-subtree-node-count", 1, "左子树恰有一个节点"),
          check("call-stack", [4, 2], "栈保留根和左子帧"),
        ],
      },
      {
        sources: ["left", "root"], targets: ["call-stack", "visit-order", "visited-count"],
        values: { "call-stack": [4], "visit-order": [2, 4], "visited-count": 2 },
        connections: ["root-left", "root-output"],
        transfers: [transfer("visit-root", "root", "visit-order", 4, "输出根")],
        result: "左子树返回后访问根 4，累计访问两个节点",
        check: check("visit-order", [2, 4], "根位于左右子树之间"),
        checks: [
          check("visited-count", 2, "左子与根各访问一次"),
          check("left-subtree-node-count", 1, "左子树计数保持为 1"),
        ],
      },
      {
        sources: ["root", "right"],
        targets: ["call-stack", "visit-order", "visited-count", "right-subtree-node-count"],
        values: {
          "call-stack": [4, 6], "visit-order": [2, 4, 6], "visited-count": 3,
          "right-subtree-node-count": 1,
        },
        connections: ["root-left", "root-right", "right-output", "right-size"],
        transfers: [
          transfer("visit-right", "right", "visit-order", 6, "输出右子"),
          transfer("count-right", "right", "right-subtree-node-count", 6, "确认右子树中的节点"),
        ],
        result: "访问右子 6，并计得右子树节点数 n_R=1",
        check: check("visited-count", 3, "三个节点各访问一次"),
        checks: [
          check("right-subtree-node-count", 1, "右子树恰有一个节点"),
          check("visit-order", [2, 4, 6], "中序顺序完整"),
        ],
      },
      {
        sources: ["left-subtree-node-count", "right-subtree-node-count", "visited-count"],
        targets: ["call-stack", "tree-node-count"],
        values: { "call-stack": [], "tree-node-count": 3 },
        connections: ["root-left", "root-right", "visited-total"],
        transfers: [transfer("record-tree-size", "visited-count", "tree-node-count", 3, "记录完整遍历计数")],
        result: "根帧退出；n=1+n_L+n_R=3，遍历完成",
        check: check("call-stack", [], "递归栈清空"),
        checks: [
          check("tree-node-count", 3, "整棵树共有三个节点"),
          check("left-subtree-node-count", 1, "最终左子树节点数为 1"),
          check("right-subtree-node-count", 1, "最终右子树节点数为 1"),
          check("visit-order", [2, 4, 6], "中序输出完整"),
        ],
      },
    ]),
    explanations: [
      "进入根时保存尚未完成的递归帧；此时还没有用遍历结果填写 n、n_L、n_R。",
      "中序遍历先进入并输出左子 2。左子树只有这个节点，所以它的规模是 1，而不是节点键值 2。",
      "左侧返回后才输出根 4；访问计数增至 2，左子树规模仍为 1。",
      "随后进入并输出右子 6。右子树也只有一个节点，所以 n_R=1，而不是键值 6。",
      "三个节点各访问一次后递归栈清空，并由 1 个根、1 个左子树节点和 1 个右子树节点得到 n=3。",
    ],
  },
  40005: {
    kind: "graph",
    entities: [
      entity("start", "起点 S", "input", "S"), entity("frontier", "BFS 前沿", "control", []),
      entity("current", "当前顶点", "intermediate", "none", 1), entity("visited", "visited 集合", "intermediate", []),
      entity("neighbors", "未访问邻居", "intermediate", [], 2), entity("scanned-edges", "已扫描边数 |E_R|", "output", 0),
    ],
    connections: [connection("start-frontier", "start", "frontier"), connection("frontier-current", "frontier", "current"), connection("current-neighbors", "current", "neighbors"), connection("neighbors-frontier", "neighbors", "frontier")],
    formulaBindings: { V_R: ["visited"], E_R: ["scanned-edges"], "|V_R|": ["visited"], "|E_R|": ["scanned-edges"] },
    frames: progressiveFrames([
      { sources: ["start"], targets: ["frontier", "visited"], values: { frontier: ["S"], visited: ["S"] }, connections: ["start-frontier"], transfers: [transfer("enqueue-start", "start", "frontier", "S", "S 入队")], result: "frontier=[S], visited={S}", check: check("frontier", ["S"], "起点已入队") },
      { sources: ["frontier", "visited"], targets: ["current"], values: { current: "S" }, connections: ["frontier-current"], transfers: [transfer("dequeue-s", "frontier", "current", ["S"], "取出 S")], result: "从前沿取出 S 作为当前顶点", check: check("current", "S", "当前展开 S") },
      { sources: ["current", "visited"], targets: ["neighbors", "frontier", "visited", "scanned-edges"], values: { neighbors: ["A", "B"], frontier: ["A", "B"], visited: ["S", "A", "B"], "scanned-edges": 3 }, connections: ["current-neighbors", "neighbors-frontier"], transfers: [transfer("scan-s", "current", "neighbors", "S", "扫描 S 的邻接表"), transfer("enqueue-neighbors", "neighbors", "frontier", ["A", "B"], "未访问邻居入队")], result: "扫描 3 条边，新发现 A、B", check: check("visited", ["S", "A", "B"], "邻居入队时即标记") },
      { sources: ["frontier", "visited"], targets: ["frontier", "scanned-edges"], values: { frontier: [], current: "B", "scanned-edges": 3 }, connections: ["frontier-current"], transfers: [], result: "frontier 从 [A,B] 变为空，搜索终止", check: check("frontier", [], "前沿确实为空"), checks: [check("scanned-edges", 3, "三条邻接边均已扫描"), check("visited", ["S", "A", "B"], "可达顶点均已访问")] },
    ]),
    explanations: ["起点 S 入队时立即进入 visited。", "从可见的 frontier=[S] 取出 S 作为当前展开顶点。", "扫描 S 的三条边并把 A、B 加入前沿和 visited。", "展开剩余顶点后，非空前沿 [A,B] 变为空，搜索因而终止。"],
  },
  40006: {
    kind: "array",
    entities: [
      entity("state", "状态 s", "input", 0),
      entity("base-case", "dp[0]", "intermediate", "pending"),
      entity("action-set", "动作 A(s)", "input", [1, 2]),
      entity("immediate-cost-a1", "即时成本 c(4,1)", "input", 6),
      entity("immediate-cost-a2", "即时成本 c(4,2)", "input", 7),
      entity("next-state-a1", "下一状态 f(4,1)", "intermediate", 0),
      entity("next-state-a2", "下一状态 f(4,2)", "intermediate", 0),
      entity("cost-a1", "动作 1 候选值", "intermediate", "pending", 2),
      entity("cost-a2", "动作 2 候选值", "intermediate", "pending", 2),
      entity("dp-result", "dp[4]", "output", "pending", 3),
    ],
    connections: [
      connection("state-base", "state", "base-case"),
      connection("immediate-a1-candidate", "immediate-cost-a1", "cost-a1", "c(4,1)"),
      connection("immediate-a2-candidate", "immediate-cost-a2", "cost-a2", "c(4,2)"),
      connection("base-a1-candidate", "base-case", "cost-a1", "dp[f(4,1)]"),
      connection("base-a2-candidate", "base-case", "cost-a2", "dp[f(4,2)]"),
      connection("a1-result", "cost-a1", "dp-result"),
      connection("a2-result", "cost-a2", "dp-result"),
    ],
    formulaBindings: {
      "dp[s]": ["base-case", "dp-result"],
      s: ["state"],
      "A(s)": ["action-set"],
      "c(s,a)": ["immediate-cost-a1", "immediate-cost-a2"],
      "f(s,a)": ["next-state-a1", "next-state-a2"],
    },
    frames: progressiveFrames([
      {
        sources: ["state", "action-set"], targets: ["state"], values: { state: 4 },
        result: "定义 s=4 的最小成本问题；尚未计算任何 dp 值",
        check: check("state", 4, "目标状态为 4"),
        checks: [
          check("action-set", [1, 2], "状态 4 有两个可选动作"),
          check("dp-result", "pending", "dp[4] 尚未计算"),
        ],
      },
      {
        sources: ["state", "base-case"], targets: ["base-case"],
        values: { "base-case": 0 }, connections: ["state-base"], transfers: [],
        result: "先写入基础状态 dp[0]=0；候选值仍待计算",
        check: check("base-case", 0, "空状态成本为 0"),
        checks: [
          check("cost-a1", "pending", "动作 1 候选尚未计算"),
          check("dp-result", "pending", "dp[4] 尚未取最小值"),
        ],
      },
      {
        sources: [
          "state", "action-set", "base-case",
          "immediate-cost-a1", "immediate-cost-a2",
          "next-state-a1", "next-state-a2",
        ],
        targets: ["cost-a1", "cost-a2"],
        values: { "cost-a1": 6, "cost-a2": 7 },
        connections: [
          "immediate-a1-candidate", "immediate-a2-candidate",
          "base-a1-candidate", "base-a2-candidate",
        ],
        transfers: [
          transfer("cost-a1", "immediate-cost-a1", "cost-a1", 6, "代入 c(4,1)=6"),
          transfer("cost-a2", "immediate-cost-a2", "cost-a2", 7, "代入 c(4,2)=7"),
          transfer("future-a1", "base-case", "cost-a1", 0, "读取 dp[f(4,1)]=dp[0]"),
          transfer("future-a2", "base-case", "cost-a2", 0, "读取 dp[f(4,2)]=dp[0]"),
        ],
        result: "动作 1: 6+dp[0]=6；动作 2: 7+dp[0]=7",
        check: check("cost-a1", 6, "动作 1 候选为 6"),
        checks: [
          check("cost-a2", 7, "动作 2 候选为 7"),
          check("base-case", 0, "候选依赖已知基础状态"),
          check("dp-result", "pending", "取最小值前 dp[4] 仍待定"),
        ],
        expression: "c(4,1)+dp[f(4,1)]=6+dp[0]=6,\\quad c(4,2)+dp[f(4,2)]=7+dp[0]=7",
      },
      {
        sources: ["cost-a1", "cost-a2"], targets: ["dp-result"],
        values: { "dp-result": 6 }, connections: ["a1-result", "a2-result"],
        transfers: [
          transfer("candidate-1", "cost-a1", "dp-result", 6, "候选 6 参与取最小"),
          transfer("candidate-2", "cost-a2", "dp-result", 7, "候选 7 参与取最小"),
        ],
        result: "比较两个已计算候选，保存 dp[4]=min(6,7)=6",
        check: check("dp-result", 6, "最终最优成本为 6"),
        checks: [
          check("base-case", 0, "基础状态未被覆盖"),
          check("cost-a1", 6, "被选候选保持为 6"),
          check("cost-a2", 7, "另一候选保持为 7"),
        ],
      },
    ]),
    explanations: [
      "先固定状态 s=4 与动作集合；尚未计算的基础状态、候选值和答案都明确显示为 pending。",
      "先把可直接确定的基础状态 dp[0]=0 写入表中，后续状态才能引用它。",
      "两条动作都转移到状态 0；分别把即时成本 6、7 与 dp[0]=0 相加，得到可复算的候选值 6、7。",
      "最后比较已经算出的候选值，选择较小的 6 并写入 dp[4]。返回前一步时仍能看到未写入答案的状态。",
    ],
  },
} satisfies ConceptSceneProfileTable;

import {
  check,
  connection,
  entity,
  transfer,
  type ConceptFrameProfile,
  type ConceptSceneProfileTable,
} from "./profile.ts";

function frames(stages: Array<{
  sources: string[];
  targets: string[];
  values?: ConceptFrameProfile["values"];
  connections?: string[];
  transfers?: ConceptFrameProfile["transfers"];
  result: string;
  check: ReturnType<typeof check>;
  checks?: ReturnType<typeof check>[];
  inputs?: string[];
  outputs?: string[];
  metrics?: string[];
  expression?: string;
}>): ConceptFrameProfile[] {
  return stages.map((stage) => ({
    sourceEntityIds: stage.sources,
    targetEntityIds: stage.targets,
    values: stage.values ?? {},
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

export const databaseSceneProfiles = {
  40019: {
    kind: "graph",
    entities: [
      entity("relation-schema", "关系模式 R", "input", "R(id,name,score)"), entity("attributes", "属性 A_i", "intermediate", ["id", "name", "score"]),
      entity("domains", "值域 D_i", "intermediate", ["int", "text", "int"]), entity("relation-instance", "关系实例 r(R)", "intermediate", [], 1),
      entity("primary-keys", "唯一主键", "control", [], 2), entity("query-result", "选择投影结果", "output", [], 3),
    ],
    connections: [connection("schema-attributes", "relation-schema", "attributes"), connection("schema-domains", "relation-schema", "domains"), connection("schema-instance", "relation-schema", "relation-instance"), connection("instance-keys", "relation-instance", "primary-keys"), connection("instance-result", "relation-instance", "query-result")],
    formulaBindings: { "R(A_1,\\ldots,A_n)": ["relation-schema", "attributes"], "r(R)": ["relation-instance"], A_i: ["attributes"], D_i: ["domains"] },
    frames: frames([
      { sources: ["relation-schema"], targets: ["attributes", "domains"], connections: ["schema-attributes", "schema-domains"], transfers: [transfer("schema-fields", "relation-schema", "attributes", "R(id,name,score)", "解析属性"), transfer("schema-domains", "relation-schema", "domains", "R(id,name,score)", "约束值域")], result: "R 定义 3 个属性及值域", check: check("attributes", ["id", "name", "score"], "属性集合正确") },
      { sources: ["relation-schema", "attributes", "domains"], targets: ["relation-instance"], values: { "relation-instance": ["1,Ada,95", "2,Bo,78", "3,Chen,88", "4,Di,65"] }, connections: ["schema-instance"], transfers: [transfer("instantiate-relation", "relation-schema", "relation-instance", "R(id,name,score)", "形成合法元组集合")], result: "实例包含 4 条合法元组", check: check("relation-instance", ["1,Ada,95", "2,Bo,78", "3,Chen,88", "4,Di,65"], "实例满足模式") },
      { sources: ["relation-instance", "attributes"], targets: ["primary-keys"], values: { "primary-keys": [1, 2, 3, 4] }, connections: ["instance-keys"], transfers: [transfer("extract-keys", "relation-instance", "primary-keys", ["1,Ada,95", "2,Bo,78", "3,Chen,88", "4,Di,65"], "检查 id 唯一性")], result: "4 个主键值互不重复", check: check("primary-keys", [1, 2, 3, 4], "主键集合唯一") },
      { sources: ["relation-instance", "attributes"], targets: ["query-result"], values: { "query-result": ["Ada,95", "Chen,88"] }, connections: ["instance-result"], transfers: [transfer("select-project", "relation-instance", "query-result", ["1,Ada,95", "2,Bo,78", "3,Chen,88", "4,Di,65"], "筛选并投影")], result: "得到 2 行、2 列的新关系", check: check("query-result", ["Ada,95", "Chen,88"], "选择投影结果正确"), checks: [check("primary-keys", [1, 2, 3, 4], "原关系键不变") ] },
    ]),
    explanations: ["模式显式定义属性与各自值域。", "四条符合模式的元组组成关系实例。", "提取 id 后确认四个键值唯一。", "score>=80 的两行投影为 name、score，仍形成关系。"],
  },
  40020: {
    kind: "graph",
    entities: [
      entity("search-key", "查询键", "input", 37),
      entity("root-page", "第 0 层根页", "intermediate", [20, 50]),
      entity("selected-child", "选中子页", "intermediate", "pending", 1),
      entity("page-path", "根到叶的页路径", "intermediate", [], 2),
      entity("leaf-slot", "叶页槽位", "output", "pending", 3),
      entity("leaf-chain", "范围扫描叶链", "output", [], 4),
      entity("entry-count", "索引项数 N", "input", 1000),
      entity("fanout", "内部页最大扇出 F", "input", 10),
      entity("leaf-capacity", "叶页最大容量 L", "input", 10),
      entity("min-internal-occupancy", "内部页最小占用 f_min", "intermediate", "pending"),
      entity("min-leaf-occupancy", "叶页最小占用 ell_min", "intermediate", "pending"),
      entity("tree-height", "树高 h（边数）", "output", "pending"),
      entity("cold-read-count", "冷启动点查读页 R_cold", "output", "pending"),
    ],
    connections: [
      connection("key-root", "search-key", "root-page"),
      connection("fanout-minimum", "fanout", "min-internal-occupancy", "ceil(F/2)"),
      connection("leaf-minimum", "leaf-capacity", "min-leaf-occupancy", "ceil(L/2)"),
      connection("root-child", "root-page", "selected-child"),
      connection("child-path", "selected-child", "page-path"),
      connection("path-height", "page-path", "tree-height", "页数减 1"),
      connection("height-cold-reads", "tree-height", "cold-read-count", "h+1"),
      connection("path-leaf", "page-path", "leaf-slot"),
      connection("leaf-chain-edge", "leaf-slot", "leaf-chain"),
    ],
    formulaBindings: {
      N: ["entry-count"],
      "F,L": ["fanout", "leaf-capacity"],
      "f_{\\min},\\ell_{\\min}": ["min-internal-occupancy", "min-leaf-occupancy"],
      h: ["tree-height"],
      "R_{\\mathrm{cold}}": ["cold-read-count"],
    },
    frames: frames([
      {
        sources: ["search-key", "fanout", "leaf-capacity"],
        targets: ["root-page", "min-internal-occupancy", "min-leaf-occupancy"],
        values: { "min-internal-occupancy": 5, "min-leaf-occupancy": 5 },
        connections: ["key-root", "fanout-minimum", "leaf-minimum"],
        transfers: [
          transfer("read-root", "search-key", "root-page", 37, "用键比较根分隔项"),
          transfer("halve-fanout", "fanout", "min-internal-occupancy", 10, "对 F=10 向上取半"),
          transfer("halve-leaf-capacity", "leaf-capacity", "min-leaf-occupancy", 10, "对 L=10 向上取半"),
        ],
        result: "读取第 0 层根页；F=L=10 时两个最小占用量都为 5",
        check: check("root-page", [20, 50], "根分隔键可见"),
        checks: [
          check("min-internal-occupancy", 5, "ceil(F/2)=5"),
          check("min-leaf-occupancy", 5, "ceil(L/2)=5"),
          check("tree-height", "pending", "尚未走完路径，不能提前填写树高"),
        ],
      },
      {
        sources: ["root-page", "search-key"], targets: ["selected-child"],
        values: { "selected-child": 2 }, connections: ["root-child"],
        transfers: [transfer("choose-child", "root-page", "selected-child", [20, 50], "37 落在第二区间")],
        result: "比较根分隔键后只选择子页 2；高度和总读页数仍待路径完成",
        check: check("selected-child", 2, "下降到正确子页"),
        checks: [
          check("tree-height", "pending", "完整根叶路径尚未确定"),
          check("cold-read-count", "pending", "冷启动总读页数尚未确定"),
        ],
      },
      {
        sources: ["selected-child", "search-key"],
        targets: ["page-path", "tree-height", "cold-read-count"],
        values: {
          "page-path": ["root", "internal-2", "leaf-7"],
          "tree-height": 2,
          "cold-read-count": 3,
        },
        connections: ["child-path", "path-height", "height-cold-reads"],
        transfers: [
          transfer("descend-path", "selected-child", "page-path", 2, "逐层沿单一路径下降"),
          transfer("count-height-edges", "page-path", "tree-height", ["root", "internal-2", "leaf-7"], "三页之间共有两条边"),
          transfer("count-cold-pages", "tree-height", "cold-read-count", 2, "从第 0 层到第 h 层共 h+1 页"),
        ],
        result: "根到叶经过 2 条边，所以 h=2；冷启动点查读取 h+1=3 页",
        check: check("page-path", ["root", "internal-2", "leaf-7"], "根到叶路径包含三页"),
        checks: [
          check("tree-height", 2, "树高按边数计为 2"),
          check("cold-read-count", 3, "冷启动点查读取三页"),
        ],
      },
      {
        sources: ["page-path", "search-key"], targets: ["leaf-slot"],
        values: { "leaf-slot": 5 }, connections: ["path-leaf"],
        transfers: [transfer("locate-slot", "page-path", "leaf-slot", ["root", "internal-2", "leaf-7"], "在叶页二分定位")],
        result: "在第 h=2 层的叶页定位键 37，点查读页数保持为 3",
        check: check("leaf-slot", 5, "叶槽定位正确"),
        checks: [
          check("tree-height", 2, "根到叶仍是两条边"),
          check("cold-read-count", 3, "点查仍只读取根到叶三页"),
        ],
      },
      {
        sources: ["leaf-slot", "search-key"], targets: ["leaf-chain"],
        values: { "leaf-chain": ["leaf-7", "leaf-8"] }, connections: ["leaf-chain-edge"],
        transfers: [transfer("scan-next-leaf", "leaf-slot", "leaf-chain", 5, "沿叶链继续范围扫描")],
        result: "范围查询从命中叶页继续到 leaf-8；点查的 R_cold=h+1=3 不含这次后续扫描",
        check: check("leaf-chain", ["leaf-7", "leaf-8"], "叶链连续"),
        checks: [
          check("page-path", ["root", "internal-2", "leaf-7"], "范围扫描无需回到根"),
          check("tree-height", 2, "叶链扫描不改变树高"),
          check("cold-read-count", 3, "点查根到叶读页数仍为 3"),
        ],
      },
    ]),
    explanations: [
      "查询键 37 先与第 0 层根页的分隔键比较。示例 F=L=10，因此非根内部页和叶页的最小占用都为 ceil(10/2)=5。",
      "37 只落入第二个子页区间；尚未看到完整根叶路径时，不提前填写树高或冷启动总读页数。",
      "路径包含根页、内部页和叶页三页，但树高数的是页与页之间的边，因此 h=2；冷缓存需要把三页都读入，所以 R_cold=h+1=3。",
      "在第 2 层叶页的槽 5 找到目标键；根、内部页、叶页仍恰好对应三次冷启动索引页读取。",
      "范围查询从命中叶页沿链再读下一页，不必回到根；公式 R_cold=h+1 描述的是此前一次点查的根到叶读页数。",
    ],
  },
  40021: {
    kind: "pipeline",
    entities: [
      entity("account-a-before", "账户 A 初始余额 a", "input", 100), entity("account-b-before", "账户 B 初始余额 b", "input", 50),
      entity("transfer-amount", "转账额 x", "input", 30), entity("constraint-state", "约束检查", "control", "pending", 1),
      entity("wal-record", "WAL 日志", "intermediate", "none", 2), entity("account-a-after", "账户 A 新余额 a'", "output", 0, 2),
      entity("account-b-after", "账户 B 新余额 b'", "output", 0, 2), entity("balance-total", "余额总和", "output", 0, 2),
      entity("commit-state", "事务状态", "control", "idle", 0),
    ],
    connections: [connection("a-constraint", "account-a-before", "constraint-state"), connection("amount-constraint", "transfer-amount", "constraint-state"), connection("a-after", "account-a-before", "account-a-after"), connection("b-after", "account-b-before", "account-b-after"), connection("amount-a-after", "transfer-amount", "account-a-after"), connection("amount-b-after", "transfer-amount", "account-b-after"), connection("a-total", "account-a-after", "balance-total"), connection("b-total", "account-b-after", "balance-total"), connection("total-commit", "balance-total", "commit-state")],
    formulaBindings: { a: ["account-a-before"], b: ["account-b-before"], x: ["transfer-amount"], "a',b'": ["account-a-after", "account-b-after"] },
    frames: frames([
      { sources: ["account-a-before", "account-b-before"], targets: ["commit-state"], values: { "commit-state": "active" }, result: "事务快照读取 A=100、B=50", check: check("account-a-before", 100, "A 初始余额为 100") },
      { sources: ["account-a-before", "transfer-amount"], targets: ["constraint-state"], values: { "constraint-state": "passed" }, connections: ["a-constraint", "amount-constraint"], transfers: [transfer("check-balance", "account-a-before", "constraint-state", 100, "检查可用余额"), transfer("check-amount", "transfer-amount", "constraint-state", 30, "检查转账额")], result: "0 < 30 <= 100，约束通过", check: check("constraint-state", "passed", "业务约束通过") },
      { sources: ["account-a-before", "account-b-before", "transfer-amount", "constraint-state"], targets: ["wal-record", "account-a-after", "account-b-after", "balance-total"], values: { "wal-record": "A:-30,B:+30", "account-a-after": 70, "account-b-after": 80, "balance-total": 150 }, connections: ["a-after", "b-after", "amount-a-after", "amount-b-after", "a-total", "b-total"], transfers: [transfer("debit-a", "account-a-before", "account-a-after", 100, "计算 A-30"), transfer("credit-b", "account-b-before", "account-b-after", 50, "计算 B+30"), transfer("amount-to-a", "transfer-amount", "account-a-after", 30, "扣减转账额"), transfer("amount-to-b", "transfer-amount", "account-b-after", 30, "增加转账额")], result: "原子更新 A=70、B=80，总和仍为 150", check: check("account-a-after", 70, "A 原子减为 70"), checks: [check("account-b-after", 80, "B 原子增为 80"), check("balance-total", 150, "余额总和守恒") ] },
      { sources: ["account-a-after", "account-b-after", "balance-total", "wal-record"], targets: ["commit-state"], values: { "commit-state": "committed" }, connections: ["total-commit"], transfers: [transfer("commit-total", "balance-total", "commit-state", 150, "一致性检查后提交")], result: "提交成功，A=70、B=80", check: check("commit-state", "committed", "事务已提交"), checks: [check("balance-total", 150, "提交后总和仍为 150"), check("account-a-after", 70, "A 已持久化为 70"), check("account-b-after", 80, "B 已持久化为 80") ] },
    ]),
    explanations: ["事务读取同一快照中的 A=100 和 B=50。", "转账 30 同时满足正数和余额约束。", "日志之后，同一原子步骤把两个权威余额更新为 70 和 80。", "总和 150 校验通过才提交；失败路径会整体回滚。"],
  },
  40022: {
    kind: "graph",
    entities: [
      entity("snapshot-time", "快照时间 S", "input", 0), entity("version-chain", "版本链 v", "input", ["v3:[25,inf)=90", "v2:[21,25)=85", "v1:[10,21)=80"]),
      entity("checked-version-count", "已检查版本数", "intermediate", 0, 1), entity("visible-version", "首个可见版本", "intermediate", "none", 2),
      entity("visible-version-value", "可见版本值", "output", 0, 2), entity("write-conflict", "写冲突", "control", false, 3),
    ],
    connections: [connection("snapshot-chain", "snapshot-time", "version-chain"), connection("chain-checked", "version-chain", "checked-version-count"), connection("checked-visible", "checked-version-count", "visible-version"), connection("version-value", "visible-version", "visible-version-value"), connection("visible-conflict", "visible-version", "write-conflict")],
    formulaBindings: { v: ["version-chain", "visible-version"], S: ["snapshot-time"], "b(v)": ["version-chain"], "e(v)": ["version-chain"] },
    frames: frames([
      { sources: ["snapshot-time", "version-chain"], targets: ["snapshot-time"], values: { "snapshot-time": 20 }, connections: ["snapshot-chain"], result: "读事务固定 S=20", check: check("snapshot-time", 20, "快照时间不漂移") },
      { sources: ["version-chain", "snapshot-time"], targets: ["checked-version-count"], values: { "checked-version-count": 2 }, connections: ["chain-checked"], transfers: [transfer("scan-new-versions", "version-chain", "checked-version-count", ["v3:[25,inf)=90", "v2:[21,25)=85", "v1:[10,21)=80"], "检查两个不可见新版本")], result: "前两个版本均不覆盖 S=20", check: check("checked-version-count", 2, "已拒绝两个新版本") },
      { sources: ["version-chain", "snapshot-time", "checked-version-count"], targets: ["checked-version-count", "visible-version", "visible-version-value"], values: { "checked-version-count": 3, "visible-version": "v1:[10,21)", "visible-version-value": 80 }, connections: ["chain-checked", "checked-visible", "version-value"], transfers: [transfer("third-version", "version-chain", "checked-version-count", ["v3:[25,inf)=90", "v2:[21,25)=85", "v1:[10,21)=80"], "继续检查第三个版本"), transfer("read-visible-value", "visible-version", "visible-version-value", "v1:[10,21)", "读取可见值")], result: "检查第 3 个版本后返回 80", check: check("checked-version-count", 3, "第三个候选也已检查"), checks: [check("visible-version-value", 80, "返回首个可见版本值") ] },
      { sources: ["visible-version", "version-chain"], targets: ["write-conflict"], values: { "write-conflict": true }, connections: ["visible-conflict"], transfers: [transfer("detect-write-conflict", "visible-version", "write-conflict", "v1:[10,21)", "同记录并发写入")], result: "并发更新触发写冲突处理", check: check("write-conflict", true, "写冲突已标记"), checks: [check("visible-version-value", 80, "读快照结果保持 80") ] },
    ]),
    explanations: ["事务先固定一致性快照 S=20。", "从新到旧检查，前两个版本都不可见。", "第三个版本覆盖时间 20，因此检查计数变为 3 并返回值 80。", "并发写冲突另由锁或提交验证处理，不改变本次快照读。"],
  },
  40023: {
    kind: "graph",
    entities: [
      entity("sql-query", "SQL 查询 Q", "input", "SELECT ... JOIN ..."),
      entity("logical-plan", "逻辑算子树", "intermediate", [], 0),
      entity("candidate-plans", "候选计划集 P(Q)", "intermediate", [], 1),
      entity("estimated-rows", "估计输出行数", "intermediate", 0, 2),
      entity("io-cost", "各计划 I/O 成本", "intermediate", [], 3),
      entity("cpu-cost", "各计划 CPU 成本", "intermediate", [], 3),
      entity("net-cost", "各计划网络成本", "intermediate", [], 3),
      entity("candidate-plan-costs", "各候选计划总成本", "intermediate", [], 3),
      entity("selected-plan", "最低成本计划 P*", "intermediate", "none", 4),
      entity("actual-rows", "实际输出行数", "output", 0, 4),
    ],
    connections: [
      connection("sql-logical", "sql-query", "logical-plan"),
      connection("logical-candidates", "logical-plan", "candidate-plans"),
      connection("candidates-estimate", "candidate-plans", "estimated-rows"),
      connection("estimate-io", "estimated-rows", "io-cost"),
      connection("estimate-cpu", "estimated-rows", "cpu-cost"),
      connection("estimate-net", "estimated-rows", "net-cost"),
      connection("io-total", "io-cost", "candidate-plan-costs"),
      connection("cpu-total", "cpu-cost", "candidate-plan-costs"),
      connection("net-total", "net-cost", "candidate-plan-costs"),
      connection("cost-selected", "candidate-plan-costs", "selected-plan"),
      connection("candidates-selected", "candidate-plans", "selected-plan"),
      connection("query-actual", "sql-query", "actual-rows"),
    ],
    formulaBindings: { Q: ["sql-query", "logical-plan"], "\\mathcal{P}(Q)": ["candidate-plans"], "P^*": ["selected-plan"], "C_{\\mathrm{I/O}},C_{\\mathrm{CPU}},C_{\\mathrm{NET}}": ["io-cost", "cpu-cost", "net-cost"] },
    frames: frames([
      { sources: ["sql-query"], targets: ["logical-plan"], values: { "logical-plan": ["scan", "filter", "join", "project"] }, connections: ["sql-logical"], transfers: [transfer("parse-sql", "sql-query", "logical-plan", "SELECT ... JOIN ...", "构造逻辑树")], result: "形成 4 节点逻辑计划", check: check("logical-plan", ["scan", "filter", "join", "project"], "逻辑算子完整") },
      { sources: ["logical-plan"], targets: ["candidate-plans"], values: { "candidate-plans": ["index+nested-loop", "hash(A,B)", "hash(B,A)"] }, connections: ["logical-candidates"], transfers: [transfer("enumerate-plans", "logical-plan", "candidate-plans", ["scan", "filter", "join", "project"], "枚举物理实现")], result: "枚举 3 个候选物理计划", check: check("candidate-plans", ["index+nested-loop", "hash(A,B)", "hash(B,A)"], "候选计划可见") },
      { sources: ["candidate-plans"], targets: ["estimated-rows"], values: { "estimated-rows": 100 }, connections: ["candidates-estimate"], transfers: [transfer("estimate-cardinality", "candidate-plans", "estimated-rows", ["index+nested-loop", "hash(A,B)", "hash(B,A)"], "依据统计估计基数")], result: "关键节点估计输出 100 行", check: check("estimated-rows", 100, "估计基数为 100") },
      {
        sources: ["estimated-rows", "candidate-plans"],
        targets: ["io-cost", "cpu-cost", "net-cost", "candidate-plan-costs"],
        values: {
          "io-cost": [14, 10, 12],
          "cpu-cost": [8, 6, 7],
          "net-cost": [4, 2, 3],
          "candidate-plan-costs": [26, 18, 22],
        },
        connections: ["estimate-io", "estimate-cpu", "estimate-net", "io-total", "cpu-total", "net-total"],
        transfers: [
          transfer("rows-to-io", "estimated-rows", "io-cost", 100, "逐计划估算 I/O"),
          transfer("rows-to-cpu", "estimated-rows", "cpu-cost", 100, "逐计划估算 CPU"),
          transfer("rows-to-net", "estimated-rows", "net-cost", 100, "逐计划估算网络"),
        ],
        result: "三个计划总成本依次为 26、18、22；此时尚未选择",
        check: check("candidate-plan-costs", [26, 18, 22], "所有候选总成本均已显示"),
        checks: [check("selected-plan", "none", "成本齐全前不提前写入选择")],
        expression: "[14+8+4,\\ 10+6+2,\\ 12+7+3]=[26,18,22]",
      },
      {
        sources: ["candidate-plans", "candidate-plan-costs", "sql-query"],
        targets: ["selected-plan", "actual-rows"],
        values: { "selected-plan": "hash(A,B):18", "actual-rows": 120 },
        connections: ["cost-selected", "candidates-selected", "query-actual"],
        transfers: [
          transfer("compare-costs", "candidate-plan-costs", "selected-plan", [26, 18, 22], "对完整成本向量取 argmin"),
          transfer("name-selected-plan", "candidate-plans", "selected-plan", ["index+nested-loop", "hash(A,B)", "hash(B,A)"], "把最小下标映射回计划"),
          transfer("execute-plan", "sql-query", "actual-rows", "SELECT ... JOIN ...", "执行所选计划"),
        ],
        result: "argmin([26,18,22])=1，执行 hash(A,B) 后实测 120 行",
        check: check("selected-plan", "hash(A,B):18", "argmin 选中成本 18 的计划"),
        checks: [check("actual-rows", 120, "实际行数来自执行"), check("estimated-rows", 100, "估计值仍可对照")],
        expression: "P^*=\\arg\\min_{P\\in\\mathcal{P}(Q)}[26,18,22]=\\mathrm{hash}(A,B)",
      },
    ]),
    explanations: [
      "SQL 先变成由扫描、筛选、连接、投影组成的逻辑树。",
      "优化器从逻辑树枚举三个真实候选，并固定后续成本数组的相同顺序。",
      "统计信息为关键连接估计 100 行，此时实际结果仍不可见。",
      "按候选顺序分别展示 I/O、CPU、网络成本，并逐项相加得到 [26,18,22]；选择结果仍隐藏。",
      "只有完整成本向量可见后才取 argmin，选择下标 1 的 hash(A,B)，执行阶段再揭示实际 120 行。",
    ],
  },
  40024: {
    kind: "pipeline",
    entities: [
      entity("shard-key", "分片键 k", "input", "user-42"), entity("hash-value", "哈希值 h(k)", "intermediate", 10),
      entity("shard-count", "分片数 m", "input", 4), entity("target-shard", "目标分片", "intermediate", 0),
      entity("primary", "主副本", "intermediate", "shard-2-primary", 1), entity("log-sequence", "日志序号", "intermediate", 0, 1),
      entity("followers", "跟随副本", "intermediate", ["f1", "f2"], 2), entity("replica-count", "副本数 r", "input", 3),
      entity("ack-count", "确认数", "output", 0, 3), entity("active-primary", "当前主副本", "output", "shard-2-primary", 4),
    ],
    connections: [connection("key-hash", "shard-key", "hash-value"), connection("hash-shard", "hash-value", "target-shard"), connection("shard-primary", "target-shard", "primary"), connection("primary-log", "primary", "log-sequence"), connection("log-followers", "log-sequence", "followers"), connection("followers-ack", "followers", "ack-count"), connection("followers-new-primary", "followers", "active-primary")],
    formulaBindings: { k: ["shard-key"], "h(k)": ["hash-value"], m: ["shard-count"], r: ["replica-count"] },
    frames: frames([
      { sources: ["shard-key", "hash-value", "shard-count"], targets: ["target-shard"], values: { "target-shard": 2 }, connections: ["key-hash", "hash-shard"], transfers: [transfer("hash-key", "shard-key", "hash-value", "user-42", "计算哈希"), transfer("mod-shards", "hash-value", "target-shard", 10, "对 4 取模")], result: "10 mod 4 = 分片 2", check: check("target-shard", 2, "请求路由到分片 2") },
      { sources: ["target-shard", "primary"], targets: ["log-sequence"], values: { "log-sequence": 41 }, connections: ["shard-primary", "primary-log"], transfers: [transfer("route-primary", "target-shard", "primary", 2, "路由到主副本"), transfer("append-log", "primary", "log-sequence", "shard-2-primary", "主副本追加日志")], result: "分片 2 主副本记录日志 41", check: check("log-sequence", 41, "主副本日志序号为 41") },
      { sources: ["log-sequence", "followers"], targets: ["followers"], values: { followers: ["f1:41", "f2:41"] }, connections: ["log-followers"], transfers: [transfer("replicate-log", "log-sequence", "followers", 41, "复制日志 41")], result: "两个跟随者应用日志 41", check: check("followers", ["f1:41", "f2:41"], "跟随者均应用同一日志") },
      { sources: ["primary", "followers", "replica-count"], targets: ["ack-count"], values: { "ack-count": 2 }, connections: ["followers-ack"], transfers: [transfer("follower-ack", "followers", "ack-count", ["f1:41", "f2:41"], "跟随者确认")], result: "主副本加一个跟随者达到 2 票", check: check("ack-count", 2, "确认策略达到多数") },
      { sources: ["followers", "target-shard"], targets: ["active-primary"], values: { "active-primary": "f1" }, connections: ["followers-new-primary"], transfers: [transfer("elect-primary", "followers", "active-primary", ["f1:41", "f2:41"], "从同步副本中选新主")], result: "故障后 f1 成为新主", check: check("active-primary", "f1", "新主具有日志 41"), checks: [check("target-shard", 2, "路由仍指向分片 2") ] },
    ]),
    explanations: ["分片键哈希为 10，对 4 取模得到分片 2。", "该分片主副本执行写入并追加日志 41。", "日志 41 传给两个跟随副本。", "主副本加一个跟随者确认即满足本例策略。", "故障后只从拥有日志 41 的同步副本中选新主。"],
  },
} satisfies ConceptSceneProfileTable;

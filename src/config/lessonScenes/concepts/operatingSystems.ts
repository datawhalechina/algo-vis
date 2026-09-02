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
  }));
}

export const operatingSystemSceneProfiles = {
  40007: {
    kind: "sequence",
    entities: [
      entity("process", "进程 P", "input", "P"), entity("address-space", "地址空间 M", "intermediate", "unallocated"),
      entity("open-files", "打开文件 F", "intermediate", []), entity("thread-1", "线程 T1 现场", "intermediate", "empty"),
      entity("thread-2", "线程 T2 现场", "intermediate", "empty"), entity("running-thread", "当前运行线程", "control", "none", 2),
      entity("shared-counter", "共享计数器", "output", 0, 3),
    ],
    connections: [connection("process-memory", "process", "address-space"), connection("process-files", "process", "open-files"), connection("process-t1", "process", "thread-1"), connection("process-t2", "process", "thread-2"), connection("t2-running", "thread-2", "running-thread"), connection("running-shared", "running-thread", "shared-counter")],
    formulaBindings: { P: ["process"], M: ["address-space"], F: ["open-files"], T_i: ["thread-1", "thread-2"], PC_i: ["thread-1", "thread-2"], SP_i: ["thread-1", "thread-2"], R_i: ["thread-1", "thread-2"] },
    frames: frames([
      { sources: ["process", "address-space", "open-files"], targets: ["address-space", "open-files"], values: { "address-space": "allocated", "open-files": ["log.txt"] }, connections: ["process-memory", "process-files"], result: "P 拥有地址空间与打开文件", check: check("address-space", "allocated", "地址空间已分配") },
      { sources: ["process", "thread-1", "thread-2"], targets: ["thread-1", "thread-2"], values: { "thread-1": [100, 8000, "R1"], "thread-2": [200, 9000, "R2"] }, connections: ["process-t1", "process-t2"], result: "T1、T2 各保存 PC/SP/寄存器", check: check("thread-1", [100, 8000, "R1"], "T1 现场独立") },
      { sources: ["thread-1", "thread-2"], targets: ["running-thread"], values: { "running-thread": "T2" }, connections: ["t2-running"], transfers: [transfer("schedule-t2", "thread-2", "running-thread", [200, 9000, "R2"], "恢复 T2 现场")], result: "调度器选择 T2", check: check("running-thread", "T2", "当前运行 T2") },
      { sources: ["running-thread", "address-space"], targets: ["shared-counter"], values: { "shared-counter": 42 }, connections: ["running-shared"], transfers: [transfer("write-shared", "running-thread", "shared-counter", "T2", "T2 写共享内存")], result: "同进程线程都能观察共享值 42", check: check("shared-counter", 42, "共享写入可见"), checks: [check("running-thread", "T2", "写入来自 T2")] },
    ]),
    explanations: ["进程 P 建立资源边界，持有地址空间和文件。", "两个线程分别保存自己的 PC、SP 与寄存器。", "调度只恢复 T2 的执行现场，不复制进程资源。", "T2 写入同一地址空间，T1 之后可读到 42。"],
  },
  40008: {
    kind: "pipeline",
    entities: [
      entity("old-thread", "旧线程 T1", "input", "T1"), entity("interrupt", "中断", "control", false),
      entity("saved-context", "已保存现场", "intermediate", [], 1), entity("ready-queue", "就绪队列", "input", ["T2", "T3"]),
      entity("new-thread", "选中新线程", "intermediate", "none", 2), entity("restored-context", "恢复现场", "output", [], 3),
      entity("save-time", "保存耗时", "intermediate", 1), entity("schedule-time", "调度耗时", "intermediate", 2),
      entity("restore-time", "恢复耗时", "intermediate", 1), entity("indirect-time", "间接耗时", "intermediate", 4),
      entity("switch-time", "总切换耗时", "output", 0, 3),
    ],
    connections: [connection("old-interrupt", "old-thread", "interrupt"), connection("old-saved", "old-thread", "saved-context"), connection("queue-selected", "ready-queue", "new-thread"), connection("selected-restored", "new-thread", "restored-context"), connection("times-total", "restore-time", "switch-time")],
    formulaBindings: { "T_{\\mathrm{switch}}": ["switch-time"], "T_{\\mathrm{save}}": ["save-time"], "T_{\\mathrm{schedule}}": ["schedule-time"], "T_{\\mathrm{restore}}": ["restore-time"], "T_{\\mathrm{indirect}}": ["indirect-time"] },
    frames: frames([
      { sources: ["old-thread"], targets: ["interrupt"], values: { interrupt: true }, connections: ["old-interrupt"], transfers: [transfer("timer-interrupt", "old-thread", "interrupt", "T1", "暂停 T1")], result: "时钟中断触发切换", check: check("interrupt", true, "中断已触发") },
      { sources: ["old-thread", "save-time"], targets: ["saved-context"], values: { "saved-context": ["PC=120", "SP=8000", "R"] }, connections: ["old-saved"], transfers: [transfer("save-context", "old-thread", "saved-context", "T1", "保存 T1 现场")], result: "保存 PC=120 等现场", check: check("saved-context", ["PC=120", "SP=8000", "R"], "恢复点完整") },
      { sources: ["ready-queue", "schedule-time"], targets: ["new-thread"], values: { "new-thread": "T2" }, connections: ["queue-selected"], transfers: [transfer("choose-t2", "ready-queue", "new-thread", ["T2", "T3"], "选择 T2")], result: "就绪队列选出 T2", check: check("new-thread", "T2", "调度结果为 T2") },
      { sources: ["new-thread", "restore-time", "indirect-time", "save-time", "schedule-time"], targets: ["restored-context", "switch-time"], values: { "restored-context": ["PC=200", "SP=9000", "R"], "switch-time": 8 }, connections: ["selected-restored", "times-total"], transfers: [transfer("restore-t2", "new-thread", "restored-context", "T2", "恢复 T2 现场")], result: "1+2+1+4=8 微秒", check: check("switch-time", 8, "总切换耗时为 8"), checks: [check("new-thread", "T2", "恢复对象是 T2")] },
    ]),
    explanations: ["时钟中断暂停当前线程并进入切换路径。", "先保存 T1 的 PC=120、SP 和寄存器。", "调度器从就绪队列选择 T2。", "恢复 T2 后，总成本包含保存、调度、恢复和缓存间接开销。"],
  },
  40009: {
    kind: "sequence",
    entities: [
      entity("arrival", "P1 到达时刻", "input", 0), entity("ready-queue", "就绪队列", "input", []),
      entity("selected-task", "选中任务", "control", "none", 1), entity("run-time", "P1 运行时间", "input", 2),
      entity("start-time", "P1 开始时刻", "intermediate", 0, 1), entity("finish-time", "P1 完成时刻", "output", 0, 2),
      entity("turnaround", "P1 周转时间", "output", 0, 3), entity("wait-time", "P1 等待时间", "output", 0, 3),
    ],
    connections: [connection("arrival-queue", "arrival", "ready-queue"), connection("queue-selected", "ready-queue", "selected-task"), connection("selected-finish", "selected-task", "finish-time"), connection("finish-turn", "finish-time", "turnaround"), connection("turn-wait", "turnaround", "wait-time")],
    formulaBindings: { "T_{\\mathrm{arrival}}": ["arrival"], "T_{\\mathrm{finish}}": ["finish-time"], "T_{\\mathrm{turn}}": ["turnaround"], "T_{\\mathrm{wait}}": ["wait-time"], "T_{\\mathrm{run}}": ["run-time"] },
    frames: frames([
      { sources: ["arrival"], targets: ["ready-queue"], values: { "ready-queue": ["P2", "P3", "P1"] }, connections: ["arrival-queue"], transfers: [transfer("arrive-p1", "arrival", "ready-queue", 0, "P1 在时刻 0 到达")], result: "三个任务进入就绪队列", check: check("ready-queue", ["P2", "P3", "P1"], "到达任务全部排队") },
      { sources: ["ready-queue", "arrival"], targets: ["selected-task", "start-time"], values: { "selected-task": "P1", "start-time": 3 }, connections: ["queue-selected"], transfers: [transfer("select-p1", "ready-queue", "selected-task", ["P2", "P3", "P1"], "策略选中 P1")], result: "P1 在时刻 3 开始", check: check("start-time", 3, "P1 等待到时刻 3") },
      { sources: ["selected-task", "start-time", "run-time"], targets: ["finish-time"], values: { "finish-time": 5 }, connections: ["selected-finish"], transfers: [transfer("run-p1", "selected-task", "finish-time", "P1", "P1 运行 2 个单位")], result: "P1 在时刻 5 完成", check: check("finish-time", 5, "完成时刻 3+2=5") },
      { sources: ["arrival", "finish-time", "run-time"], targets: ["turnaround", "wait-time"], values: { turnaround: 5, "wait-time": 3 }, connections: ["finish-turn", "turn-wait"], transfers: [transfer("finish-to-turn", "finish-time", "turnaround", 5, "计算周转时间"), transfer("turn-to-wait", "turnaround", "wait-time", 5, "扣除运行时间")], result: "turn=5，wait=3", check: check("wait-time", 3, "等待时间为 3"), checks: [check("turnaround", 5, "周转时间为 5")] },
    ]),
    explanations: ["P1 与另外两个任务在时刻 0 到达。", "策略让 P1 在时刻 3 开始运行。", "运行 2 个单位后于时刻 5 完成。", "周转 5 减去运行 2，得到等待 3。"],
  },
  40010: {
    kind: "pipeline",
    entities: [
      entity("virtual-address", "虚拟地址 v", "input", 13330), entity("page-size", "页大小 P", "input", 4096),
      entity("page-number", "虚拟页号 p", "intermediate", 0), entity("page-offset", "页内偏移 d", "intermediate", 0),
      entity("tlb-result", "TLB 结果", "control", "unknown", 1), entity("pte-valid", "页表有效位", "control", false, 2),
      entity("page-frame", "页框 frame[p]", "intermediate", 0, 3), entity("permission", "权限检查", "control", "pending", 2),
      entity("physical-address", "物理地址 PA", "output", 0, 4),
    ],
    connections: [connection("va-page", "virtual-address", "page-number"), connection("va-offset", "virtual-address", "page-offset"), connection("page-tlb", "page-number", "tlb-result"), connection("tlb-pte", "tlb-result", "pte-valid"), connection("pte-frame", "pte-valid", "page-frame"), connection("frame-pa", "page-frame", "physical-address"), connection("offset-pa", "page-offset", "physical-address")],
    formulaBindings: { v: ["virtual-address"], P: ["page-size"], p: ["page-number"], d: ["page-offset"], "\\operatorname{frame}[p]": ["page-frame"], PA: ["physical-address"] },
    frames: frames([
      { sources: ["virtual-address", "page-size"], targets: ["page-number", "page-offset"], values: { "page-number": 3, "page-offset": 1042 }, connections: ["va-page", "va-offset"], transfers: [transfer("split-page", "virtual-address", "page-number", 13330, "提取页号"), transfer("split-offset", "virtual-address", "page-offset", 13330, "保留偏移")], result: "p=3，d=1042", check: check("page-number", 3, "虚拟页号为 3") },
      { sources: ["page-number", "tlb-result"], targets: ["tlb-result"], values: { "tlb-result": "miss" }, connections: ["page-tlb"], transfers: [transfer("lookup-tlb", "page-number", "tlb-result", 3, "查询页 3")], result: "TLB miss，继续查页表", check: check("tlb-result", "miss", "TLB 未命中") },
      { sources: ["tlb-result", "page-number"], targets: ["pte-valid", "permission"], values: { "pte-valid": false, permission: "allowed" }, connections: ["tlb-pte"], transfers: [transfer("walk-page-table", "tlb-result", "pte-valid", "miss", "读取页表项")], result: "有效位为 0，不能拼接地址", check: check("pte-valid", false, "页表项无效") },
      { sources: ["page-number", "permission", "pte-valid"], targets: ["page-frame", "pte-valid"], values: { "page-frame": 7, "pte-valid": true }, connections: ["pte-frame"], transfers: [transfer("install-frame", "pte-valid", "page-frame", true, "有效映射提供页框 7")], result: "合法页调入页框 7", check: check("page-frame", 7, "缺页后页框为 7") },
      { sources: ["page-frame", "page-size", "page-offset"], targets: ["physical-address"], values: { "physical-address": 29714 }, connections: ["frame-pa", "offset-pa"], transfers: [transfer("frame-to-pa", "page-frame", "physical-address", 7, "页框参与拼接"), transfer("offset-to-pa", "page-offset", "physical-address", 1042, "偏移保持不变")], result: "PA=7*4096+1042=29714", check: check("physical-address", 29714, "物理地址正确"), checks: [check("page-offset", 1042, "页内偏移保持不变")] },
    ]),
    explanations: ["把虚拟地址拆成页号 3 和偏移 1042。", "TLB 中没有页 3 映射。", "页表项无效，因此此时绝不生成物理地址。", "地址合法且权限允许，缺页处理分配页框 7。", "重试时用页框 7 与原偏移拼出 29714。"],
  },
  40011: {
    kind: "sequence",
    entities: [
      entity("thread-1", "线程 T1", "input", "T1"), entity("thread-2", "线程 T2", "input", "T2"),
      entity("resource-1", "资源 R1", "intermediate", "held-by-T1"), entity("resource-2", "资源 R2", "intermediate", "held-by-T2"),
      entity("critical-count", "临界区线程数", "control", 0), entity("shared-result", "受保护更新数", "output", 0, 2),
      entity("wait-graph", "等待图 G_W", "output", [], 3),
    ],
    connections: [connection("t1-r2", "thread-1", "resource-2"), connection("r2-critical", "resource-2", "critical-count"), connection("critical-result", "critical-count", "shared-result"), connection("t2-r1", "thread-2", "resource-1"), connection("r1-t1", "resource-1", "thread-1")],
    formulaBindings: { T_i: ["thread-1", "thread-2"], C: ["critical-count"], G_W: ["wait-graph"], "\\mathbf{1}[T_i\\in C]": ["critical-count"] },
    frames: frames([
      { sources: ["thread-1", "resource-2"], targets: ["resource-2"], connections: ["t1-r2"], transfers: [transfer("request-r2", "thread-1", "resource-2", "T1", "T1 请求 R2")], result: "T1 请求被 T2 持有的 R2", check: check("resource-2", "held-by-T2", "R2 当前属于 T2") },
      { sources: ["thread-2", "critical-count"], targets: ["critical-count"], values: { "critical-count": 1 }, connections: ["r2-critical"], transfers: [transfer("enter-critical", "resource-2", "critical-count", "held-by-T2", "T2 进入临界区")], result: "临界区内仅有 T2", check: check("critical-count", [0, 1], "互斥不变量 <=1", "range") },
      { sources: ["critical-count", "shared-result"], targets: ["shared-result"], values: { "shared-result": 1 }, connections: ["critical-result"], transfers: [transfer("protected-write", "critical-count", "shared-result", 1, "唯一写入者更新")], result: "共享数据完成一次受保护更新", check: check("shared-result", 1, "更新只发生一次") },
      { sources: ["thread-1", "thread-2", "resource-1", "resource-2"], targets: ["wait-graph"], values: { "wait-graph": ["T1->R2", "R2->T2", "T2->R1", "R1->T1"] }, connections: ["t1-r2", "t2-r1", "r1-t1"], transfers: [transfer("t2-waits-r1", "thread-2", "resource-1", "T2", "T2 请求 R1")], result: "等待边闭合成环，检测到死锁", check: check("wait-graph", ["T1->R2", "R2->T2", "T2->R1", "R1->T1"], "等待图包含完整环"), checks: [check("critical-count", 1, "互斥仍成立")] },
    ]),
    explanations: ["T1 持有 R1 又请求 T2 持有的 R2。", "互斥条件只允许 T2 一人进入临界区。", "持锁期间共享数据只有一个写入者。", "T2 再请求 R1 时，等待图形成 T1 与 T2 的环。"],
  },
  40012: {
    kind: "pipeline",
    entities: [
      entity("path", "路径", "input", "/data/log"), entity("inode", "inode", "intermediate", 0),
      entity("file-offset", "文件偏移 o", "input", 9000), entity("block-size", "块大小 B", "input", 4096),
      entity("logical-block", "逻辑块 b", "intermediate", 0, 1), entity("block-offset", "块内偏移 d", "intermediate", 0, 1),
      entity("device-block", "设备块", "intermediate", 0, 2), entity("read-bytes", "返回字节数", "output", 0, 3),
    ],
    connections: [connection("path-inode", "path", "inode"), connection("offset-block", "file-offset", "logical-block"), connection("offset-inner", "file-offset", "block-offset"), connection("logical-device", "logical-block", "device-block"), connection("device-read", "device-block", "read-bytes")],
    formulaBindings: { o: ["file-offset"], B: ["block-size"], b: ["logical-block"], d: ["block-offset"] },
    frames: frames([
      { sources: ["path"], targets: ["inode"], values: { inode: 42 }, connections: ["path-inode"], transfers: [transfer("resolve-path", "path", "inode", "/data/log", "解析目录项")], result: "路径解析到 inode 42", check: check("inode", 42, "元数据编号为 42") },
      { sources: ["file-offset", "block-size"], targets: ["logical-block", "block-offset"], values: { "logical-block": 2, "block-offset": 808 }, connections: ["offset-block", "offset-inner"], transfers: [transfer("split-file-offset", "file-offset", "logical-block", 9000, "计算逻辑块"), transfer("keep-block-offset", "file-offset", "block-offset", 9000, "计算块内偏移")], result: "b=2，d=808", check: check("logical-block", 2, "逻辑块号为 2") },
      { sources: ["inode", "logical-block"], targets: ["device-block"], values: { "device-block": 73 }, connections: ["logical-device"], transfers: [transfer("map-block", "logical-block", "device-block", 2, "查询 inode 块映射")], result: "逻辑块 2 映射到设备块 73", check: check("device-block", 73, "设备块号为 73") },
      { sources: ["device-block", "block-offset"], targets: ["read-bytes"], values: { "read-bytes": 1024 }, connections: ["device-read"], transfers: [transfer("device-io", "device-block", "read-bytes", 73, "设备读取并复制")], result: "从偏移 808 返回 1024 字节", check: check("read-bytes", 1024, "返回长度为 1024"), checks: [check("block-offset", 808, "块内偏移保持 808")] },
    ]),
    explanations: ["路径先解析到保存块映射的 inode 42。", "文件偏移 9000 拆为逻辑块 2 和块内偏移 808。", "inode 映射把逻辑块 2 定位到设备块 73。", "设备读取完成后从偏移 808 向应用复制 1024 字节。"],
  },
} satisfies ConceptSceneProfileTable;

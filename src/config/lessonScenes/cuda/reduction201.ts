import type { GuidedLessonBlueprint } from "../../guidedLessonTypes.ts";
import type {
  ArraySceneSpec,
  EntityStatus,
  LessonSceneEntity,
  LessonSceneFrame,
  LessonSceneTransfer,
  SceneEntityState,
  SceneValue,
} from "../../lessonSceneTypes.ts";

const INPUT_VALUES = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const inputIds = INPUT_VALUES.map((_, index) => `input-${index}`);
const registerIds = INPUT_VALUES.map((_, index) => `register-${index}`);
const sharedIds = INPUT_VALUES.map((_, index) => `shared-${index}`);
const pairIds = ["sum-01", "sum-23", "sum-45", "sum-67"];
const halfIds = ["sum-left", "sum-right"];
const controlIds = ["barrier-before", "barrier", "block-sum", "partial-sum", "grid-sum"];
const allEntityIds = [
  ...inputIds,
  ...registerIds,
  ...sharedIds,
  ...pairIds,
  ...halfIds,
  ...controlIds,
];

const entities: LessonSceneEntity[] = [
  ...INPUT_VALUES.map((_, index): LessonSceneEntity => ({
    id: inputIds[index],
    label: `x[${index}]`,
    role: "input",
    groupId: "global-input",
  })),
  ...INPUT_VALUES.map((_, index): LessonSceneEntity => ({
    id: registerIds[index],
    label: `线程 ${index} 寄存器`,
    role: "intermediate",
    groupId: "registers",
  })),
  ...INPUT_VALUES.map((_, index): LessonSceneEntity => ({
    id: sharedIds[index],
    label: `shared[${index}]`,
    role: "intermediate",
    groupId: "shared-memory",
  })),
  ...pairIds.map((id, index): LessonSceneEntity => ({
    id,
    label: `第一层和 ${index}`,
    role: "intermediate",
    groupId: "reduction-tree",
  })),
  ...halfIds.map((id, index): LessonSceneEntity => ({
    id,
    label: index === 0 ? "左半和" : "右半和",
    role: "intermediate",
    groupId: "reduction-tree",
  })),
  { id: "barrier-before", label: "屏障释放前快照", role: "control", groupId: "control" },
  { id: "barrier", label: "__syncthreads()", role: "control", groupId: "control" },
  { id: "block-sum", label: "lane 0 block 和", role: "intermediate", groupId: "output" },
  { id: "partial-sum", label: "全局部分和[0]", role: "intermediate", groupId: "output" },
  { id: "grid-sum", label: "最终 S", role: "output", groupId: "output" },
];

const initialValues: Record<string, SceneValue> = {
  ...Object.fromEntries(inputIds.map((id, index) => [id, INPUT_VALUES[index]])),
  ...Object.fromEntries(registerIds.map((id) => [id, "empty"])),
  ...Object.fromEntries(sharedIds.map((id) => [id, "empty"])),
  ...Object.fromEntries([...pairIds, ...halfIds].map((id) => [id, "pending"])),
  "barrier-before": "waiting",
  barrier: "waiting",
  "block-sum": "pending",
  "partial-sum": "pending",
  "grid-sum": "pending",
};

function states(
  values: Record<string, SceneValue>,
  activeIds: readonly string[],
  completeIds: readonly string[],
  statuses: Record<string, EntityStatus> = {},
  visibleIds: readonly string[] = allEntityIds,
  previousValues?: Readonly<Record<string, SceneValue>>,
): Record<string, SceneEntityState> {
  const active = new Set(activeIds);
  const complete = new Set(completeIds);
  const visible = new Set([...visibleIds, "input-0", "grid-sum"]);
  return Object.fromEntries(allEntityIds.map((id) => {
    let status: EntityStatus = complete.has(id) ? "complete" : "waiting";
    if (active.has(id)) status = "active";
    if (statuses[id]) status = statuses[id];
    const changed = previousValues
      && active.has(id)
      && JSON.stringify(previousValues[id]) !== JSON.stringify(values[id]);
    return [id, {
      value: values[id],
      ...(changed ? { previousValue: previousValues[id] } : {}),
      status,
      visible: visible.has(id),
    }];
  }));
}

function transfers(
  prefix: string,
  routes: Array<[string, string, number | string]>,
): LessonSceneTransfer[] {
  return routes.map(([from, to, payload], index) => ({
    id: `${prefix}-${index}`,
    from,
    to,
    sourceValue: payload,
    payload,
    label: `${entities.find((entity) => entity.id === from)?.label} 携带 ${payload}`,
  }));
}

function datum(entityId: string, value: SceneValue) {
  return {
    entityId,
    label: entities.find((entity) => entity.id === entityId)?.label ?? entityId,
    value,
  };
}

export function createCudaReduction201Scene(
  blueprint: GuidedLessonBlueprint,
): ArraySceneSpec {
  const [
    readRegisters,
    writeShared,
    blockBarrier,
    sharedTreeReduce,
    warpTail,
    writeBlockSum,
    finalizeGridSum,
  ] = blueprint.flow.map(({ id }) => id);

  const readValues = {
    ...initialValues,
    ...Object.fromEntries(registerIds.map((id, index) => [id, INPUT_VALUES[index]])),
  };
  const sharedValues = {
    ...readValues,
    ...Object.fromEntries(sharedIds.map((id, index) => [id, INPUT_VALUES[index]])),
  };
  const barrierValues = { ...sharedValues, barrier: "released" };
  const treeValues = {
    ...barrierValues,
    "sum-01": 3,
    "sum-23": 7,
    "sum-45": 11,
    "sum-67": 15,
    "sum-left": 10,
    "sum-right": 26,
  };
  const warpValues = { ...treeValues, "block-sum": 36 };
  const partialValues = { ...warpValues, "partial-sum": 36 };
  const finalValues = { ...partialValues, "grid-sum": 36 };

  const readTransfers = transfers("read", inputIds.map((id, index) => [
    id,
    registerIds[index],
    INPUT_VALUES[index],
  ]));
  const sharedTransfers = transfers("shared", registerIds.map((id, index) => [
    id,
    sharedIds[index],
    INPUT_VALUES[index],
  ]));
  const treeRoutes: Array<[string, string, number]> = [
    ["shared-0", "sum-01", 1],
    ["shared-1", "sum-01", 2],
    ["shared-2", "sum-23", 3],
    ["shared-3", "sum-23", 4],
    ["shared-4", "sum-45", 5],
    ["shared-5", "sum-45", 6],
    ["shared-6", "sum-67", 7],
    ["shared-7", "sum-67", 8],
    ["sum-01", "sum-left", 3],
    ["sum-23", "sum-left", 7],
    ["sum-45", "sum-right", 11],
    ["sum-67", "sum-right", 15],
  ];
  const treeTransfers = transfers("tree", treeRoutes);
  const warpTransfers = transfers("warp", [
    ["sum-left", "block-sum", 10],
    ["sum-right", "block-sum", 26],
  ]);
  const blockTransfer = transfers("block", [["block-sum", "partial-sum", 36]]);
  const finalTransfer = transfers("final", [["partial-sum", "grid-sum", 36]]);
  const barrierTransfers: LessonSceneTransfer[] = [
    {
      id: "barrier-before-release",
      from: "barrier-before",
      to: "barrier",
      sourceValue: "waiting",
      payload: "waiting",
      label: "进入屏障时仍在等待",
    },
    ...sharedIds.map((id, index) => ({
      id: `barrier-ready-${index}`,
      from: id,
      to: "barrier",
      sourceValue: INPUT_VALUES[index],
      payload: INPUT_VALUES[index],
      label: `shared[${index}] 写入值 ${INPUT_VALUES[index]} 后到达屏障`,
    })),
  ];

  const connections = [
    ...readTransfers,
    ...sharedTransfers,
    ...treeTransfers,
    ...warpTransfers,
    ...blockTransfer,
    ...finalTransfer,
    ...barrierTransfers,
  ].map(({ id, from, to, label }) => ({ id: `edge-${id}`, from, to, label }));

  const makeFrame = (
    frame: Omit<LessonSceneFrame, "debugAssertions"> & {
      debugEntityId?: string;
      debugEntityIds?: string[];
    },
  ): LessonSceneFrame => {
    const { debugEntityId, debugEntityIds, ...rest } = frame;
    const assertionEntityIds = debugEntityIds ?? (debugEntityId ? [debugEntityId] : []);
    return {
      ...rest,
      debugAssertions: assertionEntityIds.map((entityId) => {
        const value = rest.entityStates[entityId].value;
        return {
          label: `核对 ${datum(entityId, value ?? "pending").label}`,
          entityId,
          operator: "eq" as const,
          expected: value ?? "pending",
        };
      }),
    };
  };

  const framesByJointId: Record<string, LessonSceneFrame> = {
    [readRegisters]: makeFrame({
      jointId: readRegisters,
      title: "八个线程读取连续输入",
      inputs: inputIds.map((id, index) => datum(id, INPUT_VALUES[index])),
      operation: {
        label: "线程 i 把 x[i] 读入自己的寄存器",
        sourceEntityIds: inputIds,
        targetEntityIds: registerIds,
      },
      outputs: registerIds.map((id, index) => datum(id, INPUT_VALUES[index])),
      entityStates: states(
        readValues,
        [...inputIds, ...registerIds],
        inputIds,
        {},
        [...inputIds, ...registerIds],
        initialValues,
      ),
      visibleConnectionIds: readTransfers.map(({ id }) => `edge-${id}`),
      transfers: readTransfers,
      metrics: [],
      result: "线程寄存器 = [1, 2, 3, 4, 5, 6, 7, 8]",
      explanation: "连续线程读取连续地址，每个线程先持有一个可独立累加的局部值。",
      debugEntityId: "register-7",
    }),
    [writeShared]: makeFrame({
      jointId: writeShared,
      title: "寄存器值写入 shared memory",
      inputs: registerIds.map((id, index) => datum(id, INPUT_VALUES[index])),
      operation: {
        label: "线程 i 写 shared[i]",
        sourceEntityIds: registerIds,
        targetEntityIds: sharedIds,
      },
      outputs: sharedIds.map((id, index) => datum(id, INPUT_VALUES[index])),
      entityStates: states(
        sharedValues,
        [...registerIds, ...sharedIds],
        [...inputIds, ...registerIds],
        { barrier: "blocked" },
        [...registerIds, ...sharedIds, "barrier"],
        readValues,
      ),
      visibleConnectionIds: sharedTransfers.map(({ id }) => `edge-${id}`),
      transfers: sharedTransfers,
      metrics: [datum("barrier", "waiting")],
      result: "shared = [1, 2, 3, 4, 5, 6, 7, 8]；屏障仍在 waiting",
      explanation: "所有槽位都已获得值，但在屏障释放前任何线程都不能安全读取邻居槽位。",
      debugEntityId: "barrier",
    }),
    [blockBarrier]: makeFrame({
      jointId: blockBarrier,
      title: "块内屏障释放",
      inputs: [
        ...sharedIds.map((id, index) => datum(id, INPUT_VALUES[index])),
        datum("barrier-before", "waiting"),
      ],
      operation: {
        label: "__syncthreads() 等待八次 shared 写入可见",
        sourceEntityIds: [...sharedIds, "barrier-before"],
        targetEntityIds: ["barrier"],
      },
      outputs: [datum("barrier", "released")],
      entityStates: states(
        barrierValues,
        [...sharedIds, "barrier-before", "barrier"],
        [...inputIds, ...registerIds, ...sharedIds],
        { barrier: "complete" },
        [...sharedIds, "barrier-before", "barrier"],
        sharedValues,
      ),
      visibleConnectionIds: barrierTransfers.map(({ id }) => `edge-${id}`),
      transfers: barrierTransfers,
      metrics: [],
      result: "barrier: waiting -> released",
      explanation: "屏障的可见值变为 released，说明每个线程现在都能读取其他线程写入的 shared 值。",
      debugEntityIds: ["barrier-before", "barrier"],
    }),
    [sharedTreeReduce]: makeFrame({
      jointId: sharedTreeReduce,
      title: "shared memory 两层折半归约",
      inputs: sharedIds.map((id, index) => datum(id, INPUT_VALUES[index])),
      operation: {
        label: "六次加法把八个槽位折半为两个半区和",
        sourceEntityIds: sharedIds,
        targetEntityIds: [...pairIds, ...halfIds],
        expression: "3+7=10,\\;11+15=26",
      },
      outputs: [
        datum("sum-01", 3),
        datum("sum-23", 7),
        datum("sum-45", 11),
        datum("sum-67", 15),
        datum("sum-left", 10),
        datum("sum-right", 26),
      ],
      entityStates: states(
        treeValues,
        [...sharedIds, ...pairIds, ...halfIds],
        [...inputIds, ...registerIds, ...sharedIds, "barrier"],
        {},
        [...sharedIds, ...pairIds, ...halfIds, "barrier"],
        barrierValues,
      ),
      visibleConnectionIds: treeTransfers.map(({ id }) => `edge-${id}`),
      transfers: treeTransfers,
      metrics: [],
      result: "[3, 7, 11, 15] -> [10, 26]",
      explanation: "每个加法结果都由两条带具体操作数的传输汇入，因此能逐项核对折半树。",
      debugEntityIds: [...pairIds, ...halfIds],
    }),
    [warpTail]: makeFrame({
      jointId: warpTail,
      title: "有效 lane 完成尾归约",
      inputs: [datum("sum-left", 10), datum("sum-right", 26)],
      operation: {
        label: "有效掩码下用 shuffle 把两个半区和送给 lane 0",
        sourceEntityIds: halfIds,
        targetEntityIds: ["block-sum"],
        expression: "10+26=36",
      },
      outputs: [datum("block-sum", 36)],
      entityStates: states(
        warpValues,
        [...halfIds, "block-sum"],
        [...inputIds, ...registerIds, ...sharedIds, "barrier", ...pairIds, ...halfIds],
        {},
        [...halfIds, "block-sum"],
        treeValues,
      ),
      visibleConnectionIds: warpTransfers.map(({ id }) => `edge-${id}`),
      transfers: warpTransfers,
      metrics: [],
      result: "lane 0 持有 block 和 36",
      explanation: "只剩一个 warp 后不再使用块级屏障，两个有效 lane 通过 shuffle 合成 36。",
      debugEntityId: "block-sum",
    }),
    [writeBlockSum]: makeFrame({
      jointId: writeBlockSum,
      title: "block 部分和写入全局内存",
      inputs: [datum("block-sum", 36)],
      operation: {
        label: "lane 0 写出本 block 的唯一部分和",
        sourceEntityIds: ["block-sum"],
        targetEntityIds: ["partial-sum"],
      },
      outputs: [datum("partial-sum", 36)],
      entityStates: states(
        partialValues,
        ["block-sum", "partial-sum"],
        allEntityIds.slice(0, -2),
        {},
        ["block-sum", "partial-sum"],
        warpValues,
      ),
      visibleConnectionIds: blockTransfer.map(({ id }) => `edge-${id}`),
      transfers: blockTransfer,
      metrics: [],
      result: "global partials = [36]",
      explanation: "块内同步范围到此结束，lane 0 把可跨 kernel 使用的部分和写到全局内存。",
      debugEntityId: "partial-sum",
    }),
    [finalizeGridSum]: makeFrame({
      jointId: finalizeGridSum,
      title: "新 kernel 完成 grid 归约",
      inputs: [datum("partial-sum", 36)],
      operation: {
        label: "kernel 边界后读取所有 block 部分和并得到 S",
        sourceEntityIds: ["partial-sum"],
        targetEntityIds: ["grid-sum"],
        expression: "S=36",
      },
      outputs: [datum("grid-sum", 36)],
      entityStates: states(
        finalValues,
        ["partial-sum", "grid-sum"],
        allEntityIds.slice(0, -1),
        {},
        ["partial-sum", "grid-sum"],
        partialValues,
      ),
      visibleConnectionIds: finalTransfer.map(({ id }) => `edge-${id}`),
      transfers: finalTransfer,
      metrics: [datum("grid-sum", 36)],
      result: "最终输出 S = 36",
      explanation: "新 kernel 提供 grid 级全局边界；本例只有一个部分和，所以最终结果仍是 36。",
      debugEntityIds: [
        "barrier",
        ...pairIds,
        ...halfIds,
        "block-sum",
        "partial-sum",
        "grid-sum",
      ],
    }),
  };

  return {
    lessonId: 201,
    kind: "array",
    ariaLabel: "八个连续整数从线程寄存器到 grid 总和的七帧 CUDA 归约",
    entities,
    connections,
    formulaBindings: [
      { symbol: "x_i", entityIds: inputIds },
      { symbol: "N", entityIds: inputIds },
      { symbol: "S", entityIds: ["grid-sum"] },
    ],
    layout: {
      orientation: "horizontal",
      groups: [
        { id: "global-input", label: "全局输入 [1..8]", entityIds: inputIds },
        { id: "registers", label: "线程寄存器", entityIds: registerIds },
        { id: "shared-memory", label: "shared memory", entityIds: sharedIds },
        { id: "reduction-tree", label: "折半归约树", entityIds: [...pairIds, ...halfIds] },
        { id: "control", label: "同步", entityIds: ["barrier-before", "barrier"] },
        { id: "output", label: "block 与 grid 输出", entityIds: ["block-sum", "partial-sum", "grid-sum"] },
      ],
    },
    framesByJointId,
  };
}

import { VisualizationStep } from "@/types";

// 链表节点
export interface ListNode {
  val: number;
  next: number | null; // 指向下一个节点的索引
}

// 可视化状态
export interface ReverseListState {
  nodes: ListNode[];
  prevIndex: number | null;
  currIndex: number | null;
  nextIndex: number | null;
  isComplete: boolean;
}

// 生成反转链表的可视化步骤
export function generateReverseLinkedListSteps(
  values: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];

  if (values.length === 0) {
    steps.push({
      id: 0,
      description: "空链表，无需反转",
      data: {
        nodes: [],
        prevIndex: null,
        currIndex: null,
        nextIndex: null,
        isComplete: true,
      } as ReverseListState,
      code: "if (!head) return null;",
    });
    return steps;
  }

  // 初始化链表
  const nodes: ListNode[] = values.map((val, index) => ({
    val,
    next: index < values.length - 1 ? index + 1 : null,
  }));

  // 步骤 0: 初始状态
  steps.push({
    id: 0,
    description: "初始链表状态",
    data: {
      nodes: JSON.parse(JSON.stringify(nodes)),
      prevIndex: null,
      currIndex: null,
      nextIndex: null,
      isComplete: false,
    } as ReverseListState,
    code: "// 原始链表",
    variables: {
      prev: "null",
      curr: "null",
      next: "null",
    },
  });

  // 步骤 1: 初始化指针
  steps.push({
    id: 1,
    description: "初始化两个指针：prev 指向 null，curr 指向头节点",
    data: {
      nodes: JSON.parse(JSON.stringify(nodes)),
      prevIndex: null,
      currIndex: 0,
      nextIndex: null,
      isComplete: false,
    } as ReverseListState,
    code: "let prev = null;\nlet curr = head;",
    variables: {
      prev: "null",
      curr: values[0],
      next: "null",
    },
  });

  let prevIndex: number | null = null;
  let currIndex: number | null = 0;
  let stepId = 2;

  // 遍历链表并反转
  while (currIndex !== null) {
    // 在修改之前保存当前节点状态
    const currentNodes = JSON.parse(JSON.stringify(nodes));
    // 在修改之前获取 nextIndex（此时 next 还是原始值）
    const nextIndex: number | null = nodes[currIndex].next;

    // 步骤: 保存下一个节点
    steps.push({
      id: stepId++,
      description: `保存 curr 的下一个节点到 next，防止链表断裂`,
      data: {
        nodes: currentNodes,
        prevIndex,
        currIndex,
        nextIndex,
        isComplete: false,
      } as ReverseListState,
      code: "const next = curr.next;",
      variables: {
        prev: prevIndex !== null ? values[prevIndex] : "null",
        curr: values[currIndex],
        next: nextIndex !== null ? values[nextIndex] : "null",
      },
    });

    // 反转当前节点的指针（指向 prev）
    nodes[currIndex].next = prevIndex;

    // 步骤: 反转指针
    steps.push({
      id: stepId++,
      description: `反转当前节点的指针，使其指向 prev`,
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        prevIndex,
        currIndex,
        nextIndex,
        isComplete: false,
      } as ReverseListState,
      code: "curr.next = prev;",
      variables: {
        prev: prevIndex !== null ? values[prevIndex] : "null",
        curr: values[currIndex],
        next: nextIndex !== null ? values[nextIndex] : "null",
      },
    });

    // 移动指针
    prevIndex = currIndex;
    currIndex = nextIndex;

    // 步骤: 移动指针
    steps.push({
      id: stepId++,
      description:
        currIndex !== null
          ? `移动 prev 和 curr 指针，继续处理下一个节点`
          : `curr 为 null，遍历结束。prev 指向新的头节点`,
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        prevIndex,
        currIndex,
        nextIndex: null,
        isComplete: currIndex === null,
      } as ReverseListState,
      code: "prev = curr;\ncurr = next;",
      variables: {
        prev: values[prevIndex],
        curr: currIndex !== null ? values[currIndex] : "null",
        next: "null",
      },
    });
  }

  // 最终状态
  steps.push({
    id: stepId,
    description: "链表反转完成！prev 指向新的头节点",
    data: {
      nodes: JSON.parse(JSON.stringify(nodes)),
      prevIndex,
      currIndex: null,
      nextIndex: null,
      isComplete: true,
    } as ReverseListState,
    code: "return prev;",
    variables: {
      prev: values[prevIndex!],
      curr: "null",
      next: "null",
    },
  });

  return steps;
}

// 默认测试用例
export const defaultTestCases = [
  { values: [1, 2, 3, 4, 5], label: "示例 1" },
  { values: [1, 2], label: "示例 2" },
  { values: [1], label: "单节点" },
  { values: [], label: "空链表" },
];

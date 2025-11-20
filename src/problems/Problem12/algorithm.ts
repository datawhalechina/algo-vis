import { VisualizationStep } from "@/types";

export interface ListNode {
  val: number;
  next: ListNode | null;
}

export function arrayToList(arr: number[]): ListNode | null {
  if (arr.length === 0) return null;
  const head: ListNode = { val: arr[0], next: null };
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = { val: arr[i], next: null };
    current = current.next;
  }
  return head;
}

export function listToArray(head: ListNode | null): number[] {
  const result: number[] = [];
  let current = head;
  while (current) {
    result.push(current.val);
    current = current.next;
  }
  return result;
}

export function generateMergeTwoListsSteps(
  list1: number[],
  list2: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始合并两个有序链表：list1 = [${list1.join(', ')}], list2 = [${list2.join(', ')}]`,
    data: { list1: [...list1], list2: [...list2], merged: [] },
    variables: { pointer1: 0, pointer2: 0 },
  });

  let pointer1 = 0;
  let pointer2 = 0;
  const merged: number[] = [];

  while (pointer1 < list1.length && pointer2 < list2.length) {
    const val1 = list1[pointer1];
    const val2 = list2[pointer2];

    steps.push({
      id: stepId++,
      description: `比较：list1[${pointer1}] = ${val1} vs list2[${pointer2}] = ${val2}`,
      data: { list1: [...list1], list2: [...list2], merged: [...merged] },
      variables: { pointer1, pointer2, val1, val2, comparing: true },
    });

    if (val1 <= val2) {
      merged.push(val1);
      steps.push({
        id: stepId++,
        description: `${val1} ≤ ${val2}，将 ${val1} 加入结果链表`,
        data: { list1: [...list1], list2: [...list2], merged: [...merged] },
        variables: { pointer1: pointer1 + 1, pointer2, selectedFrom: 'list1', selectedValue: val1 },
      });
      pointer1++;
    } else {
      merged.push(val2);
      steps.push({
        id: stepId++,
        description: `${val1} > ${val2}，将 ${val2} 加入结果链表`,
        data: { list1: [...list1], list2: [...list2], merged: [...merged] },
        variables: { pointer1, pointer2: pointer2 + 1, selectedFrom: 'list2', selectedValue: val2 },
      });
      pointer2++;
    }
  }

  if (pointer1 < list1.length) {
    const remaining = list1.slice(pointer1);
    steps.push({
      id: stepId++,
      description: `list2 已遍历完，将 list1 剩余元素 [${remaining.join(', ')}] 加入结果`,
      data: { list1: [...list1], list2: [...list2], merged: [...merged, ...remaining] },
      variables: { pointer1, pointer2, remaining: 'list1' },
    });
    merged.push(...remaining);
  }

  if (pointer2 < list2.length) {
    const remaining = list2.slice(pointer2);
    steps.push({
      id: stepId++,
      description: `list1 已遍历完，将 list2 剩余元素 [${remaining.join(', ')}] 加入结果`,
      data: { list1: [...list1], list2: [...list2], merged: [...merged, ...remaining] },
      variables: { pointer1, pointer2, remaining: 'list2' },
    });
    merged.push(...remaining);
  }

  steps.push({
    id: stepId++,
    description: `合并完成！结果链表为 [${merged.join(', ')}]`,
    data: { list1: [...list1], list2: [...list2], merged: [...merged] },
    variables: { pointer1, pointer2, finished: true },
  });

  return steps;
}

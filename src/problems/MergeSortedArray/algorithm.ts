import { VisualizationStep } from "@/types";

export function generateMergeSortedArraySteps(
  nums1Input: number[],
  m: number,
  nums2Input: number[],
  n: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];

  // 复制数组以避免修改原数组
  const nums1 = [...nums1Input];
  const nums2 = [...nums2Input];

  let stepId = 0;

  // 初始状态
  steps.push({
    id: stepId++,
    description: `初始状态：nums1 = [${nums1.slice(0, m).join(", ")}${
      m < nums1.length ? ", ..." : ""
    }]，nums2 = [${nums2.join(", ")}]`,
    data: { nums1: [...nums1], nums2: [...nums2] },
    variables: {
      p1: m - 1,
      p2: n - 1,
      p: m + n - 1,
      m,
      n,
    },
  });

  let p1 = m - 1; // nums1 的有效元素末尾
  let p2 = n - 1; // nums2 的末尾
  let p = m + n - 1; // 合并后的末尾位置

  steps.push({
    id: stepId++,
    description: `初始化三个指针：p1 = ${p1}（nums1 有效元素末尾），p2 = ${p2}（nums2 末尾），p = ${p}（合并位置末尾）`,
    data: { nums1: [...nums1], nums2: [...nums2] },
    variables: { p1, p2, p, m, n },
    highlightedIndices: [],
  });

  // 从后向前合并
  while (p2 >= 0) {
    if (p1 >= 0 && nums1[p1] > nums2[p2]) {
      steps.push({
        id: stepId++,
        description: `比较 nums1[${p1}] = ${nums1[p1]} 和 nums2[${p2}] = ${nums2[p2]}，${nums1[p1]} > ${nums2[p2]}`,
        data: { nums1: [...nums1], nums2: [...nums2] },
        variables: {
          p1,
          p2,
          p,
          comparing: true,
          compareValue1: nums1[p1],
          compareValue2: nums2[p2],
          m,
          n,
        },
        highlightedIndices: [p1, p],
      });

      nums1[p] = nums1[p1];

      steps.push({
        id: stepId++,
        description: `将 nums1[${p1}] = ${nums1[p]} 放到位置 ${p}，然后 p1--`,
        data: { nums1: [...nums1], nums2: [...nums2] },
        variables: {
          p1: p1 - 1,
          p2,
          p,
          movedFrom: "nums1",
          movedValue: nums1[p],
          m,
          n,
        },
        highlightedIndices: [p],
      });

      p1--;
    } else {
      if (p1 >= 0) {
        steps.push({
          id: stepId++,
          description: `比较 nums1[${p1}] = ${nums1[p1]} 和 nums2[${p2}] = ${nums2[p2]}，${nums2[p2]} >= ${nums1[p1]}`,
          data: { nums1: [...nums1], nums2: [...nums2] },
          variables: {
            p1,
            p2,
            p,
            comparing: true,
            compareValue1: nums1[p1],
            compareValue2: nums2[p2],
            m,
            n,
          },
          highlightedIndices: [p],
        });
      } else {
        steps.push({
          id: stepId++,
          description: `nums1 的有效元素已处理完（p1 < 0），直接复制 nums2[${p2}] = ${nums2[p2]}`,
          data: { nums1: [...nums1], nums2: [...nums2] },
          variables: {
            p1,
            p2,
            p,
            m,
            n,
          },
          highlightedIndices: [p],
        });
      }

      nums1[p] = nums2[p2];

      steps.push({
        id: stepId++,
        description: `将 nums2[${p2}] = ${nums1[p]} 放到位置 ${p}，然后 p2--`,
        data: { nums1: [...nums1], nums2: [...nums2] },
        variables: {
          p1,
          p2: p2 - 1,
          p,
          movedFrom: "nums2",
          movedValue: nums1[p],
          m,
          n,
        },
        highlightedIndices: [p],
      });

      p2--;
    }

    p--;
  }

  // 完成
  steps.push({
    id: stepId++,
    description: `合并完成！最终结果：[${nums1.join(", ")}]`,
    data: { nums1: [...nums1], nums2: [...nums2] },
    variables: {
      p1,
      p2,
      p,
      completed: true,
      m,
      n,
    },
    highlightedIndices: [],
  });

  return steps;
}

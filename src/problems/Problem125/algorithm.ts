import { VisualizationStep } from "@/types";

export function generateFindMedianSortedArraysSteps(
  nums1: number[],
  nums2: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 确保nums1是较短的数组
  if (nums1.length > nums2.length) {
    [nums1, nums2] = [nums2, nums1];
    steps.push({
      id: stepId++,
      description: `交换数组，确保nums1是较短的数组`,
      data: {
        nums1: [...nums1],
        nums2: [...nums2],
        left: 0,
        right: nums1.length,
        partition1: -1,
        partition2: -1,
      },
      variables: {
        nums1: [...nums1],
        nums2: [...nums2],
        left: 0,
        right: nums1.length,
        partition1: -1,
        partition2: -1,
        phase: "swap",
      },
    });
  }

  const m = nums1.length;
  const n = nums2.length;
  let left = 0;
  let right = m;

  steps.push({
    id: stepId++,
    description: `初始化：在nums1中使用二分查找寻找分割点，left=0, right=${right}`,
    data: {
      nums1: [...nums1],
      nums2: [...nums2],
      left,
      right,
      partition1: -1,
      partition2: -1,
    },
    variables: {
      nums1: [...nums1],
      nums2: [...nums2],
      left,
      right,
      partition1: -1,
      partition2: -1,
      phase: "init",
    },
  });

  // 二分查找
  while (left <= right) {
    const partition1 = Math.floor((left + right) / 2);
    const partition2 = Math.floor((m + n + 1) / 2) - partition1;

    steps.push({
      id: stepId++,
      description: `计算分割点：partition1 = ${partition1}, partition2 = ${partition2}`,
      data: {
        nums1: [...nums1],
        nums2: [...nums2],
        left,
        right,
        partition1,
        partition2,
      },
      variables: {
        nums1: [...nums1],
        nums2: [...nums2],
        left,
        right,
        partition1,
        partition2,
        phase: "calculate",
      },
    });

    const maxLeft1 = partition1 === 0 ? -Infinity : nums1[partition1 - 1];
    const minRight1 = partition1 === m ? Infinity : nums1[partition1];
    const maxLeft2 = partition2 === 0 ? -Infinity : nums2[partition2 - 1];
    const minRight2 = partition2 === n ? Infinity : nums2[partition2];

    steps.push({
      id: stepId++,
      description: `检查边界值：maxLeft1=${maxLeft1}, minRight1=${minRight1}, maxLeft2=${maxLeft2}, minRight2=${minRight2}`,
      data: {
        nums1: [...nums1],
        nums2: [...nums2],
        left,
        right,
        partition1,
        partition2,
        maxLeft1,
        minRight1,
        maxLeft2,
        minRight2,
      },
      variables: {
        nums1: [...nums1],
        nums2: [...nums2],
        left,
        right,
        partition1,
        partition2,
        maxLeft1,
        minRight1,
        maxLeft2,
        minRight2,
        phase: "check",
      },
    });

    if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
      // 找到正确的分割点
      let median: number;
      if ((m + n) % 2 === 0) {
        median =
          (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
        steps.push({
          id: stepId++,
          description: `找到正确分割点！中位数 = (max(${maxLeft1}, ${maxLeft2}) + min(${minRight1}, ${minRight2})) / 2 = ${median}`,
          data: {
            nums1: [...nums1],
            nums2: [...nums2],
            left,
            right,
            partition1,
            partition2,
            median,
            found: true,
          },
          variables: {
            nums1: [...nums1],
            nums2: [...nums2],
            left,
            right,
            partition1,
            partition2,
            median,
            found: true,
            phase: "found",
          },
        });
      } else {
        median = Math.max(maxLeft1, maxLeft2);
        steps.push({
          id: stepId++,
          description: `找到正确分割点！中位数 = max(${maxLeft1}, ${maxLeft2}) = ${median}`,
          data: {
            nums1: [...nums1],
            nums2: [...nums2],
            left,
            right,
            partition1,
            partition2,
            median,
            found: true,
          },
          variables: {
            nums1: [...nums1],
            nums2: [...nums2],
            left,
            right,
            partition1,
            partition2,
            median,
            found: true,
            phase: "found",
          },
        });
      }
      return steps;
    } else if (maxLeft1 > minRight2) {
      right = partition1 - 1;
      steps.push({
        id: stepId++,
        description: `maxLeft1 (${maxLeft1}) > minRight2 (${minRight2})，在左半部分继续查找，right = ${right}`,
        data: {
          nums1: [...nums1],
          nums2: [...nums2],
          left,
          right,
          partition1,
          partition2,
        },
        variables: {
          nums1: [...nums1],
          nums2: [...nums2],
          left,
          right,
          partition1,
          partition2,
          goLeft: true,
          phase: "go_left",
        },
      });
    } else {
      left = partition1 + 1;
      steps.push({
        id: stepId++,
        description: `maxLeft2 (${maxLeft2}) > minRight1 (${minRight1})，在右半部分继续查找，left = ${left}`,
        data: {
          nums1: [...nums1],
          nums2: [...nums2],
          left,
          right,
          partition1,
          partition2,
        },
        variables: {
          nums1: [...nums1],
          nums2: [...nums2],
          left,
          right,
          partition1,
          partition2,
          goRight: true,
          phase: "go_right",
        },
      });
    }
  }

  return steps;
}

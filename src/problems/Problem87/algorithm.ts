import { VisualizationStep } from "@/types";

/**
 * 课程表算法（拓扑排序 - BFS）
 * 
 * 时间复杂度：O(V + E)
 * 空间复杂度：O(V + E)
 */
export function generateCourseScheduleSteps(
  numCourses: number,
  prerequisites: number[][]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  
  // 构建邻接表和入度数组
  const graph: number[][] = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);
  
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }

  steps.push({
    id: steps.length,
    description: `初始化：${numCourses}门课程，${prerequisites.length}个先修关系`,
    data: {
      numCourses,
      prerequisites,
      graph,
      inDegree: [...inDegree],
    },
    variables: {
      phase: 'init',
      inDegree: [...inDegree],
      queue: [],
      completed: [],
      graphNodes: Array.from({ length: numCourses }, (_, i) => ({
        id: i,
        label: `课程${i}`,
        inDegree: inDegree[i],
      })),
      graphEdges: prerequisites.map(([to, from]) => ({
        from,
        to,
      })),
    },
  });

  // 将所有入度为0的课程加入队列
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  steps.push({
    id: steps.length,
    description: `找到${queue.length}门入度为0的课程加入队列：[${queue.join(', ')}]`,
    data: {
      queue: [...queue],
      inDegree: [...inDegree],
    },
    variables: {
      phase: 'enqueue',
      queue: [...queue],
      inDegree: [...inDegree],
      completed: [],
      graphNodes: Array.from({ length: numCourses }, (_, i) => ({
        id: i,
        label: `课程${i}`,
        inDegree: inDegree[i],
        isInQueue: queue.includes(i),
      })),
      graphEdges: prerequisites.map(([to, from]) => ({
        from,
        to,
      })),
    },
  });

  // BFS拓扑排序
  let count = 0;
  const completed: number[] = [];

  while (queue.length > 0) {
    const course = queue.shift()!;
    count++;
    completed.push(course);

    steps.push({
      id: steps.length,
      description: `从队列取出课程${course}，已完成${count}/${numCourses}门课程`,
      data: {
        currentCourse: course,
        queue: [...queue],
        completed: [...completed],
        inDegree: [...inDegree],
      },
      variables: {
        phase: 'process',
        currentCourse: course,
        queue: [...queue],
        completed: [...completed],
        inDegree: [...inDegree],
        count,
        graphNodes: Array.from({ length: numCourses }, (_, i) => ({
          id: i,
          label: `课程${i}`,
          inDegree: inDegree[i],
          isCurrent: i === course,
          isProcessed: completed.includes(i),
          isInQueue: queue.includes(i),
        })),
        graphEdges: prerequisites.map(([to, from]) => ({
          from,
          to,
          isCurrent: from === course,
        })),
      },
    });

    // 将后继课程的入度-1
    for (const next of graph[course]) {
      inDegree[next]--;

      steps.push({
        id: steps.length,
        description: `课程${next}的入度减1：${inDegree[next] + 1} → ${inDegree[next]}`,
        data: {
          currentCourse: course,
          nextCourse: next,
          queue: [...queue],
          completed: [...completed],
          inDegree: [...inDegree],
        },
        variables: {
          phase: 'update',
          currentCourse: course,
          nextCourse: next,
          queue: [...queue],
          completed: [...completed],
          inDegree: [...inDegree],
          count,
          graphNodes: Array.from({ length: numCourses }, (_, i) => ({
            id: i,
            label: `课程${i}`,
            inDegree: inDegree[i],
            isCurrent: i === next,
            isProcessed: completed.includes(i),
            isInQueue: queue.includes(i),
          })),
          graphEdges: prerequisites.map(([to, from]) => ({
            from,
            to,
            isCurrent: from === course && to === next,
            isVisited: from === course,
          })),
        },
      });

      if (inDegree[next] === 0) {
        queue.push(next);

        steps.push({
          id: steps.length,
          description: `课程${next}入度变为0，加入队列`,
          data: {
            nextCourse: next,
            queue: [...queue],
            completed: [...completed],
            inDegree: [...inDegree],
          },
          variables: {
            phase: 'enqueue',
            nextCourse: next,
            queue: [...queue],
            completed: [...completed],
            inDegree: [...inDegree],
            count,
            graphNodes: Array.from({ length: numCourses }, (_, i) => ({
              id: i,
              label: `课程${i}`,
              inDegree: inDegree[i],
              isCurrent: i === next,
              isProcessed: completed.includes(i),
              isInQueue: queue.includes(i),
            })),
            graphEdges: prerequisites.map(([to, from]) => ({
              from,
              to,
            })),
          },
        });
      }
    }
  }

  // 最终结果
  const canFinish = count === numCourses;

  steps.push({
    id: steps.length,
    description: canFinish
      ? `✓ 成功！所有${numCourses}门课程都可以完成`
      : `✗ 失败！只能完成${count}门课程，存在循环依赖`,
    data: {
      result: canFinish,
      completed: [...completed],
      count,
    },
    variables: {
      phase: 'result',
      result: canFinish,
      completed: [...completed],
      count,
      success: canFinish,
      graphNodes: Array.from({ length: numCourses }, (_, i) => ({
        id: i,
        label: `课程${i}`,
        inDegree: inDegree[i],
        isProcessed: completed.includes(i),
      })),
      graphEdges: prerequisites.map(([to, from]) => ({
        from,
        to,
        isVisited: true,
      })),
    },
  });

  return steps;
}

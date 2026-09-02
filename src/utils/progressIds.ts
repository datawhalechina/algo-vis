const CUDA_PROGRESS_OFFSET = 1_000_000;

export function getCudaProgressId(problemId: number): number {
  return CUDA_PROGRESS_OFFSET + problemId;
}

export interface ScopedProgressStats {
  total: number;
  completed: number;
  inProgress: number;
  favorite: number;
  completionRate: number;
}

export function getScopedProgressStats(
  ids: readonly number[],
  completedIds: ReadonlySet<number>,
  inProgressIds: ReadonlySet<number>,
  favoriteIds: ReadonlySet<number>,
): ScopedProgressStats {
  const completed = ids.filter((id) => completedIds.has(id)).length;
  const inProgress = ids.filter((id) => inProgressIds.has(id)).length;
  const favorite = ids.filter((id) => favoriteIds.has(id)).length;

  return {
    total: ids.length,
    completed,
    inProgress,
    favorite,
    completionRate: ids.length > 0
      ? Math.round((completed / ids.length) * 10_000) / 100
      : 0,
  };
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 滚动位置状态管理
 * 使用 sessionStorage 存储临时滚动位置（关闭标签页后清除）
 */

interface ScrollState {
  scrollPositions: Record<string, number>; // path -> scrollPosition
  saveScrollPosition: (path: string, position: number) => void;
  getScrollPosition: (path: string) => number | undefined;
  clearScrollPosition: (path: string) => void;
  clearAllScrollPositions: () => void;
}

export const useScrollStore = create<ScrollState>()(
  persist(
    (set, get) => ({
      scrollPositions: {},

      // 保存滚动位置
      saveScrollPosition: (path, position) => {
        set((state) => ({
          scrollPositions: { ...state.scrollPositions, [path]: position },
        }));
      },

      // 获取滚动位置
      getScrollPosition: (path) => {
        return get().scrollPositions[path];
      },

      // 清除指定路径的滚动位置
      clearScrollPosition: (path) => {
        set((state) => {
          const { [path]: _, ...rest } = state.scrollPositions;
          return { scrollPositions: rest };
        });
      },

      // 清除所有滚动位置
      clearAllScrollPositions: () => {
        set({ scrollPositions: {} });
      },
    }),
    {
      name: "scroll-positions", // sessionStorage key
      // 使用 sessionStorage 而不是 localStorage（临时数据）
      storage: {
        getItem: (name) => {
          try {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            sessionStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.warn("Failed to save scroll position:", error);
          }
        },
        removeItem: (name) => {
          try {
            sessionStorage.removeItem(name);
          } catch (error) {
            console.warn("Failed to remove scroll position:", error);
          }
        },
      },
    }
  )
);

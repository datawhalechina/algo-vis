import { useEffect, useLayoutEffect, useRef, RefObject } from "react";
import { useLocation } from "react-router-dom";
import { useScrollStore } from "@/store/useScrollStore";

/**
 * 滚动位置恢复 Hook
 *
 * @param path - 存储路径（如果不提供，使用当前路由路径）
 * @param containerRef - 滚动容器的 ref（如果不提供，使用 window）
 * @param enabled - 是否启用滚动位置保存（默认 true）
 */
export function useScrollRestore(
  path?: string,
  containerRef?: RefObject<HTMLElement>,
  enabled: boolean = true
) {
  const location = useLocation();
  const { saveScrollPosition, getScrollPosition } = useScrollStore();
  const scrollPath = path || location.pathname;
  const isRestoredRef = useRef<string | null>(null);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathRef = useRef<string | null>(null);

  // 在路由变化前保存当前滚动位置
  useLayoutEffect(() => {
    if (!enabled) return;

    const previousPath = previousPathRef.current;
    if (previousPath && previousPath !== scrollPath) {
      // 路径变化了，保存之前路径的滚动位置
      if (containerRef?.current) {
        const scrollTop = containerRef.current.scrollTop;
        saveScrollPosition(previousPath, scrollTop);
      } else {
        const scrollY = window.scrollY;
        saveScrollPosition(previousPath, scrollY);
      }
    }

    previousPathRef.current = scrollPath;
  }, [scrollPath, enabled, containerRef, saveScrollPosition]);

  // 恢复滚动位置（路径变化时重置）
  useLayoutEffect(() => {
    if (!enabled) return;

    // 路径变化时重置恢复状态
    if (isRestoredRef.current !== scrollPath) {
      isRestoredRef.current = null;
    }

    // 如果已经恢复过这个路径，跳过
    if (isRestoredRef.current === scrollPath) return;

    const savedPosition = getScrollPosition(scrollPath);
    if (savedPosition !== undefined && savedPosition > 0) {
      // 立即尝试恢复一次（在 DOM 更新前）
      const tryRestoreImmediate = () => {
        if (containerRef?.current) {
          const container = containerRef.current;
          if (container.scrollHeight >= savedPosition) {
            container.scrollTop = savedPosition;
            isRestoredRef.current = scrollPath;
            return true;
          }
        } else {
          const docHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
          );
          if (docHeight >= savedPosition) {
            window.scrollTo({ top: savedPosition, behavior: "instant" });
            isRestoredRef.current = scrollPath;
            return true;
          }
        }
        return false;
      };

      // 监听滚动事件，如果检测到被重置到顶部，立即恢复
      const handleScrollReset = () => {
        if (isRestoredRef.current === scrollPath) return;

        if (containerRef?.current) {
          const container = containerRef.current;
          if (
            container.scrollTop === 0 &&
            savedPosition > 0 &&
            container.scrollHeight >= savedPosition
          ) {
            container.scrollTop = savedPosition;
            isRestoredRef.current = scrollPath;
          }
        } else {
          if (window.scrollY === 0 && savedPosition > 0) {
            const docHeight = Math.max(
              document.documentElement.scrollHeight,
              document.body.scrollHeight
            );
            if (docHeight >= savedPosition) {
              window.scrollTo({ top: savedPosition, behavior: "instant" });
              isRestoredRef.current = scrollPath;
            }
          }
        }
      };

      const scrollTarget = containerRef?.current || window;
      scrollTarget.addEventListener("scroll", handleScrollReset, {
        passive: true,
      });

      // 先尝试立即恢复
      const restoredImmediately = tryRestoreImmediate();

      if (!restoredImmediately) {
        // 如果立即恢复失败，使用多次尝试机制
        let attempts = 0;
        const maxAttempts = 30;

        const tryRestore = () => {
          attempts++;

          if (containerRef?.current) {
            const container = containerRef.current;
            const currentScrollTop = container.scrollTop;

            if (container.scrollHeight >= savedPosition) {
              if (
                Math.abs(currentScrollTop - savedPosition) > 10 ||
                (currentScrollTop === 0 && savedPosition > 0)
              ) {
                container.scrollTop = savedPosition;
              }
              isRestoredRef.current = scrollPath;
              return true;
            }
          } else {
            const docHeight = Math.max(
              document.documentElement.scrollHeight,
              document.body.scrollHeight
            );
            const currentScrollY = window.scrollY;

            if (docHeight >= savedPosition) {
              if (
                Math.abs(currentScrollY - savedPosition) > 10 ||
                (currentScrollY === 0 && savedPosition > 0)
              ) {
                window.scrollTo({ top: savedPosition, behavior: "instant" });
              }
              isRestoredRef.current = scrollPath;
              return true;
            }
          }

          if (attempts < maxAttempts) {
            requestAnimationFrame(tryRestore);
          } else {
            // 超时后强制恢复
            if (containerRef?.current) {
              containerRef.current.scrollTop = savedPosition;
            } else {
              window.scrollTo({ top: savedPosition, behavior: "instant" });
            }
            isRestoredRef.current = scrollPath;
          }
          return false;
        };

        // 延迟开始尝试，确保懒加载组件有时间加载
        const timer = setTimeout(() => {
          requestAnimationFrame(tryRestore);
        }, 100);

        // 使用 MutationObserver 监听 DOM 变化，确保内容加载完成后恢复
        let observer: MutationObserver | null = null;
        if (containerRef?.current) {
          observer = new MutationObserver(() => {
            if (isRestoredRef.current !== scrollPath) {
              tryRestoreImmediate();
            }
          });
          observer.observe(containerRef.current, {
            childList: true,
            subtree: true,
            attributes: true,
          });
        } else {
          observer = new MutationObserver(() => {
            if (isRestoredRef.current !== scrollPath) {
              tryRestoreImmediate();
            }
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
        }

        // 定期检查，防止 React Router 重置滚动
        const checkTimer = setInterval(() => {
          if (isRestoredRef.current === scrollPath) {
            clearInterval(checkTimer);
            scrollTarget.removeEventListener("scroll", handleScrollReset);
            if (observer) observer.disconnect();
            return;
          }
          handleScrollReset();
        }, 50);

        return () => {
          clearTimeout(timer);
          clearInterval(checkTimer);
          scrollTarget.removeEventListener("scroll", handleScrollReset);
          if (observer) observer.disconnect();
        };
      } else {
        // 即使立即恢复成功，也要监听一段时间，防止被重置
        const checkTimer = setInterval(() => {
          if (isRestoredRef.current === scrollPath) {
            clearInterval(checkTimer);
            scrollTarget.removeEventListener("scroll", handleScrollReset);
            return;
          }
          handleScrollReset();
        }, 50);

        // 3秒后停止监听（假设此时已经稳定）
        const stopTimer = setTimeout(() => {
          clearInterval(checkTimer);
          scrollTarget.removeEventListener("scroll", handleScrollReset);
        }, 3000);

        return () => {
          clearTimeout(stopTimer);
          clearInterval(checkTimer);
          scrollTarget.removeEventListener("scroll", handleScrollReset);
        };
      }
    } else {
      isRestoredRef.current = scrollPath;
    }
  }, [scrollPath, enabled, containerRef, getScrollPosition]);

  // 保存滚动位置（使用节流优化性能）
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      // 清除之前的定时器
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }

      // 节流：每 100ms 保存一次
      throttleTimerRef.current = setTimeout(() => {
        if (containerRef?.current) {
          // 容器滚动
          const scrollTop = containerRef.current.scrollTop;
          saveScrollPosition(scrollPath, scrollTop);
        } else {
          // window 滚动
          const scrollY = window.scrollY;
          saveScrollPosition(scrollPath, scrollY);
        }
      }, 100);
    };

    const containerElement = containerRef?.current;
    const scrollTarget = containerElement || window;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });

    // 在页面卸载前保存（beforeunload 事件）
    const handleBeforeUnload = () => {
      if (containerElement) {
        const scrollTop = containerElement.scrollTop;
        saveScrollPosition(scrollPath, scrollTop);
      } else {
        const scrollY = window.scrollY;
        saveScrollPosition(scrollPath, scrollY);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
        // 清理时立即保存一次（仍然使用此次 effect 中拍下来的 containerElement）
        if (containerElement) {
          const scrollTop = containerElement.scrollTop;
          saveScrollPosition(scrollPath, scrollTop);
        } else {
          const scrollY = window.scrollY;
          saveScrollPosition(scrollPath, scrollY);
        }
      }
    };
  }, [scrollPath, enabled, containerRef, saveScrollPosition]);
}

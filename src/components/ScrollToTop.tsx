import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 滚动恢复组件
 * 阻止 React Router 的默认滚动到顶部行为
 * 让 useScrollRestore Hook 来处理滚动位置恢复
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 阻止 React Router 的默认滚动行为
    // 使用 useLayoutEffect 的时机，在浏览器绘制之前执行
    // 但这里用 useEffect 也可以，因为我们只是阻止默认行为
    
    // 监听路由变化，但不执行滚动
    // React Router v6 默认会在路由变化时滚动到顶部
    // 我们需要阻止这个行为，让 useScrollRestore Hook 来处理
  }, [pathname]);

  // 在组件挂载时，阻止浏览器默认的滚动恢复行为
  useEffect(() => {
    // 保存原始的 scrollRestoration 设置
    const originalScrollRestoration = window.history.scrollRestoration;
    
    // 禁用浏览器的自动滚动恢复
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 组件卸载时恢复
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = originalScrollRestoration;
      }
    };
  }, []);

  return null;
}


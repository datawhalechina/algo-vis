import { MouseEvent, PropsWithChildren, useRef, useState } from "react";

interface HorizontalDragContainerProps {
  className?: string;
}

/**
 * 通用水平拖动容器
 * - 支持滚轮/触控板横向滚动（依赖浏览器）
 * - 支持鼠标按住拖动（类似抓手 ✋）
 */
export function HorizontalDragContainer({
  children,
  className = "",
}: PropsWithChildren<HorizontalDragContainerProps>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragStartX(event.clientX);
    setScrollStartLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    event.preventDefault();
    const deltaX = event.clientX - dragStartX;
    scrollRef.current.scrollLeft = scrollStartLeft - deltaX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={scrollRef}
      className={`w-full overflow-x-auto pb-2 select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="inline-flex min-w-max">{children}</div>
    </div>
  );
}



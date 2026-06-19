"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const dot = useRef({ x: 0, y: 0 });
  const outline = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const moveDot = (e: MouseEvent) => {
      dot.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      outline.current.x += (dot.current.x - outline.current.x) * 0.12;
      outline.current.y += (dot.current.y - outline.current.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dot.current.x - 4}px, ${dot.current.y - 4}px)`;
      }
      if (outlineRef.current) {
        const size = isHovering ? 30 : 20;
        outlineRef.current.style.transform = `translate(${outline.current.x - size}px, ${outline.current.y - size}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => setIsHidden(false);
    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleHoverEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.dataset.cursor === "hover"
      ) {
        setIsHovering(true);
      }
    };

    const handleHoverLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", moveDot, { passive: true });
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleHoverEnter, { passive: true });
    document.addEventListener("mouseout", handleHoverLeave, { passive: true });

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", moveDot);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleHoverEnter);
      document.removeEventListener("mouseout", handleHoverLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isHovering]);

  return (
    <>
      <div
        ref={dotRef}
        className={cn(
          "cursor-dot pointer-events-none fixed z-[9999] transition-opacity duration-200",
          isHidden ? "opacity-0" : "opacity-100",
          isClicking ? "scale-50" : "scale-100"
        )}
        style={{ top: 0, left: 0 }}
        aria-hidden="true"
      />
      <div
        ref={outlineRef}
        className={cn(
          "pointer-events-none fixed z-[9998] rounded-full border transition-all duration-200",
          isHovering
            ? "w-[60px] h-[60px] border-gold-DEFAULT/80 bg-gold-DEFAULT/5"
            : "w-[40px] h-[40px] border-gold-DEFAULT/40",
          isHidden ? "opacity-0" : "opacity-100",
          isClicking ? "scale-75" : "scale-100"
        )}
        style={{ top: 0, left: 0 }}
        aria-hidden="true"
      />
    </>
  );
}

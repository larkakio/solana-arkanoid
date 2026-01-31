import { useEffect, useRef, useState } from "react";

export function useSwipeControls(canvasWidth: number, paddleWidth: number) {
  const [paddlePosition, setPaddlePosition] = useState(canvasWidth / 2);
  const [isTouching, setIsTouching] = useState(false);
  const lastTouchX = useRef<number | null>(null);

  useEffect(() => {
    setPaddlePosition(canvasWidth / 2);
  }, [canvasWidth]);

  useEffect(() => {
    const el = document.getElementById("game-canvas-wrapper");
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchX.current = e.touches[0].clientX;
      setIsTouching(true);
      if ("vibrate" in navigator) navigator.vibrate(10);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (lastTouchX.current === null) return;
      const deltaX = e.touches[0].clientX - lastTouchX.current;
      lastTouchX.current = e.touches[0].clientX;
      setPaddlePosition((prev) => {
        const newPos = prev + deltaX;
        return Math.max(paddleWidth / 2, Math.min(canvasWidth - paddleWidth / 2, newPos));
      });
    };

    const handleTouchEnd = () => {
      setIsTouching(false);
      lastTouchX.current = null;
    };

    const handleMouseDown = (e: MouseEvent) => {
      lastTouchX.current = e.clientX;
      setIsTouching(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (lastTouchX.current === null || !e.buttons) return;
      const deltaX = e.clientX - lastTouchX.current;
      lastTouchX.current = e.clientX;
      setPaddlePosition((prev) => {
        const newPos = prev + deltaX;
        return Math.max(paddleWidth / 2, Math.min(canvasWidth - paddleWidth / 2, newPos));
      });
    };

    const handleMouseUp = () => {
      setIsTouching(false);
      lastTouchX.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mouseleave", handleMouseUp);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [canvasWidth, paddleWidth]);

  return { paddlePosition, isTouching, setPaddlePosition: (pos: number) => setPaddlePosition(Math.max(paddleWidth / 2, Math.min(canvasWidth - paddleWidth / 2, pos))) };
}

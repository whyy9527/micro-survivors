// 虚拟摇杆 - 移动端触控控制

import React, { useRef, useEffect, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent): void => {
      if (!baseRef.current || !stickRef.current) return;

      const touch = e.touches[0];
      const rect = baseRef.current.getBoundingClientRect();

      // 检查是否在摇杆区域内
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        touchIdRef.current = touch.identifier;
        setActive(true);
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent): void => {
      if (!baseRef.current || !stickRef.current || touchIdRef.current === null) return;

      const touch = Array.from(e.touches).find((t) => t.identifier === touchIdRef.current);
      if (!touch) return;

      const rect = baseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;

      // 限制在摇杆半径内
      const maxRadius = rect.width / 2 - 20;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
      }

      // 更新摇杆位置
      stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;

      // 归一化输入 (-1 到 1)
      const normalizedX = dx / maxRadius;
      const normalizedY = dy / maxRadius;

      onMove(normalizedX, normalizedY);
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      if (touchIdRef.current === null) return;

      const touch = Array.from(e.changedTouches).find((t) => t.identifier === touchIdRef.current);
      if (!touch) return;

      touchIdRef.current = null;
      setActive(false);

      // 重置摇杆位置
      if (stickRef.current) {
        stickRef.current.style.transform = 'translate(0, 0)';
      }

      onMove(0, 0);
      e.preventDefault();
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onMove]);

  return (
    <div className="fixed bottom-8 left-8 pointer-events-auto z-20 md:hidden">
      <div
        ref={baseRef}
        className={`relative w-32 h-32 rounded-full transition-all ${
          active ? 'bg-white/30 scale-110' : 'bg-white/20'
        } border-4 border-white/40`}>
        <div
          ref={stickRef}
          className={`absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 rounded-full transition-all ${
            active ? 'bg-cyan-500 scale-110' : 'bg-white/60'
          } border-2 border-white`}
        />
      </div>
      <div className="text-center text-white text-xs mt-2 opacity-60">移动</div>
    </div>
  );
};

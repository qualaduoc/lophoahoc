import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const AntiCheatGuard = ({ children, onCheatingDetected }) => {
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (warnings === 1) {
      toast.warning("⚠️ CẢNH BÁO: Cấm chuyển tab khi đang làm bài! Lần thứ 2 sẽ tự động nộp bài 0 điểm.");
    } else if (warnings >= 2) {
      toast.error("🚫 VI PHẠM GIAN LẬN: Bài làm sẽ được nộp với điểm 0.");
      if (onCheatingDetected) onCheatingDetected();
    }
  }, [warnings, onCheatingDetected]);

  return (
    <div className="relative w-full h-full">
      {warnings >= 2 && (
        <div className="absolute inset-0 bg-red-50 z-50 flex flex-col items-center justify-center rounded-2xl">
          <div className="text-center">
            <p className="text-6xl mb-4">🚫</p>
            <h2 className="text-2xl font-black text-red-600 mb-2">HỦY BÀI THI</h2>
            <p className="text-red-500 font-medium">Lý do: Chuyển thẻ trình duyệt nhiều lần sai quy định.</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

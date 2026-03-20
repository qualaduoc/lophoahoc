import React, { useEffect, useState } from 'react';

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
      alert("CẢNH BÁO: Cấm chuyển tab khi đang làm bài. Lần thứ 2 tự động nộp bài 0 điểm!");
    } else if (warnings >= 2) {
      alert("VI PHẠM GIAN LẬN: Bài làm sẽ được nộp với điểm 0.");
      if (onCheatingDetected) onCheatingDetected();
    }
  }, [warnings, onCheatingDetected]);

  return (
    <div className="relative w-full h-full">
      {warnings >= 2 && (
        <div className="absolute inset-0 bg-red-100 z-50 flex flex-col items-center justify-center rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">HỦY BÀI THI</h2>
          <p className="text-red-700">Lý do: Chuyển thẻ trình duyệt nhiều lần sai quy định.</p>
        </div>
      )}
      {children}
    </div>
  );
};

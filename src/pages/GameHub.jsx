import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, ChevronRight, PlayCircle } from 'lucide-react';

const GAMES = [
  { 
    id: 'alchemy', 
    path: '/games/alchemy', 
    title: 'Thuật Sĩ Giả Kim', 
    desc: 'Kéo thả kết hợp các nguyên tố để tạo ra hợp chất mới và khám phá phản ứng hóa học kì thú.', 
    icon: '🧪', 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    upcoming: false
  },
  { 
    id: 'bonds', 
    path: '/games/bonds', 
    title: 'Kỹ Sư Liên Kết', 
    desc: 'Nối cáp dây điện nguyên tử. Thử thách kiến thức về hóa trị và liên kết cộng hóa trị.', 
    icon: '🧩', 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
    upcoming: false 
  },
  { 
    id: 'invaders', 
    path: '/games/invaders', 
    title: 'Pháo Đài Phương Trình', 
    desc: 'Thiên thạch phản ứng hóa học đang rơi! Cân bằng nhanh hệ số để tiêu diệt chúng.', 
    icon: '🚀', 
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200', 
    upcoming: false 
  },
  { 
    id: 'minesweeper', 
    path: '/games/minesweeper', 
    title: 'Chiến Thần Bản Tuần Hoàn', 
    desc: 'Dùng rada dữ kiện để tìm ra vị trí của các nguyên tố bí ẩn đang bị che khuất.', 
    icon: '🗺️', 
    color: 'bg-rose-100 text-rose-700 border-rose-200', 
    upcoming: false 
  }
];

const ENT_GAMES = [
  { 
    id: 'artillery', 
    path: '/games/artillery', 
    title: 'Pháo Binh Tọa Độ', 
    desc: 'Căn chỉnh góc bắn và lực để tiêu diệt mục tiêu. Game kinh điển!', 
    icon: '🎯', 
    color: 'bg-red-100 text-red-700 border-red-200', 
    upcoming: false 
  },
  { 
    id: 'rpg', 
    path: '/games/rpg', 
    title: 'Anh Hùng Viễn Chinh', 
    desc: 'Đối kháng Turn-based kiểu RPG. Chọn kỹ năng để đánh bại quái vật!', 
    icon: '⚔️', 
    color: 'bg-orange-100 text-orange-700 border-orange-200', 
    upcoming: false 
  },
  { 
    id: 'flappy', 
    path: '/games/flappy', 
    title: 'Flappy Bird', 
    desc: 'Bay lượn qua các ống cống. Không cần giới thiệu thêm!', 
    icon: '🐦', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
    upcoming: false 
  },
  { 
    id: 'snake', 
    path: '/games/snake', 
    title: 'Rắn Săn Mồi Neon', 
    desc: 'Game rắn săn mồi cổ điển nhưng với đồ họa Neon phát sáng.', 
    icon: '🐍', 
    color: 'bg-lime-100 text-lime-700 border-lime-200', 
    upcoming: false 
  }
];

export const GameHub = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
        {/* BG Decor */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10">
          <Gamepad2 className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm">
              Khu Khám Phá
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ĐẤU TRƯỜNG HÓA HỌC
          </h1>
          <p className="text-purple-100 max-w-2xl text-base md:text-lg font-medium">
            Học mà chơi, chơi mà học. Vượt qua các kỷ lục của bản thân và ghi tên vào bảng vàng thành tích!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GAMES.map(game => (
          <div 
            key={game.id} 
            className={`glass rounded-2xl p-6 border-2 transition-all flex flex-col h-full ${
              game.upcoming 
                ? 'border-gray-100 opacity-70 grayscale-[0.5]' 
                : 'border-transparent hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 group relative cursor-pointer'
            }`}
            onClick={() => !game.upcoming && navigate(game.path)}
          >
            <div className="flex gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 shadow-sm ${game.color}`}>
                {game.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-xl text-gray-800">{game.title}</h3>
                  {game.upcoming && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full uppercase">Sắp ra mắt</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{game.desc}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              {!game.upcoming ? (
                <>
                  <div className="text-xs font-bold text-gray-400">⚡ Server: Trái Đất</div>
                  <button className="flex items-center gap-1.5 text-sm font-bold text-purple-600 group-hover:text-purple-800 transition-colors">
                    <PlayCircle className="w-5 h-5" /> CHƠI NGAY
                  </button>
                </>
              ) : (
                <div className="text-xs font-bold text-gray-400 w-full text-center">Đang được đội ngũ phát triển...</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 mb-6 flex items-center gap-3">
        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-black text-white uppercase tracking-widest shadow-md">
          Zone Giải Trí
        </span>
        <h2 className="text-2xl font-black text-gray-800">ARCADE GAMES (Non-Hóa Học)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ENT_GAMES.map(game => (
          <div 
            key={game.id} 
            className={`glass rounded-2xl p-6 border-2 transition-all flex flex-col h-full ${
              game.upcoming 
                ? 'border-gray-100 opacity-70 grayscale-[0.5]' 
                : 'border-transparent hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1 group relative cursor-pointer'
            }`}
            onClick={() => !game.upcoming && navigate(game.path)}
          >
            <div className="flex gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 shadow-sm ${game.color}`}>
                {game.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-xl text-gray-800">{game.title}</h3>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{game.desc}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs font-bold text-gray-400">⚡ Server: Trái Đất</div>
              <button className="flex items-center gap-1.5 text-sm font-bold text-orange-600 group-hover:text-orange-800 transition-colors">
                <PlayCircle className="w-5 h-5" /> CHƠI NGAY
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

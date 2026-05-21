import { useState } from "react";
import { trendingGames } from "@/mocks/games";

interface RightSidebarProps {
  onGameClick?: (tag: string) => void;
}

export default function RightSidebar({ onGameClick }: RightSidebarProps) {
  return (
    <aside className="w-[280px] xl:w-[300px] shrink-0">
      <div className="sticky top-6 space-y-6">
        {/* Trending Games */}
        <div className="bg-[#27272a] rounded-2xl border border-[#3f3f46] p-5">
          <h3 className="text-[#f4f4f5] font-bold text-base mb-4 flex items-center gap-2">
            <i className="ri-fire-fill text-sky-400"></i>
            인기 게임
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {trendingGames.map((game) => (
              <button
                key={game.id}
                onClick={() => onGameClick?.(game.tag)}
                className="group flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-[#18181b] transition-all duration-200"
              >
                <div
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#3f3f46] group-hover:border-current transition-all duration-300"
                  style={{ color: game.color }}
                >
                  <img
                    src={game.icon}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[#a1a1aa] text-[11px] font-medium text-center leading-tight group-hover:text-[#f4f4f5] transition-colors">
                  {game.name.length > 5 ? game.name.slice(0, 4) + ".." : game.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="px-2">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#71717a]">
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">소개</a>
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">도움말</a>
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">약관</a>
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">개인정보</a>
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">쿠키</a>
          </div>
          <p className="text-xs text-[#52525b] mt-2">© 2026 GameClip</p>
        </div>
      </div>
    </aside>
  );
}
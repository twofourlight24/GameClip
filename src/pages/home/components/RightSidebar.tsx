import { useState } from "react";
import UploadPanel from "./UploadPanel";
import { trendingGames } from "@/mocks/games";

interface RightSidebarProps {
  onGameClick?: (tag: string) => void;
  showUploadPanel?: boolean;
}

export default function RightSidebar({ onGameClick, showUploadPanel }: RightSidebarProps) {
  return (
    <aside className="w-[240px] xl:w-[260px] shrink-0 max-h-[calc(100dvh-32px)] overflow-y-auto">
      <div className="sticky top-4 space-y-4">
        {/* Trending Games */}
        <div className="bg-[#27272a] rounded-2xl border border-[#3f3f46] p-4">
          <h3 className="text-[#f4f4f5] font-bold text-sm mb-3 flex items-center gap-2">
            <i className="ri-fire-fill text-sky-400"></i>
            인기 게임
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {trendingGames.map((game) => (
              <button
                key={game.id}
                onClick={() => onGameClick?.(game.tag)}
                className="group flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-[#18181b] transition-all duration-200"
              >
                <div
                  className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#3f3f46] group-hover:border-current transition-all duration-300"
                  style={{ color: game.color }}
                >
                  <img
                    src={game.icon}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[#a1a1aa] text-[10px] font-medium text-center leading-tight group-hover:text-[#f4f4f5] transition-colors">
                  {game.name.length > 5 ? game.name.slice(0, 4) + ".." : game.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="px-2">
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#71717a]">
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">소개</a>
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">도움말</a>
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">약관</a>
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">개인정보</a>
            <a href="#" className="hover:text-[#a1a1aa] transition-colors">쿠키</a>
          </div>
          <p className="text-[11px] text-[#52525b] mt-1.5">© 2026 GameClip</p>
        </div>

        {/* Upload Panel */}
        {showUploadPanel && <UploadPanel />}
      </div>
    </aside>
  );
}
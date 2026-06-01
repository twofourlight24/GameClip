import { trendingGames } from "@/mocks/games";
import { videos } from "@/mocks/videos";

interface RightSidebarProps {
  onGameClick?: (tag: string) => void;
}

const rankedVideos = [...videos].sort((a, b) => b.likes - a.likes).slice(0, 8);

const rankColors: Record<number, string> = {
  1: "text-amber-400 bg-amber-400/10",
  2: "text-slate-300 bg-slate-300/10",
  3: "text-orange-400 bg-orange-400/10",
};

export default function RightSidebar({ onGameClick }: RightSidebarProps) {
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

        {/* Video Rankings */}
        <div className="bg-[#27272a] rounded-2xl border border-[#3f3f46] p-4">
          <h3 className="text-[#f4f4f5] font-bold text-sm mb-3 flex items-center gap-2">
            <i className="ri-trophy-fill text-amber-400"></i>
            인기 클립 순위
          </h3>
          <div className="space-y-1.5">
            {rankedVideos.map((video, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={video.id}
                  className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#18181b] transition-all duration-200 cursor-pointer"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      isTop3 ? rankColors[rank] : "text-[#71717a] bg-[#18181b]"
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${isTop3 ? "" : "text-[10px]"}`}>
                      {rank}
                    </span>
                  </div>

                  <div className="w-8 h-10 rounded-md overflow-hidden shrink-0 bg-[#18181b]">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[#f4f4f5] text-[11px] font-medium leading-tight truncate group-hover:text-white transition-colors">
                      {video.title}
                    </p>
                    <p className="text-[#71717a] text-[10px] truncate mt-0.5">
                      {video.gameName}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <i className="ri-heart-3-fill text-[#ef4444] text-[10px]"></i>
                    <span className="text-[#a1a1aa] text-[10px] font-medium">
                      {formatLikes(video.likes)}
                    </span>
                  </div>
                </div>
              );
            })}
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
      </div>
    </aside>
  );
}

function formatLikes(likes: number) {
  if (likes >= 10000) return `${(likes / 10000).toFixed(0)}만`;
  if (likes >= 1000) return `${(likes / 1000).toFixed(1)}천`;
  return likes;
}

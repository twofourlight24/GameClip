import { useCallback, useEffect, useMemo, useState } from "react";
import { trendingGames } from "@/mocks/games";
import type { Video } from "@/mocks/videos";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

type UploadedVideo = {
  id: string;
  title?: string;
  originalName?: string;
  gameName?: string;
  genreTag?: string;
  genreTags?: string[];
  uploader?: string;
  avatarUrl?: string | null;
  isAnonymous?: boolean;
  canEdit?: boolean;
  hasPassword?: boolean;
  videoUrl: string;
  likes?: number;
  comments?: number;
};

interface RightSidebarProps {
  onGameClick?: (gameName: string) => void;
  selectedGameName?: string | null;
}

const rankColors: Record<number, string> = {
  1: "text-amber-400 bg-amber-400/10",
  2: "text-slate-300 bg-slate-300/10",
  3: "text-orange-400 bg-orange-400/10",
};

export default function RightSidebar({ onGameClick, selectedGameName = null }: RightSidebarProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isGameListExpanded, setIsGameListExpanded] = useState(false);

  const loadVideos = useCallback(async () => {
    const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos`, {
      credentials: "include",
    });
    const payload = (await response.json()) as UploadedVideo[];
    setVideos(Array.isArray(payload) ? payload.map(toRankVideo) : []);
  }, []);

  useEffect(() => {
    loadVideos().catch(() => setVideos([]));

    const handleVideosChanged = () => {
      loadVideos().catch(() => setVideos([]));
    };

    window.addEventListener("gameclip:videos-changed", handleVideosChanged);
    window.addEventListener("gameclip:auth-changed", handleVideosChanged);
    return () => {
      window.removeEventListener("gameclip:videos-changed", handleVideosChanged);
      window.removeEventListener("gameclip:auth-changed", handleVideosChanged);
    };
  }, [loadVideos]);

  const knownGameNames = useMemo(() => new Set(trendingGames.map((game) => game.name)), []);
  const customGameNames = useMemo(() => {
    return [...new Set(videos.map((video) => video.gameName).filter((gameName) => gameName && !knownGameNames.has(gameName)))]
      .sort((a, b) => a.localeCompare(b, "ko"));
  }, [knownGameNames, videos]);
  const topGames = useMemo(() => trendingGames.slice(0, 9), []);
  const moreGames = useMemo(() => trendingGames.slice(9), []);
  const rankedVideos = useMemo(() => {
    const rankingSource = selectedGameName
      ? videos.filter((video) => video.gameName === selectedGameName)
      : videos;

    return [...rankingSource].sort((a, b) => b.likes - a.likes).slice(0, 8);
  }, [selectedGameName, videos]);

  return (
    <aside className="w-[240px] xl:w-[260px] shrink-0 max-h-[calc(100dvh-32px)] overflow-y-auto">
      <div className="sticky top-4 space-y-4">
        {/* Trending Games */}
        <div className="bg-[#27272a] rounded-2xl border border-[#3f3f46] p-4">
          <h3 className="text-[#f4f4f5] font-bold text-sm mb-3 flex items-center gap-2">
            <i className="ri-fire-fill text-sky-400"></i>
            인기 게임
          </h3>
          <GameGrid games={topGames} selectedGameName={selectedGameName} onGameClick={onGameClick} />

          {(moreGames.length > 0 || customGameNames.length > 0) && (
            <div className="mt-2">
              {isGameListExpanded && (
                <div>
                  {moreGames.length > 0 && (
                    <GameGrid games={moreGames} selectedGameName={selectedGameName} onGameClick={onGameClick} />
                  )}

                  {customGameNames.length > 0 && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-[#202024] p-2">
                      <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold text-[#a1a1aa]">
                        <i className="ri-price-tag-3-line text-sky-400" />
                        <span>기타</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {customGameNames.map((gameName) => (
                          <button
                            key={gameName}
                            type="button"
                            onClick={() => onGameClick?.(gameName)}
                            className={`max-w-full rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                              selectedGameName === gameName
                                ? "border-sky-400 bg-sky-500/20 text-sky-100"
                                : "border-[#3f3f46] bg-[#18181b] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
                            }`}
                          >
                            <span className="block max-w-[150px] truncate">{gameName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsGameListExpanded((isExpanded) => !isExpanded)}
                className="mt-2 flex h-8 w-full items-center justify-center rounded-xl border border-white/10 bg-[#202024] text-[#a1a1aa] transition-colors hover:border-[#52525b] hover:text-white"
                aria-expanded={isGameListExpanded}
                aria-label={isGameListExpanded ? "게임 목록 접기" : "게임 목록 더 보기"}
              >
                <i className={`${isGameListExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-xl`} />
              </button>
            </div>
          )}
        </div>

        {/* Video Rankings */}
        <div className="bg-[#27272a] rounded-2xl border border-[#3f3f46] p-4">
          <h3 className="mb-3 flex min-w-0 items-center gap-2 text-sm font-bold text-[#f4f4f5]">
            <i className="ri-trophy-fill shrink-0 text-amber-400"></i>
            <span className="min-w-0 truncate">
              {selectedGameName ? `${selectedGameName} 인기 클립` : "인기 클립 순위"}
            </span>
          </h3>
          <div className="space-y-1.5">
            {rankedVideos.length > 0 ? rankedVideos.map((video, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <button
                  type="button"
                  key={video.id}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("gameclip:open-video", {
                        detail: { video, videoId: video.id },
                      }),
                    );
                  }}
                  className="group flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-all duration-200 hover:bg-[#18181b]"
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
                    {video.videoUrl ? (
                      <video
                        src={video.videoUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover object-top"
                      />
                    )}
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
                </button>
              );
            }) : (
              <p className="px-1 py-3 text-[11px] text-[#71717a]">
                {selectedGameName ? "선택한 게임의 인기 클립이 없습니다" : "아직 인기 클립이 없습니다"}
              </p>
            )}
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

function GameGrid({
  games,
  selectedGameName,
  onGameClick,
}: {
  games: typeof trendingGames;
  selectedGameName: string | null;
  onGameClick?: (gameName: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onGameClick?.(game.name)}
          className={`group flex min-w-0 flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all duration-200 hover:bg-[#18181b] ${
            selectedGameName === game.name ? "bg-[#18181b] ring-1 ring-sky-400/50" : ""
          }`}
        >
          <GameIcon name={game.name} color={game.color} src={game.icon} />
          <span className="w-full truncate text-center text-[10px] font-medium leading-tight text-[#a1a1aa] transition-colors group-hover:text-[#f4f4f5]">
            {game.name}
          </span>
        </button>
      ))}
    </div>
  );
}

function GameIcon({ name, color, src }: { name: string; color: string; src: string }) {
  const [hasImageError, setHasImageError] = useState(false);
  const initials = getGameInitials(name);

  return (
    <div
      className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#3f3f46] bg-[#18181b] transition-all duration-300 group-hover:border-current"
      style={{ color }}
    >
      {!hasImageError && src ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-center text-[11px] font-black leading-none text-white">
          {initials}
        </span>
      )}
    </div>
  );
}

function getGameInitials(name: string) {
  const compactName = name.replace(/\s+/g, "");
  if (!compactName) return "?";
  if (/^[a-z0-9!]+$/i.test(compactName)) return compactName.slice(0, 3).toUpperCase();
  return compactName.slice(0, 2);
}

function formatLikes(likes: number) {
  if (likes >= 10000) return `${(likes / 10000).toFixed(0)}만`;
  if (likes >= 1000) return `${(likes / 1000).toFixed(1)}천`;
  return likes;
}

function toRankVideo(video: UploadedVideo): Video {
  const gameName = video.gameName || "게임 미지정";
  const genreTags = Array.isArray(video.genreTags)
    ? video.genreTags
    : [video.genreTag].filter(Boolean);

  return {
    id: video.id,
    title: video.title || video.originalName || "제목 없는 영상",
    gameName,
    genreTags,
    thumbnail: "",
    videoUrl: video.videoUrl,
    views: "0",
    duration: "재생",
    uploader: video.uploader || "익명",
    isAnonymous: video.isAnonymous ?? false,
    canEdit: video.canEdit ?? true,
    hasPassword: video.hasPassword ?? false,
    avatar: video.avatarUrl || "",
    likes: video.likes ?? 0,
    comments: video.comments ?? 0,
    tags: [gameName, ...genreTags].filter(Boolean),
  };
}

function cleanApiBaseUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

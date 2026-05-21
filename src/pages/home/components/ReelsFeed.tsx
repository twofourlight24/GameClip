import { useState, useMemo } from "react";
import ReelsItem from "./ReelsItem";
import { videos } from "@/mocks/videos";

export default function ReelsFeed() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const gameTags = useMemo(() => {
    return [...new Set(videos.map((v) => v.gameTag))];
  }, []);

  const getGameName = (tag: string) => {
    const video = videos.find((v) => v.gameTag === tag);
    return video?.gameName || tag;
  };

  const filteredVideos = useMemo(() => {
    if (!selectedTag) return videos;
    return videos.filter((v) => v.gameTag === selectedTag);
  }, [selectedTag]);

  return (
    <div className="relative h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
      {/* Top overlay tabs */}
      <div className="sticky top-0 z-50 flex items-center justify-center pt-5 pb-3 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
        <span className="text-[15px] font-bold text-white transition-all duration-200">
          추천
        </span>
      </div>

      {/* Filter chips */}
      <div className="sticky top-12 z-40 px-4 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 w-fit mx-auto">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              selectedTag === null
                ? "bg-sky-500/90 border-sky-400 text-white shadow-lg shadow-sky-500/20"
                : "bg-black/50 border-white/20 text-white/80 backdrop-blur-md hover:bg-black/70"
            }`}
          >
            전체
          </button>
          {gameTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
                selectedTag === tag
                  ? "bg-sky-500/90 border-sky-400 text-white shadow-lg shadow-sky-500/20"
                  : "bg-black/50 border-white/20 text-white/80 backdrop-blur-md hover:bg-black/70"
              }`}
            >
              {getGameName(tag)}
            </button>
          ))}
        </div>
      </div>

      {/* Reels Items */}
      <div className="flex flex-col">
        {filteredVideos.map((video) => (
          <ReelsItem key={video.id} video={video} />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-[#a1a1aa]">
          <i className="ri-search-line text-5xl mb-4 text-[#52525b]" />
          <p className="text-base font-medium">해당 게임의 영상이 없습니다</p>
          <p className="text-sm text-[#71717a] mt-1">다른 게임을 선택해보세요</p>
        </div>
      )}
    </div>
  );
}
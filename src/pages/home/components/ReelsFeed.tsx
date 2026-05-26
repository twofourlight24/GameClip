import { useState, useMemo } from "react";
import ReelsItem from "./ReelsItem";
import PhotoGrid from "./PhotoGrid";
import { videos } from "@/mocks/videos";

interface ReelsFeedProps {
  selectedTag?: string | null;
  onTagChange?: (tag: string | null) => void;
}

export default function ReelsFeed({ selectedTag: propSelectedTag, onTagChange }: ReelsFeedProps) {
  const [internalSelectedTag, setInternalSelectedTag] = useState<string | null>(null);

  const selectedTag = propSelectedTag !== undefined ? propSelectedTag : internalSelectedTag;
  const setSelectedTag = (tag: string | null) => {
    if (onTagChange) {
      onTagChange(tag);
    } else {
      setInternalSelectedTag(tag);
    }
  };

  const gameTags = useMemo(() => {
    const tags = [...new Set(videos.map((v) => v.gameTag))];
    return tags.filter((tag) => tag !== "tekken" && tag !== "fconline");
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
    <div className="relative h-full overflow-y-auto scrollbar-hide">
      {/* Top overlay tabs */}
      <div className="sticky top-0 z-50 flex items-center justify-center pt-3 pb-2 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
        <span className="text-[14px] font-bold text-white transition-all duration-200">
          추천
        </span>
      </div>

      {/* Filter chips */}
      <div className="sticky top-10 z-40 px-3 py-1.5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 w-fit mx-auto">
          {gameTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border whitespace-nowrap ${
                selectedTag === tag
                  ? "bg-sky-500/90 border-sky-400 text-white shadow-lg shadow-sky-500/20"
                  : "bg-black/50 border-white/20 text-white/80 backdrop-blur-md hover:bg-black/70"
              }`}
            >
              {getGameName(tag)}
            </button>
          ))}
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              selectedTag === null
                ? "bg-sky-500/90 border-sky-400 text-white shadow-lg shadow-sky-500/20"
                : "bg-black/50 border-white/20 text-white/80 backdrop-blur-md hover:bg-black/70"
            }`}
          >
            전체
          </button>
        </div>
      </div>

      {/* Content: Photo Grid for "All", Reels for specific tag */}
      {selectedTag === null ? (
        <PhotoGrid
          videos={filteredVideos}
          onVideoClick={(v) => setSelectedTag(v.gameTag)}
        />
      ) : (
        <div className="flex flex-col snap-y snap-mandatory">
          {filteredVideos.map((video) => (
            <ReelsItem key={video.id} video={video} />
          ))}
        </div>
      )}

      {selectedTag !== null && filteredVideos.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-[#a1a1aa]">
          <i className="ri-search-line text-5xl mb-4 text-[#52525b]" />
          <p className="text-base font-medium">해당 게임의 영상이 없습니다</p>
          <p className="text-sm text-[#71717a] mt-1">다른 게임을 선택해보세요</p>
        </div>
      )}
    </div>
  );
}
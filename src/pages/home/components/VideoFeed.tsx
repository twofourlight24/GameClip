import { useState, useMemo } from "react";
import VideoCard from "./VideoCard";
import { videos } from "@/mocks/videos";

export default function VideoFeed() {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">("for-you");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract unique game tags from videos
  const gameTags = useMemo(() => {
    const tags = [...new Set(videos.map((v) => v.gameTag))];
    return tags;
  }, []);

  // Get game name by tag
  const getGameName = (tag: string) => {
    const video = videos.find((v) => v.gameTag === tag);
    return video?.gameName || tag;
  };

  // Filter videos by selected tag
  const filteredVideos = useMemo(() => {
    if (!selectedTag) return videos;
    return videos.filter((v) => v.gameTag === selectedTag);
  }, [selectedTag]);

  return (
    <div className="flex-1 min-w-0">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4 bg-[#27272a] rounded-full p-1 w-fit">
        <button
          onClick={() => setActiveTab("for-you")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "for-you"
              ? "bg-[#18181b] text-[#f4f4f5] shadow-sm font-semibold"
              : "text-[#a1a1aa] hover:text-[#f4f4f5]"
          }`}
        >
          추천
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "following"
              ? "bg-[#18181b] text-[#f4f4f5] shadow-sm font-semibold"
              : "text-[#a1a1aa] hover:text-[#f4f4f5]"
          }`}
        >
          팔로잉
        </button>
      </div>

      {/* Game Tag Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
            selectedTag === null
              ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
              : "bg-[#27272a] border-[#3f3f46] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
          }`}
        >
          전체
        </button>
        {gameTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              selectedTag === tag
                ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                : "bg-[#27272a] border-[#3f3f46] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
            }`}
          >
            #{getGameName(tag)}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-20 text-[#71717a]">
          <i className="ri-search-line text-4xl mb-3 block"></i>
          <p className="text-sm">해당 게임의 영상이 없습니다</p>
        </div>
      )}

      {/* Load more */}
      <div className="flex justify-center mt-10 mb-6">
        <button className="px-8 py-3 rounded-full bg-[#27272a] border border-[#3f3f46] text-[#f4f4f5] text-sm font-medium hover:bg-[#18181b] hover:border-sky-400/30 transition-all duration-200">
          더 보기
        </button>
      </div>
    </div>
  );
}
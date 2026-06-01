import { useState } from "react";
import type { Video } from "@/mocks/videos";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const displayedGenreTags = video.genreTags || video.tags?.filter((tag) => tag !== video.gameName) || [];

  return (
    <div
      className={`group relative rounded-xl overflow-hidden bg-[#27272a] cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg ${
        video.isHero ? "col-span-2 row-span-2" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`video-${video.gameName}`}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Play button on hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <i className="ri-play-fill text-white text-2xl md:text-3xl ml-1"></i>
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
          {video.duration}
        </div>

        <div className="absolute left-3 top-3 max-w-[calc(100%-84px)] rounded-full border border-sky-300/40 bg-sky-500/25 px-2.5 py-1 backdrop-blur-sm">
          <span className="flex items-center gap-1 truncate text-xs font-bold text-sky-50">
            <i className="ri-gamepad-line text-[13px]" />
            {video.gameName}
          </span>
        </div>

        {/* Hover border */}
        {isHovered && (
          <div className="absolute inset-0 rounded-xl border border-sky-400/40 pointer-events-none"></div>
        )}
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-semibold text-sm md:text-base leading-snug mb-2 line-clamp-2">
          {video.title}
        </h3>
        
        {displayedGenreTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {displayedGenreTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-medium text-white/75 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-[#27272a]">
            <i className="ri-user-line text-sm text-white/80" />
            {video.avatar ? (
              <img
                src={video.avatar}
                alt={video.uploader}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                className="absolute h-7 w-7 rounded-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-300 text-xs font-medium truncate">{video.uploader}</p>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-xs shrink-0">
            <span className="flex items-center gap-1">
              <i className="ri-eye-line text-sm"></i>
              {video.views}
            </span>
            <span className="flex items-center gap-1">
              <i className="ri-heart-3-line text-sm"></i>
              {(video.likes / 1000).toFixed(1)}k
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

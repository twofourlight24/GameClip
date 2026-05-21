import { useState } from "react";
import type { Video } from "@/mocks/videos";

interface ReelsItemProps {
  video: Video;
}

export default function ReelsItem({ video }: ReelsItemProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="h-full w-full snap-start relative flex flex-col items-center shrink-0">
      {/* Blurred background */}
      <div className="absolute inset-0">
        <img
          src={video.thumbnail}
          alt=""
          className="w-full h-full object-cover blur-[80px] scale-150 opacity-50"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Spacer for top sticky header (tabs + filter chips) */}
      <div className="h-[88px] shrink-0 w-full pointer-events-none" />

      {/* Main video container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-[460px] aspect-[9/16] max-h-full rounded-none md:rounded-2xl overflow-hidden shadow-2xl mx-auto">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Play button (centered) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
              <i className="ri-play-fill text-white text-3xl ml-1" />
            </div>
          </div>

          {/* Right side actions */}
          <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
            {/* Like */}
            <button
              onClick={() => setLiked(!liked)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform">
                <i
                  className={`${liked ? "ri-heart-3-fill text-red-500" : "ri-heart-3-line text-white"} text-[28px] drop-shadow-lg transition-colors`}
                />
              </div>
              <span className="text-white text-xs font-semibold drop-shadow-lg">
                {(video.likes / 1000).toFixed(1)}k
              </span>
            </button>

            {/* Comment */}
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform">
                <i className="ri-chat-1-line text-white text-[26px] drop-shadow-lg" />
              </div>
              <span className="text-white text-xs font-semibold drop-shadow-lg">
                {(video.comments / 1000).toFixed(1)}k
              </span>
            </button>

            {/* More */}
            <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
              <div className="w-10 h-10 flex items-center justify-center">
                <i className="ri-more-fill text-white text-[26px] drop-shadow-lg rotate-90" />
              </div>
            </button>

            {/* Spinning disc (music/avatar) */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 mt-1 animate-[spin_8s_linear_infinite]">
              <img
                src={video.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-16 p-4 pb-10 z-10">
            {/* Uploader */}
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={video.avatar}
                alt={video.uploader}
                className="w-9 h-9 rounded-full object-cover border border-white/30"
              />
              <span className="text-white text-sm font-bold drop-shadow-lg tracking-tight">
                {video.uploader}
              </span>
            </div>

            {/* Title */}
            <p className="text-white text-sm font-medium leading-relaxed mb-2.5 drop-shadow-lg line-clamp-2">
              {video.title}
            </p>

            {/* Game tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[11px] font-medium border border-white/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Music info */}
            <div className="flex items-center gap-2 overflow-hidden">
              <i className="ri-music-2-line text-white/80 text-sm shrink-0" />
              <div className="overflow-hidden relative w-44">
                <p className="text-white/80 text-xs whitespace-nowrap animate-[marquee_8s_linear_infinite]">
                  {video.gameName} - 오리지널 사운드 &middot; {video.duration}
                </p>
              </div>
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute top-4 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs font-medium z-10">
            {video.duration}
          </div>

          {/* Game name badge */}
          <div className="absolute top-4 left-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 z-10">
            <span className="text-white text-xs font-semibold">{video.gameName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
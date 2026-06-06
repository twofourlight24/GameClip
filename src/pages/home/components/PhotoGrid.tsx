import { Video } from "@/mocks/videos";

interface PhotoGridProps {
  videos: Video[];
  onVideoClick?: (video: Video) => void;
}

export default function PhotoGrid({ videos, onVideoClick }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-1 px-1 pb-8">
      {videos.map((video) => (
        <button
          type="button"
          key={video.id}
          className="relative aspect-square overflow-hidden group bg-black text-left"
          onClick={() => onVideoClick?.(video)}
        >
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              poster={video.thumbnail || undefined}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-2.5 pt-9">
            <div className="mb-1.5 flex min-w-0 items-center gap-1.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-[#27272a]">
                <i className="ri-user-line text-[13px] text-white/80" />
                {video.avatar ? (
                  <img
                    src={video.avatar}
                    alt={video.uploader}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="absolute h-6 w-6 rounded-full object-cover"
                  />
                ) : null}
              </div>
              <p className="min-w-0 truncate text-[11px] font-semibold text-white/85 drop-shadow">
                {video.uploader}
              </p>
            </div>
            <p className="line-clamp-2 text-[13px] font-bold leading-snug text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.75)] md:text-sm">
              {video.title}
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="min-w-0 truncate text-[10px] text-white/75">{video.gameName}</p>
              <div className="flex shrink-0 items-center gap-2 rounded-full bg-black/45 px-2 py-1 text-[10px] font-semibold text-white/95 backdrop-blur-sm">
                <span className="flex items-center gap-1 tabular-nums">
                  <i className="ri-eye-fill text-[11px] text-emerald-300" />
                  {video.views || formatCompactCount(video.viewCount ?? 0)}
                </span>
                <span className="flex items-center gap-1 tabular-nums">
                  <i className="ri-heart-3-fill text-[11px] text-red-500" />
                  {formatCompactCount(video.likes)}
                </span>
                <span className="flex items-center gap-1 tabular-nums">
                  <i className="ri-chat-1-fill text-[11px] text-sky-300" />
                  {formatCompactCount(video.comments)}
                </span>
              </div>
            </div>
          </div>

          {/* Video indicator */}
          <div className="absolute top-2 right-2 text-white z-10">
            <i className="ri-play-fill text-lg drop-shadow-md" />
          </div>
        </button>
      ))}
    </div>
  );
}

function formatCompactCount(count: number) {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
  return count;
}

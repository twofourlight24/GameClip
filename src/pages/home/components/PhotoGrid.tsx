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

          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 pt-8">
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
              <p className="min-w-0 truncate text-[10px] font-semibold text-white/85 drop-shadow">
                {video.uploader}
              </p>
            </div>
            <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-white drop-shadow">
              {video.title}
            </p>
            <p className="mt-1 truncate text-[10px] text-white/75">{video.gameName}</p>
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

import { Video } from "@/mocks/videos";

interface PhotoGridProps {
  videos: Video[];
  onVideoClick?: (video: Video) => void;
}

export default function PhotoGrid({ videos, onVideoClick }: PhotoGridProps) {
  const formatCount = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num);
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-1 px-1 pb-8">
      {videos.map((video) => (
        <div
          key={video.id}
          className="relative aspect-square overflow-hidden cursor-pointer group"
          onClick={() => onVideoClick?.(video)}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Video indicator */}
          <div className="absolute top-2 right-2 text-white z-10">
            <i className="ri-play-fill text-lg drop-shadow-md" />
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-5 text-white z-10">
            <div className="flex items-center gap-1.5">
              <i className="ri-heart-fill text-lg" />
              <span className="text-sm font-bold">{formatCount(video.likes)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="ri-chat-1-fill text-lg" />
              <span className="text-sm font-bold">{formatCount(video.comments)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
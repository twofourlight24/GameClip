import { useState } from "react";
import type { Video } from "@/mocks/videos";
import CommentPopup from "./CommentPopup";
import MoreOptionsPopup from "./MoreOptionsPopup";
import ReportPopup from "./ReportPopup";
import EditPopup from "./EditPopup";
import DeletePopup from "./DeletePopup";

interface ReelsItemProps {
  video: Video;
  showHeaderSpacer?: boolean;
  onUpdated?: (video: Video) => void;
  onDeleted?: (videoId: string) => void;
}

export default function ReelsItem({ video, showHeaderSpacer = true, onUpdated, onDeleted }: ReelsItemProps) {
  const [liked, setLiked] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleUpdated = (payload: Partial<Video>) => {
    onUpdated?.({
      ...video,
      ...payload,
      tags: [payload.gameName || video.gameName, payload.gameTag || video.gameTag].filter(Boolean),
    });
  };

  return (
    <div className="h-full w-full snap-start relative flex flex-col items-center shrink-0">
      {/* Blurred background */}
      <div className="absolute inset-0">
        {video.videoUrl ? (
          <video
            src={video.videoUrl}
            poster={video.thumbnail || undefined}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover blur-[80px] scale-150 opacity-40"
          />
        ) : (
          <img
            src={video.thumbnail}
            alt=""
            className="w-full h-full object-cover blur-[80px] scale-150 opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Spacer for top sticky header (tabs + filter chips) */}
      {showHeaderSpacer && <div className="h-[76px] shrink-0 w-full pointer-events-none" />}

      {/* Main video container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full aspect-[16/9] max-h-[calc(100dvh-110px)] mx-auto rounded-none overflow-hidden">
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              poster={video.thumbnail || undefined}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="w-full h-full bg-black object-contain"
            />
          ) : (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
          <div className="pointer-events-none absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Play button (centered) */}
          {!video.videoUrl && <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
              <i className="ri-play-fill text-white text-2xl ml-1" />
            </div>
          </div>}

          {/* Right side actions */}
          <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-4 z-10">
            {/* Like */}
            <button
              onClick={() => setLiked(!liked)}
              className="flex flex-col items-center gap-0.5 group"
            >
              <div className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform">
                <i
                  className={`${liked ? "ri-heart-3-fill text-red-500" : "ri-heart-3-line text-white"} text-[22px] drop-shadow-lg transition-colors`}
                />
              </div>
              <span className="text-white text-[11px] font-semibold drop-shadow-lg">
                {(video.likes / 1000).toFixed(1)}k
              </span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setIsCommentOpen(true)}
              className="flex flex-col items-center gap-0.5 group"
            >
              <div className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform">
                <i className="ri-chat-1-line text-white text-[20px] drop-shadow-lg" />
              </div>
              <span className="text-white text-[11px] font-semibold drop-shadow-lg">
                {(video.comments / 1000).toFixed(1)}k
              </span>
            </button>

            {/* More */}
            <button
              onClick={() => setIsMoreOpen(true)}
              className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
            >
              <div className="w-9 h-9 flex items-center justify-center">
                <i className="ri-more-fill text-white text-[20px] drop-shadow-lg rotate-90" />
              </div>
            </button>

            {/* Spinning disc (music/avatar) */}
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40 mt-1 animate-[spin_8s_linear_infinite]">
              {video.avatar ? (
                <img
                  src={video.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#27272a]">
                  <i className="ri-user-line text-white/80 text-sm" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom info */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-14 p-3 pb-8 z-10">
            {/* Uploader */}
            <div className="flex items-center gap-2 mb-2">
              {video.avatar ? (
                <img
                  src={video.avatar}
                  alt={video.uploader}
                  className="w-8 h-8 rounded-full object-cover border border-white/30"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-[#27272a]">
                  <i className="ri-user-line text-white/80 text-sm" />
                </div>
              )}
              <span className="text-white text-[13px] font-bold drop-shadow-lg tracking-tight">
                {video.uploader}
              </span>
            </div>

            {/* Title */}
            <p className="text-white text-[13px] font-medium leading-relaxed mb-2 drop-shadow-lg line-clamp-2">
              {video.title}
            </p>

            {/* Game tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {video.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[10px] font-medium border border-white/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Music info */}
            <div className="flex items-center gap-2 overflow-hidden">
              <i className="ri-music-2-line text-white/80 text-sm shrink-0" />
              <div className="overflow-hidden relative w-40">
                <p className="text-white/80 text-[11px] whitespace-nowrap animate-[marquee_8s_linear_infinite]">
                  {video.gameName} - 오리지널 사운드 &middot; {video.duration}
                </p>
              </div>
            </div>
          </div>

          {/* Duration badge */}
          <div className="pointer-events-none absolute top-3 right-2.5 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium z-10">
            {video.duration}
          </div>

          {/* Game name badge */}
          <div className="pointer-events-none absolute top-3 left-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 z-10">
            <span className="text-white text-[11px] font-semibold">{video.gameName}</span>
          </div>
        </div>
      </div>

      {/* Comment Popup */}
      <CommentPopup
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        videoTitle={video.title}
        commentCount={video.comments}
      />

      {/* More Options Popup */}
      <MoreOptionsPopup
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onReport={() => setIsReportOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {/* Report Popup */}
      <ReportPopup
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Edit Popup */}
      <EditPopup
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={handleUpdated}
        video={{
          id: video.id,
          title: video.title,
          gameName: video.gameName,
          gameTag: video.gameTag,
          uploader: video.uploader,
        }}
      />

      {/* Delete Popup */}
      <DeletePopup
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => onDeleted?.(video.id)}
        videoId={video.id}
        videoTitle={video.title}
      />
    </div>
  );
}

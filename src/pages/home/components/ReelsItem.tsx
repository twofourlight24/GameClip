import { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import type { Video } from "@/mocks/videos";
import CommentPopup from "./CommentPopup";
import MoreOptionsPopup from "./MoreOptionsPopup";
import ReportPopup from "./ReportPopup";
import EditPopup from "./EditPopup";
import DeletePopup from "./DeletePopup";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

interface ReelsItemProps {
  video: Video;
  showHeaderSpacer?: boolean;
  onUpdated?: (video: Video) => void;
  onDeleted?: (videoId: string) => void;
}

export default function ReelsItem({ video, showHeaderSpacer = true, onUpdated, onDeleted }: ReelsItemProps) {
  const playerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideControlsTimerRef = useRef<number | null>(null);
  const clickTimerRef = useRef<number | null>(null);
  const volumeFeedbackTimerRef = useRef<number | null>(null);
  const centerFeedbackTimerRef = useRef<number | null>(null);
  const likeMessageTimerRef = useRef<number | null>(null);
  const isPointerInsidePlayerRef = useRef(false);
  const [liked, setLiked] = useState(video.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [commentCount, setCommentCount] = useState(video.comments);
  const [isLikeSaving, setIsLikeSaving] = useState(false);
  const [likeMessage, setLikeMessage] = useState("");
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [volumeFeedbackVisible, setVolumeFeedbackVisible] = useState(false);
  const [centerFeedback, setCenterFeedback] = useState<{ icon: string; text: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoUiVisible = !video.videoUrl || controlsVisible;

  useEffect(() => {
    setLiked(video.likedByMe ?? false);
    setLikeCount(video.likes);
    setCommentCount(video.comments);
  }, [video.id, video.likedByMe, video.likes, video.comments]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return undefined;
    }

    const syncVideoState = () => {
      setIsPlaying(!videoElement.paused);
      setIsMuted(videoElement.muted || videoElement.volume === 0);
      setVolume(videoElement.volume);
      setCurrentTime(videoElement.currentTime || 0);
      setDuration(Number.isFinite(videoElement.duration) ? videoElement.duration : 0);
    };

    syncVideoState();
    videoElement.addEventListener("play", syncVideoState);
    videoElement.addEventListener("pause", syncVideoState);
    videoElement.addEventListener("volumechange", syncVideoState);
    videoElement.addEventListener("timeupdate", syncVideoState);
    videoElement.addEventListener("loadedmetadata", syncVideoState);

    return () => {
      videoElement.removeEventListener("play", syncVideoState);
      videoElement.removeEventListener("pause", syncVideoState);
      videoElement.removeEventListener("volumechange", syncVideoState);
      videoElement.removeEventListener("timeupdate", syncVideoState);
      videoElement.removeEventListener("loadedmetadata", syncVideoState);
    };
  }, [video.videoUrl]);

  const handleUpdated = (payload: Partial<Video>) => {
    onUpdated?.({
      ...video,
      ...payload,
      tags: [payload.gameName || video.gameName, payload.gameTag || video.gameTag].filter(Boolean),
    });
  };

  const scheduleControlsHide = useCallback(() => {
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }

    if (!isPlaying) {
      setControlsVisible(true);
      return;
    }

    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2600);
  }, [isPlaying]);

  useEffect(() => {
    scheduleControlsHide();

    return () => {
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [scheduleControlsHide]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        window.clearTimeout(clickTimerRef.current);
      }

      if (volumeFeedbackTimerRef.current) {
        window.clearTimeout(volumeFeedbackTimerRef.current);
      }

      if (centerFeedbackTimerRef.current) {
        window.clearTimeout(centerFeedbackTimerRef.current);
      }

      if (likeMessageTimerRef.current) {
        window.clearTimeout(likeMessageTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const hideVideoUi = () => {
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }

    setControlsVisible(false);
  };

  const handlePlayerMouseEnter = () => {
    isPointerInsidePlayerRef.current = true;
    revealControls();
  };

  const handlePlayerMouseLeave = () => {
    isPointerInsidePlayerRef.current = false;
    hideVideoUi();
  };

  const showCenterFeedback = useCallback((icon: string, text: string) => {
    setCenterFeedback({ icon, text });

    if (centerFeedbackTimerRef.current) {
      window.clearTimeout(centerFeedbackTimerRef.current);
    }

    centerFeedbackTimerRef.current = window.setTimeout(() => {
      setCenterFeedback(null);
    }, 650);
  }, []);

  const showLikeMessage = useCallback((message: string) => {
    setLikeMessage(message);

    if (likeMessageTimerRef.current) {
      window.clearTimeout(likeMessageTimerRef.current);
    }

    likeMessageTimerRef.current = window.setTimeout(() => {
      setLikeMessage("");
    }, 1800);
  }, []);

  const toggleLike = async () => {
    if (isLikeSaving) {
      return;
    }

    const nextLiked = !liked;
    const previousLiked = liked;
    const previousLikeCount = likeCount;

    setLiked(nextLiked);
    setLikeCount((currentCount) => Math.max(0, currentCount + (nextLiked ? 1 : -1)));
    setIsLikeSaving(true);
    setLikeMessage("");

    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos/${encodeURIComponent(video.id)}/like`, {
        method: nextLiked ? "POST" : "DELETE",
        credentials: "include",
      });
      const payload = (await readPayload(response)) as Partial<Video> & { message?: string };

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("로그인 후 하트를 누를 수 있습니다.");
        }

        throw new Error(payload.message || "좋아요를 저장하지 못했습니다.");
      }

      const savedLiked = payload.likedByMe ?? nextLiked;
      const savedLikeCount = typeof payload.likes === "number" ? payload.likes : Math.max(0, previousLikeCount + (nextLiked ? 1 : -1));
      setLiked(savedLiked);
      setLikeCount(savedLikeCount);
      onUpdated?.({
        ...video,
        ...payload,
        likedByMe: savedLiked,
        likes: savedLikeCount,
      });
    } catch (error) {
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      showLikeMessage(error instanceof Error ? error.message : "좋아요를 저장하지 못했습니다.");
    } finally {
      setIsLikeSaving(false);
    }
  };

  const handleCommentCountChange = useCallback((nextCommentCount: number) => {
    setCommentCount(nextCommentCount);
    onUpdated?.({
      ...video,
      comments: nextCommentCount,
    });
  }, [onUpdated, video]);

  const togglePlayback = useCallback(async (showFeedback = false) => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const willPlay = videoElement.paused;

    revealControls();

    if (willPlay) {
      await videoElement.play().catch(() => undefined);
    } else {
      videoElement.pause();
    }

    if (showFeedback) {
      showCenterFeedback(willPlay ? "ri-play-circle-fill" : "ri-pause-circle-fill", willPlay ? "재생" : "일시정지");
    }
  }, [revealControls, showCenterFeedback]);

  const handleVideoClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button,input")) {
      return;
    }

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = window.setTimeout(() => {
      void togglePlayback();
    }, 180);
  };

  const handleVideoDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button,input")) {
      return;
    }

    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
    }

    void toggleFullscreen();
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.currentTime = nextTime;
    }

    setCurrentTime(nextTime);
    revealControls();
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const shouldUnmute = videoElement.muted || videoElement.volume === 0;
    videoElement.muted = !shouldUnmute;

    if (shouldUnmute && videoElement.volume === 0) {
      videoElement.volume = 0.6;
    }

    setIsMuted(videoElement.muted);
    setVolume(videoElement.volume);
    revealControls();
    showVolumeFeedback();
  };

  const showVolumeFeedback = useCallback(() => {
    setVolumeFeedbackVisible(true);

    if (volumeFeedbackTimerRef.current) {
      window.clearTimeout(volumeFeedbackTimerRef.current);
    }

    volumeFeedbackTimerRef.current = window.setTimeout(() => {
      setVolumeFeedbackVisible(false);
    }, 900);
  }, []);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    videoElement.volume = nextVolume;
    videoElement.muted = nextVolume === 0;
    setVolume(nextVolume);
    setIsMuted(videoElement.muted);
    revealControls();
    showVolumeFeedback();
  };

  const toggleFullscreen = async () => {
    const playerElement = playerRef.current;

    if (!playerElement) {
      return;
    }

    revealControls();

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }

    await playerElement.requestFullscreen().catch(() => undefined);
  };

  const seekBy = useCallback((seconds: number) => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const nextTime = Math.min(Math.max(videoElement.currentTime + seconds, 0), duration || videoElement.duration || 0);
    videoElement.currentTime = nextTime;
    setCurrentTime(nextTime);
    revealControls();
    showCenterFeedback(seconds > 0 ? "ri-arrow-right-circle-fill" : "ri-arrow-left-circle-fill", seconds > 0 ? "5초 앞으로" : "5초 뒤로");
  }, [duration, revealControls, showCenterFeedback]);

  const changeVolumeBy = useCallback((delta: number) => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    const nextVolume = Math.min(Math.max(videoElement.volume + delta, 0), 1);
    videoElement.volume = nextVolume;
    videoElement.muted = nextVolume === 0;
    setVolume(nextVolume);
    setIsMuted(videoElement.muted);
    revealControls();
    showVolumeFeedback();
    showCenterFeedback(
      nextVolume === 0 ? "ri-volume-mute-fill" : "ri-volume-up-fill",
      `${Math.round(nextVolume * 100)}%`,
    );
  }, [revealControls, showCenterFeedback, showVolumeFeedback]);

  const handleWindowKeyDown = useCallback((event: KeyboardEvent) => {
    if (!video.videoUrl) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const isTypingTarget =
      target?.matches("input, textarea, select") || target?.isContentEditable;
    const isPlayerActive =
      isPointerInsidePlayerRef.current || document.fullscreenElement === playerRef.current;

    if (isTypingTarget || !isPlayerActive) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      seekBy(-5);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      seekBy(5);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      changeVolumeBy(0.1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      changeVolumeBy(-0.1);
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      void togglePlayback(true);
    }
  }, [changeVolumeBy, seekBy, togglePlayback, video.videoUrl]);

  useEffect(() => {
    window.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [handleWindowKeyDown]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
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
        <div
          ref={playerRef}
          className={`relative w-full aspect-[16/9] max-h-[calc(100dvh-110px)] mx-auto rounded-none overflow-hidden bg-black ${controlsVisible ? "cursor-default" : "cursor-none"} fullscreen:h-screen fullscreen:max-h-screen fullscreen:aspect-auto`}
          onClick={handleVideoClick}
          onDoubleClick={handleVideoDoubleClick}
          onMouseEnter={handlePlayerMouseEnter}
          onMouseMove={revealControls}
          onMouseLeave={handlePlayerMouseLeave}
          onTouchStart={handlePlayerMouseEnter}
        >
          {video.videoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnail || undefined}
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

          {/* Play button (centered) */}
          {!video.videoUrl && <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
              <i className="ri-play-fill text-white text-2xl ml-1" />
            </div>
          </div>}

          {video.videoUrl && (
            <>
              <div
                className={`pointer-events-none absolute inset-x-0 bottom-0 z-[7] h-[46%] bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-opacity duration-300 ${videoUiVisible ? "opacity-100" : "opacity-0"}`}
              />

              <div
                className={`pointer-events-none absolute inset-0 z-[8] flex items-center justify-center transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"}`}
              >
                <button
                  type="button"
                  onClick={() => void togglePlayback()}
                  className={`pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white shadow-xl backdrop-blur-md ring-1 ring-white/20 transition hover:bg-black/70 active:scale-95 ${isPlaying || centerFeedback ? "opacity-0" : "opacity-100"}`}
                  aria-label={isPlaying ? "일시정지" : "재생"}
                >
                  <i className={`${isPlaying ? "ri-pause-fill" : "ri-play-fill ml-0.5"} text-[34px]`} />
                </button>
              </div>

              <div
                className={`pointer-events-none absolute inset-0 z-[18] flex items-center justify-center transition-opacity duration-150 ${centerFeedback ? "opacity-100" : "opacity-0"}`}
                aria-hidden="true"
              >
                <div className="flex min-w-24 flex-col items-center justify-center gap-2 rounded-2xl bg-black/60 px-5 py-4 text-white shadow-2xl backdrop-blur-md ring-1 ring-white/15">
                  <i className={`${centerFeedback?.icon || "ri-play-fill"} text-[42px] leading-none`} />
                  <span className="text-sm font-bold tabular-nums">
                    {centerFeedback?.text}
                  </span>
                </div>
              </div>

              <div
                className={`absolute inset-x-0 bottom-0 z-20 px-4 pb-3 pt-12 transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
                onClick={(event) => event.stopPropagation()}
                onMouseMove={revealControls}
              >
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={Math.min(currentTime, duration || currentTime)}
                  onChange={handleSeek}
                  onFocus={(event) => event.currentTarget.blur()}
                  tabIndex={-1}
                  aria-label="재생 위치"
                  className="h-5 w-full cursor-pointer accent-white"
                />

                <div className="flex min-h-11 flex-wrap items-center gap-2 text-white sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => void togglePlayback()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95"
                    aria-label={isPlaying ? "일시정지" : "재생"}
                  >
                    <i className={`${isPlaying ? "ri-pause-fill" : "ri-play-fill"} text-2xl`} />
                  </button>

                  <div className="group/volume relative flex h-10 items-center rounded-full bg-white/10 transition-[width,background-color] duration-200 hover:bg-white/20">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full active:scale-95"
                      aria-label={isMuted ? "음소거 해제" : "음소거"}
                    >
                      <i className={`${isMuted ? "ri-volume-mute-fill" : "ri-volume-up-fill"} text-xl`} />
                    </button>

                    <div className="grid w-0 grid-cols-[0fr] overflow-hidden pr-0 transition-[width,grid-template-columns,padding] duration-200 group-hover/volume:w-28 group-hover/volume:grid-cols-[1fr] group-hover/volume:pr-3">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        onFocus={(event) => event.currentTarget.blur()}
                        tabIndex={-1}
                        aria-label="볼륨"
                        className="min-w-0 cursor-pointer accent-white"
                      />
                    </div>

                    <div
                      className={`pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 rounded-md bg-black/75 px-2 py-1 text-[11px] font-semibold tabular-nums text-white shadow-lg transition-opacity duration-150 ${volumeFeedbackVisible ? "opacity-100" : "opacity-0"}`}
                    >
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void toggleFullscreen()}
                    className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95"
                    aria-label={isFullscreen ? "전체화면 종료" : "전체화면"}
                  >
                    <i className={`${isFullscreen ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"} text-xl`} />
                  </button>

                  <div className="ml-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleLike()}
                      disabled={isLikeSaving}
                      className="relative flex h-10 min-w-10 items-center justify-center gap-1 rounded-full bg-white/10 px-2 hover:bg-white/20 active:scale-95 disabled:cursor-wait disabled:opacity-80"
                      aria-label="좋아요"
                      aria-pressed={liked}
                    >
                      <i
                        className={`${liked ? "ri-heart-3-fill text-red-500" : "ri-heart-3-line text-white"} text-xl transition-colors`}
                      />
                      <span className="text-[11px] font-semibold tabular-nums text-white/95">
                        {formatCompactCount(likeCount)}
                      </span>
                      {likeMessage && (
                        <span className="pointer-events-none absolute bottom-12 right-0 w-max max-w-[210px] rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold text-white shadow-lg">
                          {likeMessage}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCommentOpen(true)}
                      className="flex h-10 min-w-10 items-center justify-center gap-1 rounded-full bg-white/10 px-2 hover:bg-white/20 active:scale-95"
                      aria-label="댓글"
                    >
                      <i className="ri-chat-1-line text-xl text-white" />
                      <span className="text-[11px] font-semibold tabular-nums text-white/95">
                        {formatCompactCount(commentCount)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMoreOpen(true)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95"
                      aria-label="더보기"
                    >
                      <i className="ri-more-fill rotate-90 text-xl text-white" />
                    </button>
                  </div>

                  <span className="ml-3 min-w-[88px] text-xs font-semibold tabular-nums text-white/95">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Bottom info */}
          <div className={`pointer-events-none absolute left-0 right-14 p-3 pb-8 z-10 transition-[bottom,opacity] duration-300 ${video.videoUrl && videoUiVisible ? "bottom-16" : "bottom-0"} ${videoUiVisible ? "opacity-100" : "opacity-0"}`}>
            {/* Uploader */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-[#27272a]">
                <i className="ri-user-line text-white/80 text-sm" />
                {video.avatar ? (
                  <img
                    src={video.avatar}
                    alt={video.uploader}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="absolute h-8 w-8 rounded-full object-cover"
                  />
                ) : null}
              </div>
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

          </div>
        </div>
      </div>

      {/* Comment Popup */}
      <CommentPopup
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        videoId={video.id}
        videoTitle={video.title}
        commentCount={commentCount}
        onCommentCountChange={handleCommentCountChange}
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

async function readPayload(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function cleanApiBaseUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function formatCompactCount(count: number) {
  if (count >= 10000) return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1)}만`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
  return String(count);
}

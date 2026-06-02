import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReelsItem from "./ReelsItem";
import PhotoGrid from "./PhotoGrid";
import type { Video } from "@/mocks/videos";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

type UploadedVideo = {
  id: string;
  title?: string;
  originalName?: string;
  gameName?: string;
  genreTag?: string;
  genreTags?: string[];
  uploader?: string;
  avatarUrl?: string | null;
  isAnonymous?: boolean;
  canEdit?: boolean;
  hasPassword?: boolean;
  size?: number;
  videoUrl: string;
  likes?: number;
  likedByMe?: boolean;
  comments?: number;
};

interface ReelsFeedProps {
  selectedGameName?: string | null;
  onGameNameChange?: (gameName: string | null) => void;
  homeResetKey?: number;
}

export default function ReelsFeed({ selectedGameName, onGameNameChange: _onGameNameChange, homeResetKey = 0 }: ReelsFeedProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);

  const loadVideos = useCallback(async (options?: { signal?: AbortSignal; showLoading?: boolean }) => {
    const showLoading = options?.showLoading ?? false;

    if (showLoading) {
      setIsLoading(true);
    }
    setErrorMessage("");

    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos`, {
        signal: options?.signal,
        credentials: "include",
      });
      const payload = (await readPayload(response)) as UploadedVideo[] | { message?: string };

      if (!response.ok) {
        throw new Error(!Array.isArray(payload) && payload.message ? payload.message : "영상을 불러오지 못했습니다.");
      }

      const nextVideos = Array.isArray(payload) ? payload.map(toFeedVideo) : [];
      setVideos(nextVideos);
      setActiveVideo((currentActiveVideo) => {
        if (!currentActiveVideo) return currentActiveVideo;
        return nextVideos.find((video) => video.id === currentActiveVideo.id) || null;
      });
    } catch (error) {
      if (options?.signal?.aborted) return;
      setVideos([]);
      setErrorMessage(error instanceof Error ? error.message : "영상을 불러오지 못했습니다.");
    } finally {
      if (!options?.signal?.aborted && showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadVideos({ signal: controller.signal, showLoading: true });

    return () => controller.abort();
  }, [loadVideos]);

  useEffect(() => {
    const handleVideosChanged = () => {
      loadVideos();
    };

    window.addEventListener("gameclip:videos-changed", handleVideosChanged);
    window.addEventListener("gameclip:auth-changed", handleVideosChanged);
    return () => {
      window.removeEventListener("gameclip:videos-changed", handleVideosChanged);
      window.removeEventListener("gameclip:auth-changed", handleVideosChanged);
    };
  }, [loadVideos]);

  useEffect(() => {
    const handleOpenVideo = (event: Event) => {
      const detail = (event as CustomEvent<{ video?: Video; videoId?: string }>).detail;
      const videoId = detail?.videoId;
      if (!videoId) return;

      const nextActiveVideo = videos.find((video) => video.id === videoId) || detail?.video;
      if (nextActiveVideo) {
        setActiveVideo(nextActiveVideo);
      }
    };

    window.addEventListener("gameclip:open-video", handleOpenVideo);
    return () => {
      window.removeEventListener("gameclip:open-video", handleOpenVideo);
    };
  }, [videos]);

  const handleVideoUpdated = (updatedVideo: Video) => {
    setActiveVideo(updatedVideo);
    setVideos((currentVideos) =>
      currentVideos.map((video) => (video.id === updatedVideo.id ? updatedVideo : video)),
    );
  };

  const handleVideoDeleted = (videoId: string) => {
    setVideos((currentVideos) => currentVideos.filter((video) => video.id !== videoId));
    setActiveVideo(null);
  };

  const filteredVideos = useMemo(() => {
    if (!selectedGameName) return videos;
    return videos.filter((video) => video.gameName === selectedGameName);
  }, [selectedGameName, videos]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    setActiveVideo(null);
    feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [homeResetKey]);

  if (activeVideo) {
    return createPortal(
      <div
        className="fixed inset-y-0 left-[72px] right-0 z-[70] overflow-hidden bg-black lg:left-[210px]"
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setActiveVideo(null)}
          className="absolute left-3 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15"
          aria-label="그리드로 돌아가기"
        >
          <i className="ri-arrow-left-line text-xl" />
        </button>
        <ReelsItem
          video={activeVideo}
          showHeaderSpacer={false}
          onUpdated={handleVideoUpdated}
          onDeleted={handleVideoDeleted}
        />
      </div>,
      document.body,
    );
  }

  return (
    <div ref={feedRef} className="relative h-full overflow-y-auto scrollbar-hide">
      {/* Top overlay tabs */}
      <div className="sticky top-0 z-50 flex items-center justify-center pt-3 pb-2 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
        <span className="text-[14px] font-bold text-white transition-all duration-200">
          추천
        </span>
      </div>

      {isLoading && (
        <div className="flex h-[calc(100%-48px)] flex-col items-center justify-center text-[#a1a1aa]">
          <i className="ri-loader-4-line mb-3 text-3xl text-sky-400 animate-spin" />
          <p className="text-sm font-medium">업로드된 영상을 불러오는 중입니다</p>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="flex h-[calc(100%-48px)] flex-col items-center justify-center px-6 text-center text-[#a1a1aa]">
          <i className="ri-error-warning-line mb-3 text-4xl text-[#52525b]" />
          <p className="text-base font-medium">영상을 불러오지 못했습니다</p>
          <p className="mt-1 text-sm text-[#71717a]">{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && filteredVideos.length > 0 && (
        <PhotoGrid
          videos={filteredVideos}
          onVideoClick={(video) => setActiveVideo(video)}
        />
      )}

      {!isLoading && !errorMessage && filteredVideos.length === 0 && (
        <div className="flex h-[calc(100%-48px)] flex-col items-center justify-center text-[#a1a1aa]">
          <i className="ri-film-line mb-4 text-5xl text-[#52525b]" />
          <p className="text-base font-medium">
            {selectedGameName ? "선택한 게임의 영상이 없습니다" : "아직 업로드된 영상이 없습니다"}
          </p>
        </div>
      )}
    </div>
  );
}

function toFeedVideo(video: UploadedVideo): Video {
  const gameName = video.gameName || "게임 미지정";
  const genreTags = Array.isArray(video.genreTags)
    ? video.genreTags
    : [video.genreTag].filter(Boolean);

  return {
    id: video.id,
    title: video.title || video.originalName || "제목 없는 영상",
    gameName,
    genreTags,
    thumbnail: "",
    videoUrl: video.videoUrl,
    views: "0",
    duration: "재생",
    uploader: video.uploader || "익명",
    isAnonymous: video.isAnonymous ?? false,
    canEdit: video.canEdit ?? true,
    hasPassword: video.hasPassword ?? false,
    avatar: video.avatarUrl || "",
    likes: video.likes ?? 0,
    likedByMe: video.likedByMe ?? false,
    comments: video.comments ?? 0,
    tags: [gameName, ...genreTags].filter(Boolean),
  };
}

async function readPayload(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function cleanApiBaseUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

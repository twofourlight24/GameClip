import { useState, useRef, useEffect } from "react";

interface EditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (video: Partial<VideoPayload>) => void;
  video: {
    id: string;
    title: string;
    gameName: string;
    gameTag: string;
    uploader: string;
  };
}

type VideoPayload = {
  id: string;
  title?: string;
  gameName?: string;
  gameTag?: string;
  uploader?: string;
  message?: string;
};

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

export default function EditPopup({ isOpen, onClose, onUpdated, video }: EditPopupProps) {
  const [title, setTitle] = useState(video.title);
  const [gameName, setGameName] = useState(video.gameName);
  const [gameTag, setGameTag] = useState(video.gameTag);
  const [uploader, setUploader] = useState(video.uploader);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setTitle(video.title);
      setGameName(video.gameName);
      setGameTag(video.gameTag);
      setUploader(video.uploader);
      setPassword("");
      setError("");
      setIsSaving(false);
    }
  }, [isOpen, video]);

  const handleSave = async () => {
    if (!title.trim() || !gameName.trim() || !gameTag.trim() || !uploader.trim()) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          gameName,
          gameTag,
          uploader,
          password,
        }),
      });
      const payload = (await readPayload(response)) as VideoPayload;

      if (!response.ok) {
        throw new Error(payload.message || `수정에 실패했습니다. (${response.status})`);
      }

      setPassword("");
      onUpdated?.(payload);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={popupRef}
        className="relative z-10 w-[92vw] sm:w-[480px] md:w-[25vw] md:min-w-[380px] md:max-w-[480px] h-[70vh] max-h-[600px] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <h3 className="text-white text-sm font-bold">영상 정보 편집</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        <>
          {/* Form */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[#a1a1aa] text-xs font-medium">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors"
                />
              </div>

              {/* Game name */}
              <div className="space-y-1.5">
                <label className="text-[#a1a1aa] text-xs font-medium">게임명</label>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors"
                />
              </div>

            {/* Game tag */}
            <div className="space-y-1.5">
              <label className="text-[#a1a1aa] text-xs font-medium">태그</label>
              <input
                type="text"
                value={gameTag}
                onChange={(e) => setGameTag(e.target.value)}
                placeholder="예: fps"
                disabled={isSaving}
                className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors"
              />
            </div>

            {/* Uploader */}
            <div className="space-y-1.5">
              <label className="text-[#a1a1aa] text-xs font-medium">닉네임</label>
              <input
                type="text"
                value={uploader}
                onChange={(e) => setUploader(e.target.value)}
                placeholder="업로드에 표시될 닉네임"
                disabled={isSaving}
                className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[#a1a1aa] text-xs font-medium">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호가 설정된 영상이면 입력"
                autoComplete="current-password"
                disabled={isSaving}
                className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors"
              />
            </div>

            {error && (
              <p
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200"
              >
                {error}
              </p>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-4 py-3 border-t border-white/10 shrink-0 flex gap-2">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] text-sm font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !gameName.trim() || !gameTag.trim() || !uploader.trim() || isSaving}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 disabled:bg-[#3f3f46] disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
          </div>
        </>
      </div>
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

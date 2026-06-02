import { useCallback, useState, useRef, useEffect } from "react";

interface DeletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  videoId: string;
  videoTitle: string;
  isAnonymous?: boolean;
}

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

export default function DeletePopup({ isOpen, onClose, onDeleted, videoId, videoTitle, isAnonymous = false }: DeletePopupProps) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (message) {
      onDeleted?.();
    }
    onClose();
  }, [message, onClose, onDeleted]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setMessage("");
      setError("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos/${videoId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = (await readPayload(response)) as { message?: string };
        throw new Error(payload.message || `삭제에 실패했습니다. (${response.status})`);
      }

      setMessage("동영상이 삭제되었습니다.");
      setPassword("");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        ref={popupRef}
        className="relative z-10 w-[92vw] sm:w-[400px] md:w-[20vw] md:min-w-[340px] md:max-w-[400px] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <h3 className="text-white text-sm font-bold">동영상 삭제</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ri-delete-bin-line text-amber-400 text-xl" />
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-relaxed">
                이 동영상을 삭제하시겠습니까?
              </p>
              <p className="text-[#a1a1aa] text-xs mt-1 leading-relaxed">
                삭제된 동영상은 복구할 수 없습니다.
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl px-3 py-2.5 mb-4">
            <p className="text-[#71717a] text-[11px] truncate">{videoTitle}</p>
          </div>

          {isAnonymous && (
            <div className="space-y-1.5">
              <label className="text-[#a1a1aa] text-xs font-medium">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호가 설정된 영상이면 입력"
                autoComplete="current-password"
                disabled={isDeleting || Boolean(message)}
                className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-amber-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors"
              />
            </div>
          )}

          {(message || error) && (
            <p
              className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
                error
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {error || message}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 border-t border-white/10 shrink-0 flex gap-2">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] text-sm font-medium transition-colors"
          >
            {message ? "닫기" : "취소"}
          </button>
          {!message && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-amber-500/90 hover:bg-amber-500 disabled:bg-[#3f3f46] disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          )}
        </div>
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

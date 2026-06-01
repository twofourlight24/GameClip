import { useState, useRef, useCallback, useEffect } from "react";
import { gameGenres } from "@/mocks/games";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

type UploadResponse = {
  title?: string;
  originalName?: string;
  message?: string;
};

type UploadUser = {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string | null;
};

interface UploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
  currentUser?: UploadUser | null;
}

export default function UploadPopup({ isOpen, onClose, onUploadSuccess, currentUser = null }: UploadPopupProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [gameName, setGameName] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const needsManualIdentity = !currentUser || isAnonymous;
  const canUpload = Boolean(selectedFile && title && gameName && selectedGenre && (!needsManualIdentity || nickname) && !isUploading);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isUploading) onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, isUploading, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setDragActive(false);
    setSelectedFile(null);
    setTitle("");
    setGameName("");
    setSelectedGenre(null);
    setNickname("");
    setPassword("");
    setIsAnonymous(false);
    setIsUploading(false);
    setUploadError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [isOpen]);

  const setFile = (file: File) => {
    setUploadError("");
    setSelectedFile(file);
  };

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (!event.dataTransfer.files?.[0]) return;

    const file = event.dataTransfer.files[0];
    if (file.type.startsWith("video/")) {
      setFile(file);
    } else {
      setUploadError("동영상 파일만 업로드할 수 있습니다.");
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;

    const file = event.target.files[0];
    if (file.type.startsWith("video/")) {
      setFile(file);
    } else {
      setUploadError("동영상 파일만 업로드할 수 있습니다.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !gameName || !selectedGenre || (needsManualIdentity && !nickname)) return;

    setIsUploading(true);
    setUploadError("");

    const body = new FormData();
    body.append("video", selectedFile);
    body.append("title", title);
    body.append("gameName", gameName);
    body.append("gameTag", selectedGenre);
    if (isAnonymous) {
      body.append("isAnonymous", "true");
    }
    if (needsManualIdentity) {
      body.append("uploader", nickname);
    }
    if (needsManualIdentity && password.trim()) {
      body.append("password", password);
    }

    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos`, {
        method: "POST",
        credentials: "include",
        body,
      });
      const payload = (await readPayload(response)) as UploadResponse;

      if (!response.ok) {
        throw new Error(payload.message || `업로드에 실패했습니다. (${response.status})`);
      }

      window.dispatchEvent(new Event("gameclip:videos-changed"));
      onUploadSuccess?.();
      onClose();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!isUploading) onClose();
        }}
      />

      <div className="relative z-10 w-[94vw] sm:w-[540px] md:w-[30vw] md:min-w-[420px] md:max-w-[540px] max-h-[90vh] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <h3 className="text-white text-sm font-bold flex items-center gap-2">
            <i className="ri-upload-cloud-2-line text-sky-400"></i>
            영상 업로드
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              dragActive
                ? "border-sky-400 bg-sky-500/10"
                : "border-[#3f3f46] hover:border-[#52525b] bg-[#27272a]"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <i className="ri-file-video-line text-sky-400 text-xl"></i>
                <span className="text-sm text-[#f4f4f5] truncate max-w-[250px]">
                  {selectedFile.name}
                </span>
              </div>
            ) : (
              <>
                <i className="ri-film-line text-3xl text-[#71717a] mb-2 block"></i>
                <p className="text-sm text-[#a1a1aa] mb-1">
                  영상을 여기에 드래그하세요
                </p>
                <p className="text-xs text-[#71717a]">또는 클릭해서 파일 선택</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="영상 제목을 입력하세요"
              disabled={isUploading}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
              게임 이름
            </label>
            <input
              type="text"
              value={gameName}
              onChange={(event) => setGameName(event.target.value)}
              placeholder="예: 리그 오브 레전드"
              disabled={isUploading}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#a1a1aa] mb-2 font-medium">
              장르 태그
            </label>
            <div className="flex flex-wrap gap-2">
              {gameGenres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  disabled={isUploading}
                  onClick={() => setSelectedGenre(genre.id === selectedGenre ? null : genre.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
                    selectedGenre === genre.id
                      ? "bg-sky-500/90 border-sky-400 text-white shadow-lg shadow-sky-500/20"
                      : "bg-[#27272a] border-[#3f3f46] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {currentUser ? (
            <div className="rounded-xl border border-white/10 bg-[#27272a] px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#18181b]">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.nickname} className="h-full w-full object-cover" />
                  ) : (
                    <i className="ri-user-line text-white/80" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{currentUser.nickname}</p>
                  <p className="truncate text-xs text-[#a1a1aa]">@{currentUser.username} 계정으로 업로드</p>
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs font-medium text-[#a1a1aa]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                  disabled={isUploading}
                  className="h-4 w-4 accent-sky-500"
                />
                익명으로 업로드
              </label>
              {isAnonymous && (
                <div className="mt-3 grid gap-3">
                  <div>
                    <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
                      익명 닉네임
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      placeholder="익명 업로드에 표시될 닉네임"
                      disabled={isUploading}
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
                      익명 영상 비밀번호 (선택)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="익명 영상 수정/삭제 보호가 필요하면 입력"
                      autoComplete="new-password"
                      disabled={isUploading}
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
                  닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="업로드에 표시될 닉네임"
                  disabled={isUploading}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
                  비밀번호 (선택)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="수정/삭제 보호가 필요하면 입력"
                  autoComplete="new-password"
                  disabled={isUploading}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </>
          )}

          {uploadError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200">
              {uploadError}
            </p>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!canUpload}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              canUpload
                ? "bg-sky-500 hover:bg-sky-600 text-white"
                : "bg-[#3f3f46] text-[#71717a] cursor-not-allowed"
            }`}
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="ri-loader-4-line animate-spin"></i>
                업로드 중...
              </span>
            ) : (
              "업로드"
            )}
          </button>
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

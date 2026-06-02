import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { gameGenres, trendingGames } from "@/mocks/games";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

type UploadResponse = {
  title?: string;
  originalName?: string;
  message?: string;
};

type CurrentUser = {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string | null;
};

export default function UploadPanel() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [gameName, setGameName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState("");
  const [isCustomGenreOpen, setIsCustomGenreOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredGames = useMemo(() => {
    const query = gameName.trim().toLowerCase();
    if (!query) return trendingGames;
    return trendingGames.filter((game) => game.name.toLowerCase().includes(query));
  }, [gameName]);
  const selectedGenreNames = selectedGenres
    .map((genreId) => gameGenres.find((genre) => genre.id === genreId)?.name || genreId)
    .filter(Boolean);
  const uploadGenreTags = [...selectedGenreNames, customGenre.trim()].filter(Boolean);
  const needsManualIdentity = !currentUser || isAnonymous;
  const canUpload = Boolean(
    selectedFile &&
      title &&
      gameName &&
      uploadGenreTags.length > 0 &&
      (!needsManualIdentity || nickname.trim()) &&
      !isUploading,
  );

  const loadCurrentUser = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/me`, {
        credentials: "include",
        signal,
      });

      if (!response.ok) {
        setCurrentUser(null);
        setIsAnonymous(false);
        return;
      }

      setCurrentUser((await response.json()) as CurrentUser);
    } catch {
      if (!signal?.aborted) {
        setCurrentUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCurrentUser(controller.signal);

    const handleAuthChanged = () => {
      loadCurrentUser().catch(() => setCurrentUser(null));
    };

    window.addEventListener("gameclip:auth-changed", handleAuthChanged);
    return () => {
      controller.abort();
      window.removeEventListener("gameclip:auth-changed", handleAuthChanged);
    };
  }, [loadCurrentUser]);

  const setFile = (file: File) => {
    setUploadMessage("");
    setUploadError("");
    setSelectedFile(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setFile(file);
      } else {
        setUploadMessage("");
        setUploadError("동영상 파일만 업로드할 수 있습니다.");
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("video/")) {
        setFile(file);
      } else {
        setUploadMessage("");
        setUploadError("동영상 파일만 업로드할 수 있습니다.");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !gameName || uploadGenreTags.length === 0 || (needsManualIdentity && !nickname.trim())) return;

    setIsUploading(true);
    setUploadMessage("");
    setUploadError("");

    const body = new FormData();
    body.append("video", selectedFile);
    body.append("title", title);
    body.append("gameName", gameName);
    body.append("genreTags", JSON.stringify(uploadGenreTags));
    body.append("isAnonymous", String(isAnonymous));
    if (needsManualIdentity) {
      body.append("uploader", nickname.trim());
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

      setUploadMessage(`${payload.title || payload.originalName || selectedFile.name} 업로드 완료`);
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setTitle("");
      setGameName("");
      setSelectedGenres([]);
      setCustomGenre("");
      setIsCustomGenreOpen(false);
      setNickname("");
      setPassword("");
      setIsAnonymous(false);
      window.dispatchEvent(new Event("gameclip:videos-changed"));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#27272a] rounded-2xl border border-[#3f3f46] p-5">
      <h3 className="text-[#f4f4f5] font-bold text-base mb-4 flex items-center gap-2">
        <i className="ri-upload-cloud-2-line text-sky-400"></i>
        영상 업로드
      </h3>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer mb-4 ${
          dragActive
            ? "border-sky-400 bg-sky-500/10"
            : "border-[#3f3f46] hover:border-[#52525b] bg-[#18181b]"
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
        <i className="ri-film-line text-3xl text-[#71717a] mb-2 block"></i>
        <p className="text-sm text-[#a1a1aa] mb-1">
          {selectedFile ? selectedFile.name : "영상을 여기에 드래그하세요"}
        </p>
        <p className="text-xs text-[#71717a]">또는 클릭해서 파일 선택</p>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="영상 제목을 입력하세요"
          disabled={isUploading}
          className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
        />
      </div>

      {/* Game name */}
      <div className="mb-4">
        <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
          게임 이름
        </label>
        <input
          type="text"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          placeholder="게임 검색 또는 직접 입력"
          disabled={isUploading}
          className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
        />
        <div className="mt-2 grid max-h-32 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-white/10 bg-[#202024] p-2 scrollbar-hide">
          {filteredGames.map((game) => (
            <button
              key={game.id}
              type="button"
              disabled={isUploading}
              onClick={() => {
                setGameName(game.name);
                setSelectedGenres(game.genreIds);
              }}
              className={`flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs font-semibold transition-all ${
                gameName === game.name
                  ? "border-transparent text-white shadow-lg"
                  : "border-[#3f3f46] bg-[#18181b] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
              }`}
              style={gameName === game.name ? { backgroundColor: game.color } : undefined}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: game.color }} />
              <span className="truncate">{game.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Genre tags */}
      <div className="mb-4">
        <label className="block text-xs text-[#a1a1aa] mb-2 font-medium">
          장르 태그
        </label>
        <div className="max-h-24 overflow-y-auto rounded-xl border border-white/10 bg-[#202024] p-2 scrollbar-hide">
          <div className="flex flex-wrap gap-2">
            {gameGenres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setSelectedGenres((currentGenres) =>
                    currentGenres.includes(genre.id)
                      ? currentGenres.filter((genreId) => genreId !== genre.id)
                      : [...currentGenres, genre.id],
                  );
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
                  selectedGenres.includes(genre.id)
                    ? "border-transparent text-white shadow-lg"
                    : "bg-[#18181b] border-[#3f3f46] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
                }`}
                style={selectedGenres.includes(genre.id) ? { backgroundColor: genre.color } : undefined}
              >
                {genre.name}
              </button>
            ))}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                if (isCustomGenreOpen) {
                  setCustomGenre("");
                }
                setIsCustomGenreOpen((isOpen) => !isOpen);
              }}
              aria-label="장르 태그 직접 입력"
              className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border text-sm transition-all ${
                isCustomGenreOpen
                  ? "border-sky-400 bg-sky-500/90 text-white shadow-lg shadow-sky-500/20"
                  : "border-[#3f3f46] bg-[#18181b] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
              }`}
            >
              <i className="ri-add-line" />
            </button>
          </div>
        </div>
        {isCustomGenreOpen && (
          <input
            type="text"
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="장르 태그를 직접 입력하세요"
            disabled={isUploading}
            className="mt-2 w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
          />
        )}
      </div>

      {currentUser ? (
        <div className="mb-4 rounded-xl border border-white/10 bg-[#18181b] px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#27272a]">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.nickname} className="h-full w-full object-cover" />
              ) : (
                <i className="ri-user-line text-sm text-white/80" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{currentUser.nickname}</p>
              <p className="truncate text-[10px] text-[#a1a1aa]">@{currentUser.username} 계정으로 업로드</p>
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
        </div>
      ) : null}

      {needsManualIdentity && (
        <>
          <div className="mb-4">
            <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={currentUser ? "익명 업로드에 표시될 닉네임" : "업로드에 표시될 닉네임"}
              disabled={isUploading}
              className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
              비밀번호 (선택)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="수정/삭제 보호가 필요하면 입력"
              autoComplete="new-password"
              disabled={isUploading}
              className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>
        </>
      )}

      {(uploadMessage || uploadError) && (
        <p
          className={`mb-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
            uploadError
              ? "border-red-500/30 bg-red-500/10 text-red-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {uploadError || uploadMessage}
        </p>
      )}

      {/* Upload button */}
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
  );
}

async function readPayload(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function cleanApiBaseUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

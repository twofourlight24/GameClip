import { useState, useRef, useCallback } from "react";
import { gameGenres } from "@/mocks/games";

export default function UploadPanel() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gameName, setGameName] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !gameName || !selectedGenre || !nickname) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFile(null);
      setGameName("");
      setSelectedGenre(null);
      setNickname("");
    }, 1500);
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
        />
        <i className="ri-film-line text-3xl text-[#71717a] mb-2 block"></i>
        <p className="text-sm text-[#a1a1aa] mb-1">
          {selectedFile ? selectedFile.name : "영상을 여기에 드래그하세요"}
        </p>
        <p className="text-xs text-[#71717a]">또는 클릭해서 파일 선택</p>
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
          placeholder="예: 리그 오브 레전드"
          className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
        />
      </div>

      {/* Genre tags */}
      <div className="mb-4">
        <label className="block text-xs text-[#a1a1aa] mb-2 font-medium">
          장르 태그
        </label>
        <div className="flex flex-wrap gap-2">
          {gameGenres.map((genre) => (
            <button
              key={genre.id}
              onClick={() =>
                setSelectedGenre(genre.id === selectedGenre ? null : genre.id)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap ${
                selectedGenre === genre.id
                  ? "bg-sky-500/90 border-sky-400 text-white shadow-lg shadow-sky-500/20"
                  : "bg-[#18181b] border-[#3f3f46] text-[#a1a1aa] hover:border-[#52525b] hover:text-[#f4f4f5]"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Nickname */}
      <div className="mb-4">
        <label className="block text-xs text-[#a1a1aa] mb-1.5 font-medium">
          닉네임
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="업로드에 표시될 닉네임"
          className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-sky-400 transition-colors"
        />
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={
          !selectedFile || !gameName || !selectedGenre || !nickname || isUploading
        }
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
          selectedFile && gameName && selectedGenre && nickname && !isUploading
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
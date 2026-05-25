import { useState, useRef, useEffect } from "react";

interface EditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    title: string;
    gameName: string;
    tags: string[];
  };
}

export default function EditPopup({ isOpen, onClose, video }: EditPopupProps) {
  const [title, setTitle] = useState(video.title);
  const [gameName, setGameName] = useState(video.gameName);
  const [tags, setTags] = useState(video.tags.join(", "));
  const [saved, setSaved] = useState(false);
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
      setTags(video.tags.join(", "));
      setSaved(false);
    }
  }, [isOpen, video]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
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

        {/* Saved state */}
        {saved ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <i className="ri-check-line text-emerald-400 text-3xl" />
            </div>
            <p className="text-white text-sm font-semibold">변경사항이 저장되었습니다</p>
          </div>
        ) : (
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
                  className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-[#a1a1aa] text-xs font-medium">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="예: FPS, 에임, 클립"
                  className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors"
                />
                <p className="text-[#52525b] text-[10px]">
                  쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-4 py-3 border-t border-white/10 shrink-0 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] text-sm font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                저장
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
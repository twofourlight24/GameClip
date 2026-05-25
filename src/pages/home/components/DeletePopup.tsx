import { useState, useRef, useEffect } from "react";

interface DeletePopupProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
}

export default function DeletePopup({ isOpen, onClose, videoTitle }: DeletePopupProps) {
  const [deleted, setDeleted] = useState(false);
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
    if (isOpen) setDeleted(false);
  }, [isOpen]);

  const handleDelete = () => {
    setDeleted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
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
        className="relative z-10 w-[92vw] sm:w-[400px] md:w-[20vw] md:min-w-[340px] md:max-w-[400px] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <h3 className="text-white text-sm font-bold">동영상 삭제</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-5">
          {deleted ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <i className="ri-check-line text-emerald-400 text-3xl" />
              </div>
              <p className="text-white text-sm font-semibold">동영상이 삭제되었습니다</p>
            </div>
          ) : (
            <>
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

              <div className="bg-white/5 rounded-xl px-3 py-2.5 mb-1">
                <p className="text-[#71717a] text-[11px] truncate">{videoTitle}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {!deleted && (
          <div className="px-4 py-3 border-t border-white/10 shrink-0 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] text-sm font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 rounded-xl bg-amber-500/90 hover:bg-amber-500 text-white text-sm font-semibold transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
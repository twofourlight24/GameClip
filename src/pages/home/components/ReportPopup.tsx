import { useState, useRef, useEffect } from "react";

interface ReportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const reportReasons = [
  { id: "spam", label: "스팸 및 홍보성 콘텐츠" },
  { id: "violence", label: "폭력 또는 위협적인 콘텐츠" },
  { id: "sexual", label: "성적 콘텐츠 및 나체" },
  { id: "hate", label: "혐오 발언 및 차별" },
  { id: "misinfo", label: "허위 정보 및 가짜 뉴스" },
  { id: "harassment", label: "괴롭힘 및 따돌림" },
  { id: "illegal", label: "불법 행위 및 콘텐츠" },
  { id: "other", label: "기타" },
];

export default function ReportPopup({ isOpen, onClose }: ReportPopupProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
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
      setSelected(null);
      setDetail("");
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
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
        className="relative z-10 w-[92vw] sm:w-[480px] md:w-[25vw] md:min-w-[380px] md:max-w-[480px] h-[70vh] max-h-[600px] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <h3 className="text-white text-sm font-bold">신고</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <i className="ri-check-line text-emerald-400 text-3xl" />
            </div>
            <p className="text-white text-sm font-semibold">신고가 접수되었습니다</p>
            <p className="text-[#71717a] text-xs text-center">
              검토 후 조치를 취하겠습니다.
            </p>
          </div>
        ) : (
          <>
            {/* Reason list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-hide">
              <p className="text-[#a1a1aa] text-xs mb-3">신고 사유를 선택해 주세요</p>
              {reportReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelected(reason.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors border ${
                    selected === reason.id
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-white/[0.02] border-transparent hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected === reason.id
                        ? "border-red-400"
                        : "border-[#3f3f46]"
                    }`}
                  >
                    {selected === reason.id && (
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                    )}
                  </div>
                  <span className="text-white text-xs font-medium">{reason.label}</span>
                </button>
              ))}

              {/* Detail input (only for 'other') */}
              {selected === "other" && (
                <div className="mt-3">
                  <textarea
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="자세한 내용을 입력해 주세요..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:border-red-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors resize-none scrollbar-hide"
                  />
                  <p className="text-[#52525b] text-[10px] text-right mt-1">
                    {detail.length}/500
                  </p>
                </div>
              )}
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
                onClick={handleSubmit}
                disabled={!selected}
                className="flex-1 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 disabled:bg-[#3f3f46] disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                신고하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
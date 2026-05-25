import { useEffect, useRef } from "react";

interface MoreOptionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MoreOptionsPopup({
  isOpen,
  onClose,
  onReport,
  onEdit,
  onDelete,
}: MoreOptionsPopupProps) {
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

  if (!isOpen) return null;

  const options = [
    {
      id: "report",
      label: "신고",
      icon: "ri-flag-line",
      iconColor: "text-red-400",
      hoverBg: "hover:bg-red-500/10",
      onClick: onReport,
    },
    {
      id: "edit",
      label: "편집",
      icon: "ri-edit-line",
      iconColor: "text-emerald-400",
      hoverBg: "hover:bg-emerald-500/10",
      onClick: onEdit,
    },
    {
      id: "delete",
      label: "삭제",
      icon: "ri-delete-bin-line",
      iconColor: "text-amber-400",
      hoverBg: "hover:bg-amber-500/10",
      onClick: onDelete,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        ref={popupRef}
        className="relative z-10 w-[92vw] sm:w-[400px] md:w-[22vw] md:min-w-[340px] md:max-w-[420px] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <h3 className="text-white text-sm font-bold">옵션</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        {/* Options list */}
        <div className="flex flex-col py-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                opt.onClick();
                onClose();
              }}
              className={`flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${opt.hoverBg}`}
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 shrink-0">
                <i className={`${opt.icon} ${opt.iconColor} text-lg`} />
              </div>
              <span className="text-white text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] text-sm font-medium transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
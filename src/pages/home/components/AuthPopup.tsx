import { useState, useRef, useEffect } from "react";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionLabel: string;
}

const CORRECT_PASSWORD = "1234";

export default function AuthPopup({
  isOpen,
  onClose,
  onSuccess,
  actionLabel,
}: AuthPopupProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }
    if (password !== CORRECT_PASSWORD) {
      setError("비밀번호가 일치하지 않습니다.");
      setPassword("");
      inputRef.current?.focus();
      return;
    }
    setError("");
    setSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 600);
  };

  if (!isOpen) return null;

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
        className="relative z-10 w-[92vw] sm:w-[380px] md:w-[20vw] md:min-w-[320px] md:max-w-[400px] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <h3 className="text-white text-sm font-bold">비밀번호 확인</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-5">
          {success ? (
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <i className="ri-check-line text-emerald-400 text-3xl" />
              </div>
              <p className="text-white text-sm font-semibold">인증되었습니다</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-[#a1a1aa] text-xs">
                  <span className="text-white font-medium">{actionLabel}</span>
                  을(를) 위해 비밀번호를 입력해 주세요
                </p>
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="비밀번호 입력"
                  maxLength={20}
                  className="w-full bg-[#27272a] text-white text-sm px-3 py-2.5 rounded-xl border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder:text-[#52525b] transition-colors text-center tracking-[0.2em]"
                />
                {error && (
                  <p className="text-red-400 text-xs text-center">{error}</p>
                )}
              </div>

              {/* Keypad hint */}
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
                  (key, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (key === "⌫") {
                          setPassword((prev) => prev.slice(0, -1));
                          if (error) setError("");
                        } else if (key) {
                          setPassword((prev) => {
                            const next = prev + key;
                            return next.slice(0, 20);
                          });
                          if (error) setError("");
                        }
                      }}
                      disabled={!key}
                      className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                        key
                          ? "bg-white/5 hover:bg-white/10 text-white active:bg-white/20"
                          : "invisible"
                      }`}
                    >
                      {key === "⌫" ? (
                        <i className="ri-delete-back-2-line text-white/70" />
                      ) : (
                        key
                      )}
                    </button>
                  )
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a1a1aa] text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!password.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500/90 hover:bg-sky-500 disabled:bg-[#3f3f46] disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                >
                  확인
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
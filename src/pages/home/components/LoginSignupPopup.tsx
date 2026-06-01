import { useEffect, useRef, useState, type FormEvent } from "react";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

type AuthMode = "login" | "signup";

type AuthUser = {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string | null;
  usesDefaultAvatar?: boolean;
  message?: string;
};

interface LoginSignupPopupProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onAuthenticated: (user: AuthUser) => void;
}

export default function LoginSignupPopup({
  isOpen,
  mode,
  onClose,
  onModeChange,
  onAuthenticated,
}: LoginSignupPopupProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      window.setTimeout(() => usernameRef.current?.focus(), 80);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setUsername("");
    setPassword("");
    setPasswordConfirm("");
    setNickname("");
    setMessage("");
    setError("");
  }, [isOpen, mode]);

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const user = mode === "login" ? await login() : await signup();
      onAuthenticated(user);
      setMessage(`${user.nickname}님으로 로그인되었습니다.`);
      window.setTimeout(onClose, 500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "요청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const login = async () => {
    const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const payload = (await readPayload(response)) as AuthUser;

    if (!response.ok) {
      throw new Error(payload.message || `로그인에 실패했습니다. (${response.status})`);
    }

    return payload;
  };

  const signup = async () => {
    const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, passwordConfirm, nickname }),
    });
    const payload = (await readPayload(response)) as AuthUser;

    if (!response.ok) {
      throw new Error(payload.message || `회원가입에 실패했습니다. (${response.status})`);
    }

    return login();
  };

  if (!isOpen) return null;

  const isSignup = mode === "signup";
  const canSubmit =
    username.trim() &&
    password &&
    (!isSignup || (nickname.trim() && password === passwordConfirm)) &&
    !isSubmitting;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      <div className="relative z-10 w-[92vw] max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-white">{isSignup ? "회원가입" : "로그인"}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-50"
            aria-label="닫기"
          >
            <i className="ri-close-line text-lg text-white" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 px-4 pt-4">
          <button
            type="button"
            onClick={() => onModeChange("login")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              !isSignup ? "bg-sky-500 text-white" : "bg-white/5 text-[#a1a1aa] hover:bg-white/10"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => onModeChange("signup")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              isSignup ? "bg-sky-500 text-white" : "bg-white/5 text-[#a1a1aa] hover:bg-white/10"
            }`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={submitAuth} className="space-y-4 px-4 py-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#a1a1aa]">아이디</span>
            <input
              ref={usernameRef}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_-]{3,30}"
              required
              className="w-full rounded-xl border border-white/10 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#52525b] focus:border-sky-500/60"
              placeholder="gameclip_user"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[#a1a1aa]">비밀번호</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 6 : undefined}
              maxLength={128}
              required
              className="w-full rounded-xl border border-white/10 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#52525b] focus:border-sky-500/60"
              placeholder={isSignup ? "6자 이상" : "비밀번호"}
            />
          </label>

          {isSignup && (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#a1a1aa]">비밀번호 확인</span>
              <input
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
                className="w-full rounded-xl border border-white/10 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#52525b] focus:border-sky-500/60"
                placeholder="한 번 더 입력"
              />
              {passwordConfirm && password !== passwordConfirm && (
                <span className="text-xs text-red-400">비밀번호가 일치하지 않습니다.</span>
              )}
            </label>
          )}

          {isSignup && (
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#a1a1aa]">닉네임</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoComplete="nickname"
                maxLength={30}
                required
                className="w-full rounded-xl border border-white/10 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#52525b] focus:border-sky-500/60"
                placeholder="클립장인"
              />
            </label>
          )}

          {(error || message) && (
            <p className={`text-center text-xs ${error ? "text-red-400" : "text-emerald-400"}`}>
              {error || message}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl bg-sky-500 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-[#3f3f46]"
          >
            {isSubmitting ? "처리 중..." : isSignup ? "회원가입하고 로그인" : "로그인"}
          </button>
        </form>
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

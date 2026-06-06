import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

type AuthUser = {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string | null;
  usesDefaultAvatar?: boolean;
  message?: string;
};

interface AccountSettingsPopupProps {
  isOpen: boolean;
  user: AuthUser;
  onClose: () => void;
  onUpdated: (user: AuthUser) => void;
  onDeleted: () => void;
}

export default function AccountSettingsPopup({
  isOpen,
  user,
  onClose,
  onUpdated,
  onDeleted,
}: AccountSettingsPopupProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasUnsavedChanges =
    nickname !== user.nickname ||
    Boolean(avatarFile) ||
    Boolean(currentPassword || newPassword || newPasswordConfirm || deletePassword);

  const requestClose = useCallback(() => {
    if (isSaving) return;

    if (hasUnsavedChanges && !window.confirm("저장하지 않은 변경 사항이 있습니다. 저장하지 않고 닫을까요?")) {
      return;
    }

    onClose();
  }, [hasUnsavedChanges, isSaving, onClose]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, requestClose]);

  useEffect(() => {
    if (!isOpen) return;

    setNickname(user.nickname);
    setAvatarFile(null);
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setDeletePassword("");
    setMessage("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen, user.nickname]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }

    const nextPreview = URL.createObjectURL(avatarFile);
    setAvatarPreview(nextPreview);
    return () => URL.revokeObjectURL(nextPreview);
  }, [avatarFile]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const body = new FormData();
      body.append("nickname", nickname);
      if (avatarFile) {
        body.append("avatar", avatarFile);
      }

      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/me`, {
        method: "PATCH",
        credentials: "include",
        body,
      });
      const payload = (await readPayload(response)) as AuthUser;

      if (!response.ok) {
        throw new Error(payload.message || `프로필 수정에 실패했습니다. (${response.status})`);
      }

      onUpdated(payload);
      window.dispatchEvent(new Event("gameclip:auth-changed"));
      setAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage("프로필이 수정되었습니다.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "프로필 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, newPasswordConfirm }),
      });
      const payload = (await readPayload(response)) as AuthUser;

      if (!response.ok) {
        throw new Error(payload.message || `비밀번호 변경에 실패했습니다. (${response.status})`);
      }

      onUpdated(payload);
      window.dispatchEvent(new Event("gameclip:auth-changed"));
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setMessage("비밀번호가 변경되었습니다.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAccount = async (event: FormEvent) => {
    event.preventDefault();

    if (!window.confirm("정말 계정을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/me`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const payload = await readPayload(response);

      if (!response.ok) {
        throw new Error(payload.message || `계정 삭제에 실패했습니다. (${response.status})`);
      }

      onDeleted();
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "계정 삭제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const previewUrl = avatarPreview || user.avatarUrl;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          requestClose();
        }}
      />

      <div className="relative z-10 max-h-[90vh] w-[94vw] max-w-[460px] overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-white">계정 설정</h3>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-50"
            aria-label="닫기"
          >
            <i className="ri-close-line text-lg text-white" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-54px)] space-y-5 overflow-y-auto px-4 py-5">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#27272a]">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <i className="ri-user-line text-xl text-white/80" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#27272a] px-3 py-2 text-xs text-white file:mr-3 file:rounded-lg file:border-0 file:bg-sky-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#a1a1aa]">닉네임</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={30}
                required
                className="w-full rounded-xl border border-white/10 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-sky-500/60"
              />
            </label>

            <button
              type="submit"
              disabled={!nickname.trim() || isSaving}
              className="w-full rounded-xl bg-sky-500 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-[#3f3f46]"
            >
              프로필 저장
            </button>
          </form>

          <form onSubmit={changePassword} className="space-y-3 border-t border-white/10 pt-5">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#a1a1aa]">현재 비밀번호</span>
              <input
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-sky-500/60"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#a1a1aa]">새 비밀번호</span>
              <input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                className="w-full rounded-xl border border-white/10 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-sky-500/60"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#a1a1aa]">새 비밀번호 확인</span>
              <input
                value={newPasswordConfirm}
                onChange={(event) => setNewPasswordConfirm(event.target.value)}
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                className="w-full rounded-xl border border-white/10 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-sky-500/60"
              />
              {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                <span className="text-xs text-red-400">새 비밀번호가 일치하지 않습니다.</span>
              )}
            </label>
            <button
              type="submit"
              disabled={!currentPassword || newPassword.length < 6 || newPassword !== newPasswordConfirm || isSaving}
              className="w-full rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:bg-[#3f3f46]"
            >
              비밀번호 변경
            </button>
          </form>

          <form onSubmit={deleteAccount} className="space-y-3 border-t border-white/10 pt-5">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-red-300">계정 삭제 확인 비밀번호</span>
              <input
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                type="password"
                className="w-full rounded-xl border border-red-500/20 bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-red-400/60"
              />
            </label>
            <button
              type="submit"
              disabled={!deletePassword || isSaving}
              className="w-full rounded-xl bg-red-500/15 px-3 py-2.5 text-sm font-bold text-red-200 transition-colors hover:bg-red-500/25 disabled:cursor-not-allowed disabled:bg-[#3f3f46] disabled:text-white"
            >
              계정 삭제
            </button>
          </form>

          {(error || message) && (
            <p className={`text-center text-xs ${error ? "text-red-400" : "text-emerald-400"}`}>
              {error || message}
            </p>
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

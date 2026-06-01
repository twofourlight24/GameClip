import { useEffect, useRef, useState } from "react";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

type Comment = {
  id: string;
  username: string;
  avatarUrl: string | null;
  text: string;
  likes: number;
  likedByMe: boolean;
  canEdit: boolean;
  hasPassword: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt?: string;
};

type CommentUser = {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string | null;
};

type CommentResponse = {
  comments?: Comment[];
  video?: {
    comments?: number;
  };
  message?: string;
};

interface CommentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  commentCount: number;
  onCommentCountChange?: (commentCount: number) => void;
}

export default function CommentPopup({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  commentCount,
  onCommentCountChange,
}: CommentPopupProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<CommentUser | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null);
  const [likeSavingCommentId, setLikeSavingCommentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const onCommentCountChangeRef = useRef(onCommentCountChange);
  const needsManualIdentity = !currentUser || isAnonymous;
  const canSubmit = Boolean(inputValue.trim() && (!needsManualIdentity || nickname.trim()) && !isSubmitting);

  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      window.setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    setComments([]);
    setInputValue("");
    setNickname("");
    setPassword("");
    setIsAnonymous(false);
    closeCommentActions();
    setErrorMessage("");
    setIsLoading(true);

    Promise.all([
      fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/me`, {
        credentials: "include",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as CommentUser;
        })
        .catch(() => null),
      fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos/${encodeURIComponent(videoId)}/comments`, {
        credentials: "include",
        signal: controller.signal,
      }).then(async (response) => {
        const payload = (await readPayload(response)) as Comment[] | { message?: string };

        if (!response.ok) {
          throw new Error(!Array.isArray(payload) && payload.message ? payload.message : "댓글을 불러오지 못했습니다.");
        }

        return Array.isArray(payload) ? payload : [];
      }),
    ])
      .then(([user, nextComments]) => {
        if (controller.signal.aborted) return;
        setCurrentUser(user);
        setComments(nextComments);
        onCommentCountChangeRef.current?.(nextComments.length);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setCurrentUser(null);
        setComments([]);
        setErrorMessage(error instanceof Error ? error.message : "댓글을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [isOpen, videoId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos/${encodeURIComponent(videoId)}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          text: inputValue.trim(),
          nickname: needsManualIdentity ? nickname.trim() : undefined,
          password: needsManualIdentity ? password : undefined,
          isAnonymous,
        }),
      });
      const payload = (await readPayload(response)) as CommentResponse;

      if (!response.ok) {
        throw new Error(payload.message || "댓글을 저장하지 못했습니다.");
      }

      const nextComments = payload.comments || [];
      setComments(nextComments);
      setInputValue("");
      setPassword("");
      onCommentCountChangeRef.current?.(payload.video?.comments ?? nextComments.length);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "댓글을 저장하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
    setEditPassword("");
    setDeletingCommentId(null);
    setDeletePassword("");
    setErrorMessage("");
  };

  const openDelete = (comment: Comment) => {
    setDeletingCommentId(comment.id);
    setDeletePassword("");
    setEditingCommentId(null);
    setEditText("");
    setEditPassword("");
    setErrorMessage("");
  };

  const closeCommentActions = () => {
    setEditingCommentId(null);
    setEditText("");
    setEditPassword("");
    setDeletingCommentId(null);
    setDeletePassword("");
  };

  const syncCommentResponse = (payload: CommentResponse) => {
    const nextComments = payload.comments || [];
    setComments(nextComments);
    onCommentCountChangeRef.current?.(payload.video?.comments ?? nextComments.length);
  };

  const toggleCommentLike = async (comment: Comment) => {
    if (likeSavingCommentId) return;

    setLikeSavingCommentId(comment.id);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos/${encodeURIComponent(videoId)}/comments/${encodeURIComponent(comment.id)}/like`,
        {
          method: comment.likedByMe ? "DELETE" : "POST",
          credentials: "include",
        },
      );
      const payload = (await readPayload(response)) as CommentResponse;

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("로그인 후 댓글 좋아요를 누를 수 있습니다.");
        }

        throw new Error(payload.message || "댓글 좋아요를 저장하지 못했습니다.");
      }

      syncCommentResponse(payload);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "댓글 좋아요를 저장하지 못했습니다.");
    } finally {
      setLikeSavingCommentId(null);
    }
  };

  const saveCommentEdit = async (comment: Comment) => {
    if (!editText.trim()) return;

    setSavingCommentId(comment.id);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos/${encodeURIComponent(videoId)}/comments/${encodeURIComponent(comment.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            text: editText.trim(),
            password: comment.canEdit ? undefined : editPassword,
          }),
        },
      );
      const payload = (await readPayload(response)) as CommentResponse;

      if (!response.ok) {
        throw new Error(payload.message || "댓글을 수정하지 못했습니다.");
      }

      syncCommentResponse(payload);
      closeCommentActions();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "댓글을 수정하지 못했습니다.");
    } finally {
      setSavingCommentId(null);
    }
  };

  const deleteComment = async (comment: Comment) => {
    setSavingCommentId(comment.id);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${cleanApiBaseUrl(defaultApiBaseUrl)}/api/videos/${encodeURIComponent(videoId)}/comments/${encodeURIComponent(comment.id)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            password: comment.canEdit ? undefined : deletePassword,
          }),
        },
      );
      const payload = (await readPayload(response)) as CommentResponse;

      if (!response.ok) {
        throw new Error(payload.message || "댓글을 삭제하지 못했습니다.");
      }

      syncCommentResponse(payload);
      closeCommentActions();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "댓글을 삭제하지 못했습니다.");
    } finally {
      setSavingCommentId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      <div className="relative z-10 flex h-[76vh] max-h-[680px] w-[92vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl sm:w-[480px] md:w-[25vw] md:min-w-[380px] md:max-w-[480px]">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">댓글</h3>
            <span className="text-xs text-[#a1a1aa]">{formatCompactCount(commentCount)}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-50"
            aria-label="댓글 닫기"
          >
            <i className="ri-close-line text-lg text-white" />
          </button>
        </div>

        <div className="shrink-0 border-b border-white/5 px-4 py-2">
          <p className="truncate text-xs text-[#a1a1aa]">{videoTitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
          {isLoading && (
            <div className="flex h-full flex-col items-center justify-center text-[#a1a1aa]">
              <i className="ri-loader-4-line mb-3 text-2xl text-sky-400 animate-spin" />
              <p className="text-xs font-medium">댓글을 불러오는 중입니다</p>
            </div>
          )}

          {!isLoading && comments.length === 0 && !errorMessage && (
            <div className="flex h-full flex-col items-center justify-center text-[#71717a]">
              <i className="ri-chat-1-line mb-3 text-3xl" />
              <p className="text-xs font-medium">아직 댓글이 없습니다</p>
            </div>
          )}

          {!isLoading && comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#27272a]">
                    {comment.avatarUrl ? (
                      <img src={comment.avatarUrl} alt={comment.username} className="h-full w-full object-cover" />
                    ) : (
                      <i className="ri-user-line text-sm text-white/70" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-white">{comment.username}</span>
                      <span className="shrink-0 text-[10px] text-[#71717a]">{formatRelativeTime(comment.createdAt)}</span>
                      {comment.updatedAt && (
                        <span className="shrink-0 text-[10px] text-[#52525b]">수정됨</span>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(event) => setEditText(event.target.value)}
                          disabled={savingCommentId === comment.id}
                          className="w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 text-xs text-white placeholder:text-[#71717a] focus:border-sky-400 focus:outline-none disabled:opacity-60"
                        />
                        {!comment.canEdit && (
                          <input
                            type="password"
                            value={editPassword}
                            onChange={(event) => setEditPassword(event.target.value)}
                            placeholder={comment.hasPassword ? "댓글 비밀번호" : "비밀번호가 없으면 비워두세요"}
                            autoComplete="current-password"
                            disabled={savingCommentId === comment.id}
                            className="w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 text-xs text-white placeholder:text-[#71717a] focus:border-sky-400 focus:outline-none disabled:opacity-60"
                          />
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={closeCommentActions}
                            disabled={savingCommentId === comment.id}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-[#a1a1aa] hover:bg-white/10 disabled:opacity-60"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => void saveCommentEdit(comment)}
                            disabled={!editText.trim() || savingCommentId === comment.id}
                            className="rounded-lg bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-[#3f3f46]"
                          >
                            {savingCommentId === comment.id ? "저장 중..." : "저장"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="break-words text-xs leading-relaxed text-[#e4e4e7]">{comment.text}</p>
                    )}

                    {deletingCommentId === comment.id ? (
                      <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2">
                        <p className="text-[11px] font-medium text-amber-100">이 댓글을 삭제할까요?</p>
                        {!comment.canEdit && (
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(event) => setDeletePassword(event.target.value)}
                            placeholder={comment.hasPassword ? "댓글 비밀번호" : "비밀번호가 없으면 비워두세요"}
                            autoComplete="current-password"
                            disabled={savingCommentId === comment.id}
                            className="mt-2 w-full rounded-lg border border-[#3f3f46] bg-[#18181b] px-3 py-2 text-xs text-white placeholder:text-[#71717a] focus:border-amber-400 focus:outline-none disabled:opacity-60"
                          />
                        )}
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={closeCommentActions}
                            disabled={savingCommentId === comment.id}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-[#a1a1aa] hover:bg-white/10 disabled:opacity-60"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteComment(comment)}
                            disabled={savingCommentId === comment.id}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-[#3f3f46]"
                          >
                            {savingCommentId === comment.id ? "삭제 중..." : "삭제"}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {editingCommentId !== comment.id && deletingCommentId !== comment.id && (
                      <div className="mt-1 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void toggleCommentLike(comment)}
                          disabled={likeSavingCommentId === comment.id}
                          className="group flex items-center gap-1 disabled:cursor-wait disabled:opacity-70"
                          aria-label="댓글 좋아요"
                          aria-pressed={comment.likedByMe}
                        >
                          <i
                            className={`${
                              comment.likedByMe
                                ? "ri-heart-3-fill text-red-500"
                                : "ri-heart-3-line text-[#71717a] group-hover:text-white"
                            } text-xs transition-colors`}
                          />
                          <span
                            className={`text-[10px] ${
                              comment.likedByMe ? "text-red-500" : "text-[#71717a] group-hover:text-white"
                            } transition-colors`}
                          >
                            {comment.likes}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(comment)}
                          className="text-[10px] font-semibold text-[#71717a] hover:text-white"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(comment)}
                          className="text-[10px] font-semibold text-[#71717a] hover:text-amber-300"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="shrink-0 border-t border-white/10 px-4 py-3">
          {currentUser ? (
            <div className="mb-2 rounded-xl border border-white/10 bg-[#27272a] px-3 py-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#18181b]">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.nickname} className="h-full w-full object-cover" />
                  ) : (
                    <i className="ri-user-line text-sm text-white/80" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{currentUser.nickname}</p>
                  <p className="truncate text-[10px] text-[#a1a1aa]">@{currentUser.username} 계정으로 댓글</p>
                </div>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs font-medium text-[#a1a1aa]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(event) => setIsAnonymous(event.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-sky-500"
                />
                익명으로 댓글
              </label>
            </div>
          ) : null}

          {needsManualIdentity && (
            <div className="mb-2 grid gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder={currentUser ? "익명 댓글에 표시될 닉네임" : "댓글에 표시될 닉네임"}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 text-xs text-[#f4f4f5] transition-colors placeholder-[#52525b] focus:border-sky-400 focus:outline-none disabled:opacity-60"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="댓글 수정/삭제 보호가 필요하면 입력"
                autoComplete="new-password"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-[#3f3f46] bg-[#27272a] px-3 py-2 text-xs text-[#f4f4f5] transition-colors placeholder-[#52525b] focus:border-sky-400 focus:outline-none disabled:opacity-60"
              />
            </div>
          )}

          {errorMessage && (
            <p className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="댓글 추가..."
              disabled={isSubmitting}
              className="flex-1 rounded-full border border-white/10 bg-[#27272a] px-3 py-2.5 text-xs text-white transition-colors placeholder:text-[#71717a] focus:border-sky-500/50 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-[#3f3f46]"
              aria-label="댓글 작성"
            >
              <i className={isSubmitting ? "ri-loader-4-line animate-spin text-sm text-white" : "ri-send-plane-fill text-sm text-white"} />
            </button>
          </div>
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

function formatCompactCount(count: number) {
  if (count >= 10000) return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1)}만`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
  return String(count);
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) return "방금 전";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

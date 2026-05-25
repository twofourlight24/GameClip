import { useState, useRef, useEffect } from "react";

interface Comment {
  id: number;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
  liked: boolean;
}

const mockComments: Comment[] = [
  {
    id: 1,
    username: "게임매니아",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20blue%20cyan%20gradient&width=60&height=60&seq=301&orientation=squarish",
    text: "와 이 각도 미쳤다... 진짜 에임 감",
    likes: 234,
    time: "2분 전",
    liked: false,
  },
  {
    id: 2,
    username: "프로게이머지망생",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20orange%20red%20gradient&width=60&height=60&seq=302&orientation=squarish",
    text: "나도 이렇게 할 수 있으면 좋겠다 ㅠㅠ",
    likes: 89,
    time: "5분 전",
    liked: false,
  },
  {
    id: 3,
    username: "밤새게임",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20green%20teal%20gradient&width=60&height=60&seq=303&orientation=squarish",
    text: "이건 좀 치는데?",
    likes: 56,
    time: "10분 전",
    liked: false,
  },
  {
    id: 4,
    username: "캐리머신",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20purple%20pink%20gradient&width=60&height=60&seq=304&orientation=squarish",
    text: "댓글보다 영상이 더 재밌음 ㅋㅋㅋ",
    likes: 312,
    time: "15분 전",
    liked: false,
  },
  {
    id: 5,
    username: "랭겜중독자",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20yellow%20gold%20gradient&width=60&height=60&seq=305&orientation=squarish",
    text: "팔로우하고 갑니다. 클립 더 올려주세요!",
    likes: 178,
    time: "22분 전",
    liked: false,
  },
  {
    id: 6,
    username: "초보게이머",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20white%20gray%20gradient&width=60&height=60&seq=306&orientation=squarish",
    text: "이 게임 뭐에요? 하고 싶어지네",
    likes: 45,
    time: "30분 전",
    liked: false,
  },
  {
    id: 7,
    username: "클립수집가",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20crimson%20dark%20gradient&width=60&height=60&seq=307&orientation=squarish",
    text: "베스트 클립 각임. 저장각 ㄱㄱ",
    likes: 67,
    time: "42분 전",
    liked: false,
  },
  {
    id: 8,
    username: "스트리머팬",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20sky%20blue%20gradient&width=60&height=60&seq=308&orientation=squarish",
    text: "이 사람 방송 언제 하나요? 알려주세요",
    likes: 23,
    time: "1시간 전",
    liked: false,
  },
];

interface CommentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  commentCount: number;
}

export default function CommentPopup({
  isOpen,
  onClose,
  videoTitle,
  commentCount,
}: CommentPopupProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

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

  const toggleLike = (id: number) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      username: "나",
      avatar:
        "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20emerald%20green%20gradient&width=60&height=60&seq=309&orientation=squarish",
      text: inputValue.trim(),
      likes: 0,
      time: "방금 전",
      liked: false,
    };
    setComments((prev) => [newComment, ...prev]);
    setInputValue("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup - roughly 1/4 screen width on desktop */}
      <div
        ref={popupRef}
        className="relative z-10 w-[92vw] sm:w-[480px] md:w-[25vw] md:min-w-[380px] md:max-w-[480px] h-[70vh] max-h-[600px] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-sm font-bold">댓글</h3>
            <span className="text-[#a1a1aa] text-xs">
              {(commentCount / 1000).toFixed(1)}k
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <i className="ri-close-line text-white text-lg" />
          </button>
        </div>

        {/* Video title */}
        <div className="px-4 py-2 border-b border-white/5 shrink-0">
          <p className="text-[#a1a1aa] text-xs truncate">{videoTitle}</p>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <img
                src={comment.avatar}
                alt={comment.username}
                className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-white text-xs font-semibold">
                    {comment.username}
                  </span>
                  <span className="text-[#71717a] text-[10px]">
                    {comment.time}
                  </span>
                </div>
                <p className="text-[#e4e4e7] text-xs leading-relaxed break-words">
                  {comment.text}
                </p>
                <button
                  onClick={() => toggleLike(comment.id)}
                  className="flex items-center gap-1 mt-1 group"
                >
                  <i
                    className={`${
                      comment.liked
                        ? "ri-heart-3-fill text-red-500"
                        : "ri-heart-3-line text-[#71717a] group-hover:text-white"
                    } text-xs transition-colors`}
                  />
                  <span
                    className={`text-[10px] ${
                      comment.liked ? "text-red-500" : "text-[#71717a] group-hover:text-white"
                    } transition-colors`}
                  >
                    {comment.likes}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="px-4 py-3 border-t border-white/10 shrink-0 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="댓글 추가..."
            className="flex-1 bg-[#27272a] text-white text-xs px-3 py-2.5 rounded-full border border-white/10 focus:border-sky-500/50 focus:outline-none placeholder:text-[#71717a] transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-400 disabled:bg-[#3f3f46] disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <i className="ri-send-plane-fill text-white text-sm" />
          </button>
        </form>
      </div>
    </div>
  );
}
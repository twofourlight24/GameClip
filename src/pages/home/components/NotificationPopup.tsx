import { useState, useRef, useEffect } from "react";

interface Notification {
  id: number;
  username: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  type: "like" | "comment" | "follow" | "mention" | "system";
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    username: "게임매니아",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20blue%20cyan%20gradient&width=60&height=60&seq=401&orientation=squarish",
    action: "님이 회원님의 영상을 좋아합니다",
    target: "『발로란트』에임 각도 미쳤다...",
    time: "2분 전",
    type: "like",
    read: false,
  },
  {
    id: 2,
    username: "프로게이머지망생",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20orange%20red%20gradient&width=60&height=60&seq=402&orientation=squarish",
    action: "님이 댓글을 남겼습니다",
    target: "나도 이렇게 할 수 있으면 좋겠다 ㅠㅠ",
    time: "5분 전",
    type: "comment",
    read: false,
  },
  {
    id: 3,
    username: "밤새게임",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20green%20teal%20gradient&width=60&height=60&seq=403&orientation=squarish",
    action: "님이 회원님을 팔로우하기 시작했습니다",
    target: "",
    time: "10분 전",
    type: "follow",
    read: false,
  },
  {
    id: 4,
    username: "캐리머신",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20purple%20pink%20gradient&width=60&height=60&seq=404&orientation=squarish",
    action: "님이 회원님을 언급했습니다",
    target: "@나 이거 봐봐 ㅋㅋㅋ",
    time: "15분 전",
    type: "mention",
    read: true,
  },
  {
    id: 5,
    username: "랭겜중독자",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20yellow%20gold%20gradient&width=60&height=60&seq=405&orientation=squarish",
    action: "님이 댓글을 남겼습니다",
    target: "팔로우하고 갑니다. 클립 더 올려주세요!",
    time: "22분 전",
    type: "comment",
    read: true,
  },
  {
    id: 6,
    username: "GameClip 공식",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20emerald%20green%20gradient&width=60&height=60&seq=406&orientation=squarish",
    action: "이번 주 트렌딩 게임 TOP 10이 업데이트되었습니다",
    target: "지금 확인해보세요!",
    time: "30분 전",
    type: "system",
    read: true,
  },
  {
    id: 7,
    username: "클립수집가",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20crimson%20dark%20gradient&width=60&height=60&seq=407&orientation=squarish",
    action: "님이 회원님의 영상을 좋아합니다",
    target: "『리그 오브 레전드』펜타킬 각",
    time: "42분 전",
    type: "like",
    read: true,
  },
  {
    id: 8,
    username: "스트리머팬",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20sky%20blue%20gradient&width=60&height=60&seq=408&orientation=squarish",
    action: "님이 회원님을 팔로우하기 시작했습니다",
    target: "",
    time: "1시간 전",
    type: "follow",
    read: true,
  },
  {
    id: 9,
    username: "초보게이머",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20white%20gray%20gradient&width=60&height=60&seq=409&orientation=squarish",
    action: "님이 회원님의 영상을 저장했습니다",
    target: "이 게임 뭐에요? 하고 싶어지네",
    time: "1시간 전",
    type: "like",
    read: true,
  },
  {
    id: 10,
    username: "GameClip 공식",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20emerald%20green%20gradient&width=60&height=60&seq=410&orientation=squarish",
    action: "이번 주 게임 클립 챌린지가 시작되었습니다",
    target: "참여하고 보상을 받아가세요!",
    time: "2시간 전",
    type: "system",
    read: true,
  },
];

const typeIconMap = {
  like: "ri-heart-3-fill",
  comment: "ri-chat-1-fill",
  follow: "ri-user-add-fill",
  mention: "ri-at-line",
  system: "ri-megaphone-fill",
};

const typeColorMap = {
  like: "text-red-500",
  comment: "text-sky-400",
  follow: "text-emerald-400",
  mention: "text-amber-400",
  system: "text-violet-400",
};

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPopup({
  isOpen,
  onClose,
}: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const popupRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup - same size as CommentPopup */}
      <div
        ref={popupRef}
        className="relative z-10 w-[92vw] sm:w-[480px] md:w-[25vw] md:min-w-[380px] md:max-w-[480px] h-[70vh] max-h-[600px] bg-[#18181b] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-sm font-bold">알림</h3>
            {unreadCount > 0 && (
              <span className="text-[#a1a1aa] text-xs">
                {unreadCount}개 읽지 않음
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[#a1a1aa] text-xs hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
              >
                모두 읽음
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <i className="ri-close-line text-white text-lg" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {notifications.map((noti) => (
            <button
              key={noti.id}
              onClick={() => markAsRead(noti.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 hover:bg-white/5 ${
                !noti.read ? "bg-white/[0.03]" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={noti.avatar}
                  alt={noti.username}
                  className="w-9 h-9 rounded-full object-cover border border-white/10"
                />
                {/* Type icon badge */}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#18181b] border border-[#3f3f46] flex items-center justify-center`}
                >
                  <i
                    className={`${typeIconMap[noti.type]} ${typeColorMap[noti.type]} text-[10px]`}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[#e4e4e7] text-xs leading-relaxed">
                  <span className="text-white font-semibold">
                    {noti.username}
                  </span>
                  {noti.action}
                </p>
                {noti.target && (
                  <p className="text-[#71717a] text-[11px] mt-0.5 truncate">
                    {noti.target}
                  </p>
                )}
                <p className="text-[#52525b] text-[10px] mt-1">{noti.time}</p>
              </div>

              {/* Unread dot */}
              {!noti.read && (
                <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1.5" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
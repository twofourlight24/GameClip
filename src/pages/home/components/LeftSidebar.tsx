import { useEffect, useState } from "react";
import NotificationPopup from "./NotificationPopup";
import TestAccountPopup from "./TestAccountPopup";
import TestAuthPopup from "./TestAuthPopup";
import UploadPopup from "./UploadPopup";

const apiPort = "4000";
const defaultApiBaseUrl =
  import.meta.env.VITE_UPLOAD_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

const navItems = [
  { id: "home", label: "홈", icon: "ri-home-5-line", activeIcon: "ri-home-5-fill" },
  { id: "notifications", label: "알림", icon: "ri-notification-3-line", activeIcon: "ri-notification-3-fill" },
  { id: "upload", label: "업로드", icon: "ri-add-circle-line", activeIcon: "ri-add-circle-fill" },
];

interface LeftSidebarProps {
  onUploadSuccess?: () => void;
  onHomeClick?: () => void;
}

type TestAuthMode = "login" | "signup";

type TestAuthUser = {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string | null;
  usesDefaultAvatar?: boolean;
};

export default function LeftSidebar({ onUploadSuccess, onHomeClick }: LeftSidebarProps) {
  const [active, setActive] = useState("home");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [authMode, setAuthMode] = useState<TestAuthMode>("login");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [testUser, setTestUser] = useState<TestAuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/me`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as TestAuthUser;
      })
      .then((user) => {
        if (isMounted) {
          setTestUser(user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTestUser(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const goHome = () => {
    setActive("home");
    setIsNotificationOpen(false);
    setIsUploadOpen(false);
    onHomeClick?.();
  };

  const openAuth = (mode: TestAuthMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const logout = async () => {
    await fetch(`${cleanApiBaseUrl(defaultApiBaseUrl)}/api/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    setTestUser(null);
    setIsAccountOpen(false);
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-[72px] lg:w-[210px] bg-[#27272a] border-r border-[#3f3f46] z-40 flex flex-col py-6 transition-all duration-300">
        {/* Logo */}
        <div
          onClick={goHome}
          className="px-4 lg:px-6 mb-8 flex items-center justify-center lg:justify-start cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 flex items-center justify-center shrink-0">
            <i className="ri-gamepad-line text-white text-xl"></i>
          </div>
          <span className="hidden lg:block ml-3 text-[#f4f4f5] font-bold text-xl tracking-tight">
            GameClip
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-2 lg:px-4">
          {navItems.map((item) => {
            const isActive =
              item.id === "upload"
                ? isUploadOpen
                : item.id === "notifications"
                ? isNotificationOpen
                : active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "upload") {
                    setIsUploadOpen(true);
                  } else if (item.id === "notifications") {
                    setIsNotificationOpen(true);
                  } else {
                    goHome();
                  }
                }}
                className={`
                  group flex items-center gap-4 px-3 lg:px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive ? "bg-[#18181b] font-semibold" : "hover:bg-[#18181b]"}
                `}
              >
                <div
                  className={`
                    w-[44px] h-[44px] rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0
                    ${isActive
                      ? "bg-gradient-to-br from-sky-400/10 via-blue-500/10 to-cyan-400/10"
                      : "bg-transparent"
                    }
                  `}
                >
                  <i
                    className={`
                      ${isActive ? item.activeIcon : item.icon}
                      text-2xl transition-colors duration-200
                      ${isActive ? "text-sky-400" : "text-[#a1a1aa] group-hover:text-[#f4f4f5]"}
                    `}
                  ></i>
                </div>
                <span
                  className={`
                    hidden lg:block text-[15px] font-medium transition-colors duration-200
                    ${isActive ? "text-[#f4f4f5]" : "text-[#a1a1aa] group-hover:text-[#f4f4f5]"}
                  `}
                >
                  {item.label}
                </span>
                {item.id === "notifications" && (
                  <span className="hidden lg:flex ml-auto w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] font-bold items-center justify-center">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-2 lg:px-4">
          {testUser ? (
            <div className="rounded-2xl bg-[#18181b] p-2 lg:p-3">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#27272a]">
                  {testUser.avatarUrl ? (
                    <img
                      src={testUser.avatarUrl}
                      alt={testUser.nickname}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <i className="ri-user-line text-base text-white/80" />
                  )}
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="truncate text-sm font-bold text-white">{testUser.nickname}</p>
                  <p className="truncate text-xs text-[#a1a1aa]">@{testUser.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountOpen(true)}
                className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-[#a1a1aa] transition-colors hover:bg-white/5 hover:text-white"
              >
                <i className="ri-settings-3-line text-base" />
                <span className="hidden lg:inline">계정 설정</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-[#a1a1aa] transition-colors hover:bg-white/5 hover:text-white"
              >
                <i className="ri-logout-box-r-line text-base" />
                <span className="hidden lg:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="group flex h-11 items-center justify-center gap-3 rounded-xl bg-[#18181b] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] lg:justify-start lg:px-4"
              >
                <i className="ri-login-circle-line text-xl text-sky-400" />
                <span className="hidden lg:inline">로그인</span>
              </button>
              <button
                type="button"
                onClick={() => openAuth("signup")}
                className="group flex h-11 items-center justify-center gap-3 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 text-sm font-semibold text-sky-200 transition-colors hover:bg-sky-500/20 lg:justify-start lg:px-4"
              >
                <i className="ri-user-add-line text-xl text-sky-300" />
                <span className="hidden lg:inline">회원가입</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Notification Popup */}
      <NotificationPopup
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Upload Popup */}
      <UploadPopup
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={onUploadSuccess}
        currentUser={testUser}
      />

      <TestAuthPopup
        isOpen={isAuthOpen}
        mode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onModeChange={setAuthMode}
        onAuthenticated={setTestUser}
      />

      {testUser && (
        <TestAccountPopup
          isOpen={isAccountOpen}
          user={testUser}
          onClose={() => setIsAccountOpen(false)}
          onUpdated={setTestUser}
          onDeleted={() => setTestUser(null)}
        />
      )}
    </>
  );
}

function cleanApiBaseUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

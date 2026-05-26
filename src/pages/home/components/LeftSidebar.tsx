import { useState } from "react";
import NotificationPopup from "./NotificationPopup";

const navItems = [
  { id: "home", label: "홈", icon: "ri-home-5-line", activeIcon: "ri-home-5-fill" },
  { id: "notifications", label: "알림", icon: "ri-notification-3-line", activeIcon: "ri-notification-3-fill" },
  { id: "upload", label: "업로드", icon: "ri-add-circle-line", activeIcon: "ri-add-circle-fill" },
];

interface LeftSidebarProps {
  onUploadClick?: () => void;
  showUploadPanel?: boolean;
}

export default function LeftSidebar({ onUploadClick, showUploadPanel }: LeftSidebarProps) {
  const [active, setActive] = useState("home");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-[72px] lg:w-[210px] bg-[#27272a] border-r border-[#3f3f46] z-40 flex flex-col py-6 transition-all duration-300">
        {/* Logo */}
        <div className="px-4 lg:px-6 mb-8 flex items-center justify-center lg:justify-start">
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
                ? showUploadPanel
                : item.id === "notifications"
                ? isNotificationOpen
                : active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "upload") {
                    onUploadClick?.();
                  } else if (item.id === "notifications") {
                    setIsNotificationOpen(true);
                  } else {
                    setActive(item.id);
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
      </aside>

      {/* Notification Popup */}
      <NotificationPopup
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
}
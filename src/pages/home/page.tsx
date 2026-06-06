import { useCallback, useState } from "react";
import LeftSidebar from "./components/LeftSidebar";
import ReelsFeed from "./components/ReelsFeed";
import RightSidebar from "./components/RightSidebar";
import Toast from "./components/Toast";

export default function Home() {
  const [selectedGameName, setSelectedGameName] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [homeResetKey, setHomeResetKey] = useState(0);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const handleGameClick = (gameName: string) => {
    setSelectedGameName((prev) => (prev === gameName ? null : gameName));
  };

  const handleMobileGameClick = (gameName: string) => {
    handleGameClick(gameName);
    setIsRightSidebarOpen(false);
  };

  const handleHomeClick = useCallback(() => {
    setSelectedGameName(null);
    setHomeResetKey((currentKey) => currentKey + 1);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    setToastVisible(true);
  }, []);

  const handleToastDone = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#18181b] text-[#f4f4f5]">
      {/* Left Sidebar */}
      <LeftSidebar onUploadSuccess={handleUploadSuccess} onHomeClick={handleHomeClick} />

      <button
        type="button"
        onClick={() => setIsRightSidebarOpen(true)}
        className="fixed right-4 top-4 z-[65] flex h-14 w-14 items-center justify-center rounded-full border border-sky-300/60 bg-sky-500 text-white shadow-xl shadow-sky-950/50 ring-4 ring-black/30 transition-colors hover:bg-sky-400 lg:hidden"
        aria-label="오른쪽 사이드바 열기"
      >
        <i className="ri-menu-search-line text-2xl" />
      </button>

      {/* Main Content */}
      <main className="ml-[72px] lg:ml-[210px] h-[100dvh] overflow-hidden">
        <div className="flex gap-3 h-full px-2 md:px-3 lg:px-4">
          {/* Center - Reels */}
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <ReelsFeed
              selectedGameName={selectedGameName}
              onGameNameChange={setSelectedGameName}
              homeResetKey={homeResetKey}
            />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block shrink-0 py-4">
            <RightSidebar onGameClick={handleGameClick} selectedGameName={selectedGameName} />
          </div>
        </div>
      </main>

      {isRightSidebarOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            onClick={() => setIsRightSidebarOpen(false)}
            aria-label="오른쪽 사이드바 닫기"
          />
          <div className="absolute inset-y-0 right-0 w-[min(320px,calc(100vw-80px))] border-l border-[#3f3f46] bg-[#18181b] px-3 py-4 shadow-2xl shadow-black/50">
            <button
              type="button"
              onClick={() => setIsRightSidebarOpen(false)}
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#3f3f46] bg-[#27272a] text-[#f4f4f5] transition-colors hover:bg-[#3f3f46]"
              aria-label="오른쪽 사이드바 닫기"
            >
              <i className="ri-close-line text-xl" />
            </button>
            <RightSidebar
              onGameClick={handleMobileGameClick}
              selectedGameName={selectedGameName}
              className="h-[calc(100dvh-80px)] w-full"
            />
          </div>
        </div>
      )}

      {/* Upload success toast */}
      <Toast
        message="업로드 되었습니다!"
        visible={toastVisible}
        onDone={handleToastDone}
      />
    </div>
  );
}

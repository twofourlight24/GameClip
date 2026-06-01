import { useCallback, useState } from "react";
import LeftSidebar from "./components/LeftSidebar";
import ReelsFeed from "./components/ReelsFeed";
import RightSidebar from "./components/RightSidebar";
import Toast from "./components/Toast";

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [homeResetKey, setHomeResetKey] = useState(0);

  const handleGameClick = (tag: string) => {
    setSelectedGame((prev) => (prev === tag ? null : tag));
  };

  const handleHomeClick = useCallback(() => {
    setSelectedGame(null);
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

      {/* Main Content */}
      <main className="ml-[72px] lg:ml-[210px] h-[100dvh] overflow-hidden">
        <div className="flex gap-3 h-full px-2 md:px-3 lg:px-4">
          {/* Center - Reels */}
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <ReelsFeed
              selectedTag={selectedGame}
              onTagChange={setSelectedGame}
              homeResetKey={homeResetKey}
            />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block shrink-0 py-4">
            <RightSidebar onGameClick={handleGameClick} />
          </div>
        </div>
      </main>

      {/* Upload success toast */}
      <Toast
        message="업로드 되었습니다!"
        visible={toastVisible}
        onDone={handleToastDone}
      />
    </div>
  );
}

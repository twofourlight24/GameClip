import { useState } from "react";
import LeftSidebar from "./components/LeftSidebar";
import ReelsFeed from "./components/ReelsFeed";
import RightSidebar from "./components/RightSidebar";

export default function Home() {
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleUploadClick = () => {
    setShowUploadPanel((prev) => !prev);
  };

  const handleGameClick = (tag: string) => {
    setSelectedGame((prev) => (prev === tag ? null : tag));
  };

  return (
    <div className="min-h-screen bg-[#18181b] text-[#f4f4f5]">
      {/* Left Sidebar */}
      <LeftSidebar onUploadClick={handleUploadClick} showUploadPanel={showUploadPanel} />

      {/* Main Content */}
      <main className="ml-[72px] lg:ml-[210px] h-[100dvh] overflow-hidden">
        <div className="flex gap-3 h-full px-2 md:px-3 lg:px-4">
          {/* Center - Reels */}
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <ReelsFeed selectedTag={selectedGame} onTagChange={setSelectedGame} />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block shrink-0 py-4">
            <RightSidebar showUploadPanel={showUploadPanel} onGameClick={handleGameClick} />
          </div>
        </div>
      </main>
    </div>
  );
}
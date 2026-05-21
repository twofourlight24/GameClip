import LeftSidebar from "./components/LeftSidebar";
import ReelsFeed from "./components/ReelsFeed";
import RightSidebar from "./components/RightSidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#18181b] text-[#f4f4f5]">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <main className="ml-[72px] lg:ml-[240px] h-[100dvh] overflow-hidden">
        <div className="flex gap-6 h-full px-4 md:px-6 lg:px-8">
          {/* Center - Reels */}
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            <ReelsFeed />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block shrink-0 py-6">
            <RightSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
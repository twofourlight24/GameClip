export default function BottomCTA() {
  return (
    <section className="relative mt-12 rounded-3xl overflow-hidden bg-[#27272a] border border-[#3f3f46]">
      <div className="flex flex-col md:flex-row items-center">
        {/* Image side */}
        <div className="w-full md:w-1/2 h-[280px] md:h-[360px] relative">
          <img
            src="https://readdy.ai/api/search-image?query=futuristic%20gaming%20setup%20with%20RGB%20neon%20lights%20dark%20room%20multiple%20monitors%20showing%20esports%20gameplay%20streamer%20headset%20keyboard%20mouse%20professional%20gaming%20gear%20cyberpunk%20aesthetic%20high%20quality%20photorealistic&width=600&height=400&seq=501&orientation=landscape"
            alt="게이밍 세팅"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#27272a] hidden md:block"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#27272a] to-transparent md:hidden"></div>
        </div>

        {/* Text side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f4f4f5] leading-tight mb-4">
            당신의 플레이를
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              세상과 공유하세요
            </span>
          </h2>
          <p className="text-[#a1a1aa] text-sm md:text-base leading-relaxed mb-8 max-w-md">
            최고의 순간을 클립으로 남기고, 전 세계 게이머들과 함께
            <br className="hidden md:block" />
            당신의 실력을 자랑하세요.
          </p>
          <button className="group flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#18181b] border border-[#3f3f46] text-[#f4f4f5] font-medium text-sm hover:bg-[#27272a] hover:border-sky-400/30 transition-all duration-300">
            영상 업로드
            <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
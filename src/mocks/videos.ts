export interface Video {
  id: string;
  title: string;
  gameName: string;
  gameTag: string;
  thumbnail: string;
  videoUrl?: string;
  views: string;
  duration: string;
  uploader: string;
  avatar: string;
  likes: number;
  likedByMe?: boolean;
  comments: number;
  isHero?: boolean;
  tags?: string[];
}

export const videos: Video[] = [
  {
    id: "v1",
    title: "레전드 펜타킬 클립 - 리신 인섹 각도 미쳤다",
    gameName: "리그 오브 레전드",
    gameTag: "lol",
    thumbnail:
      "https://readdy.ai/api/search-image?query=dramatic%20League%20of%20Legends%20gameplay%20screenshot%20with%20neon%20abilities%20and%20explosions%20dark%20arena%20background%20epic%20moment%20highlight%20cinematic%20lighting%20esports&width=600&height=800&seq=101&orientation=portrait",
    views: "124만",
    duration: "0:42",
    uploader: "롤매니아",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20cyan%20magenta%20gradient&width=100&height=100&seq=201&orientation=squarish",
    likes: 45200,
    comments: 1890,
    isHero: true,
    tags: ["리그오브레전드", "MOBA", "5대5"],
  },
  {
    id: "v2",
    title: "발로란트 에임 각도 보고 배워가세요",
    gameName: "발로란트",
    gameTag: "valorant",
    thumbnail:
      "https://readdy.ai/api/search-image?query=Valorant%20tactical%20shooter%20gameplay%20screenshot%20with%20agents%20and%20gunfight%20neon%20cyberpunk%20environment%20dark%20corridor%20esports%20cinematic%20moody%20lighting&width=600&height=800&seq=102&orientation=portrait",
    views: "89만",
    duration: "1:15",
    uploader: "에임갓",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20red%20orange%20gradient&width=100&height=100&seq=202&orientation=squarish",
    likes: 32100,
    comments: 1203,
    tags: ["발로란트", "FPS", "5대5"],
  },
  {
    id: "v3",
    title: "철권8 최강 콤보 98히트 달성",
    gameName: "철권 8",
    gameTag: "tekken",
    thumbnail:
      "https://readdy.ai/api/search-image?query=Tekken%20fighting%20game%20screenshot%20with%20characters%20in%20intense%20combat%20neon%20arena%20dark%20background%20esports%20fighting%20game%20cinematic%20lighting%20explosive%20effects&width=600&height=800&seq=103&orientation=portrait",
    views: "56만",
    duration: "0:58",
    uploader: "격투킹",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20purple%20blue%20gradient&width=100&height=100&seq=203&orientation=squarish",
    likes: 18700,
    comments: 876,
    tags: ["철권8", "격투게임", "1대1"],
  },
  {
    id: "v4",
    title: "배틀그라운드 1vs4 치킨 마지막 각",
    gameName: "배틀그라운드",
    gameTag: "pubg",
    thumbnail:
      "https://readdy.ai/api/search-image?query=PUBG%20battle%20royale%20gameplay%20screenshot%20with%20player%20in%20last%20circle%20desert%20environment%20sniping%20from%20hill%20dark%20atmospheric%20esports%20cinematic%20lighting&width=600&height=800&seq=104&orientation=portrait",
    views: "210만",
    duration: "2:03",
    uploader: "배그신",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20green%20teal%20gradient&width=100&height=100&seq=204&orientation=squarish",
    likes: 67800,
    comments: 3420,
    tags: ["배틀그라운드", "배그", "FPS"],
  },
  {
    id: "v5",
    title: "메이플스토리 6차 전직 스킬 쇼케이스",
    gameName: "메이플스토리",
    gameTag: "maple",
    thumbnail:
      "https://readdy.ai/api/search-image?query=MapleStory%202D%20side%20scrolling%20gameplay%20with%20colorful%20skills%20and%20effects%20chibi%20character%20fantasy%20forest%20background%20vibrant%20neon%20abilities%20dark%20moody%20atmosphere&width=600&height=800&seq=105&orientation=portrait",
    views: "45만",
    duration: "3:20",
    uploader: "메풀러",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20yellow%20pink%20gradient&width=100&height=100&seq=205&orientation=squarish",
    likes: 12500,
    comments: 654,
    tags: ["메이플스토리", "RPG", "사이드스크롤"],
  },
  {
    id: "v6",
    title: "로스트아크 군단장 레이드 솔로 클리어",
    gameName: "로스트아크",
    gameTag: "lostark",
    thumbnail:
      "https://readdy.ai/api/search-image?query=Lost%20Ark%20MMORPG%20boss%20raid%20screenshot%20with%20massive%20demon%20enemy%20epic%20battle%20neon%20skills%20dark%20fiery%20arena%20cinematic%20lighting%20esports%20MMO%20action&width=600&height=800&seq=106&orientation=portrait",
    views: "78만",
    duration: "4:15",
    uploader: "레이더스",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20gold%20amber%20gradient&width=100&height=100&seq=206&orientation=squarish",
    likes: 28900,
    comments: 1432,
    tags: ["로스트아크", "MMORPG", "레이드"],
  },
  {
    id: "v7",
    title: "오버워치2 에코 6킬 울트타이밍",
    gameName: "오버워치 2",
    gameTag: "overwatch",
    thumbnail:
      "https://readdy.ai/api/search-image?query=Overwatch%202%20hero%20shooter%20gameplay%20with%20multiple%20heroes%20in%20teamfight%20neon%20futuristic%20city%20dark%20night%20environment%20esports%20cinematic%20abilities%20explosions&width=600&height=800&seq=107&orientation=portrait",
    views: "92만",
    duration: "0:35",
    uploader: "OW매니아",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20cyan%20white%20gradient&width=100&height=100&seq=207&orientation=squarish",
    likes: 35600,
    comments: 2100,
    tags: ["오버워치2", "FPS", "6대6"],
  },
  {
    id: "v8",
    title: "FC온라인 30미터 중거리 슈퍼골",
    gameName: "FC 온라인",
    gameTag: "fconline",
    thumbnail:
      "https://readdy.ai/api/search-image?query=FC%20Online%20football%20soccer%20game%20screenshot%20with%20player%20shooting%20long%20range%20goal%20stadium%20at%20night%20floodlights%20dark%20atmosphere%20esports%20cinematic%20celebration%20moment&width=600&height=800&seq=108&orientation=portrait",
    views: "33만",
    duration: "0:28",
    uploader: "풋볼킹",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20lime%20green%20gradient&width=100&height=100&seq=208&orientation=squarish",
    likes: 9800,
    comments: 432,
    tags: ["FC온라인", "스포츠", "축구"],
  },
  {
    id: "v9",
    title: "서든어택 스나이퍼 원킬 모음",
    gameName: "서든어택",
    gameTag: "sudden",
    thumbnail:
      "https://readdy.ai/api/search-image?query=Sudden%20Attack%20tactical%20FPS%20gameplay%20screenshot%20with%20sniper%20scope%20aiming%20at%20enemy%20dark%20indoor%20warehouse%20environment%20neon%20muzzle%20flash%20esports%20cinematic%20tension&width=600&height=800&seq=109&orientation=portrait",
    views: "67만",
    duration: "1:45",
    uploader: "스나퍼Z",
    avatar:
      "https://readdy.ai/api/search-image?query=abstract%20cyberpunk%20gaming%20avatar%20profile%20icon%20neon%20glow%20dark%20background%20minimalist%20geometric%20shape%20crimson%20dark%20gradient&width=100&height=100&seq=209&orientation=squarish",
    likes: 21300,
    comments: 987,
    tags: ["서든어택", "FPS", "밀리터리"],
  },
];

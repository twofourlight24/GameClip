export interface Game {
  id: string;
  name: string;
  tag: string;
  color: string;
  icon: string;
  isTrending?: boolean;
}

export const trendingGames: Game[] = [
  {
    id: "g1",
    name: "리그 오브 레전드",
    tag: "lol",
    color: "#c89b3c",
    icon: "https://readdy.ai/api/search-image?query=League%20of%20Legends%20game%20logo%20icon%20circular%20gold%20and%20blue%20colors%20dark%20background%20minimalist%20clean%20design%20esports%20logo%20style&width=128&height=128&seq=301&orientation=squarish",
    isTrending: true,
  },
  {
    id: "g2",
    name: "발로란트",
    tag: "valorant",
    color: "#ff4655",
    icon: "https://readdy.ai/api/search-image?query=Valorant%20game%20logo%20icon%20circular%20red%20and%20black%20colors%20dark%20background%20minimalist%20clean%20design%20esports%20logo%20style&width=128&height=128&seq=302&orientation=squarish",
    isTrending: true,
  },
  {
    id: "g3",
    name: "배틀그라운드",
    tag: "pubg",
    color: "#f2a900",
    icon: "https://readdy.ai/api/search-image?query=PUBG%20game%20logo%20icon%20circular%20yellow%20and%20black%20colors%20dark%20background%20minimalist%20clean%20design%20esports%20logo%20style&width=128&height=128&seq=303&orientation=squarish",
    isTrending: true,
  },
  {
    id: "g4",
    name: "오버워치 2",
    tag: "overwatch",
    color: "#f99e1a",
    icon: "https://readdy.ai/api/search-image?query=Overwatch%202%20game%20logo%20icon%20circular%20orange%20and%20black%20colors%20dark%20background%20minimalist%20clean%20design%20esports%20logo%20style&width=128&height=128&seq=304&orientation=squarish",
    isTrending: true,
  },
  {
    id: "g5",
    name: "메이플스토리",
    tag: "maple",
    color: "#ff6b9d",
    icon: "https://readdy.ai/api/search-image?query=MapleStory%20game%20logo%20icon%20circular%20pink%20and%20purple%20colors%20dark%20background%20minimalist%20clean%20design%20esports%20logo%20style&width=128&height=128&seq=305&orientation=squarish",
    isTrending: true,
  },
  {
    id: "g6",
    name: "로스트아크",
    tag: "lostark",
    color: "#a855f7",
    icon: "https://readdy.ai/api/search-image?query=Lost%20Ark%20game%20logo%20icon%20circular%20purple%20and%20gold%20colors%20dark%20background%20minimalist%20clean%20design%20esports%20logo%20style&width=128&height=128&seq=306&orientation=squarish",
    isTrending: true,
  },
];

export const gameGenres = [
  { id: "fps", name: "FPS", color: "#ef4444" },
  { id: "moba", name: "MOBA", color: "#3b82f6" },
  { id: "rpg", name: "RPG", color: "#8b5cf6" },
  { id: "fighting", name: "격투", color: "#f59e0b" },
  { id: "sports", name: "스포츠", color: "#06b6d4" },
];
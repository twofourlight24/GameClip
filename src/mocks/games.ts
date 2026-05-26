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
    icon: "https://storage.readdy-site.link/project_files/0fe661e8-9328-496e-9536-90bae34f6160/38a199c5-d697-4fc7-866b-a0bba9bc225a_LOL.png?v=0de9ef41d4549041eb3693a048cd098e",
    isTrending: true,
  },
  {
    id: "g2",
    name: "발로란트",
    tag: "valorant",
    color: "#ff4655",
    icon: "https://storage.readdy-site.link/project_files/0fe661e8-9328-496e-9536-90bae34f6160/6793153f-6221-465a-bf06-1acb78fa37b6_valorant.png?v=f90693dfcb51d6315b71f3a52814511f",
    isTrending: true,
  },
  {
    id: "g3",
    name: "배틀그라운드",
    tag: "pubg",
    color: "#f2a900",
    icon: "https://storage.readdy-site.link/project_files/0fe661e8-9328-496e-9536-90bae34f6160/9f795baa-61fc-4838-909c-ee172342bcee_battleground.png?v=d140232c13bfc26dfe4dbd1f92dc624f",
    isTrending: true,
  },
  {
    id: "g4",
    name: "오버워치 2",
    tag: "overwatch",
    color: "#f99e1a",
    icon: "https://storage.readdy-site.link/project_files/0fe661e8-9328-496e-9536-90bae34f6160/5d438cd6-c518-4ed8-822c-8fcf438baea7_overwatch.png?v=780c6ccc3d8ea4b89c00a6243f5c1ba5",
    isTrending: true,
  },
  {
    id: "g5",
    name: "메이플스토리",
    tag: "maple",
    color: "#ff6b9d",
    icon: "https://storage.readdy-site.link/project_files/0fe661e8-9328-496e-9536-90bae34f6160/ce9a145b-0757-480b-99c5-c42901807d00_maplestory.png?v=be05ab5773264cbafeba0bb25f432e61",
    isTrending: true,
  },
  {
    id: "g6",
    name: "로스트아크",
    tag: "lostark",
    color: "#a855f7",
    icon: "https://storage.readdy-site.link/project_files/0fe661e8-9328-496e-9536-90bae34f6160/94386b5a-d300-49dc-b63e-cd5d2b94d95f_lostark.png?v=6926a193d3436b8ae52fc0b58832c95f",
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
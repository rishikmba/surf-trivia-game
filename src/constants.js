export const COLORS = {
  blue: "#273990",
  blueDark: "#1C2A6B",
  blueLight: "#3D50B0",
  bluePale: "#E8ECF8",
  white: "#FFFFFF",
  offWhite: "#F7F9FC",
  gray100: "#F1F3F7",
  gray200: "#E2E6ED",
  gray300: "#C8CFDB",
  gray500: "#7A8599",
  gray700: "#3D4555",
  gray900: "#1A1F2B",
  green: "#2D9D5E",
  red: "#D94444",
  gold: "#E6A817",
  orange: "#E67E22",
};

export const CATEGORY_META = {
  legends: { color: COLORS.gold },
  breaks: { color: COLORS.blueLight },
  history: { color: COLORS.gray700 },
  culture: { color: COLORS.orange },
  craft: { color: COLORS.gray500 },
  ocean: { color: "#1A8FA0" },
  bigwave: { color: COLORS.blueDark },
  industry: { color: "#6B4A8A" },
  women: { color: "#C75B8E" },
  tricks: { color: "#D97B26" },
  pws: { color: COLORS.blue },
};

export const LEVEL_DEFS = [
  { name: "Whitewash", desc: "Easy questions to warm up", difficulty: "easy", questionsCount: 15 },
  { name: "Outside Break", desc: "Medium difficulty — test your knowledge", difficulty: "medium", questionsCount: 15 },
  { name: "The Lineup", desc: "Harder questions — prove you belong", difficulty: "hard", questionsCount: 15 },
  { name: "The Peak", desc: "Expert level — only real heads survive", difficulty: "hard", questionsCount: 15 },
  { name: "The Barrel", desc: "Master level — deep inside the tube", difficulty: "hard", questionsCount: 15 },
  { name: "Legends Only", desc: "You've earned your place in surf history", difficulty: "hard", questionsCount: 15 },
];

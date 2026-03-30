import triviaData from "./data/trivia_questions.json";

// Seeded random using date string
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getAllQuestions() {
  return triviaData.questions;
}

export function getCategories() {
  return triviaData.categories;
}

export function getDailyQuestions(dateStr) {
  const rng = seededRandom(dateStr);
  const shuffled = shuffle(triviaData.questions, rng);
  return shuffled.slice(0, 10);
}

export function getDayNumber() {
  const start = new Date(2026, 2, 29); // March 29, 2026 in local time
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / 86400000) + 1;
}

export function getCategoryQuestions(categoryId, count = 10) {
  const questions = triviaData.questions.filter((q) => q.category === categoryId);
  const rng = seededRandom(categoryId + Date.now().toString());
  return shuffle(questions, rng).slice(0, count);
}

export function getLevelQuestions(levelIndex) {
  let pool;
  if (levelIndex === 0) {
    pool = triviaData.questions.filter((q) => q.difficulty === "easy");
  } else if (levelIndex === 1) {
    pool = triviaData.questions.filter((q) => q.difficulty === "medium");
  } else if (levelIndex === 2) {
    pool = triviaData.questions.filter((q) => q.difficulty === "hard");
  } else if (levelIndex === 3) {
    // The Peak: expert + hard mix
    pool = triviaData.questions.filter(
      (q) => q.difficulty === "expert" || q.difficulty === "hard"
    );
  } else if (levelIndex === 4) {
    // The Barrel: expert + master
    pool = triviaData.questions.filter(
      (q) => q.difficulty === "master" || q.difficulty === "expert"
    );
  } else {
    // Legends Only: master only
    pool = triviaData.questions.filter((q) => q.difficulty === "master");
  }

  const rng = seededRandom("level" + levelIndex + Date.now().toString());
  return shuffle(pool, rng).slice(0, 15);
}

export function getConnections() {
  return triviaData.connections || [];
}

export function getDailyConnection(dateStr) {
  const puzzles = triviaData.connections || [];
  if (puzzles.length === 0) return null;
  const dayIndex = getDayNumber() % puzzles.length;
  return puzzles[dayIndex];
}

export function calculateScore(isCorrect, timeRemaining, timerDuration) {
  if (!isCorrect) return 0;
  const elapsed = timerDuration - timeRemaining;
  if (elapsed <= 5) return 100;
  if (elapsed <= 10) return 80;
  if (elapsed <= 15) return 60;
  return 40;
}

export function getStreakMultiplier(consecutiveCorrect) {
  if (consecutiveCorrect >= 5) return 1.5;
  if (consecutiveCorrect >= 3) return 1.2;
  return 1;
}

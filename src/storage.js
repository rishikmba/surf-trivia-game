const KEYS = {
  dailyStreak: "pws_daily_streak",
  dailyHistory: "pws_daily_history",
  categoryBest: "pws_category_best",
  levelsProgress: "pws_levels_progress",
  totalScore: "pws_total_score",
  username: "pws_username",
};

function get(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function getDailyStreak() {
  return get(KEYS.dailyStreak, { count: 0, lastDate: null });
}

export function updateDailyStreak() {
  const today = new Date().toISOString().split("T")[0];
  const streak = getDailyStreak();
  if (streak.lastDate === today) return streak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
  const updated = { count: newCount, lastDate: today };
  set(KEYS.dailyStreak, updated);
  return updated;
}

export function getDailyHistory() {
  return get(KEYS.dailyHistory, []);
}

export function saveDailyResult(dateKey, result) {
  const history = getDailyHistory();
  if (history.find((h) => h.date === dateKey)) return;
  history.push({ date: dateKey, ...result });
  set(KEYS.dailyHistory, history);
}

export function hasPlayedDaily(dateKey) {
  return getDailyHistory().some((h) => h.date === dateKey);
}

export function getCategoryBest() {
  return get(KEYS.categoryBest, {});
}

export function saveCategoryBest(categoryId, score) {
  const bests = getCategoryBest();
  if (!bests[categoryId] || score > bests[categoryId]) {
    bests[categoryId] = score;
    set(KEYS.categoryBest, bests);
  }
}

export function getLevelsProgress() {
  return get(KEYS.levelsProgress, []);
}

export function saveLevelResult(levelIndex, score, totalPossible) {
  const progress = getLevelsProgress();
  const pct = totalPossible > 0 ? (score / totalPossible) * 100 : 0;
  let stars = 0;
  if (pct >= 90) stars = 3;
  else if (pct >= 80) stars = 2;
  else if (pct >= 60) stars = 1;

  const existing = progress[levelIndex];
  if (!existing || stars > existing.stars || score > existing.score) {
    progress[levelIndex] = { score, stars, completed: pct >= 60 };
    set(KEYS.levelsProgress, progress);
  }
  return { stars, passed: pct >= 60 };
}

export function getTotalScore() {
  return get(KEYS.totalScore, 0);
}

export function addToTotalScore(points) {
  const total = getTotalScore() + points;
  set(KEYS.totalScore, total);
  return total;
}

export function getUsername() {
  return get(KEYS.username, "Surfer");
}

export function setUsername(name) {
  set(KEYS.username, name);
}

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
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // localStorage full or unavailable (e.g. Safari private browsing)
  }
}

export function getDailyStreak() {
  return get(KEYS.dailyStreak, { count: 0, lastDate: null });
}

function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getLocalToday() {
  return getLocalDateStr();
}

export function updateDailyStreak() {
  const today = getLocalDateStr();
  const streak = getDailyStreak();
  if (streak.lastDate === today) return streak;

  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yesterday = getLocalDateStr(yest);
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
  if (!existing) {
    progress[levelIndex] = { score, stars, completed: pct >= 60 };
    set(KEYS.levelsProgress, progress);
  } else if (stars > existing.stars || score > existing.score) {
    progress[levelIndex] = {
      score: Math.max(score, existing.score),
      stars: Math.max(stars, existing.stars),
      completed: existing.completed || pct >= 60,
    };
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

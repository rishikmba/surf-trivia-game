import { useState, useEffect, useRef } from "react";
import {
  Trophy, MapPin, Clock, Film, Wrench, Waves, Mountain, Briefcase,
  Star, Target, Mic, ChevronRight, ArrowLeft, Check, X, Share2,
  BarChart3, Play, Calendar, Zap, Lock, Award, Heart, LayoutGrid,
} from "lucide-react";
import { COLORS, CATEGORY_META, LEVEL_DEFS } from "./constants";
import {
  getDailyQuestions, getCategoryQuestions, getLevelQuestions,
  calculateScore, getStreakMultiplier, getCategories, getDayNumber,
  getDailyConnection,
} from "./gameEngine";
import {
  getDailyStreak, updateDailyStreak, saveDailyResult, hasPlayedDaily,
  getDailyHistory, getCategoryBest, saveCategoryBest, getLevelsProgress,
  saveLevelResult, getTotalScore, addToTotalScore, getLocalToday,
  hasPlayedConnections, saveConnectionsResult, updateConnectionsStreak,
  getConnectionsHistory,
} from "./storage";
import pwsLogo from "/pws-logo.png";
import "./App.css";

const CATEGORY_ICONS = {
  legends: Trophy, breaks: MapPin, history: Clock, culture: Film,
  craft: Wrench, ocean: Waves, bigwave: Mountain, industry: Briefcase,
  women: Heart, tricks: Target, pws: Mic,
};

// Accessibility helper: makes a div act like a button
const clickable = (onClick) => ({
  onClick,
  onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } },
  role: "button",
  tabIndex: 0,
});

// ─── Home Screen ───
function HomeScreen({ onNavigate, streak, totalScore }) {
  return (
    <div style={{ background: COLORS.offWhite }}>
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`,
        padding: "40px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06,
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='white' d='M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,170.7C960,181,1056,171,1152,149.3C1248,128,1344,96,1392,80L1440,64L1440,320L0,320Z'/%3E%3C/svg%3E")`,
          backgroundSize: "cover", backgroundPosition: "bottom",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <img
            src={pwsLogo}
            alt="People Who Surf"
            style={{
              width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
              margin: "0 auto 16px", display: "block",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          />
          <h1 style={{ color: COLORS.white, fontSize: 28, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Surf Trivia
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0 }}>
            Test your surf knowledge
          </p>
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "center", gap: 32, padding: "20px 24px",
        background: COLORS.white, borderBottom: `1px solid ${COLORS.gray200}`,
        marginTop: -20, borderRadius: "20px 20px 0 0", position: "relative", zIndex: 2,
      }}>
        {[
          { label: "Streak", value: streak.count || 0, icon: Zap },
          { label: "Best Score", value: totalScore, icon: Trophy },
          { label: "Questions", value: "170+", icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <Icon size={16} color={COLORS.blue} style={{ marginBottom: 4 }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.gray900 }}>{value}</div>
            <div style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "24px 20px" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px 4px" }}>
          Play
        </h2>

        <div
          className="mode-card"
          {...clickable(() => onNavigate("daily"))}
          style={{
            background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueLight} 100%)`,
            borderRadius: 16, padding: "20px 24px", marginBottom: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Calendar size={18} color={COLORS.white} />
              <span style={{ color: COLORS.white, fontSize: 18, fontWeight: 700 }}>Daily Challenge</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>
              10 questions &middot; New every day &middot; Keep your streak!
            </p>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Play size={20} color={COLORS.white} fill={COLORS.white} />
          </div>
        </div>

        {[
          { name: "Surf Connections", desc: "Find the 4 hidden groups \u00b7 New puzzle daily", icon: LayoutGrid, color: COLORS.blueLight, screen: "connections" },
          { name: "Pick Your Break", desc: "Choose a category \u00b7 10 questions \u00b7 Beat your best", icon: MapPin, color: COLORS.gold, screen: "categories" },
          { name: "The Paddle Out", desc: "Paddle from Whitewash to Legends Only \u00b7 6 levels", icon: Award, color: COLORS.green, screen: "levels" },
          { name: "Your Stats", desc: "Scores, streaks, and personal bests", icon: BarChart3, color: COLORS.blue, screen: "leaderboard" },
        ].map((m) => (
          <div
            key={m.name}
            className="mode-card"
            {...clickable(() => onNavigate(m.screen))}
            style={{
              background: COLORS.white, borderRadius: 16, padding: "18px 24px", marginBottom: 12,
              border: `1px solid ${COLORS.gray200}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <m.icon size={18} color={m.color} />
                <span style={{ color: COLORS.gray900, fontSize: 16, fontWeight: 600 }}>{m.name}</span>
              </div>
              <p style={{ color: COLORS.gray500, fontSize: 13, margin: 0 }}>{m.desc}</p>
            </div>
            <ChevronRight size={20} color={COLORS.gray300} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Category Selection ───
function CategoriesScreen({ onNavigate, onStartQuiz, categoryBests }) {
  const categories = getCategories();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: COLORS.white, padding: "16px 20px", borderBottom: `1px solid ${COLORS.gray200}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div {...clickable(() => onNavigate("home"))} aria-label="Back to home" style={{ cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={20} color={COLORS.gray700} />
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.gray900, margin: 0 }}>Choose a Category</h1>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Star;
            const color = CATEGORY_META[cat.id]?.color || COLORS.blue;
            const best = categoryBests[cat.id];
            return (
              <div
                key={cat.id}
                className="category-card"
                {...clickable(() => onStartQuiz(cat.id))}
                style={{
                  background: COLORS.white, borderRadius: 14, padding: "20px 16px",
                  border: `1px solid ${COLORS.gray200}`, textAlign: "center",
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: `${color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px",
                }}>
                  <Icon size={24} color={color} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray900, marginBottom: 2 }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: 11, color: COLORS.gray500 }}>
                  {best ? `Best: ${best} pts` : "Not played yet"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Question Screen ───
function QuestionScreen({ questions, mode, modeLabel, timerDuration, onFinish, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [results, setResults] = useState([]);
  const [scores, setScores] = useState([]);
  const timerRef = useRef(null);
  const hasAutoAnswered = useRef(false);

  const question = questions[currentIndex];
  const total = questions.length;

  useEffect(() => {
    if (answered) return;
    hasAutoAnswered.current = false;
    setTimeLeft(timerDuration);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex, timerDuration]);

  useEffect(() => {
    if (timeLeft === 0 && !answered && !hasAutoAnswered.current) {
      hasAutoAnswered.current = true;
      doAnswer(null);
    }
  }, [timeLeft, answered]);

  const doAnswer = (option) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(option);
    setAnswered(true);

    const isCorrect = option === question.answer;
    const multiplier = getStreakMultiplier(consecutiveCorrect);
    const baseScore = calculateScore(isCorrect, timeLeft, timerDuration);
    const points = Math.round(baseScore * multiplier);

    setConsecutiveCorrect(isCorrect ? consecutiveCorrect + 1 : 0);
    setTotalPoints((p) => p + points);
    setScores((s) => [...s, points]);
    setResults((r) => [...r, { correct: isCorrect, points, questionId: question.id, selected: option, answer: question.answer, questionText: question.question, explanation: question.explanation }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      const finalResults = results;
      onFinish({
        scores,
        totalPoints,
        results: finalResults,
        correctCount: finalResults.filter((r) => r.correct).length,
        totalQuestions: total,
      });
      return;
    }
    setTimeLeft(timerDuration);
    hasAutoAnswered.current = false;
    setSelected(null);
    setAnswered(false);
    setCurrentIndex((i) => i + 1);
  };

  if (!question) return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏄</div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: COLORS.gray900, marginBottom: 8 }}>No Questions Available</h2>
      <p style={{ fontSize: 14, color: COLORS.gray500, marginBottom: 24 }}>We couldn't load questions for this round. Try a different category or come back later.</p>
      <button className="btn-primary" onClick={onBack} style={{ padding: "12px 32px", background: COLORS.blue, color: COLORS.white, borderRadius: 12, fontSize: 14, fontWeight: 600 }}>Go Back</button>
    </div>
  );

  const CatIcon = CATEGORY_ICONS[question.category] || Star;
  const catColor = CATEGORY_META[question.category]?.color || COLORS.blue;
  const catName = getCategories().find((c) => c.id === question.category)?.name || question.category;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: COLORS.white, padding: "16px 20px", borderBottom: `1px solid ${COLORS.gray200}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div {...clickable(onBack)} aria-label="Back" style={{ cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={20} color={COLORS.gray700} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {modeLabel}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray900 }}>
            Question {currentIndex + 1} of {total}
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.blue }}>
          {totalPoints} pts
        </div>
      </div>

      <div style={{ height: 3, background: COLORS.gray200 }}>
        <div className="progress-fill" style={{
          height: 3, width: `${((currentIndex + (answered ? 1 : 0)) / total) * 100}%`,
          background: COLORS.blue, borderRadius: "0 4px 4px 0",
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 8px" }}>
        <div
          className={timeLeft <= 5 && !answered ? "timer-urgent" : ""}
          style={{
            width: 56, height: 56, borderRadius: "50%",
            border: `3px solid ${answered ? COLORS.gray300 : COLORS.blue}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700,
            color: answered ? COLORS.gray500 : COLORS.blue,
          }}
        >
          {answered ? "--" : timeLeft}
        </div>
      </div>

      {consecutiveCorrect >= 3 && !answered && (
        <div className="fade-in" style={{ textAlign: "center", marginBottom: 4 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: `${COLORS.gold}15`, color: COLORS.gold, fontSize: 11,
            fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          }}>
            {consecutiveCorrect >= 5 ? "1.5x" : "1.2x"} streak bonus!
          </span>
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          background: `${catColor}15`, color: catColor, fontSize: 11,
          fontWeight: 600, padding: "4px 12px", borderRadius: 20,
          textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          <CatIcon size={12} /> {catName}
        </span>
      </div>

      <div style={{ padding: "0 24px 24px" }}>
        <h2 className="fade-in" key={currentIndex} style={{
          fontSize: 20, fontWeight: 600, color: COLORS.gray900, textAlign: "center",
          lineHeight: 1.4, margin: "0 0 28px",
        }}>
          {question.question}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map((option, i) => {
            const isCorrect = option === question.answer;
            const isSelected = selected === option;
            let bg = COLORS.white;
            let border = COLORS.gray200;
            let textColor = COLORS.gray900;
            let icon = null;

            if (answered) {
              if (isCorrect) {
                bg = "#2D9D5E10";
                border = COLORS.green;
                textColor = COLORS.green;
                icon = <Check size={18} color={COLORS.green} />;
              } else if (isSelected && !isCorrect) {
                bg = "#D9444410";
                border = COLORS.red;
                textColor = COLORS.red;
                icon = <X size={18} color={COLORS.red} />;
              }
            }

            return (
              <div
                key={option}
                className={`option-card ${answered ? "answered" : ""}`}
                {...clickable(() => !answered && doAnswer(option))}
                aria-disabled={answered}
                style={{
                  background: bg, border: `2px solid ${border}`, borderRadius: 12,
                  padding: "14px 18px", cursor: answered ? "default" : "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 28, minWidth: 28, height: 28, minHeight: 28, borderRadius: "50%",
                    background: answered && isCorrect ? COLORS.green : COLORS.gray100,
                    color: answered && isCorrect ? COLORS.white : COLORS.gray500,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 600, flexShrink: 0,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 500, color: textColor }}>{option}</span>
                </div>
                {icon}
              </div>
            );
          })}
        </div>

        {answered && (
          <div className="slide-up" style={{
            marginTop: 20, padding: "16px 18px", background: COLORS.bluePale,
            borderRadius: 12, borderLeft: `4px solid ${COLORS.blue}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.blue, textTransform: "uppercase", marginBottom: 4 }}>
              Did you know?
            </div>
            <p style={{ fontSize: 14, color: COLORS.gray700, margin: 0, lineHeight: 1.5 }}>
              {question.explanation}
            </p>
          </div>
        )}

        {answered && (
          <button
            className="btn-primary"
            onClick={handleNext}
            style={{
              width: "100%", marginTop: 20, padding: "14px", background: COLORS.blue,
              color: COLORS.white, borderRadius: 12, fontSize: 16, fontWeight: 600,
            }}
          >
            {currentIndex + 1 >= total ? "See Results" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Results Screen ───
function ResultsScreen({ result, mode, modeLabel, streak, onHome, onNavigate }) {
  const [copied, setCopied] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const { totalPoints, correctCount, totalQuestions } = result;
  const maxPoints = totalQuestions * 150; // 100 base + up to 1.5x streak

  const pct = Math.round((correctCount / totalQuestions) * 100);
  let emoji = "💪";
  let message = "Keep Paddling!";
  let subMessage = "Every wipeout makes you stronger.";
  if (pct >= 90) { emoji = "🏄‍♂️"; message = "Legendary!"; subMessage = "You absolutely crushed it."; }
  else if (pct >= 70) { emoji = "🤙"; message = "Solid Session!"; subMessage = "You really know your surf."; }
  else if (pct >= 50) { emoji = "🌊"; message = "Not Bad!"; subMessage = "You're getting the hang of it."; }

  const dayNumber = getDayNumber();
  const emojiGrid = result.results.map((r) => (r.correct ? "🟦" : "⬜")).join("");

  const challengeLine = mode === "daily"
    ? `Daily Challenge #${dayNumber}`
    : modeLabel;

  const shareText = `🏄 I just scored ${totalPoints} points on People Who Surf Trivia!\n\n${challengeLine}\n${emojiGrid}\n${correctCount}/${totalQuestions} correct${streak.count >= 2 ? ` | 🔥 ${streak.count} day streak` : ""}\n\nThink you can beat me? 👇\nhttps://rishikmba.github.io/surf-trivia-game/`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available (HTTP or permission denied)
      setCopied(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`,
        padding: "40px 24px 56px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</div>
        <h1 style={{ color: COLORS.white, fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>
          {message}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>
          {subMessage}
        </p>
      </div>

      <div className="slide-up" style={{
        margin: "-32px 20px 0", background: COLORS.white, borderRadius: 16,
        padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "relative", zIndex: 2,
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.blue }}>{totalPoints}</div>
            <div style={{ fontSize: 12, color: COLORS.gray500 }}>Points</div>
          </div>
          <div style={{ width: 1, background: COLORS.gray200 }} />
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.green }}>{correctCount}/{totalQuestions}</div>
            <div style={{ fontSize: 12, color: COLORS.gray500 }}>Correct</div>
          </div>
          <div style={{ width: 1, background: COLORS.gray200 }} />
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.gold }}>{streak.count || 0}</div>
            <div style={{ fontSize: 12, color: COLORS.gray500 }}>Day Streak</div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: COLORS.gray500 }}>Accuracy</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.blue }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: COLORS.gray100, borderRadius: 4 }}>
            <div style={{
              height: 8, width: `${pct}%`,
              background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.blueLight})`,
              borderRadius: 4, transition: "width 1s ease-out",
            }} />
          </div>
        </div>

      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* Challenge CTA */}
        <div style={{
          background: COLORS.white, borderRadius: 14, padding: "20px",
          border: `1px solid ${COLORS.gray200}`, marginBottom: 12, textAlign: "center",
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.gray900, marginBottom: 4 }}>
            Challenge your friends 🤙
          </div>
          <p style={{ fontSize: 13, color: COLORS.gray500, margin: "0 0 16px", lineHeight: 1.4 }}>
            Share your score and see if they can beat it
          </p>
          <button
            className="btn-primary"
            onClick={handleShare}
            style={{
              width: "100%", padding: "14px",
              background: copied ? COLORS.green : COLORS.blue,
              color: COLORS.white, borderRadius: 12, fontSize: 15, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {copied ? <><Check size={16} /> Copied! Send it to your crew</> : <><Share2 size={16} /> Share Score</>}
          </button>
        </div>

        {/* Review Answers */}
        <div style={{
          background: COLORS.white, borderRadius: 14,
          border: `1px solid ${COLORS.gray200}`, marginBottom: 12, overflow: "hidden",
        }}>
          <div
            {...clickable(() => setShowReview(!showReview))}
            style={{
              padding: "16px 20px", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart3 size={16} color={COLORS.gray500} />
              <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray900 }}>Review Answers</span>
            </div>
            <ChevronRight
              size={18}
              color={COLORS.gray300}
              style={{
                transform: showReview ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </div>

          {showReview && (
            <div style={{ borderTop: `1px solid ${COLORS.gray100}` }}>
              {result.results.map((r, i) => (
                <div key={i} style={{
                  padding: "14px 20px",
                  borderBottom: i < result.results.length - 1 ? `1px solid ${COLORS.gray100}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 22, minWidth: 22, height: 22, borderRadius: "50%",
                      background: r.correct ? COLORS.green : COLORS.red,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: 1, flexShrink: 0,
                    }}>
                      {r.correct
                        ? <Check size={12} color={COLORS.white} />
                        : <X size={12} color={COLORS.white} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray900, lineHeight: 1.4, marginBottom: 6 }}>
                        {r.questionText}
                      </div>
                      {!r.correct && (
                        <div style={{ fontSize: 12, color: COLORS.red, marginBottom: 4 }}>
                          Your answer: {r.selected || "Time expired"}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: r.correct ? COLORS.green : COLORS.gray700, fontWeight: 500 }}>
                        {r.correct ? "Correct!" : `Answer: ${r.answer}`}
                      </div>
                      {r.explanation && (
                        <div style={{ fontSize: 12, color: COLORS.gray500, marginTop: 4, lineHeight: 1.4, fontStyle: "italic" }}>
                          {r.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onNavigate("leaderboard")}
            style={{
              flex: 1, padding: "14px", background: COLORS.white, color: COLORS.blue,
              border: `1px solid ${COLORS.gray200}`, borderRadius: 12, fontSize: 14,
              fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            Stats
          </button>
          <button
            onClick={onHome}
            style={{
              flex: 1, padding: "14px", background: COLORS.white, color: COLORS.gray700,
              border: `1px solid ${COLORS.gray200}`, borderRadius: 12, fontSize: 14,
              fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Connections Colors ───
const CONN_COLORS = {
  yellow: { bg: "#F9DF6D", text: "#1A1F2B" },
  green: { bg: "#6AAA64", text: "#FFFFFF" },
  blue: { bg: "#85C0F9", text: "#1A1F2B" },
  purple: { bg: "#B380D0", text: "#FFFFFF" },
};
const CONN_ORDER = ["yellow", "green", "blue", "purple"];
const CONN_POINTS = { yellow: 100, green: 200, blue: 300, purple: 400 };

// ─── Connections Screen ───
function ConnectionsScreen({ puzzle, onFinish, onBack }) {
  const [allWords] = useState(() => {
    const words = puzzle.groups.flatMap((g) =>
      g.words.map((w) => ({ word: w, group: g.theme, color: g.color }))
    );
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  });
  const [selected, setSelected] = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showingResults, setShowingResults] = useState(false);
  const [score, setScore] = useState(0);
  const [solveOrder, setSolveOrder] = useState([]);
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [locked, setLocked] = useState(false);

  const maxMistakes = 4;
  const remainingWords = allWords.filter(
    (w) => !solvedGroups.includes(w.color)
  );

  const toggleWord = (word) => {
    if (gameOver || locked) return;
    setSelected((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : prev.length < 4 ? [...prev, word] : prev
    );
  };

  const showFeedback = (msg, duration = 1500) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), duration);
  };

  const handleSubmit = () => {
    if (selected.length !== 4 || gameOver || locked) return;

    // Check for duplicate guess
    const sortedGuess = [...selected].sort().join("|");
    if (prevGuesses.includes(sortedGuess)) {
      showFeedback("Already guessed!");
      return;
    }
    setPrevGuesses((prev) => [...prev, sortedGuess]);

    const selectedItems = selected.map((word) => allWords.find((w) => w.word === word));
    const colors = selectedItems.map((w) => w.color);
    const allSameGroup = colors.every((c) => c === colors[0]);

    if (allSameGroup) {
      const color = colors[0];
      const groupPoints = CONN_POINTS[color];
      const newSolved = [...solvedGroups, color];
      const newOrder = [...solveOrder, color];
      let newScore = score + groupPoints;

      if (newSolved.length === 4) newScore += 200;

      setSolvedGroups(newSolved);
      setSolveOrder(newOrder);
      setScore(newScore);
      setSelected([]);

      if (newSolved.length === 4) {
        setGameOver(true);
        setTimeout(() => {
          onFinish({ score: newScore, mistakes, solveOrder: newOrder, completed: true, puzzle });
        }, 800);
      }
    } else {
      // Check for "one away" — 3 of 4 from same group
      const colorCounts = {};
      colors.forEach((c) => { colorCounts[c] = (colorCounts[c] || 0) + 1; });
      const maxSame = Math.max(...Object.values(colorCounts));
      const isOneAway = maxSame === 3;

      setLocked(true);
      setWrongFlash(true);

      setTimeout(() => {
        const newMistakes = mistakes + 1;
        const newScore = score - 50;
        setMistakes(newMistakes);
        setScore(newScore);
        setWrongFlash(false);
        setSelected([]);
        setLocked(false);

        if (isOneAway) {
          showFeedback("One away!");
        } else {
          showFeedback("Not quite...");
        }

        if (newMistakes >= maxMistakes) {
          setGameOver(true);
          setShowingResults(true);
          const remaining = CONN_ORDER.filter((c) => !solvedGroups.includes(c));
          const finalOrder = [...solveOrder, ...remaining.map((c) => `missed_${c}`)];
          // Delay to let player see the revealed groups
          setTimeout(() => {
            onFinish({ score: newScore, mistakes: newMistakes, solveOrder: finalOrder, completed: false, puzzle });
          }, 2500);
        }
      }, 800);
    }
  };

  const dayNumber = getDayNumber();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: COLORS.white, padding: "16px 20px", borderBottom: `1px solid ${COLORS.gray200}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div {...clickable(onBack)} aria-label="Back" style={{ cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={20} color={COLORS.gray700} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Surf Connections
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray900 }}>
            Puzzle #{dayNumber}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {Array.from({ length: maxMistakes }).map((_, i) => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: "50%",
              background: i < maxMistakes - mistakes ? COLORS.gray900 : COLORS.red,
              border: i < maxMistakes - mistakes ? "none" : `2px solid ${COLORS.red}`,
              transition: "all 0.3s",
              opacity: i < maxMistakes - mistakes ? 1 : 0.3,
            }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 24px" }}>
        <p style={{ fontSize: 13, color: COLORS.gray500, textAlign: "center", marginBottom: 16 }}>
          Find groups of 4 that share something in common
        </p>

        {/* Feedback banner */}
        {feedbackMsg && (
          <div className="fade-in" style={{
            textAlign: "center", padding: "8px 16px", marginBottom: 12,
            borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: feedbackMsg === "One away!" ? `${COLORS.gold}20` : feedbackMsg === "Already guessed!" ? `${COLORS.blue}15` : `${COLORS.red}10`,
            color: feedbackMsg === "One away!" ? COLORS.gold : feedbackMsg === "Already guessed!" ? COLORS.blue : COLORS.red,
          }}>
            {feedbackMsg}
          </div>
        )}

        {/* Solved groups */}
        {solvedGroups.map((color) => {
          const group = puzzle.groups.find((g) => g.color === color);
          return (
            <div key={color} className="slide-up" style={{
              background: CONN_COLORS[color].bg, borderRadius: 12,
              padding: "12px 16px", marginBottom: 8, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: CONN_COLORS[color].text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {group.theme}
              </div>
              <div style={{ fontSize: 14, color: CONN_COLORS[color].text, opacity: 0.85, marginTop: 2 }}>
                {group.words.join(", ")}
              </div>
            </div>
          );
        })}

        {/* Remaining word grid */}
        {!gameOver && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridAutoRows: "1fr", gap: 6,
            marginTop: solvedGroups.length > 0 ? 8 : 0,
          }}>
            {remainingWords.map(({ word }) => {
              const isSelected = selected.includes(word);
              const isWrong = wrongFlash && isSelected;
              return (
                <div
                  key={word}
                  {...clickable(() => toggleWord(word))}
                  className={isWrong ? "shake" : ""}
                  style={{
                    padding: "18px 4px", borderRadius: 10, textAlign: "center",
                    fontSize: 12, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    minHeight: 56,
                    cursor: locked ? "default" : "pointer",
                    transition: "all 0.15s ease",
                    background: isWrong ? COLORS.red : isSelected ? COLORS.blue : COLORS.white,
                    color: isSelected || isWrong ? COLORS.white : COLORS.gray900,
                    border: `2px solid ${isWrong ? COLORS.red : isSelected ? COLORS.blue : COLORS.gray200}`,
                    userSelect: "none",
                  }}
                >
                  {word}
                </div>
              );
            })}
          </div>
        )}

        {/* Game over — reveal remaining */}
        {gameOver && showingResults && solvedGroups.length < 4 && (
          CONN_ORDER.filter((c) => !solvedGroups.includes(c)).map((color) => {
            const group = puzzle.groups.find((g) => g.color === color);
            return (
              <div key={color} className="fade-in" style={{
                background: CONN_COLORS[color].bg, borderRadius: 12,
                padding: "12px 16px", marginBottom: 8, textAlign: "center", opacity: 0.65,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: CONN_COLORS[color].text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {group.theme}
                </div>
                <div style={{ fontSize: 14, color: CONN_COLORS[color].text, opacity: 0.85, marginTop: 2 }}>
                  {group.words.join(", ")}
                </div>
              </div>
            );
          })
        )}

        {/* Submit / deselect */}
        {!gameOver && (
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              onClick={() => setSelected([])}
              disabled={selected.length === 0 || locked}
              style={{
                flex: 1, padding: "14px", background: COLORS.white, color: COLORS.gray700,
                border: `1px solid ${COLORS.gray200}`, borderRadius: 12, fontSize: 14,
                fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
                opacity: selected.length === 0 || locked ? 0.5 : 1,
              }}
            >
              Deselect All
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={selected.length !== 4 || locked}
              style={{
                flex: 1, padding: "14px",
                background: selected.length === 4 && !locked ? COLORS.blue : COLORS.gray200,
                color: selected.length === 4 && !locked ? COLORS.white : COLORS.gray500,
                borderRadius: 12, fontSize: 14, fontWeight: 600,
                cursor: selected.length === 4 && !locked ? "pointer" : "default",
              }}
            >
              Submit
            </button>
          </div>
        )}

        {/* Game over message */}
        {gameOver && showingResults && (
          <div className="fade-in" style={{ textAlign: "center", marginTop: 16, padding: "12px", color: COLORS.gray500, fontSize: 14 }}>
            Revealing answers...
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Connections Results Screen ───
function ConnectionsResultsScreen({ result, onHome, onNavigate }) {
  const [copied, setCopied] = useState(false);
  const dayNumber = getDayNumber();
  const puzzle = result.puzzle;

  const emojiMap = { yellow: "🟨", green: "🟩", blue: "🟦", purple: "🟪" };

  const emojiRows = result.solveOrder.map((color) => {
    const clean = color.replace("missed_", "");
    const wasMissed = color.startsWith("missed_");
    return wasMissed ? "⬜⬜⬜⬜" : `${emojiMap[clean]}${emojiMap[clean]}${emojiMap[clean]}${emojiMap[clean]}`;
  }).join("\n");

  const shareText = `🏄 PWS Surf Connections #${dayNumber}\n${emojiRows}\nMistakes: ${result.mistakes}/4\n\nThink you can do better? 👇\nhttps://rishikmba.github.io/surf-trivia-game/`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const emoji = result.completed ? (result.mistakes === 0 ? "🏆" : "🤙") : "🌊";
  const message = result.completed
    ? (result.mistakes === 0 ? "Perfect!" : "Nice work!")
    : "Better luck tomorrow!";

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`,
        padding: "40px 24px 56px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</div>
        <h1 style={{ color: COLORS.white, fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>
          {message}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>
          Surf Connections #{dayNumber}
        </p>
      </div>

      <div className="slide-up" style={{
        margin: "-32px 20px 0", background: COLORS.white, borderRadius: 16,
        padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "relative", zIndex: 2,
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.blue }}>{Math.max(result.score, 0)}</div>
            <div style={{ fontSize: 12, color: COLORS.gray500 }}>Points</div>
          </div>
          <div style={{ width: 1, background: COLORS.gray200 }} />
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: result.completed ? COLORS.green : COLORS.red }}>
              {result.solveOrder.filter((c) => !c.startsWith("missed_")).length}/4
            </div>
            <div style={{ fontSize: 12, color: COLORS.gray500 }}>Groups Found</div>
          </div>
          <div style={{ width: 1, background: COLORS.gray200 }} />
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: result.mistakes === 0 ? COLORS.gold : COLORS.gray700 }}>
              {result.mistakes}
            </div>
            <div style={{ fontSize: 12, color: COLORS.gray500 }}>Mistakes</div>
          </div>
        </div>

        {/* Emoji grid preview */}
        <div style={{ marginTop: 16, textAlign: "center", whiteSpace: "pre-line", fontSize: 20, lineHeight: 1.6 }}>
          {emojiRows}
        </div>
      </div>

      {/* All groups / answers */}
      {puzzle && (
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
            Today's Groups
          </div>
          {CONN_ORDER.map((color) => {
            const group = puzzle.groups.find((g) => g.color === color);
            if (!group) return null;
            const wasSolved = result.solveOrder.includes(color);
            return (
              <div key={color} style={{
                background: CONN_COLORS[color].bg, borderRadius: 10,
                padding: "10px 14px", marginBottom: 6, textAlign: "center",
                opacity: wasSolved ? 1 : 0.6,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: CONN_COLORS[color].text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {group.theme} {wasSolved ? "✓" : "✗"}
                </div>
                <div style={{ fontSize: 13, color: CONN_COLORS[color].text, opacity: 0.85, marginTop: 1 }}>
                  {group.words.join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ padding: "16px 20px 24px" }}>
        <div style={{
          background: COLORS.white, borderRadius: 14, padding: "20px",
          border: `1px solid ${COLORS.gray200}`, marginBottom: 12, textAlign: "center",
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.gray900, marginBottom: 4 }}>
            Challenge your friends 🤙
          </div>
          <p style={{ fontSize: 13, color: COLORS.gray500, margin: "0 0 16px", lineHeight: 1.4 }}>
            Share your puzzle and see how they do
          </p>
          <button
            className="btn-primary"
            onClick={handleShare}
            style={{
              width: "100%", padding: "14px",
              background: copied ? COLORS.green : COLORS.blue,
              color: COLORS.white, borderRadius: 12, fontSize: 15, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {copied ? <><Check size={16} /> Copied!</> : <><Share2 size={16} /> Share Results</>}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onNavigate("leaderboard")}
            style={{
              flex: 1, padding: "14px", background: COLORS.white, color: COLORS.blue,
              border: `1px solid ${COLORS.gray200}`, borderRadius: 12, fontSize: 14,
              fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            Stats
          </button>
          <button
            onClick={onHome}
            style={{
              flex: 1, padding: "14px", background: COLORS.white, color: COLORS.gray700,
              border: `1px solid ${COLORS.gray200}`, borderRadius: 12, fontSize: 14,
              fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Daily Complete Screen ───
function DailyCompleteScreen({ onNavigate, streak, mode }) {
  const [countdown, setCountdown] = useState("");
  const today = getLocalToday();
  const isConnections = mode === "connections";
  const history = isConnections ? getConnectionsHistory() : getDailyHistory();
  const todayResult = history.find((h) => h.date === today);
  const dayNumber = getDayNumber();
  const title = isConnections ? "Connections Complete!" : "Daily Challenge Complete!";
  const subtitle = isConnections ? "Puzzle" : "Day";

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueDark} 100%)`,
        padding: "40px 24px 56px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
        <h1 style={{ color: COLORS.white, fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>
          {title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>
          {subtitle} #{dayNumber} — You already crushed it today
        </p>
      </div>

      <div className="slide-up" style={{
        margin: "-32px 20px 0", background: COLORS.white, borderRadius: 16,
        padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "relative", zIndex: 2,
      }}>
        {todayResult && (
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.blue }}>{Math.max(todayResult.score, 0)}</div>
              <div style={{ fontSize: 12, color: COLORS.gray500 }}>Points</div>
            </div>
            <div style={{ width: 1, background: COLORS.gray200 }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.green }}>
                {isConnections
                  ? `${todayResult.solveOrder ? todayResult.solveOrder.filter((c) => !c.startsWith("missed_")).length : 0}/4`
                  : `${todayResult.correct}/${todayResult.total}`}
              </div>
              <div style={{ fontSize: 12, color: COLORS.gray500 }}>{isConnections ? "Groups" : "Correct"}</div>
            </div>
            <div style={{ width: 1, background: COLORS.gray200 }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.gold }}>{streak.count || 0}</div>
              <div style={{ fontSize: 12, color: COLORS.gray500 }}>Streak</div>
            </div>
          </div>
        )}

        <div style={{
          background: COLORS.bluePale, borderRadius: 12, padding: "16px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
            Next challenge in
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.blue, fontVariantNumeric: "tabular-nums" }}>
            {countdown}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Keep playing
        </div>
        {[
          { name: "Pick Your Break", desc: "Choose a category and test your knowledge", icon: MapPin, color: COLORS.gold, screen: "categories" },
          { name: "The Paddle Out", desc: "Progressive levels — earn stars", icon: Award, color: COLORS.green, screen: "levels" },
        ].map((m) => (
          <div
            key={m.name}
            className="mode-card"
            {...clickable(() => onNavigate(m.screen))}
            style={{
              background: COLORS.white, borderRadius: 14, padding: "16px 20px", marginBottom: 10,
              border: `1px solid ${COLORS.gray200}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <m.icon size={18} color={m.color} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.gray900 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: COLORS.gray500 }}>{m.desc}</div>
              </div>
            </div>
            <ChevronRight size={18} color={COLORS.gray300} />
          </div>
        ))}

        <button
          onClick={() => onNavigate("home")}
          style={{
            width: "100%", marginTop: 8, padding: "14px", background: COLORS.white, color: COLORS.gray700,
            border: `1px solid ${COLORS.gray200}`, borderRadius: 12, fontSize: 14,
            fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ─── Levels Screen ───
function LevelsScreen({ onNavigate, onStartLevel, levelsProgress }) {
  const totalStars = levelsProgress.reduce((sum, l) => sum + (l?.stars || 0), 0);
  const maxStars = LEVEL_DEFS.length * 3;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: COLORS.white, padding: "16px 20px", borderBottom: `1px solid ${COLORS.gray200}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div {...clickable(() => onNavigate("home"))} aria-label="Back to home" style={{ cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={20} color={COLORS.gray700} />
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.gray900, margin: 0 }}>The Paddle Out</h1>
      </div>

      {/* Instructions */}
      <div style={{
        margin: "16px 20px 0", padding: "14px 18px", background: COLORS.bluePale,
        borderRadius: 12, border: `1px solid ${COLORS.blueLight}30`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.blue }}>How it works</div>
          <div style={{ fontSize: 12, color: COLORS.gray500 }}>
            <Star size={12} color={COLORS.gold} fill={COLORS.gold} style={{ verticalAlign: -1, marginRight: 2 }} />
            {totalStars}/{maxStars}
          </div>
        </div>
        <div style={{ fontSize: 12, color: COLORS.gray700, lineHeight: 1.5 }}>
          Complete each level to unlock the next. Score 60%+ to pass. Earn up to 3 stars per level based on accuracy. Difficulty increases from easy to master.
        </div>
      </div>

      <div style={{ padding: "16px 20px 20px" }}>
        {LEVEL_DEFS.map((level, i) => {
          const progress = levelsProgress[i];
          const completed = progress?.completed;
          const stars = progress?.stars || 0;
          const prevCompleted = i === 0 || levelsProgress[i - 1]?.completed;
          const unlocked = i === 0 || prevCompleted;

          return (
            <div key={level.name} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: completed ? COLORS.green : unlocked ? COLORS.blue : COLORS.gray200,
                  border: !unlocked && !completed ? `2px dashed ${COLORS.gray300}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: completed || unlocked ? COLORS.white : COLORS.gray500,
                  fontSize: 14, fontWeight: 700,
                }}>
                  {completed ? <Check size={16} /> : unlocked ? i + 1 : <Lock size={16} />}
                </div>
                {i < LEVEL_DEFS.length - 1 && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 32,
                    background: completed ? COLORS.green : COLORS.gray200,
                  }} />
                )}
              </div>

              <div
                className={`level-card ${unlocked ? "unlocked" : ""}`}
                {...(unlocked ? clickable(() => onStartLevel(i)) : {})}
                aria-disabled={!unlocked}
                style={{
                  flex: 1, background: unlocked ? COLORS.white : COLORS.gray100, borderRadius: 14, padding: "16px 18px",
                  border: `1px solid ${unlocked ? COLORS.gray200 : COLORS.gray100}`,
                  opacity: unlocked ? 1 : 0.5,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.gray900 }}>
                        {level.name}
                      </span>
                      {!unlocked && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.gray500, background: COLORS.gray200, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>
                          Locked
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>{level.desc}</div>
                  </div>
                  {completed ? (
                    <div style={{ display: "flex", gap: 2, flexShrink: 0, marginLeft: 8 }}>
                      {[1, 2, 3].map((s) => (
                        <Star key={s} size={14} color={s <= stars ? COLORS.gold : COLORS.gray200} fill={s <= stars ? COLORS.gold : "none"} />
                      ))}
                    </div>
                  ) : unlocked ? (
                    <ChevronRight size={18} color={COLORS.gray300} style={{ flexShrink: 0, marginLeft: 8 }} />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Leaderboard / Stats Screen ───
function LeaderboardScreen({ onNavigate, streak, totalScore, categoryBests, levelsProgress }) {
  const categories = getCategories();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: COLORS.white, padding: "16px 20px", borderBottom: `1px solid ${COLORS.gray200}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div {...clickable(() => onNavigate("home"))} aria-label="Back to home" style={{ cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={20} color={COLORS.gray700} />
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.gray900, margin: 0 }}>Your Stats</h1>
      </div>

      <div style={{
        margin: "16px 20px", padding: "18px 20px", background: COLORS.bluePale,
        borderRadius: 12, border: `1px solid ${COLORS.blueLight}30`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.blue }}>{totalScore}</div>
            <div style={{ fontSize: 11, color: COLORS.gray500 }}>Total Points</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.gold }}>{streak.count || 0}</div>
            <div style={{ fontSize: 11, color: COLORS.gray500 }}>Day Streak</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.green }}>
              {levelsProgress.filter((l) => l?.completed).length}/{LEVEL_DEFS.length}
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray500 }}>Levels</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 20px 20px" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>
          Category Best Scores
        </h2>
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] || Star;
          const color = CATEGORY_META[cat.id]?.color || COLORS.blue;
          const best = categoryBests[cat.id];
          return (
            <div key={cat.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 0", borderBottom: `1px solid ${COLORS.gray100}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: `${color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={18} color={color} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.gray900 }}>{cat.name}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: best ? COLORS.blue : COLORS.gray300 }}>
                {best ? `${best} pts` : "\u2014"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [screen, setScreen] = useState("home");
  const [gameState, setGameState] = useState(null);
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState(getDailyStreak());
  const [totalScore, setTotalScore] = useState(getTotalScore());
  const [categoryBests, setCategoryBests] = useState(getCategoryBest());
  const [levelsProgress, setLevelsProgress] = useState(getLevelsProgress());

  const refreshStats = () => {
    setStreak(getDailyStreak());
    setTotalScore(getTotalScore());
    setCategoryBests(getCategoryBest());
    setLevelsProgress(getLevelsProgress());
  };

  const startDaily = () => {
    const today = getLocalToday();
    if (hasPlayedDaily(today)) {
      setScreen("dailyComplete");
      return;
    }
    const questions = getDailyQuestions(today);
    setGameState({ questions, mode: "daily", modeLabel: "Daily Challenge", timerDuration: 20, dateKey: today });
    setScreen("playing");
  };

  const startQuiz = (categoryId) => {
    const questions = getCategoryQuestions(categoryId);
    const cat = getCategories().find((c) => c.id === categoryId);
    setGameState({ questions, mode: "quiz", modeLabel: cat?.name || "Pick Your Break", timerDuration: 25, categoryId });
    setScreen("playing");
  };

  const startLevel = (levelIndex) => {
    const questions = getLevelQuestions(levelIndex);
    const level = LEVEL_DEFS[levelIndex];
    setGameState({ questions, mode: "level", modeLabel: level.name, timerDuration: 20, levelIndex });
    setScreen("playing");
  };

  const handleFinish = (finishResult) => {
    addToTotalScore(finishResult.totalPoints);

    if (gameState.mode === "daily") {
      updateDailyStreak();
      saveDailyResult(gameState.dateKey, {
        score: finishResult.totalPoints,
        correct: finishResult.correctCount,
        total: finishResult.totalQuestions,
      });
    } else if (gameState.mode === "quiz") {
      saveCategoryBest(gameState.categoryId, finishResult.totalPoints);
    } else if (gameState.mode === "level") {
      saveLevelResult(gameState.levelIndex, finishResult.totalPoints, finishResult.totalQuestions * 150);
    }

    refreshStats();
    setResult(finishResult);
    setScreen("results");
  };

  const goHome = () => {
    setScreen("home");
    setGameState(null);
    setResult(null);
    refreshStats();
  };

  const startConnections = () => {
    const today = getLocalToday();
    if (hasPlayedConnections(today)) {
      setScreen("connectionsComplete");
      return;
    }
    const puzzle = getDailyConnection(today);
    if (!puzzle) return;
    setGameState({ puzzle, mode: "connections", dateKey: today });
    setScreen("playingConnections");
  };

  const handleConnectionsFinish = (connResult) => {
    const today = getLocalToday();
    if (connResult.score > 0) addToTotalScore(connResult.score);
    updateConnectionsStreak();
    saveConnectionsResult(today, connResult);
    refreshStats();
    setResult(connResult);
    setScreen("connectionsResults");
  };

  const navigate = (s) => {
    if (s === "home") { goHome(); return; }
    if (s === "daily") { startDaily(); return; }
    if (s === "connections") { startConnections(); return; }
    setScreen(s);
  };

  return (
    <div className="app-container">
      {screen === "home" && (
        <HomeScreen onNavigate={navigate} streak={streak} totalScore={totalScore} />
      )}
      {screen === "categories" && (
        <CategoriesScreen onNavigate={navigate} onStartQuiz={startQuiz} categoryBests={categoryBests} />
      )}
      {screen === "levels" && (
        <LevelsScreen onNavigate={navigate} onStartLevel={startLevel} levelsProgress={levelsProgress} />
      )}
      {screen === "playing" && gameState && (
        <QuestionScreen
          key={gameState.mode + (gameState.categoryId || gameState.levelIndex || "")}
          questions={gameState.questions}
          mode={gameState.mode}
          modeLabel={gameState.modeLabel}
          timerDuration={gameState.timerDuration}
          onFinish={handleFinish}
          onBack={goHome}
        />
      )}
      {screen === "results" && result && (
        <ResultsScreen
          result={result}
          mode={gameState?.mode}
          modeLabel={gameState?.modeLabel}
          streak={streak}
          onHome={goHome}
          onNavigate={navigate}
        />
      )}
      {screen === "playingConnections" && gameState?.puzzle && (
        <ConnectionsScreen
          puzzle={gameState.puzzle}
          onFinish={handleConnectionsFinish}
          onBack={goHome}
        />
      )}
      {screen === "connectionsResults" && result && (
        <ConnectionsResultsScreen
          result={result}
          onHome={goHome}
          onNavigate={navigate}
        />
      )}
      {screen === "connectionsComplete" && (
        <DailyCompleteScreen onNavigate={navigate} streak={streak} mode="connections" />
      )}
      {screen === "dailyComplete" && (
        <DailyCompleteScreen onNavigate={navigate} streak={streak} />
      )}
      {screen === "leaderboard" && (
        <LeaderboardScreen
          onNavigate={navigate}
          streak={streak}
          totalScore={totalScore}
          categoryBests={categoryBests}
          levelsProgress={levelsProgress}
        />
      )}

      {/* Version footer */}
      <div style={{
        padding: "16px 20px 20px", textAlign: "center",
        fontSize: 11, color: COLORS.gray300,
      }}>
        {__BUILD_VERSION__} &middot; {__BUILD_DATE__}
      </div>
    </div>
  );
}

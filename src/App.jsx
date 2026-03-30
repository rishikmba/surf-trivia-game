import { useState, useEffect, useRef } from "react";
import {
  Trophy, MapPin, Clock, Film, Wrench, Waves, Mountain, Briefcase,
  Star, Target, Mic, ChevronRight, ArrowLeft, Check, X, Share2,
  BarChart3, Play, Calendar, Zap, Lock, Award, Heart,
} from "lucide-react";
import { COLORS, CATEGORY_META, LEVEL_DEFS } from "./constants";
import {
  getDailyQuestions, getCategoryQuestions, getLevelQuestions,
  calculateScore, getStreakMultiplier, getCategories, getDayNumber,
} from "./gameEngine";
import {
  getDailyStreak, updateDailyStreak, saveDailyResult, hasPlayedDaily,
  getDailyHistory, getCategoryBest, saveCategoryBest, getLevelsProgress,
  saveLevelResult, getTotalScore, addToTotalScore, getLocalToday,
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
          { label: "Questions", value: "130+", icon: BarChart3 },
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
          { name: "Quick Quiz", desc: "Pick a category \u00b7 10 questions \u00b7 Beat your best", icon: Zap, color: COLORS.gold, screen: "categories" },
          { name: "The Lineup", desc: "Progressive levels \u00b7 Unlock harder challenges \u00b7 Earn stars", icon: Award, color: COLORS.green, screen: "levels" },
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

// ─── Daily Complete Screen ───
function DailyCompleteScreen({ onNavigate, streak }) {
  const [countdown, setCountdown] = useState("");
  const today = getLocalToday();
  const history = getDailyHistory();
  const todayResult = history.find((h) => h.date === today);
  const dayNumber = getDayNumber();

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
          Daily Challenge Complete!
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>
          Day #{dayNumber} — You already crushed it today
        </p>
      </div>

      <div className="slide-up" style={{
        margin: "-32px 20px 0", background: COLORS.white, borderRadius: 16,
        padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "relative", zIndex: 2,
      }}>
        {todayResult && (
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.blue }}>{todayResult.score}</div>
              <div style={{ fontSize: 12, color: COLORS.gray500 }}>Points</div>
            </div>
            <div style={{ width: 1, background: COLORS.gray200 }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.green }}>{todayResult.correct}/{todayResult.total}</div>
              <div style={{ fontSize: 12, color: COLORS.gray500 }}>Correct</div>
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
          { name: "Quick Quiz", desc: "Pick a category and test your knowledge", icon: Zap, color: COLORS.gold, screen: "categories" },
          { name: "The Lineup", desc: "Progressive levels — earn stars", icon: Award, color: COLORS.green, screen: "levels" },
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
  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite }}>
      <div style={{
        background: COLORS.white, padding: "16px 20px", borderBottom: `1px solid ${COLORS.gray200}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div {...clickable(() => onNavigate("home"))} aria-label="Back to home" style={{ cursor: "pointer", padding: 4 }}>
          <ArrowLeft size={20} color={COLORS.gray700} />
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.gray900, margin: 0 }}>The Lineup</h1>
      </div>

      <div style={{ padding: 20 }}>
        {LEVEL_DEFS.map((level, i) => {
          const progress = levelsProgress[i];
          const completed = progress?.completed;
          const stars = progress?.stars || 0;
          const prevCompleted = i === 0 || levelsProgress[i - 1]?.completed;
          const unlocked = i === 0 || prevCompleted;

          return (
            <div key={level.name} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: completed ? COLORS.green : unlocked ? COLORS.blue : COLORS.gray300,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: COLORS.white, fontSize: 14, fontWeight: 700,
                }}>
                  {completed ? <Check size={16} /> : unlocked ? i + 1 : <Lock size={14} />}
                </div>
                {i < LEVEL_DEFS.length - 1 && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 40,
                    background: completed ? COLORS.green : COLORS.gray200,
                  }} />
                )}
              </div>

              <div
                className={`level-card ${unlocked ? "unlocked" : ""}`}
                {...(unlocked ? clickable(() => onStartLevel(i)) : {})}
                aria-disabled={!unlocked}
                style={{
                  flex: 1, background: COLORS.white, borderRadius: 14, padding: "16px 18px",
                  border: `1px solid ${unlocked ? COLORS.gray200 : COLORS.gray100}`,
                  opacity: unlocked ? 1 : 0.6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.gray900, marginBottom: 2 }}>
                      {level.name}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.gray500 }}>{level.desc}</div>
                  </div>
                  {completed && (
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3].map((s) => (
                        <Star key={s} size={14} color={s <= stars ? COLORS.gold : COLORS.gray200} fill={s <= stars ? COLORS.gold : "none"} />
                      ))}
                    </div>
                  )}
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
    setGameState({ questions, mode: "quiz", modeLabel: cat?.name || "Quick Quiz", timerDuration: 25, categoryId });
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

  const navigate = (s) => {
    if (s === "home") { goHome(); return; }
    if (s === "daily") { startDaily(); return; }
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

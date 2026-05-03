import { useState, useEffect, memo, useRef } from "react";
import { TRIVIA_QUESTIONS, getStreak, saveStreak, getBestScore, saveBestScore } from "../../trivia.js";

const API_URL = "https://opentdb.com/api.php?amount=7&category=17&type=multiple&encode=url3986";

const decodeAPI = (str) => {
  try {
    return decodeURIComponent(str.replace(/\+/g, " "));
  } catch {
    return str;
  }
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const TriviaGame = memo(function TriviaGame() {
  const [show, setShow] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const streak = getStreak();
  const best = getBestScore();
  const abortRef = useRef(null);
  const cardRef = useRef(null);

  const fetchQuestions = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setApiFailed(false);

    try {
      const localPicks = shuffle(TRIVIA_QUESTIONS).slice(0, 3).map(q => ({
        q: q.q,
        opts: q.opts,
        correct: q.correct,
        isLocal: true,
      }));

      const res = await fetch(API_URL, { signal: abortRef.current.signal });
      const data = await res.json();

      if (data.response_code === 0 && data.results) {
        const apiQuestions = data.results.map(q => {
          const opts = shuffle([q.correct_answer, ...q.incorrect_answers]);
          return {
            q: decodeAPI(q.question),
            opts: opts.map(o => decodeAPI(o)),
            correct: opts.indexOf(q.correct_answer),
            isLocal: false,
          };
        });
        setQuestions(shuffle([...apiQuestions, ...localPicks]));
      } else {
        setApiFailed(true);
        setQuestions(shuffle([...localPicks, ...shuffle(TRIVIA_QUESTIONS.filter(q => !localPicks.some(l => l.q === q.q))).slice(0, 7)].map(q => ({
          q: q.q, opts: q.opts, correct: q.correct, isLocal: true,
        }))));
      }
    } catch {
      setApiFailed(true);
      const local = shuffle(TRIVIA_QUESTIONS).slice(0, 10).map(q => ({
        q: q.q, opts: q.opts, correct: q.correct, isLocal: true,
      }));
      setQuestions(local);
    }
    setLoading(false);
  };

  const startGame = () => {
    setIdx(0);
    setScore(0);
    setAnswered(false);
    setSelected(-1);
    setDone(false);
    setShow(true);
    fetchQuestions();
  };

  const answer = (i) => {
    if (answered) return;
    const scrollY = window.scrollY;
    setAnswered(true);
    setSelected(i);
    if (i === questions[idx].correct) setScore(s => s + 1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    });
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const final = score + (selected === questions[idx].correct ? 1 : 0);
      saveBestScore(final);
      saveStreak(streak + 1);
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setAnswered(false);
      setSelected(-1);
    }
  };

  if (!show) {
    return (
      <div className="glass-card fade-in trivia-start-card">
        <div className="trivia-start-emoji">🧠</div>
        <div className="trivia-start-title">Weather & Science Trivia</div>
        <div className="trivia-start-desc">10 questions from global science + weather knowledge</div>
        <div className="trivia-start-stats">
          <span>🔥 Streak: {streak} days</span>
          <span>🏆 Best: {best}/10</span>
        </div>
        <button className="btn btn-accent trivia-start-btn" onClick={startGame}>Start Quiz</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div ref={cardRef} className="glass-card fade-in trivia-game-card">
        <div className="trivia-loading">
          <div className="loading-spinner" />
          <span>Fetching questions...</span>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="glass-card fade-in trivia-results-card">
        <div className="trivia-result-emoji">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
        <div className="trivia-result-score">{score} / {questions.length}</div>
        <div className="trivia-result-pct">{pct}% correct</div>
        <div className="trivia-result-stats">
          <span>🔥 Streak: {streak + 1} days</span>
          <span>🏆 Best: {Math.max(best, score)}/10</span>
        </div>
        <button className="btn btn-accent trivia-next" onClick={startGame}>Play Again</button>
      </div>
    );
  }

  const q = questions[idx];
  if (!q) return null;

  return (
    <div ref={cardRef} className="glass-card fade-in trivia-game-card">
      <div className="trivia-progress-dots">
        {questions.map((_, i) => (
          <div key={i} className={`trivia-dot${i < idx ? " answered" : ""}${i === idx ? " current" : ""}`} />
        ))}
      </div>
      <div className="trivia-header">
        <span>Question {idx + 1} of {questions.length}</span>
        <span className="trivia-streak">🔥 {streak}</span>
      </div>
      <div className="trivia-question">{q.q}</div>
      {q.isLocal && <div className="trivia-source-tag">🌤️ Weather-specific</div>}
      <div className="trivia-options">
        {q.opts.map((opt, i) => {
          let cls = "trivia-option";
          if (answered) {
            if (i === q.correct) cls += " correct";
            else if (i === selected) cls += " wrong";
          }
          return (
            <button key={i} className={cls} onClick={() => answer(i)} disabled={answered}>{opt}</button>
          );
        })}
      </div>
      {answered && (
        <button className="btn btn-accent trivia-next" onClick={next}>
          {idx + 1 >= questions.length ? "See Results" : "Next →"}
        </button>
      )}
    </div>
  );
});

export default TriviaGame;

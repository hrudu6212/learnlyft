import { useState } from 'react';
import './Quiz.css';
import './ContentStyles.css';

function getQuestionDifficulty(index, total) {
  const pct = index / (total - 1 || 1);
  if (pct <= 0.3) return { label: 'Easy', cls: 'easy' };
  if (pct <= 0.6) return { label: 'Medium', cls: 'medium' };
  if (pct <= 0.85) return { label: 'Hard', cls: 'hard' };
  return { label: 'Expert', cls: 'expert' };
}

function getGrade(pct) {
  if (pct >= 95) return 'A+';
  if (pct >= 90) return 'A';
  if (pct >= 85) return 'A-';
  if (pct >= 80) return 'B+';
  if (pct >= 75) return 'B';
  if (pct >= 70) return 'B-';
  if (pct >= 65) return 'C+';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

export default function Quiz({ data, depthMode }) {
  if (!data) return null;
  const questions = data.questions || [];
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIndex, optIndex) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  const allAnswered = Object.keys(answers).length === questions.length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const answeredCount = Object.keys(answers).length;

  const getScoreColor = () => { if (pct >= 80) return 'var(--accent-emerald)'; if (pct >= 50) return 'var(--accent-amber)'; return 'var(--accent-rose)'; };
  const getScoreEmoji = () => { if (pct >= 90) return '🏆'; if (pct >= 70) return '🌟'; if (pct >= 50) return '👍'; return '📚'; };

  const handleReset = () => { setAnswers({}); setShowResults(false); };

  return (
    <div>
      <h2 className="section-title">{data.title || 'Quiz'}</h2>
      <p className="section-subtitle">
        {depthMode ? `Comprehensive assessment — ${questions.length} questions across all difficulty levels` : `Test your knowledge — ${questions.length} questions`}
      </p>

      {/* Depth mode meta bar */}
      {depthMode && (
        <div className="depth-meta-bar">
          <div className="depth-meta-item"><span>❓</span> <strong>{questions.length}</strong> questions</div>
          <div className="depth-meta-item"><span>✅</span> <strong>{answeredCount}</strong> answered</div>
          <div className="depth-meta-item"><span>📊</span> <strong>{depthMode ? 'Easy → Expert' : 'Mixed'}</strong></div>
          {showResults && <div className="depth-meta-item"><span>🎓</span> Grade: <strong>{getGrade(pct)}</strong></div>}
        </div>
      )}

      {/* Depth mode progress */}
      {depthMode && !showResults && (
        <div className="depth-progress">
          <div className="depth-progress__fill" style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }} />
        </div>
      )}

      {/* Score Banner */}
      {showResults && (
        <div className={`quiz-score animate-fade-in ${depthMode ? 'quiz-score--depth' : ''}`}>
          <div className="quiz-score__emoji">{getScoreEmoji()}</div>
          <div className="quiz-score__number" style={{ color: getScoreColor() }}>
            {score}/{questions.length}
          </div>
          {depthMode && <div className="quiz-score__grade" style={{ color: getScoreColor() }}>{getGrade(pct)}</div>}
          <div className="quiz-score__pct" style={{ color: getScoreColor() }}>{pct}%</div>
          <div className="quiz-score__bar">
            <div className="quiz-score__bar-fill" style={{ width: `${pct}%`, background: getScoreColor() }} />
          </div>
          {depthMode && (
            <div className="quiz-score__breakdown">
              <span>✅ Correct: <strong>{score}</strong></span>
              <span>❌ Wrong: <strong>{questions.length - score}</strong></span>
              <span>📊 Accuracy: <strong>{pct}%</strong></span>
            </div>
          )}
          <button className="quiz-score__reset" onClick={handleReset}>Try Again</button>
        </div>
      )}

      {/* Questions */}
      <div className="quiz-questions">
        {questions.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = selected === q.correct;
          const answered = selected !== undefined;
          const diff = depthMode ? getQuestionDifficulty(qi, questions.length) : null;

          return (
            <div
              key={q.id || qi}
              className={`quiz-q stagger-item ${showResults ? (isCorrect ? 'quiz-q--correct' : 'quiz-q--wrong') : ''} ${depthMode ? 'quiz-q--depth' : ''}`}
              style={{ animationDelay: `${qi * 0.06}s` }}
            >
              <div className="quiz-q__header">
                <span className="quiz-q__num">{qi + 1}</span>
                <h3 className="quiz-q__text">{q.question}</h3>
                {depthMode && diff && (
                  <span className={`difficulty-badge difficulty-badge--${diff.cls}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    {diff.label}
                  </span>
                )}
              </div>

              <div className="quiz-q__options">
                {(q.options || []).map((opt, oi) => {
                  let optClass = 'quiz-opt';
                  if (selected === oi) optClass += ' quiz-opt--selected';
                  if (showResults && oi === q.correct) optClass += ' quiz-opt--correct';
                  if (showResults && selected === oi && oi !== q.correct) optClass += ' quiz-opt--wrong';

                  return (
                    <button key={oi} className={optClass} onClick={() => handleSelect(qi, oi)}>
                      <span className="quiz-opt__letter">{String.fromCharCode(65 + oi)}</span>
                      <span className="quiz-opt__text">{opt}</span>
                      {showResults && oi === q.correct && <span className="quiz-opt__icon">✓</span>}
                      {showResults && selected === oi && oi !== q.correct && <span className="quiz-opt__icon">✗</span>}
                    </button>
                  );
                })}
              </div>

              {showResults && q.explanation && (
                <div className="quiz-q__explanation animate-fade-in">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!showResults && (
        <div className="quiz-submit">
          <button className="quiz-submit__btn" disabled={!allAnswered} onClick={() => setShowResults(true)}>
            {allAnswered ? '🎯 Submit Answers' : `Answer all questions (${answeredCount}/${questions.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

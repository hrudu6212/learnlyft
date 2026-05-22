import { useState, useRef, useEffect } from 'react';
import './Hero.css';

const FEATURES = [
  { icon: '📖', label: 'Study Guide' },
  { icon: '🔀', label: 'Flowchart' },
  { icon: '📊', label: 'Report' },
  { icon: '🔑', label: 'Key Points' },
  { icon: '❓', label: 'Quiz' },
];

const SUGGESTIONS = [
  'Quantum Computing', 'Photosynthesis', 'Machine Learning',
  'World War II', 'DNA Replication', 'Black Holes',
];

export default function Hero({ user, onGenerate, onLogout }) {
  const [topic, setTopic] = useState('');
  const [depthMode, setDepthMode] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('learnlyft_history') || '[]');
      setHistory(h.slice(0, 5));
    } catch {}
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = () => setPdfBase64(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfBase64(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    fire(topic.trim());
  };

  const fire = (t) => {
    setIsAnimating(true);
    setTimeout(() => onGenerate({ topic: t, depthMode, pdfBase64 }), depthMode ? 100 : 400);
  };

  return (
    <div className={`hero ${isAnimating ? 'hero--exit' : ''}`}>
      {/* Top bar */}
      <div className="hero__topbar">
        <div className="hero__logo">
          <span className="hero__logo-icon">🚀</span>
          <span className="hero__logo-text">Learn<span className="hero__logo-accent">Lyft</span></span>
        </div>
        <div className="hero__user-area">
          <div className="hero__user-info">
            <span className="hero__user-avatar">{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
            <span className="hero__user-name">{user?.name || 'User'}</span>
          </div>
          <button className="hero__logout" onClick={onLogout}>Log Out</button>
        </div>
      </div>

      <div className="hero__content">
        <div className="hero__greeting animate-fade-in">
          👋 Welcome back, <strong>{user?.name?.split(' ')[0] || 'Learner'}</strong>
        </div>

        <h1 className="hero__title animate-fade-in">
          What would you like to<br />
          <span className="hero__title-gradient">study today?</span>
        </h1>

        {/* Main Input */}
        <form className="hero__form animate-fade-in" style={{ animationDelay: '.1s' }} onSubmit={handleSubmit}>
          <div className="hero__input-wrap">
            <svg className="hero__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              id="topic-input"
              type="text"
              className="hero__input"
              placeholder="Enter a topic — e.g. Quantum Physics, Neural Networks…"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="hero__btn" disabled={!topic.trim()}>
              <span>Generate</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </form>

        {/* Controls row */}
        <div className="hero__controls animate-fade-in" style={{ animationDelay: '.15s' }}>
          {/* PDF Upload */}
          <div className="hero__upload">
            <input type="file" accept=".pdf" id="pdf-upload" ref={fileRef} hidden onChange={handleFile} />
            {!pdfFile ? (
              <label htmlFor="pdf-upload" className="hero__upload-zone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
                  <path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/>
                </svg>
                <span>Upload PDF <em>(optional)</em></span>
              </label>
            ) : (
              <div className="hero__upload-file">
                <span>📄</span>
                <span className="hero__upload-file-name">{pdfFile.name}</span>
                <span className="hero__upload-file-size">{(pdfFile.size / 1024).toFixed(0)}KB</span>
                <button type="button" className="hero__upload-remove" onClick={removePdf}>✕</button>
              </div>
            )}
          </div>

          {/* Depth Mode */}
          <button
            type="button"
            className={`hero__depth-btn ${depthMode ? 'hero__depth-btn--active' : ''}`}
            onClick={() => setDepthMode(d => !d)}
          >
            <span className={`hero__depth-vortex ${depthMode ? 'hero__depth-vortex--spin' : ''}`}>🌀</span>
            <span className="hero__depth-label">Super Depth</span>
            <span className={`hero__depth-toggle-track ${depthMode ? 'hero__depth-toggle-track--on' : ''}`}>
              <span className="hero__depth-toggle-thumb" />
            </span>
          </button>
        </div>

        {/* Suggestions */}
        <div className="hero__suggestions animate-fade-in" style={{ animationDelay: '.2s' }}>
          <span className="hero__suggestions-label">Quick start:</span>
          {SUGGESTIONS.map(s => (
            <button key={s} className="hero__suggestion" onClick={() => { setTopic(s); fire(s); }}>{s}</button>
          ))}
        </div>

        {/* Features */}
        <div className="hero__features animate-fade-in" style={{ animationDelay: '.25s' }}>
          {FEATURES.map((f, i) => (
            <div key={f.label} className="hero__feature" style={{ animationDelay: `${0.25 + i * 0.05}s` }}>
              <span className="hero__feature-icon">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <div className="hero__history animate-fade-in" style={{ animationDelay: '.3s' }}>
            <span className="hero__history-label">Recent:</span>
            {history.map((h, i) => (
              <button key={i} className="hero__history-item" onClick={() => { setTopic(h.topic); fire(h.topic); }}>
                {h.depth && <span className="hero__history-depth">🌀</span>}
                {h.topic}
              </button>
            ))}
          </div>
        )}

        {/* Footer branding */}
        <div className="hero__branding animate-fade-in" style={{ animationDelay: '.35s' }}>
          ⭐ Made by <strong>CoreStar</strong> · Owned by <strong>Hruddayansh</strong>
        </div>
      </div>
    </div>
  );
}


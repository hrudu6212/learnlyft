import { useState, useCallback, useEffect } from 'react';
import Landing from './components/Landing.jsx';
import Auth from './components/Auth.jsx';
import Hero from './components/Hero.jsx';
import Dashboard from './components/Dashboard.jsx';
import Wormhole from './components/Wormhole.jsx';
import {
  generateStudyGuide,
  generateFlowchart,
  generateReport,
  generateKeyPoints,
  generateQuiz,
} from './api/gemini.js';
import './App.css';

const INITIAL_RESULTS = {
  guide:     { loading: false, data: null, error: null },
  flowchart: { loading: false, data: null, error: null },
  report:    { loading: false, data: null, error: null },
  keypoints: { loading: false, data: null, error: null },
  quiz:      { loading: false, data: null, error: null },
};

export default function App() {
  const [page, setPage] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);

  const [view, setView] = useState('hero');
  const [topic, setTopic] = useState('');
  const [depthMode, setDepthMode] = useState(false);
  const [activeTab, setActiveTab] = useState('guide');
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [showWormhole, setShowWormhole] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(null);

  // Check for existing session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('learnlyft_user');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);

  const handleAuth = (userData) => {
    setUser(userData);
    localStorage.setItem('learnlyft_user', JSON.stringify(userData));
    setPage('app');
    setView('hero');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('learnlyft_user');
    setPage('landing');
    setView('hero');
    setResults(INITIAL_RESULTS);
  };

  const goToAuth = (mode) => {
    setAuthMode(mode);
    setPage('auth');
  };

  const goToApp = () => {
    if (user) { setPage('app'); setView('hero'); }
    else goToAuth('signup');
  };

  // --- Generation logic ---
  const updateResult = (key, update) => {
    setResults(prev => ({ ...prev, [key]: { ...prev[key], ...update } }));
  };

  const startGeneration = useCallback((inputTopic, isDepth, pdfBase64) => {
    setTopic(inputTopic);
    setDepthMode(isDepth);
    setView('dashboard');
    setActiveTab('guide');

    const allLoading = {};
    Object.keys(INITIAL_RESULTS).forEach(k => {
      allLoading[k] = { loading: true, data: null, error: null };
    });
    setResults(allLoading);

    const opts = { depthMode: isDepth, pdfBase64 };
    const tasks = [
      { key: 'guide',     fn: generateStudyGuide },
      { key: 'flowchart', fn: generateFlowchart },
      { key: 'report',    fn: generateReport },
      { key: 'keypoints', fn: generateKeyPoints },
      { key: 'quiz',      fn: generateQuiz },
    ];
    tasks.forEach(({ key, fn }) => {
      fn(inputTopic, opts)
        .then(data => updateResult(key, { loading: false, data }))
        .catch(err => updateResult(key, { loading: false, error: err.message }));
    });

    // Save to history
    try {
      const hist = JSON.parse(localStorage.getItem('learnlyft_history') || '[]');
      hist.unshift({ topic: inputTopic, depth: isDepth, date: new Date().toISOString() });
      localStorage.setItem('learnlyft_history', JSON.stringify(hist.slice(0, 20)));
    } catch {}
  }, []);

  const handleGenerate = useCallback(({ topic: t, depthMode: d, pdfBase64 }) => {
    if (d) {
      setPendingGeneration({ topic: t, depthMode: d, pdfBase64 });
      setShowWormhole(true);
    } else {
      startGeneration(t, false, pdfBase64);
    }
  }, [startGeneration]);

  const handleWormholeComplete = useCallback(() => {
    setShowWormhole(false);
    if (pendingGeneration) {
      startGeneration(pendingGeneration.topic, pendingGeneration.depthMode, pendingGeneration.pdfBase64);
      setPendingGeneration(null);
    }
  }, [pendingGeneration, startGeneration]);

  const handleNewTopic = () => { setView('hero'); setResults(INITIAL_RESULTS); setTopic(''); };

  const handleRegenerate = () => {
    if (depthMode) {
      setPendingGeneration({ topic, depthMode, pdfBase64: null });
      setShowWormhole(true);
    } else {
      startGeneration(topic, depthMode, null);
    }
  };

  return (
    <div className="app">
      <div className="app-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {showWormhole && <Wormhole onComplete={handleWormholeComplete} />}

      {page === 'landing' && (
        <Landing onGetStarted={goToApp} onLogin={() => goToAuth('login')} onSignup={() => goToAuth('signup')} />
      )}

      {page === 'auth' && (
        <Auth mode={authMode} onSwitch={(m) => setAuthMode(m)} onAuth={handleAuth} onBack={() => setPage('landing')} />
      )}

      {page === 'app' && view === 'hero' && (
        <Hero user={user} onGenerate={handleGenerate} onLogout={handleLogout} />
      )}

      {page === 'app' && view === 'dashboard' && (
        <Dashboard
          topic={topic}
          depthMode={depthMode}
          user={user}
          results={results}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewTopic={handleNewTopic}
          onRegenerate={handleRegenerate}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

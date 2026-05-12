import Loader from './Loader.jsx';
import StudyGuide from './StudyGuide.jsx';
import Flowchart from './Flowchart.jsx';
import Report from './Report.jsx';
import KeyPoints from './KeyPoints.jsx';
import Quiz from './Quiz.jsx';
import './Dashboard.css';

const TABS = [
  { key: 'guide',     icon: '📖', label: 'Study Guide' },
  { key: 'flowchart', icon: '🔀', label: 'Flowchart' },
  { key: 'report',    icon: '📊', label: 'Report' },
  { key: 'keypoints', icon: '🔑', label: 'Key Points' },
  { key: 'quiz',      icon: '❓', label: 'Quiz' },
];

const CONTENT_MAP = {
  guide: StudyGuide,
  flowchart: Flowchart,
  report: Report,
  keypoints: KeyPoints,
  quiz: Quiz,
};

export default function Dashboard({ topic, depthMode, user, results, activeTab, onTabChange, onNewTopic, onRegenerate, onLogout }) {
  const completedCount = Object.values(results).filter(r => !r.loading).length;
  const totalCount = Object.keys(results).length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const currentResult = results[activeTab];
  const ContentComponent = CONTENT_MAP[activeTab];

  return (
    <div className={`dashboard animate-fade-in ${depthMode ? 'dashboard--depth' : ''}`}>
      {depthMode && <div className="dash-depth-bg"><div className="dash-depth-grid" /></div>}
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header__left">
          <button className="dash-header__back" onClick={onNewTopic} title="New Topic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="dash-header__title">🚀 Learn<span className="dash-header__accent">Lyft</span></h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p className="dash-header__topic">{topic}</p>
              {depthMode && (
                <span className="dash-depth-badge">🌀 Super Depth</span>
              )}
            </div>
          </div>
        </div>
        <div className="dash-header__right">
          {completedCount < totalCount && (
            <div className="dash-header__progress">
              <div className="dash-header__progress-bar">
                <div className="dash-header__progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="dash-header__progress-text">{completedCount}/{totalCount}</span>
            </div>
          )}
          <button className="dash-header__regen" onClick={onRegenerate} title="Regenerate">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            <span>Regenerate</span>
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="dash-tabs">
        {TABS.map(tab => {
          const r = results[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              className={`dash-tab ${isActive ? 'dash-tab--active' : ''} ${r.error ? 'dash-tab--error' : ''}`}
              onClick={() => onTabChange(tab.key)}
            >
              <span className="dash-tab__icon">{tab.icon}</span>
              <span className="dash-tab__label">{tab.label}</span>
              {r.loading && <span className="dash-tab__status dash-tab__status--loading" />}
              {!r.loading && r.data && <span className="dash-tab__status dash-tab__status--done">✓</span>}
              {r.error && <span className="dash-tab__status dash-tab__status--error">!</span>}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main className="dash-content">
        {currentResult.loading && (
          <Loader section={TABS.find(t => t.key === activeTab)?.label} />
        )}
        {currentResult.error && (
          <div className="dash-error">
            <div className="dash-error__icon">⚠️</div>
            <h3>Generation Failed</h3>
            <p>{currentResult.error}</p>
            <button className="dash-error__retry" onClick={onRegenerate}>Try Again</button>
          </div>
        )}
        {!currentResult.loading && currentResult.data && (
          <div className="dash-content__inner animate-fade-in-up">
            <ContentComponent data={currentResult.data} depthMode={depthMode} />
          </div>
        )}
      </main>
    </div>
  );
}

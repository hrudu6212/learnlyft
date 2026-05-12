import './ContentStyles.css';
import './KeyPoints.css';

function ImportanceMeter({ level }) {
  const bars = level === 'high' ? 5 : level === 'medium' ? 3 : 1;
  return (
    <div className="importance-meter">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`importance-meter__bar ${i < bars ? `importance-meter__bar--filled ${level}` : ''}`} />
      ))}
    </div>
  );
}

export default function KeyPoints({ data, depthMode }) {
  if (!data) return null;
  const points = data.points || [];
  const tips = data.tips || [];

  const highCount = points.filter(p => p.importance === 'high').length;
  const medCount = points.filter(p => p.importance === 'medium').length;
  const lowCount = points.filter(p => p.importance === 'low').length;

  // Group by importance for depth mode
  const grouped = depthMode ? {
    high: points.filter(p => p.importance === 'high'),
    medium: points.filter(p => p.importance === 'medium'),
    low: points.filter(p => p.importance === 'low'),
  } : null;

  return (
    <div>
      <h2 className="section-title">{data.title || 'Key Points'}</h2>
      <p className="section-subtitle">
        {depthMode ? 'Comprehensive essential concepts ranked by importance' : 'Essential concepts you need to know'}
      </p>

      {depthMode && (
        <div className="depth-meta-bar">
          <div className="depth-meta-item"><span>🔑</span> <strong>{points.length}</strong> key points</div>
          <div className="depth-meta-item"><span>🔴</span> <strong>{highCount}</strong> critical</div>
          <div className="depth-meta-item"><span>🟡</span> <strong>{medCount}</strong> important</div>
          <div className="depth-meta-item"><span>🟢</span> <strong>{lowCount}</strong> supplementary</div>
        </div>
      )}

      {/* Stats bar */}
      <div className="kp-stats">
        <div className="kp-stat">
          <span className="kp-stat__count" style={{ color: 'var(--accent-rose)' }}>{highCount}</span>
          <span className="kp-stat__label">High Priority</span>
        </div>
        <div className="kp-stat">
          <span className="kp-stat__count" style={{ color: 'var(--accent-amber)' }}>{medCount}</span>
          <span className="kp-stat__label">Medium</span>
        </div>
        <div className="kp-stat">
          <span className="kp-stat__count" style={{ color: 'var(--accent-emerald)' }}>{lowCount}</span>
          <span className="kp-stat__label">Low</span>
        </div>
        <div className="kp-stat">
          <span className="kp-stat__count" style={{ color: 'var(--accent-cyan)' }}>{points.length}</span>
          <span className="kp-stat__label">Total Points</span>
        </div>
      </div>

      {depthMode && <div className="depth-progress"><div className="depth-progress__fill" style={{ width: '100%' }} /></div>}

      {/* Depth mode: grouped by importance */}
      {depthMode && grouped ? (
        <>
          {[
            { key: 'high', label: '🔴 Critical — Must Know', items: grouped.high },
            { key: 'medium', label: '🟡 Important — Should Know', items: grouped.medium },
            { key: 'low', label: '🟢 Supplementary — Good to Know', items: grouped.low },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.key} style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
                {group.label}
              </h3>
              <div className="kp-grid">
                {group.items.map((pt, i) => (
                  <div key={i} className="kp-card kp-card--depth stagger-item" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="kp-card__top">
                      <span className={`importance-badge importance-badge--${pt.importance || 'medium'}`}>
                        {pt.importance || 'medium'}
                      </span>
                    </div>
                    <h3 className="kp-card__title">{pt.title}</h3>
                    <p className="kp-card__desc">{pt.description}</p>
                    <ImportanceMeter level={pt.importance || 'medium'} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        /* Normal mode */
        <div className="kp-grid">
          {points.map((pt, i) => (
            <div key={i} className="kp-card stagger-item" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="kp-card__top">
                <span className={`importance-badge importance-badge--${pt.importance || 'medium'}`}>
                  {pt.importance || 'medium'}
                </span>
              </div>
              <h3 className="kp-card__title">{pt.title}</h3>
              <p className="kp-card__desc">{pt.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Study Tips */}
      {tips.length > 0 && (
        <div className="content-card" style={{ marginTop: 24 }}>
          <h3 className="content-card__title" style={{ marginBottom: 16 }}>
            💡 {depthMode ? 'Expert Study Strategies' : 'Study Tips'}
          </h3>
          <div className="kp-tips">
            {tips.map((tip, i) => (
              <div key={i} className="kp-tip">
                <span className="kp-tip__num">{i + 1}</span>
                <span className="kp-tip__text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

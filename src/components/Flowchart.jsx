import './Flowchart.css';
import './ContentStyles.css';

const TYPE_COLORS = {
  start:     { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', color: '#10b981', icon: '🚀' },
  concept:   { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.4)', color: '#8b5cf6', icon: '💡' },
  practice:  { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', color: '#3b82f6', icon: '🔧' },
  milestone: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', color: '#f59e0b', icon: '🏆' },
  end:       { bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.4)', color: '#22d3ee', icon: '🎯' },
};

const DEPTH_COLORS = {
  start:     { bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.5)', glow: 'rgba(16,185,129,0.15)' },
  concept:   { bg: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.5)', glow: 'rgba(139,92,246,0.15)' },
  practice:  { bg: 'rgba(59,130,246,0.18)', border: 'rgba(59,130,246,0.5)', glow: 'rgba(59,130,246,0.15)' },
  milestone: { bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.15)' },
  end:       { bg: 'rgba(34,211,238,0.18)', border: 'rgba(34,211,238,0.5)', glow: 'rgba(34,211,238,0.15)' },
};

function getDifficultyLevel(index, total) {
  const pct = index / (total - 1);
  if (pct <= 0.25) return { label: 'Beginner', cls: 'easy' };
  if (pct <= 0.5) return { label: 'Intermediate', cls: 'medium' };
  if (pct <= 0.75) return { label: 'Advanced', cls: 'hard' };
  return { label: 'Expert', cls: 'expert' };
}

export default function Flowchart({ data, depthMode }) {
  if (!data) return null;
  const nodes = data.nodes || [];

  return (
    <div>
      <h2 className="section-title">{data.title || 'Learning Flowchart'}</h2>
      <p className="section-subtitle">
        {depthMode ? 'Detailed learning path with skill level progression' : 'Follow this path to master the topic'}
      </p>

      {depthMode && (
        <>
          <div className="depth-meta-bar">
            <div className="depth-meta-item"><span>📍</span> <strong>{nodes.length}</strong> steps</div>
            <div className="depth-meta-item"><span>🎯</span> <strong>Beginner → Expert</strong></div>
            <div className="depth-meta-item"><span>🌀</span> <strong>Complete</strong> path</div>
          </div>
          <div className="depth-progress">
            <div className="depth-progress__fill" style={{ width: '100%' }} />
          </div>
        </>
      )}

      <div className="flowchart">
        {nodes.map((node, i) => {
          const baseStyle = TYPE_COLORS[node.type] || TYPE_COLORS.concept;
          const depthStyle = DEPTH_COLORS[node.type] || DEPTH_COLORS.concept;
          const style = depthMode ? depthStyle : baseStyle;
          const isLast = i === nodes.length - 1;
          const diff = depthMode ? getDifficultyLevel(i, nodes.length) : null;

          return (
            <div key={node.id || i} className="flow-node stagger-item" style={{ animationDelay: `${i * 0.1}s` }}>
              {!isLast && <div className={`flow-connector ${depthMode ? 'flow-connector--depth' : ''}`} />}

              <div
                className={`flow-node__card ${depthMode ? 'flow-node__card--depth' : ''}`}
                style={{
                  background: style.bg,
                  borderColor: style.border,
                  boxShadow: depthMode ? `0 0 24px ${style.glow}` : undefined,
                }}
              >
                <div className="flow-node__icon" style={{ background: (baseStyle).border }}>
                  {(TYPE_COLORS[node.type] || TYPE_COLORS.concept).icon}
                </div>
                <div className="flow-node__content">
                  <div className="flow-node__step" style={{ color: (baseStyle).color }}>
                    Step {i + 1}
                  </div>
                  <h3 className="flow-node__label">{node.label}</h3>
                  {node.description && (
                    <p className="flow-node__desc">{node.description}</p>
                  )}
                  {depthMode && diff && (
                    <div style={{ marginTop: 8 }}>
                      <span className={`difficulty-badge difficulty-badge--${diff.cls}`}>
                        {diff.label}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flow-node__type" style={{ color: (baseStyle).color, borderColor: (baseStyle).border }}>
                  {node.type}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

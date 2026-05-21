import { useState } from 'react';
import './ExportPDF.css';

// ── helpers ────────────────────────────────────────────────────────────────

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function nowFormatted() {
  return new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── PDF generation via browser print ─────────────────────────────────────

function buildPrintHTML(topic, depthMode, results) {
  const guide     = results.guide?.data;
  const flowchart = results.flowchart?.data;
  const report    = results.report?.data;
  const keypoints = results.keypoints?.data;
  const quiz      = results.quiz?.data;

  const date = nowFormatted();

  const sectionHeader = (icon, title) =>
    `<div class="pdf-section-header"><span class="pdf-section-icon">${icon}</span><h2>${title}</h2></div>`;

  // ── Study Guide ───────────────────────────────────────────────────────
  let guideHTML = '';
  if (guide) {
    guideHTML = `
      ${sectionHeader('📖', guide.title || 'Study Guide')}
      ${guide.introduction ? `<div class="pdf-intro">${guide.introduction}</div>` : ''}
      ${(guide.sections || []).map((s, i) => `
        <div class="pdf-card">
          <div class="pdf-card-header"><span class="pdf-num">${i + 1}</span><h3>${s.heading}</h3></div>
          <div class="pdf-card-body">${s.content || ''}</div>
          ${s.keyTakeaway ? `<div class="pdf-takeaway">💡 <strong>Key Takeaway:</strong> ${s.keyTakeaway}</div>` : ''}
        </div>
      `).join('')}
      ${guide.summary ? `<div class="pdf-summary"><strong>📋 Summary:</strong> ${guide.summary}</div>` : ''}
    `;
  }

  // ── Flowchart ─────────────────────────────────────────────────────────
  const nodeColors = {
    start: '#10b981', concept: '#8b5cf6', practice: '#3b82f6',
    milestone: '#f59e0b', end: '#22d3ee',
  };
  let flowHTML = '';
  if (flowchart) {
    flowHTML = `
      ${sectionHeader('🔀', flowchart.title || 'Learning Flowchart')}
      <div class="pdf-flow">
        ${(flowchart.nodes || []).map((n, i) => {
          const color = nodeColors[n.type] || '#8b5cf6';
          return `
            <div class="pdf-flow-node" style="border-left:4px solid ${color}">
              <div class="pdf-flow-step" style="color:${color}">Step ${i + 1} · ${n.type || 'concept'}</div>
              <strong>${n.label}</strong>
              ${n.description ? `<p>${n.description}</p>` : ''}
            </div>
            ${i < (flowchart.nodes || []).length - 1 ? '<div class="pdf-flow-arrow">↓</div>' : ''}
          `;
        }).join('')}
      </div>
    `;
  }

  // ── Report ────────────────────────────────────────────────────────────
  let reportHTML = '';
  if (report) {
    reportHTML = `
      ${sectionHeader('📊', report.title || 'Report')}
      ${report.abstract ? `<div class="pdf-intro"><strong style="color:#22d3ee;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;">Abstract</strong><br>${report.abstract}</div>` : ''}
      ${(report.sections || []).map((s, i) => `
        <div class="pdf-card">
          <div class="pdf-card-header"><span class="pdf-num">${i + 1}</span><h3>${s.heading}</h3></div>
          <div class="pdf-card-body">${s.content || ''}</div>
        </div>
      `).join('')}
      ${report.conclusion ? `<div class="pdf-summary"><strong>🎯 Conclusion:</strong> ${report.conclusion}</div>` : ''}
      ${(report.references || []).length > 0 ? `
        <div class="pdf-card">
          <h3>📚 References</h3>
          <ol>${(report.references || []).map(r => `<li>${r}</li>`).join('')}</ol>
        </div>
      ` : ''}
    `;
  }

  // ── Key Points ────────────────────────────────────────────────────────
  const importanceColor = { high: '#f43f5e', medium: '#f59e0b', low: '#10b981' };
  let kpHTML = '';
  if (keypoints) {
    kpHTML = `
      ${sectionHeader('🔑', keypoints.title || 'Key Points')}
      <div class="pdf-kp-grid">
        ${(keypoints.points || []).map(p => `
          <div class="pdf-kp-card">
            <div class="pdf-kp-badge" style="background:${importanceColor[p.importance] || '#8b5cf6'}22;color:${importanceColor[p.importance] || '#8b5cf6'};border:1px solid ${importanceColor[p.importance] || '#8b5cf6'}44;">
              ${p.importance || 'medium'}
            </div>
            <strong>${p.title}</strong>
            <p>${p.description}</p>
          </div>
        `).join('')}
      </div>
      ${(keypoints.tips || []).length > 0 ? `
        <div class="pdf-card" style="margin-top:16px">
          <h3>💡 Study Tips</h3>
          <ol>${(keypoints.tips || []).map(t => `<li>${t}</li>`).join('')}</ol>
        </div>
      ` : ''}
    `;
  }

  // ── Quiz ──────────────────────────────────────────────────────────────
  let quizHTML = '';
  if (quiz) {
    quizHTML = `
      ${sectionHeader('❓', quiz.title || 'Quiz')}
      <p class="pdf-subtitle">${(quiz.questions || []).length} questions to test your knowledge</p>
      ${(quiz.questions || []).map((q, qi) => `
        <div class="pdf-quiz-q">
          <div class="pdf-quiz-num">${qi + 1}</div>
          <div>
            <strong>${q.question}</strong>
            <ul class="pdf-quiz-opts">
              ${(q.options || []).map((opt, oi) => `
                <li class="${oi === q.correct ? 'pdf-quiz-correct' : ''}">
                  ${String.fromCharCode(65 + oi)}) ${opt}
                  ${oi === q.correct ? ' <span class="pdf-quiz-tick">✓ Correct</span>' : ''}
                </li>
              `).join('')}
            </ul>
            ${q.explanation ? `<div class="pdf-quiz-explain">💬 ${q.explanation}</div>` : ''}
          </div>
        </div>
      `).join('')}
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>LearnLyft Export — ${topic}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #fff;
    color: #1e1b4b;
    font-size: 13px;
    line-height: 1.65;
  }

  /* ── Cover Page ── */
  .pdf-cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    color: #fff;
    text-align: center;
    padding: 60px 40px;
    page-break-after: always;
  }
  .pdf-cover-logo {
    font-size: 3.5rem;
    margin-bottom: 12px;
    filter: drop-shadow(0 0 24px rgba(139,92,246,.6));
  }
  .pdf-cover-brand {
    font-size: 2.2rem;
    font-weight: 900;
    background: linear-gradient(135deg, #8b5cf6, #6366f1, #22d3ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  .pdf-cover-tagline {
    color: rgba(255,255,255,.55);
    font-size: 0.95rem;
    margin-bottom: 48px;
  }
  .pdf-cover-divider {
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #8b5cf6, #22d3ee);
    border-radius: 99px;
    margin: 0 auto 48px;
  }
  .pdf-cover-topic {
    font-size: 2.4rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 16px;
    max-width: 640px;
  }
  .pdf-cover-badges {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 48px;
  }
  .pdf-badge {
    padding: 5px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.1);
    border: 1px solid rgba(255,255,255,.2);
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255,255,255,.85);
  }
  .pdf-badge--depth {
    background: rgba(139,92,246,.25);
    border-color: rgba(139,92,246,.5);
    color: #c084fc;
  }
  .pdf-cover-meta {
    color: rgba(255,255,255,.4);
    font-size: 0.78rem;
    margin-bottom: 64px;
  }
  .pdf-cover-footer {
    margin-top: auto;
    color: rgba(255,255,255,.35);
    font-size: 0.75rem;
    border-top: 1px solid rgba(255,255,255,.08);
    width: 100%;
    padding-top: 24px;
    margin-top: 64px;
  }
  .pdf-cover-footer strong { color: rgba(255,255,255,.6); }

  /* ── Content pages ── */
  .pdf-page {
    padding: 40px 48px;
    max-width: 860px;
    margin: 0 auto;
  }
  .pdf-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 2px solid #ede9fe;
    margin-bottom: 28px;
  }
  .pdf-page-logo {
    font-size: 1rem;
    font-weight: 800;
    color: #6d28d9;
  }
  .pdf-page-date { font-size: 0.72rem; color: #94a3b8; }

  .pdf-section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #ede9fe, #dbeafe);
    border-left: 4px solid #7c3aed;
    border-radius: 8px;
    padding: 12px 18px;
    margin: 28px 0 18px;
  }
  .pdf-section-icon { font-size: 1.3rem; }
  .pdf-section-header h2 {
    font-size: 1.1rem;
    font-weight: 800;
    color: #1e1b4b;
  }

  .pdf-intro {
    background: linear-gradient(135deg, #faf5ff, #eff6ff);
    border: 1px solid #ddd6fe;
    border-radius: 8px;
    padding: 14px 18px;
    margin-bottom: 14px;
    color: #374151;
    font-size: 0.88rem;
  }
  .pdf-subtitle { color: #6b7280; font-size: 0.85rem; margin-bottom: 14px; }

  .pdf-card {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    break-inside: avoid;
  }
  .pdf-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .pdf-num {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
    font-weight: 700;
    font-size: 0.75rem;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pdf-card-header h3 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e1b4b;
  }
  .pdf-card-body {
    color: #374151;
    font-size: 0.84rem;
    line-height: 1.7;
  }
  .pdf-card-body h1,.pdf-card-body h2,.pdf-card-body h3 { color:#1e1b4b; margin:.6em 0 .3em; }
  .pdf-card-body ul,.pdf-card-body ol { padding-left:1.4em; margin:.4em 0; }
  .pdf-card-body li { margin:.2em 0; }
  .pdf-card-body strong { color:#1e1b4b; }
  .pdf-card-body code { background:#f3f4f6; padding:1px 5px; border-radius:4px; font-size:.82em; }
  .pdf-card h3 { font-size:.92rem; font-weight:700; color:#1e1b4b; margin-bottom:10px; }
  .pdf-card ol,.pdf-card ul { padding-left:1.4em; color:#374151; }
  .pdf-card li { margin:.25em 0; font-size:.84rem; }

  .pdf-takeaway {
    background: linear-gradient(135deg, #fef9c3, #fef3c7);
    border: 1px solid #fde68a;
    border-radius: 6px;
    padding: 8px 14px;
    margin-top: 10px;
    font-size: 0.82rem;
    color: #92400e;
  }

  .pdf-summary {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border: 1px solid #a7f3d0;
    border-left: 4px solid #10b981;
    border-radius: 8px;
    padding: 14px 18px;
    margin-top: 14px;
    font-size: 0.86rem;
    color: #065f46;
  }

  /* ── Flowchart ── */
  .pdf-flow { padding: 4px 0; }
  .pdf-flow-node {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 16px;
    break-inside: avoid;
  }
  .pdf-flow-step {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 4px;
  }
  .pdf-flow-node strong { font-size: .92rem; color: #1e1b4b; }
  .pdf-flow-node p { color: #6b7280; font-size: .82rem; margin-top: 4px; }
  .pdf-flow-arrow {
    text-align: center;
    color: #a78bfa;
    font-size: 1.2rem;
    line-height: 1;
    margin: 4px 0;
  }

  /* ── Key Points ── */
  .pdf-kp-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 4px;
  }
  .pdf-kp-card {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 14px;
    break-inside: avoid;
  }
  .pdf-kp-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: .7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    margin-bottom: 6px;
  }
  .pdf-kp-card strong { font-size: .88rem; color: #1e1b4b; display: block; margin-bottom: 4px; }
  .pdf-kp-card p { font-size: .81rem; color: #4b5563; }

  /* ── Quiz ── */
  .pdf-quiz-q {
    display: flex;
    gap: 12px;
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 10px;
    break-inside: avoid;
  }
  .pdf-quiz-num {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
    font-weight: 700;
    font-size: .78rem;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pdf-quiz-q strong { font-size: .88rem; color: #1e1b4b; display: block; margin-bottom: 8px; }
  .pdf-quiz-opts { padding-left: 1.2em; list-style: none; }
  .pdf-quiz-opts li { font-size: .82rem; color: #6b7280; margin: 3px 0; }
  .pdf-quiz-correct { color: #059669 !important; font-weight: 600; }
  .pdf-quiz-tick {
    background: #d1fae5;
    color: #059669;
    font-size: .7rem;
    padding: 1px 7px;
    border-radius: 999px;
    margin-left: 6px;
    font-weight: 700;
  }
  .pdf-quiz-explain {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 7px 12px;
    margin-top: 8px;
    font-size: .8rem;
    color: #1e40af;
  }

  /* ── Footer ── */
  .pdf-footer {
    text-align: center;
    padding: 32px 40px 24px;
    border-top: 2px solid #ede9fe;
    margin-top: 40px;
    color: #9ca3af;
    font-size: 0.75rem;
  }
  .pdf-footer-brand {
    font-size: 1rem;
    font-weight: 800;
    color: #6d28d9;
    margin-bottom: 4px;
  }
  .pdf-footer strong { color: #7c3aed; }

  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .pdf-cover { page-break-after: always; }
    .pdf-card, .pdf-quiz-q, .pdf-kp-card, .pdf-flow-node { break-inside: avoid; }
  }
</style>
</head>
<body>

<!-- ── Cover Page ── -->
<div class="pdf-cover">
  <div class="pdf-cover-logo">🚀</div>
  <div class="pdf-cover-brand">LearnLyft</div>
  <div class="pdf-cover-tagline">AI-Powered Study Materials</div>
  <div class="pdf-cover-divider"></div>
  <div class="pdf-cover-topic">${topic}</div>
  <div class="pdf-cover-badges">
    <span class="pdf-badge">📖 Study Guide</span>
    <span class="pdf-badge">🔀 Flowchart</span>
    <span class="pdf-badge">📊 Report</span>
    <span class="pdf-badge">🔑 Key Points</span>
    <span class="pdf-badge">❓ Quiz</span>
    ${depthMode ? '<span class="pdf-badge pdf-badge--depth">🌀 Super Depth Mode</span>' : ''}
  </div>
  <div class="pdf-cover-meta">Generated on ${date}</div>
  <div class="pdf-cover-footer">
    Made with ❤️ by <strong>CoreStar</strong> &nbsp;·&nbsp; Owned by <strong>Hruddayansh</strong>
    &nbsp;·&nbsp; LearnLyft © 2026
  </div>
</div>

<!-- ── Content Pages ── -->
<div class="pdf-page">
  <div class="pdf-page-header">
    <div class="pdf-page-logo">🚀 LearnLyft</div>
    <div class="pdf-page-date">Topic: ${topic} &nbsp;|&nbsp; ${date}</div>
  </div>

  ${guideHTML}
  ${flowHTML}
  ${reportHTML}
  ${kpHTML}
  ${quizHTML}

  <div class="pdf-footer">
    <div class="pdf-footer-brand">🚀 LearnLyft</div>
    <div>Made with ❤️ by <strong>CoreStar</strong> &nbsp;·&nbsp; Owned by <strong>Hruddayansh</strong></div>
    <div style="margin-top:4px">AI-Powered Study Materials &nbsp;·&nbsp; LearnLyft © 2026</div>
  </div>
</div>

</body></html>`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ExportPDF({ topic, depthMode, results }) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const readyKeys = Object.keys(results).filter(k => results[k]?.data);
  const totalKeys = Object.keys(results).length;
  const allReady  = readyKeys.length === totalKeys;
  const anyReady  = readyKeys.length > 0;

  const SECTION_LABELS = {
    guide: { icon: '📖', label: 'Study Guide' },
    flowchart: { icon: '🔀', label: 'Flowchart' },
    report: { icon: '📊', label: 'Report' },
    keypoints: { icon: '🔑', label: 'Key Points' },
    quiz: { icon: '❓', label: 'Quiz' },
  };

  const handleExport = () => {
    setExporting(true);
    setDone(false);

    const html = buildPrintHTML(topic, depthMode, results);
    const win = window.open('', '_blank');
    if (!win) {
      setExporting(false);
      alert('Please allow popups for this site to export the PDF.');
      return;
    }

    win.document.write(html);
    win.document.close();

    // Give fonts time to load then trigger print
    setTimeout(() => {
      win.focus();
      win.print();
      setExporting(false);
      setDone(true);
      setTimeout(() => setDone(false), 3500);
    }, 1200);
  };

  return (
    <div className="export-page">
      {/* Hero Banner */}
      <div className="export-hero">
        <div className="export-hero__glow" />
        <div className="export-hero__icon">📄</div>
        <h2 className="export-hero__title">Export as PDF</h2>
        <p className="export-hero__sub">
          Download a beautifully formatted PDF of all your AI-generated study materials for <strong>{topic}</strong>
        </p>
      </div>

      {/* Status cards */}
      <div className="export-sections">
        <h3 className="export-sections__title">Content Sections</h3>
        <div className="export-sections__grid">
          {Object.entries(SECTION_LABELS).map(([key, { icon, label }]) => {
            const r = results[key];
            const status = r?.loading ? 'loading' : r?.data ? 'ready' : r?.error ? 'error' : 'pending';
            return (
              <div key={key} className={`export-section-card export-section-card--${status}`}>
                <div className="export-section-card__icon">{icon}</div>
                <div className="export-section-card__info">
                  <div className="export-section-card__label">{label}</div>
                  <div className={`export-section-card__status export-section-card__status--${status}`}>
                    {status === 'ready'   && '✓ Ready'}
                    {status === 'loading' && '⏳ Generating…'}
                    {status === 'error'   && '⚠ Failed'}
                    {status === 'pending' && '○ Pending'}
                  </div>
                </div>
                {status === 'ready' && <div className="export-section-card__check">✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      {!allReady && (
        <div className="export-progress-wrap">
          <div className="export-progress-bar">
            <div
              className="export-progress-fill"
              style={{ width: `${(readyKeys.length / totalKeys) * 100}%` }}
            />
          </div>
          <span className="export-progress-text">{readyKeys.length}/{totalKeys} sections ready</span>
        </div>
      )}

      {/* Preview card */}
      <div className="export-preview">
        <div className="export-preview__header">
          <div className="export-preview__logo">🚀 LearnLyft</div>
          <div className="export-preview__badge">PDF Preview</div>
        </div>
        <div className="export-preview__body">
          <div className="export-preview__cover">
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚀</div>
            <div className="export-preview__brand">LearnLyft</div>
            <div className="export-preview__topic">{topic}</div>
            <div className="export-preview__chips">
              {Object.entries(SECTION_LABELS).map(([key, { icon, label }]) =>
                results[key]?.data ? (
                  <span key={key} className="export-preview__chip">{icon} {label}</span>
                ) : null
              )}
              {depthMode && <span className="export-preview__chip export-preview__chip--depth">🌀 Super Depth</span>}
            </div>
          </div>
          <div className="export-preview__footer-brand">
            Made with ❤️ by <strong>CoreStar</strong> · Owned by <strong>Hruddayansh</strong>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="export-actions">
        <button
          className={`export-btn ${exporting ? 'export-btn--loading' : ''} ${done ? 'export-btn--done' : ''}`}
          onClick={handleExport}
          disabled={!anyReady || exporting}
        >
          {exporting ? (
            <>
              <span className="export-btn__spinner" />
              Preparing PDF…
            </>
          ) : done ? (
            <>✅ Exported! Print dialog opened</>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Full PDF
            </>
          )}
        </button>
        {!allReady && anyReady && (
          <p className="export-hint">
            You can export now with {readyKeys.length} section{readyKeys.length !== 1 ? 's' : ''}, or wait for all {totalKeys} to finish.
          </p>
        )}
        {!anyReady && (
          <p className="export-hint">Waiting for content to be generated…</p>
        )}
      </div>

      {/* Branding Footer */}
      <div className="export-branding">
        <div className="export-branding__logo">⭐ CoreStar</div>
        <div className="export-branding__tagline">
          Crafted with ❤️ by <strong>CoreStar</strong> &nbsp;·&nbsp; Owned by <strong>Hruddayansh</strong>
        </div>
        <div className="export-branding__sub">LearnLyft is a CoreStar product · © 2026</div>
      </div>
    </div>
  );
}

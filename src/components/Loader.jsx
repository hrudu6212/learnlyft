import './Loader.css';

export default function Loader({ section }) {
  return (
    <div className="loader">
      <div className="loader__rings">
        <div className="loader__ring loader__ring--1" />
        <div className="loader__ring loader__ring--2" />
        <div className="loader__ring loader__ring--3" />
        <div className="loader__brain">🧠</div>
      </div>
      <p className="loader__text">Generating {section || 'content'}…</p>
      <p className="loader__sub">AI is analyzing and creating your study material</p>
    </div>
  );
}

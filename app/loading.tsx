export default function Loading() {
  return <div className="shell loading-page" aria-label="페이지를 불러오는 중"><div className="loading-heading" /><div className="loading-grid">{Array.from({ length: 8 }).map((_, index) => <div key={index}><span /><i /><b /></div>)}</div></div>;
}

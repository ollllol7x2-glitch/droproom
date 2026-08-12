import Link from "next/link";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  sections: LegalSection[];
};

export function LegalDocument({ eyebrow, title, summary, effectiveDate, sections }: LegalDocumentProps) {
  return (
    <div className="policy-page">
      <header className="shell policy-hero">
        <p className="policy-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{summary}</p>
        <dl className="policy-meta">
          <div><dt>시행일</dt><dd>{effectiveDate}</dd></div>
          <div><dt>문서 상태</dt><dd>화면 구성용 샘플</dd></div>
        </dl>
      </header>

      <div className="shell policy-notice" role="note">
        <strong>데모 안내</strong>
        <p>이 문서는 쇼핑몰 화면 확인을 위한 가데이터입니다. 실제 운영 전 법률 검토와 사업자 정보 반영이 필요합니다.</p>
      </div>

      <div className="shell policy-layout">
        <nav className="policy-toc" aria-label={`${title} 목차`}>
          <strong>목차</strong>
          {sections.map((section, index) => (
            <Link key={section.id} href={`#${section.id}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>{section.title}
            </Link>
          ))}
        </nav>

        <article className="policy-content">
          {sections.map((section, index) => (
            <section id={section.id} key={section.id} className="policy-section">
              <div className="policy-section-heading">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.title}</h2>
              </div>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items && (
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}


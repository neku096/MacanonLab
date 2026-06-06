import TermsRadioTabs from "@/components/TermsRadioTabs";

export const metadata = {
  alternates: {
    canonical: "/terms"
  },
  openGraph: {
    url: "/terms"
  },
  title: "利用規約・ライセンス",
  description: "macanonサイトの利用規約とDLsite/BOOTH商品向けライセンスを確認できます。"
};

const licensePages = {
  ja: {
    label: "日本語BOOTH規約PDF",
    alt: "macanon利用規約 日本語",
    count: 10
  },
  en: {
    label: "英語BOOTH規約PDF",
    alt: "macanon license terms English",
    count: 11
  },
  ko: {
    label: "韓国語BOOTH規約PDF",
    alt: "macanon 이용약관 한국어",
    count: 2
  },
  zh: {
    label: "中国語BOOTH規約PDF",
    alt: "macanon 使用条款 中文",
    count: 4
  }
};

function TermsLicensePages({ language }) {
  const license = licensePages[language];
  const pages = Array.from({ length: license.count }, (_, index) => index + 1);

  return (
    <div className="terms-license-pages" aria-label={license.label}>
      {pages.map((page) => {
        const pageNumber = String(page).padStart(2, "0");
        return (
          <figure className="terms-license-page" key={`${language}-${pageNumber}`}>
            <img
              src={`/images/terms/macanon-license-${language}-${pageNumber}.webp`}
              alt={`${license.alt} ${page}ページ目`}
              width="1192"
              height="1684"
              loading="lazy"
              decoding="async"
            />
          </figure>
        );
      })}
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="text-page terms-page">
      <section className="section text-section" aria-labelledby="terms-title">
        <h1 id="terms-title">利用規約・ライセンス</h1>
        <div className="terms-tabs">
          <input className="terms-tab-input" type="radio" name="terms-view" id="terms-site" defaultChecked />
          <input className="terms-tab-input" type="radio" name="terms-view" id="terms-booth" />
          <div className="terms-tab-list" role="tablist" aria-label="利用規約の分類">
            <label className="terms-tab-button" htmlFor="terms-site" role="tab" id="terms-site-tab" aria-controls="terms-site-panel" aria-selected="true" tabIndex="0">
              サイトの規約
            </label>
            <label className="terms-tab-button" htmlFor="terms-booth" role="tab" id="terms-booth-tab" aria-controls="terms-booth-panel" aria-selected="false" tabIndex="-1">
              BOOTHの規約
            </label>
          </div>
          <div className="terms-tab-panels">
            <section className="terms-tab-panel terms-tab-panel-site" role="tabpanel" id="terms-site-panel" aria-labelledby="terms-site-tab" tabIndex="0">
              <div className="article-summary-list">
                <p>各商品の利用条件、禁止事項、更新履歴、導入条件は、DLsiteまたはBOOTHの商品ページおよび商品に同梱された規約を優先します。</p>
                <p>画像、文章、商品データの無断転載、再配布、販売、AI学習への利用は行わないでください。</p>
                <p>案件のご相談や商品に関するお問い合わせは、BOOTHまたはXの案内からご連絡ください。</p>
                <h2>アクセス解析について</h2>
                <p>当サイトでは、サイト改善や閲覧状況の把握のため、アクセス解析ツールを利用する場合があります。</p>
                <p>アクセス解析により、閲覧ページ、利用環境、アクセス日時などの情報が収集される場合があります。収集される情報は、個人を特定する目的では使用しません。</p>
                <p>Google Analytics等の解析ツールを利用する場合、収集された情報は各提供元のプライバシーポリシーに基づいて管理されます。</p>
              </div>
            </section>
            <section className="terms-tab-panel terms-tab-panel-booth" role="tabpanel" id="terms-booth-panel" aria-labelledby="terms-booth-tab" tabIndex="0">
              <input className="terms-license-input" type="radio" name="license-language" id="license-ja" defaultChecked />
              <input className="terms-license-input" type="radio" name="license-language" id="license-en" />
              <input className="terms-license-input" type="radio" name="license-language" id="license-ko" />
              <input className="terms-license-input" type="radio" name="license-language" id="license-zh" />
              <div className="terms-license-switch" role="tablist" aria-label="BOOTH規約の言語">
                <label className="terms-license-button" htmlFor="license-ja" role="tab" id="license-ja-tab" aria-controls="license-ja-panel" aria-selected="true" tabIndex="0">
                  JA
                </label>
                <label className="terms-license-button" htmlFor="license-en" role="tab" id="license-en-tab" aria-controls="license-en-panel" aria-selected="false" tabIndex="-1">
                  EN
                </label>
                <label className="terms-license-button" htmlFor="license-ko" role="tab" id="license-ko-tab" aria-controls="license-ko-panel" aria-selected="false" tabIndex="-1">
                  KO
                </label>
                <label className="terms-license-button" htmlFor="license-zh" role="tab" id="license-zh-tab" aria-controls="license-zh-panel" aria-selected="false" tabIndex="-1">
                  ZH
                </label>
              </div>
              <div className="terms-license-panels">
                <section className="terms-license-panel terms-license-panel-ja" role="tabpanel" id="license-ja-panel" aria-labelledby="license-ja-tab" tabIndex="0">
                  <TermsLicensePages language="ja" />
                </section>
                <section className="terms-license-panel terms-license-panel-en" role="tabpanel" id="license-en-panel" aria-labelledby="license-en-tab" tabIndex="0">
                  <TermsLicensePages language="en" />
                </section>
                <section className="terms-license-panel terms-license-panel-ko" role="tabpanel" id="license-ko-panel" aria-labelledby="license-ko-tab" tabIndex="0">
                  <TermsLicensePages language="ko" />
                </section>
                <section className="terms-license-panel terms-license-panel-zh" role="tabpanel" id="license-zh-panel" aria-labelledby="license-zh-tab" tabIndex="0">
                  <TermsLicensePages language="zh" />
                </section>
              </div>
            </section>
          </div>
        </div>
        <div className="article-summary-list terms-disclaimer">
          <h2>免責</h2>
          <p>当商品によって発生した損害、トラブル、各プラットフォームでの制限について、macanonは責任を負いません。必要に応じて規約内容を変更する場合があります。</p>
        </div>
      </section>
      <TermsRadioTabs />
    </main>
  );
}

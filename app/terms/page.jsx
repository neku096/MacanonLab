export const metadata = {
  title: "利用規約・ライセンス",
  description: "macanon作品の利用条件、禁止事項、免責、アクセス解析についての案内です。"
};

export default function TermsPage() {
  return (
    <main className="terms-body">
      <section className="section terms-page-shell">
        <div className="terms-card">
          <h1>利用規約・ライセンス</h1>
          <div className="terms-tabs-frame" role="group" aria-label="規約種別">
            <a className="button primary" href="#site-terms">
              サイトの規約
            </a>
            <a className="button secondary" href="#booth-terms">
              BOOTHの規約
            </a>
          </div>
          <section id="site-terms" className="terms-section">
            <h2>利用できる範囲</h2>
            <p>各商品の利用条件、禁止事項、更新履歴、導入条件は、BOOTHの商品ページおよび商品に同梱された規約を優先します。</p>
            <p>画像、文章、商品データの無断転載、再配布、販売、AI学習への利用は行わないでください。</p>
            <p>案件のご相談や商品に関するお問い合わせは、BOOTHまたはXの案内からご連絡ください。</p>
          </section>
          <section id="analytics" className="terms-section">
            <h2>アクセス解析について</h2>
            <p>当サイトでは、サイト改善や閲覧状況の把握のため、アクセス解析ツールを利用する場合があります。</p>
            <p>アクセス解析により、閲覧ページ、利用環境、アクセス日時などの情報が収集される場合があります。収集される情報は、個人を特定する目的では使用しません。</p>
            <p>Google Analytics等の解析ツールを利用する場合、収集された情報は各提供元のプライバシーポリシーに基づいて管理されます。</p>
          </section>
          <section id="booth-terms" className="terms-section">
            <h2>BOOTHの規約</h2>
            <p>各商品の詳細な利用条件、導入手順、更新内容はBOOTHの商品ページに掲載しています。購入前に必ず最新情報をご確認ください。</p>
          </section>
          <section id="disclaimer" className="terms-section">
            <h2>免責</h2>
            <p>当商品によって発生した損害、トラブル、各プラットフォームでの制限について、macanonは責任を負いません。必要に応じて規約内容を変更する場合があります。</p>
          </section>
        </div>
      </section>
    </main>
  );
}

(() => {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const translations = {
    "VRChat 3D衣装・ギミック制作": "VRChat 3D Outfit & Gimmick",
    "macanon | VRChat向け3D衣装・ギミック": "macanon | VRChat 3D Outfits & Gimmicks",
    "macanon | VRChat向け3D衣装・ギミック制作": "macanon | VRChat 3D Outfits & Gimmicks",
    "BOOTH作品一覧 | macanon": "BOOTH Works | macanon",
    "制作実績・案件相談 | macanon": "Portfolio & Commissions | macanon",
    "公式リンク集 | macanon": "Official Links | macanon",
    "利用規約 | macanon": "Terms | macanon",
    "利用規約・ライセンス | macanon": "Terms & License | macanon",
    "macanonはVRChat向けの3D衣装、召喚ギミック、アクセサリーを制作しています。BOOTH作品、制作相談、ブログ記事への導線をまとめた公式サイトです。": "macanon creates VRChat 3D outfits, summon gimmicks, and accessories. This official site collects links to BOOTH works, commission information, and blog posts.",
    "VRChat向けの3D衣装、召喚ギミック、アクセサリーを制作するmacanonの公式サイトです。": "The official macanon site for VRChat 3D outfits, summon gimmicks, and accessories.",
    "macanon BOOTH商品サムネイル": "macanon BOOTH product thumbnail",
    "macanonのVRChat向け3D衣装、召喚ギミック、アクセサリーをBOOTH商品サムネイルで確認できます。": "Browse macanon's VRChat 3D outfits, summon gimmicks, and accessories through BOOTH product thumbnails.",
    "macanonのVRChat向け3D衣装、召喚ギミック、アクセサリー一覧です。": "A list of macanon's VRChat 3D outfits, summon gimmicks, and accessories.",
    "macanonのVRChat向け3D衣装・ギミック制作実績・案件相談ページです。BOOTH販売実績、制作できる内容、案件相談の流れを掲載しています。": "A portfolio and commission information page for macanon's VRChat 3D outfit and gimmick production, including BOOTH work examples, available services, and inquiry guidance.",
    "VRChat向け3D衣装・ギミック制作の実績と案件相談窓口です。": "Portfolio and commission contact information for VRChat 3D outfit and gimmick production.",
    "macanonサイトの利用規約と、BOOTH商品ページの規約確認に関する案内です。": "Terms for the macanon site and guidance for checking BOOTH product terms.",
    "macanonサイトの利用規約とBOOTH商品向けライセンスを確認できます。日本語版と英語版のライセンス画像をタブで掲載しています。": "View the macanon site terms and BOOTH product license. Japanese and English license images are shown in tabs.",
    "macanonサイトの利用規約とBOOTH商品向けライセンスを確認できます。日本語版、英語版、韓国語版、中国語版のライセンス画像をタブで掲載しています。": "View the macanon site terms and BOOTH product license. Japanese, English, Korean, and Chinese license images are shown in tabs.",
    "macanonのVRChat、Unity、Modular Avatar向けTips、商品レビュー、制作ブログ記事一覧です。タグで絞り込みできます。": "A tag-filterable list of macanon tips, product reviews, and production blog posts for VRChat, Unity, and Modular Avatar.",
    "macanonのTips、商品レビュー、制作ブログ記事一覧です。": "A list of macanon tips, product reviews, and production blog posts.",
    "macanonの公式リンク集です。BOOTH作品ページとXへの導線をスマホでも見やすくまとめています。": "Official macanon links, with easy mobile access to the BOOTH product page and X.",
    "macanonのBOOTH作品ページとXへの公式リンクをまとめています。": "Official links to macanon's BOOTH product page and X.",
    "macanon 公式リンク集": "macanon Official Links",
    "macanon 公式リンク集へ": "macanon official links",
    "VRChat向け3D衣装、召喚ギミック、アクセサリーを制作しています。作品ページと更新情報はこちらから確認できます。": "I create VRChat 3D outfits, summon gimmicks, and accessories. You can check product pages and updates here.",
    "公式外部リンク": "Official external links",
    "VRChat向け3D衣装・ギミック作品ページ": "VRChat 3D outfit and gimmick product page",
    "制作告知・更新情報・お問い合わせ": "Announcements, updates, and inquiries",
    "サイト内で探す": "Browse This Site",
    "サムネイルから作品を探す": "Browse works from thumbnails",
    "使用条件を確認する": "Check usage conditions",
    "ブログを確認する": "View the blog",
    "Links": "Links",
    "macanonのVRChat、Unity、Modular Avatar向けTips記事一覧です。記事は今後追加予定です。": "A list of macanon tips articles for VRChat, Unity, and Modular Avatar. Articles will be added in the future.",
    "macanonのVRChat、Unity、Modular Avatar向けTips記事一覧です。": "A list of macanon tips articles for VRChat, Unity, and Modular Avatar.",
    "このページを共有": "Share this page",
    "共有": "Share",
    "現在のページを共有": "Share this page",
    "閉じる": "Close",
    "Xでシェア": "Share on X",
    "LINEでシェア": "Share on LINE",
    "URLをコピー": "Copy URL",
    "URLをコピーしました": "URL copied",
    "トップ": "Top",
    "ブログ": "Blog",
    "ブログタグ絞り込み": "Blog tag filter",
    "ブログ記事一覧": "Blog article list",
    "ブログページ切り替え": "Blog page navigation",
    "前のブログページ": "Previous blog page",
    "次のブログページ": "Next blog page",
    "BOOTH作品": "BOOTH Works",
    "利用規約": "Terms",
    "利用規約・ライセンス": "Terms & License",
    "サイトの規約": "Site Terms",
    "BOOTHの規約": "BOOTH Terms",
    "利用規約の分類": "Terms category",
    "BOOTH規約の言語": "BOOTH terms language",
    "日本語BOOTH規約PDF": "Japanese BOOTH terms PDF",
    "英語BOOTH規約PDF": "English BOOTH terms PDF",
    "韓国語BOOTH規約PDF": "Korean BOOTH terms PDF",
    "中国語BOOTH規約PDF": "Chinese BOOTH terms PDF",
    "VRChat向け": "For VRChat",
    "3Dアイテム制作": "3D Item Creation",
    "衣装、召喚ギミック、アクセサリーを中心に、改変に取り入れやすく、写真や交流のきっかけになるアイテムを制作しています。": "I create VRChat outfits, summon gimmicks, and accessories that are easy to add to avatar edits and fun to use in photos or social moments.",
    "BOOTHを見る": "View BOOTH",
    "制作実績を見る": "View Works",
    "商品リンク": "Product Links",
    "一覧で見る": "View All",
    "3D衣装": "3D Outfit",
    "召喚ギミック": "Summon Gimmick",
    "3D装飾品": "3D Accessory",
    "3Dモデル": "3D Model",
    "ワールドギミック": "World Gimmick",
    "〖ルミナ対応〗CravingDance": "CravingDance for Lumina",
    "〖召喚ギミック〗鮫召喚 Shark summon": "Shark Summon Gimmick",
    "鮫召喚 / Shark summon": "Shark Summon",
    "鯨召喚 Whale summon": "Whale Summon",
    "鯨召喚 / Whale summon": "Whale Summon",
    "カピバラ召喚 Capybara summon": "Capybara Summon",
    "カピバラ召喚": "Capybara Summon",
    "ミリロリ制服 MiriLori Uniform": "MiriLori Uniform",
    "ミリロリ制服": "MiriLori Uniform",
    "スターガーディアン Star Guardian": "Star Guardian",
    "ギャルヘイロー GalHalo": "Gal Halo",
    "ギャルヘイロー": "Gal Halo",
    "無料 ミニ クジラ": "Free Mini Whale",
    "ミニ クジラ": "Mini Whale",
    "Dark Knight 対応衣装": "Dark Knight Outfit",
    "にゃんこお面 CatMask": "CatMask",
    "鮫召喚 Shark summon の制作実績サムネイル": "Shark Summon portfolio thumbnail",
    "CravingDance 制作実績": "CravingDance portfolio work",
    "鮫召喚 制作実績": "Shark Summon portfolio work",
    "鯨召喚 制作実績": "Whale Summon portfolio work",
    "Dark Knight 制作実績": "Dark Knight portfolio work",
    "Star Guardian 制作実績": "Star Guardian portfolio work",
    "ミリロリ制服 制作実績": "MiriLori Uniform portfolio work",
    "商品レビュー・制作ブログ": "Product Reviews / Dev Blog",
    "Blogを見る": "View Blog",
    "レビュー記事は準備中です。公開後はこのエリアに、Tipsと同じカード形式で掲載します。": "Review articles are being prepared. Once published, they will appear here in the same card style as Tips.",
    "BOOTH作品一覧": "BOOTH Works",
    "商品をサムネイルから確認できます。": "Browse products from their thumbnails.",
    "商品情報": "Product information",
    "商品画像": "Product image",
    "商品画像ギャラリー": "Product image gallery",
    "クリックして拡大できます。": "Click to enlarge.",
    "前のサムネイルへ": "Previous thumbnails",
    "次のサムネイルへ": "Next thumbnails",
    "前の画像": "Previous image",
    "次の画像": "Next image",
    "作品カテゴリ": "Work category",
    "商品キーワード": "Product keywords",
    "商品画像はBOOTH掲載サムネイルを基にしています。": "Product images are based on BOOTH listing thumbnails.",
    "BOOTHで確認する": "View on BOOTH",
    "BOOTHで購入する": "Buy on BOOTH",
    "利用規約を見る": "View Terms",
    "対応": "Compatibility",
    "内容": "Contents",
    "用途": "Use",
    "価格": "Price",
    "商品概要": "Product Overview",
    "商品詳細": "Product Details",
    "導入方法": "Setup",
    "同梱内容": "Included Files",
    "チェックポイント": "Checkpoints",
    "利用前の確認": "Before Use",
    "FAQ": "FAQ",
    "この商品のタグ": "Tags for this product",
    "タグ": "Tags",
    "通常タグ": "Main Tags",
    "サブタグ": "Sub Tags",
    "関連商品": "Related Products",
    "BOOTH作品一覧へ": "Back to BOOTH Works",
    "掲載順": "Listed Order",
    "通常順": "Default Order",
    "人気順": "Popular",
    "すべて": "All",
    "衣装": "Outfits",
    "ギミック": "Gimmick",
    "装飾品": "Accessories",
    "前へ": "Prev",
    "次へ": "Next",
    "公開中の制作実績": "Published Works",
    "制作で大切にしていること": "What I Focus On",
    "相談しやすい内容": "Good Topics To Discuss",
    "3D衣装・ギミック制作": "3D Outfits & Gimmicks",
    "企業・個人様の": "Commissions for",
    "ご依頼について": "Businesses and Individuals",
    "VRChat向け3D衣装、召喚ギミック、アクセサリー制作などのご相談を受け付けています。": "I accept inquiries for VRChat 3D outfits, summon gimmicks, accessories, and related production.",
    "世界観や用途に合わせた制作をご提案します。": "I propose production plans tailored to your worldbuilding and intended use.",
    "BOOTHで販売している衣装、召喚ギミック、アクセサリー制作の経験を活かし、コンセプトに合わせた3Dアイテム制作をお手伝いします。": "Using my experience creating BOOTH outfits, summon gimmicks, and accessories, I can help produce 3D items that match your concept.",
    "BOOTH実績を見る": "View BOOTH Works",
    "Xで相談する": "Contact on X",
    "VRChatで使う場面を想定した見栄え、導入しやすさ、改変しやすさのバランス": "Balancing visual appeal, easy setup, and editability for real VRChat use.",
    "Modular Avatar導入を前提にした、ユーザーが扱いやすいPrefab構成": "Prefab structures designed to be easy to use with Modular Avatar.",
    "写真映えするシルエット、発光、パーティクル、表情のある演出づくり": "Silhouettes, glow, particles, and expressive effects that look good in photos.",
    "商品ページで伝わりやすいサムネイル、説明文、更新履歴の整理": "Clear thumbnails, descriptions, and update notes for BOOTH product pages.",
    "VRChatアバター向け衣装、アクセサリー、小物の3Dモデル制作": "3D model production for VRChat avatar outfits, accessories, and props.",
    "召喚、追従、ON/OFF切り替えなどの演出付きギミック制作": "Gimmicks with summon, follow, ON/OFF, and other interactive effects.",
    "既存商品の追加対応、色差分、商品サムネイル改善の相談": "Additional avatar support, color variations, and product thumbnail improvements.",
    "BOOTH販売を想定した商品構成、説明文、導線設計の相談": "Product structure, descriptions, and sales flow planning for BOOTH releases.",
    "制作の流れ": "Production Flow",
    "相談": "Consultation",
    "見積もり": "Estimate",
    "制作": "Production",
    "確認": "Review",
    "納品": "Delivery",
    "相談時に必要なもの": "What To Prepare",
    "ご希望アバター": "Desired avatar",
    "作りたい内容": "What you want made",
    "参考画像": "Reference images",
    "希望納期": "Preferred deadline",
    "予算感": "Budget range",
    "制作の流れ: 相談、見積もり、制作、確認、納品": "Production flow: consultation, estimate, production, review, delivery",
    "相談時に必要なもの: ご希望アバター、作りたい内容、参考画像、希望納期、予算感": "What to prepare: desired avatar, desired content, reference images, preferred deadline, budget range",
    "レビュー/紹介": "Reviews / Posts",
    "制作メモ": "Work Logs",
    "該当するブログ記事はまだありません。": "No matching blog posts yet.",
    "ブログ記事はまだありません。公開後はタグごとに絞り込みできます。": "There are no blog posts yet. Once published, they can be filtered by tag.",
    "Tips記事はまだありません。記事を追加すると、この一覧にカード形式で表示できます。": "There are no Tips articles yet. When articles are added, they will appear here as cards.",
    "各商品の利用条件、禁止事項、更新履歴、導入条件は、BOOTHの商品ページおよび商品に同梱された規約を優先します。": "For each product, the BOOTH product page and included terms take priority for usage conditions, restrictions, update history, and setup requirements.",
    "画像、文章、商品データの無断転載、再配布、販売、AI学習への利用は行わないでください。": "Do not repost, redistribute, sell, or use images, text, or product data for AI training without permission.",
    "案件のご相談や商品に関するお問い合わせは、BOOTHまたはXの案内からご連絡ください。": "For commissions or product inquiries, please contact me through BOOTH or X.",
    "アクセス解析について": "About Access Analytics",
    "当サイトでは、サイト改善や閲覧状況の把握のため、アクセス解析ツールを利用する場合があります。": "This site may use access analytics tools to improve the site and understand browsing activity.",
    "アクセス解析により、閲覧ページ、利用環境、アクセス日時などの情報が収集される場合があります。収集される情報は、個人を特定する目的では使用しません。": "Analytics may collect information such as viewed pages, usage environment, and access date and time. This information is not used to identify individuals.",
    "Google Analytics等の解析ツールを利用する場合、収集された情報は各提供元のプライバシーポリシーに基づいて管理されます。": "When analytics tools such as Google Analytics are used, collected information is managed according to each provider's privacy policy.",
    "BOOTHで規約を確認": "Check Terms on BOOTH",
    "免責": "Disclaimer",
    "当商品によって発生した損害、トラブル、各プラットフォームでの制限について、macanonは責任を負いません。必要に応じて規約内容を変更する場合があります。": "macanon is not responsible for damages, trouble, or platform restrictions caused by these products. Terms may be changed as needed."
  };

  const originalTextNodes = new WeakMap();
  const originalDocumentTitle = document.title;
  const originalAttributes = new WeakMap();
  const languageButtons = [...document.querySelectorAll("[data-language-option]")];
  let currentLanguage = localStorage.getItem("macanon-language") === "en" ? "en" : "ja";

  const translateText = (text) => (currentLanguage === "en" ? translations[text] || text : text);

  const translateAttributes = () => {
    document.title = currentLanguage === "en" ? translations[originalDocumentTitle] || originalDocumentTitle : originalDocumentTitle;
    document.querySelectorAll("[content], [alt], [aria-label], [title]").forEach((element) => {
      ["content", "alt", "aria-label", "title"].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) {
          return;
        }
        if (!originalAttributes.has(element)) {
          originalAttributes.set(element, new Map());
        }
        const originalValues = originalAttributes.get(element);
        if (!originalValues.has(attribute)) {
          originalValues.set(attribute, element.getAttribute(attribute));
        }
        const originalValue = originalValues.get(attribute);
        element.setAttribute(attribute, currentLanguage === "en" ? translations[originalValue] || originalValue : originalValue);
      });
    });
  };

  const updateLocalizedImages = () => {
    document.querySelectorAll("[data-ja-src][data-en-src]").forEach((image) => {
      const nextSrc = currentLanguage === "en" ? image.dataset.enSrc : image.dataset.jaSrc;
      if (nextSrc && image.getAttribute("src") !== nextSrc) {
        image.setAttribute("src", nextSrc);
      }
    });
  };

  const applyLanguage = (language) => {
    currentLanguage = language === "en" ? "en" : "ja";
    localStorage.setItem("macanon-language", currentLanguage);
    document.documentElement.lang = currentLanguage;
    translateAttributes();
    updateLocalizedImages();
    languageButtons.forEach((button) => {
      const isActive = button.dataset.languageOption === currentLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style")) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    textNodes.forEach((node) => {
      if (!originalTextNodes.has(node)) {
        originalTextNodes.set(node, node.nodeValue);
      }
      const originalValue = originalTextNodes.get(node);
      const originalText = originalValue.trim();
      const nextText = currentLanguage === "en" ? translations[originalText] || originalText : originalText;
      node.nodeValue = originalValue.replace(originalText, nextText);
    });

    window.dispatchEvent(new CustomEvent("macanon:languagechange"));
  };

  const getShareData = () => ({
    title: document.title,
    text: document.querySelector('meta[name="description"]')?.content || "",
    url: document.querySelector('link[rel="canonical"]')?.href || window.location.href
  });

  const createShareModal = () => {
    const modal = document.createElement("div");
    modal.className = "share-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "share-modal-title");
    modal.hidden = true;
    modal.innerHTML = `
      <div class="share-backdrop" data-share-close></div>
      <div class="share-panel">
        <button class="share-close" type="button" data-share-close aria-label="閉じる">×</button>
        <h2 id="share-modal-title" class="share-title">現在のページを共有</h2>
        <p class="share-page-title" data-share-title></p>
        <p class="share-page-url" data-share-url></p>
        <div class="share-options" role="list">
          <button class="share-option" type="button" data-share-action="x" role="listitem">
            <span class="share-option-icon share-option-x" aria-hidden="true">X</span>
            <span>Xでシェア</span>
          </button>
          <button class="share-option" type="button" data-share-action="line" role="listitem">
            <span class="share-option-icon share-option-line" aria-hidden="true">LINE</span>
            <span>LINEでシェア</span>
          </button>
          <button class="share-option" type="button" data-share-action="copy" role="listitem">
            <span class="share-option-icon share-option-copy" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.9-3.9a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.25 0 1 1 0 1 1 1.42-1.42 1 1 0 0 0 1.41 0l3-3a1 1 0 0 0-1.41-1.41L12 13.4a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3.9 3.9a3 3 0 1 1-4.2-4.2l3-3a3 3 0 0 1 4.25 0 1 1 0 0 1-1.42 1.42 1 1 0 0 0-1.41 0l-3 3a1 1 0 1 0 1.41 1.41L12 10.6a1 1 0 0 1 1.4 0Z"></path></svg>
            </span>
            <span data-copy-label>URLをコピー</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  };

  let shareModal = null;
  let lastFocusedShareButton = null;

  const closeShareModal = () => {
    if (!shareModal || shareModal.hidden) {
      return;
    }
    shareModal.hidden = true;
    document.body.classList.remove("is-share-modal-open");
    lastFocusedShareButton?.focus();
  };

  const openShareModal = (button) => {
    shareModal ||= createShareModal();
    lastFocusedShareButton = button;
    const shareData = getShareData();
    shareModal.querySelector(".share-close").setAttribute("aria-label", translateText("閉じる"));
    shareModal.querySelector(".share-title").textContent = translateText("現在のページを共有");
    shareModal.querySelector("[data-share-title]").textContent = shareData.title;
    shareModal.querySelector("[data-share-url]").textContent = shareData.url;
    shareModal.querySelector('[data-share-action="x"] span:last-child').textContent = translateText("Xでシェア");
    shareModal.querySelector('[data-share-action="line"] span:last-child').textContent = translateText("LINEでシェア");
    shareModal.querySelector("[data-copy-label]").textContent = translateText("URLをコピー");
    shareModal.hidden = false;
    document.body.classList.add("is-share-modal-open");
    translateAttributes();
    shareModal.querySelector("[data-share-close]")?.focus();
  };

  document.addEventListener("click", async (event) => {
    const shareButton = event.target.closest("[data-share-button]");
    if (shareButton) {
      openShareModal(shareButton);
      return;
    }

    if (!shareModal || shareModal.hidden) {
      return;
    }

    if (event.target.closest("[data-share-close]")) {
      closeShareModal();
      return;
    }

    const actionButton = event.target.closest("[data-share-action]");
    if (!actionButton) {
      return;
    }

    const shareData = getShareData();
    if (actionButton.dataset.shareAction === "x") {
      const intent = new URL("https://twitter.com/intent/tweet");
      intent.searchParams.set("text", shareData.title);
      intent.searchParams.set("url", shareData.url);
      window.open(intent.href, "_blank", "noopener,noreferrer");
      closeShareModal();
    }
    if (actionButton.dataset.shareAction === "line") {
      const intent = new URL("https://social-plugins.line.me/lineit/share");
      intent.searchParams.set("url", shareData.url);
      window.open(intent.href, "_blank", "noopener,noreferrer");
      closeShareModal();
    }
    if (actionButton.dataset.shareAction === "copy") {
      try {
        await navigator.clipboard.writeText(shareData.url);
        actionButton.querySelector("[data-copy-label]").textContent = translateText("URLをコピーしました");
      } catch {
        actionButton.querySelector("[data-copy-label]").textContent = shareData.url;
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeShareModal();
    }
  });

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.languageOption));
  });

  const ensureFooterLinks = () => {
    document.querySelectorAll(".footer-links").forEach((footerLinks) => {
      if (footerLinks.querySelector('a[href="links.html"]')) {
        return;
      }
      const link = document.createElement("a");
      link.className = "footer-pill";
      link.href = "links.html";
      link.setAttribute("aria-label", "macanon 公式リンク集へ");
      link.innerHTML = '<span class="footer-pill-icon" aria-hidden="true">L</span><span>Links</span>';
      footerLinks.appendChild(link);
    });
  };

  const applyFooterIcons = () => {
    const icons = [
      { match: "macanon.booth.pm", src: "images/link-icons/Booth_logo_footer.webp" },
      { match: "x.com/MaCANoN_", src: "images/link-icons/x_logo-white_footer.webp" }
    ];
    document.querySelectorAll(".footer-pill").forEach((pill) => {
      const iconData = icons.find((item) => pill.href.includes(item.match));
      const icon = pill.querySelector(".footer-pill-icon");
      if (!iconData || !icon) {
        return;
      }
      icon.textContent = "";
      let image = icon.querySelector("img");
      if (!image) {
        image = document.createElement("img");
        image.alt = "";
        image.width = 32;
        image.height = 32;
        image.loading = "lazy";
        image.decoding = "async";
        icon.appendChild(image);
      }
      if (!image.getAttribute("src")) {
        image.setAttribute("src", iconData.src);
      }
    });
  };

  ensureFooterLinks();
  applyFooterIcons();

  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const cardSelector = slider.dataset.cardSelector || ".product-slide";
    const slides = [...slider.querySelectorAll(cardSelector)];
    const dots = slider.parentElement.querySelector("[data-slider-dots]");
    const previousButton = slider.parentElement.querySelector("[data-slider-prev]");
    const nextButton = slider.parentElement.querySelector("[data-slider-next]");
    const shouldLoop = slider.dataset.loop === "true";
    const stepSize = 2;

    if (!slides.length) {
      return;
    }

    const getGap = () => {
      const gap = Number.parseFloat(getComputedStyle(slider).columnGap);
      return Number.isNaN(gap) ? 24 : gap;
    };
    const getCardDistance = () => slides[0].getBoundingClientRect().width + getGap();
    const getMaxScrollLeft = () => Math.max(0, slider.scrollWidth - slider.clientWidth);
    const getMaxIndex = () => {
      const distance = getCardDistance();
      return distance > 0 ? Math.ceil(getMaxScrollLeft() / distance) : 0;
    };
    const getMaxStepIndex = () => Math.ceil(getMaxIndex() / stepSize);
    const getSlideLeft = (index) => Math.min(getCardDistance() * index, getMaxScrollLeft());
    const getStepLeft = (stepIndex) => getSlideLeft(stepIndex * stepSize);
    const getVisibleCardCount = () => {
      const distance = getCardDistance();
      return distance > 0 ? Math.ceil(slider.clientWidth / distance) : stepSize;
    };
    const isAtEnd = () => slider.scrollLeft >= getMaxScrollLeft() - 2;
    const getCurrentIndex = () => {
      const distance = getCardDistance();
      return distance > 0 ? clamp(Math.round(slider.scrollLeft / distance), 0, getMaxIndex()) : 0;
    };
    const getCurrentStepIndex = () => clamp(Math.round(getCurrentIndex() / stepSize), 0, getMaxStepIndex());
    const loadImage = (image) => {
      if (image.dataset.srcset && !image.hasAttribute("srcset")) {
        image.setAttribute("srcset", image.dataset.srcset);
      }
      if (image.dataset.src && !image.hasAttribute("src")) {
        image.setAttribute("src", image.dataset.src);
      }
    };
    const loadSlideImages = (index) => {
      const slide = slides[clamp(index, 0, slides.length - 1)];
      if (!slide) {
        return;
      }
      slide.querySelectorAll("img[data-src]").forEach(loadImage);
    };
    const loadSlideRange = (startIndex, endIndex) => {
      for (let index = Math.max(0, startIndex); index <= Math.min(slides.length - 1, endIndex); index += 1) {
        loadSlideImages(index);
      }
    };
    const loadCurrentSlideImages = () => {
      const currentIndex = getCurrentIndex();
      loadSlideRange(currentIndex, currentIndex + getVisibleCardCount() + stepSize);
    };

    const updateActiveDot = () => {
      if (!dots) {
        return;
      }
      const index = getCurrentStepIndex();
      dots.querySelectorAll(".slider-dot").forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        dot.setAttribute("aria-current", isActive ? "true" : "false");
        dot.classList.toggle("is-active", isActive);
      });
    };
    const updateDotLabels = () => {
      if (!dots) {
        return;
      }
      dots.querySelectorAll(".slider-dot").forEach((dot, dotIndex) => {
        dot.setAttribute("aria-label", currentLanguage === "en" ? `Go to slide ${dotIndex + 1}` : `${dotIndex + 1}枚目へ`);
      });
    };

    const fastScrollToStart = () => {
      const start = slider.scrollLeft;
      const duration = 20;
      const startedAt = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        slider.scrollLeft = start * (1 - progress);
        if (progress < 1) {
          requestAnimationFrame(step);
          return;
        }
        slider.scrollLeft = 0;
        updateActiveDot();
      };

      requestAnimationFrame(step);
    };

    const slideByCard = (direction) => {
      const maxScrollLeft = getMaxScrollLeft();
      if (maxScrollLeft <= 0) {
        return;
      }
      const currentIndex = getCurrentIndex();
      if (shouldLoop && direction > 0 && isAtEnd()) {
        loadSlideRange(0, stepSize + 1);
        fastScrollToStart();
        return;
      }
      if (shouldLoop && direction < 0 && slider.scrollLeft <= 2) {
        loadSlideRange(slides.length - stepSize - 2, slides.length - 1);
        slider.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
        return;
      }
      const nextIndex = clamp(currentIndex + direction * stepSize, 0, slides.length - 1);
      loadSlideRange(nextIndex, nextIndex + stepSize + 1);
      slider.scrollTo({ left: getSlideLeft(nextIndex), behavior: "smooth" });
    };

    const autoSlideDelay = 3600;
    let autoSlideTimer;
    let canAutoSlide = !("IntersectionObserver" in window);
    const stopAutoSlide = () => {
      window.clearInterval(autoSlideTimer);
      autoSlideTimer = undefined;
    };
    const startAutoSlide = () => {
      if (autoSlideTimer || !canAutoSlide) {
        return;
      }
      autoSlideTimer = window.setInterval(() => slideByCard(1), autoSlideDelay);
    };
    const restartAutoSlide = () => {
      stopAutoSlide();
      startAutoSlide();
    };
    let isDragging = false;
    let hasDragged = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let pressedLink = null;
    let suppressNextClick = false;

    const renderDots = () => {
      if (!dots) {
        return;
      }
      dots.innerHTML = "";
      const dotCount = getMaxStepIndex() + 1;
      Array.from({ length: dotCount }).forEach((_, dotIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "slider-dot";
        button.setAttribute("aria-label", currentLanguage === "en" ? `Go to slide ${dotIndex + 1}` : `${dotIndex + 1}枚目へ`);
        button.addEventListener("click", () => {
          const targetIndex = dotIndex * stepSize;
          loadSlideRange(targetIndex, targetIndex + stepSize + 1);
          slider.scrollTo({ left: getStepLeft(dotIndex), behavior: "smooth" });
          restartAutoSlide();
        });
        dots.append(button);
      });
      updateActiveDot();
      updateDotLabels();
    };

    const move = (direction) => {
      slideByCard(direction);
      restartAutoSlide();
    };

    slider.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    });

    if (previousButton) {
      previousButton.addEventListener("click", () => move(-1));
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => move(1));
    }

    let scrollEndTimer;
    slider.addEventListener("scroll", () => {
      loadCurrentSlideImages();
      updateActiveDot();
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(updateActiveDot, 180);
    });
    slider.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      isDragging = true;
      hasDragged = false;
      dragStartX = event.clientX;
      dragStartScrollLeft = slider.scrollLeft;
      pressedLink = event.target.closest("a[href]");
      slider.setPointerCapture(event.pointerId);
      stopAutoSlide();
    });
    slider.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });
    slider.addEventListener("pointermove", (event) => {
      if (!isDragging) {
        return;
      }
      const movedX = event.clientX - dragStartX;
      if (Math.abs(movedX) < 8) {
        return;
      }
      hasDragged = true;
      pressedLink = null;
      slider.classList.add("is-dragging");
      event.preventDefault();
      slider.scrollLeft = dragStartScrollLeft - movedX;
    });
    slider.addEventListener(
      "click",
      (event) => {
        if (suppressNextClick) {
          event.preventDefault();
          event.stopPropagation();
          suppressNextClick = false;
          return;
        }
        if (!hasDragged) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        window.setTimeout(() => {
          hasDragged = false;
        }, 0);
      },
      true
    );
    const stopDragging = (event) => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      slider.classList.remove("is-dragging");
      restartAutoSlide();
      if (slider.hasPointerCapture(event.pointerId)) {
        slider.releasePointerCapture(event.pointerId);
      }
      const totalMovedX = Math.abs(event.clientX - dragStartX);
      if (!hasDragged && totalMovedX < 8 && pressedLink && pressedLink.getAttribute("href") !== "#") {
        suppressNextClick = true;
        if (pressedLink.target === "_blank") {
          window.open(pressedLink.href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = pressedLink.href;
        }
      }
      pressedLink = null;
    };
    slider.addEventListener("pointerup", stopDragging);
    slider.addEventListener("pointercancel", stopDragging);
    slider.addEventListener("touchend", restartAutoSlide, { passive: true });
    slider.addEventListener("touchcancel", restartAutoSlide, { passive: true });
    slider.addEventListener("lostpointercapture", () => {
      isDragging = false;
      slider.classList.remove("is-dragging");
      restartAutoSlide();
    });
    slider.addEventListener("mouseenter", stopAutoSlide);
    slider.addEventListener("mouseleave", restartAutoSlide);
    slider.addEventListener("focusin", stopAutoSlide);
    slider.addEventListener("focusout", restartAutoSlide);
    window.addEventListener("macanon:languagechange", updateDotLabels);
    window.addEventListener("resize", renderDots);

    if ("IntersectionObserver" in window) {
      const sliderObserver = new IntersectionObserver(
        (entries) => {
          canAutoSlide = entries.some((entry) => entry.isIntersecting);
          if (canAutoSlide) {
            loadCurrentSlideImages();
            startAutoSlide();
            return;
          }
          stopAutoSlide();
        },
        { rootMargin: "160px 0px" }
      );
      sliderObserver.observe(slider);
    } else {
      startAutoSlide();
    }

    renderDots();
    loadCurrentSlideImages();
  });

  document.querySelectorAll("[data-product-gallery]").forEach((gallery) => {
    const dataElement = document.querySelector("#product-gallery-data");
    const mainImage = gallery.querySelector("[data-product-main-image]");
    const mainButton = gallery.querySelector("[data-gallery-open]");
    const inlineThumbs = gallery.querySelector("[data-gallery-inline-thumbs]");
    const inlinePrev = gallery.querySelector("[data-gallery-inline-prev]");
    const inlineNext = gallery.querySelector("[data-gallery-inline-next]");
    const productName = document.querySelector("#product-title")?.textContent?.trim() || "商品";

    if (!dataElement || !mainImage || !inlineThumbs) {
      return;
    }

    let images = [];
    try {
      images = JSON.parse(dataElement.textContent || "[]");
    } catch {
      images = [];
    }

    if (!images.length) {
      return;
    }

    let currentIndex = 0;
    const modal = document.createElement("div");
    modal.className = "product-lightbox";
    modal.hidden = true;
    modal.tabIndex = -1;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "商品画像ギャラリー");
    modal.innerHTML = `
      <div class="product-lightbox-stage" data-gallery-stage>
        <div class="product-lightbox-image-wrap">
          <button class="product-lightbox-close" type="button" data-gallery-close aria-label="閉じる">×</button>
          <button class="product-lightbox-nav" type="button" data-gallery-prev aria-label="前の画像">‹</button>
          <img class="product-lightbox-image" data-gallery-modal-image alt="">
          <button class="product-lightbox-nav" type="button" data-gallery-next aria-label="次の画像">›</button>
        </div>
      </div>
      <aside class="product-lightbox-side">
        <p class="product-lightbox-title">${productName}</p>
        <p class="product-lightbox-count" data-gallery-count></p>
        <div class="product-lightbox-thumbs" data-gallery-modal-thumbs></div>
      </aside>
    `;
    document.body.append(modal);

    const modalImage = modal.querySelector("[data-gallery-modal-image]");
    const modalCount = modal.querySelector("[data-gallery-count]");
    const modalThumbs = modal.querySelector("[data-gallery-modal-thumbs]");
    const stage = modal.querySelector("[data-gallery-stage]");
    const thumbButtons = [];
    const modalThumbButtons = [];
    let suppressThumbClick = false;
    mainImage.draggable = false;

    const imageSrcset = (image) => {
      const width = image.width || 1200;
      return image.thumb ? `${image.thumb} 420w, ${image.src} ${width}w` : "";
    };

    const scrollActiveThumb = (behavior = "smooth") => {
      const activeThumb = thumbButtons.find((button) => Number(button.dataset.galleryIndex) === currentIndex);
      activeThumb?.scrollIntoView({ behavior, block: "nearest", inline: "center" });
    };

    let hasMainImageSynced = false;
    let mainImageLoadSequence = 0;
    const mainImageCache = new Map();
    let inlineScrollSelectionMuted = false;
    let inlineScrollSelectionTimer = null;
    let inlineScrollSelectionFrame = null;

    const preloadMainImage = (image) => {
      if (!image?.src) {
        return Promise.resolve(false);
      }

      if (mainImage.getAttribute("src") === image.src && mainImage.complete) {
        return Promise.resolve(true);
      }

      const cachedImage = mainImageCache.get(image.src);
      if (cachedImage) {
        return cachedImage;
      }

      const loader = new Image();
      loader.decoding = "async";
      loader.src = image.src;

      const loadPromise = (loader.decode
        ? loader.decode()
        : new Promise((resolve, reject) => {
          loader.addEventListener("load", resolve, { once: true });
          loader.addEventListener("error", reject, { once: true });
        }))
        .then(() => true)
        .catch(() => false);

      mainImageCache.set(image.src, loadPromise);
      return loadPromise;
    };

    const updateMainImageWhenReady = (image) => {
      if (!image?.src) {
        return;
      }

      const loadSequence = ++mainImageLoadSequence;

      preloadMainImage(image).then((isReady) => {
        if (!isReady || loadSequence !== mainImageLoadSequence) {
          return;
        }

        mainImage.src = image.src;
        mainImage.srcset = imageSrcset(image);
        mainImage.alt = image.alt || productName;
        hasMainImageSynced = true;
      });
    };

    const muteInlineScrollSelection = () => {
      inlineScrollSelectionMuted = true;
      window.clearTimeout(inlineScrollSelectionTimer);
      inlineScrollSelectionTimer = window.setTimeout(() => {
        inlineScrollSelectionMuted = false;
      }, 360);
    };

    const getLeadingInlineThumbIndex = () => {
      if (!thumbButtons.length) {
        return null;
      }

      const sliderRect = inlineThumbs.getBoundingClientRect();
      let leadingThumb = null;
      let leadingDistance = Number.POSITIVE_INFINITY;

      thumbButtons.forEach((button) => {
        const rect = button.getBoundingClientRect();
        const isVisible = rect.right > sliderRect.left + 1 && rect.left < sliderRect.right - 1;
        if (!isVisible) {
          return;
        }

        const distance = Math.abs(rect.left - sliderRect.left);
        if (distance < leadingDistance) {
          leadingDistance = distance;
          leadingThumb = button;
        }
      });

      return leadingThumb ? Number(leadingThumb.dataset.galleryIndex) : null;
    };

    const syncMainImageToLeadingInlineThumb = () => {
      if (inlineScrollSelectionMuted || inlineScrollSelectionFrame !== null) {
        return;
      }

      inlineScrollSelectionFrame = window.requestAnimationFrame(() => {
        inlineScrollSelectionFrame = null;

        if (inlineScrollSelectionMuted) {
          return;
        }

        const index = getLeadingInlineThumbIndex();
        if (!Number.isFinite(index) || (index === currentIndex && hasMainImageSynced)) {
          return;
        }

        setImage(index, true, false);
      });
    };

    const setImage = (index, updateMain = true, syncInlineThumb = true) => {
      currentIndex = (index + images.length) % images.length;
      const image = images[currentIndex];
      if (updateMain) {
        updateMainImageWhenReady(image);
      }
      if (modalImage) {
        modalImage.src = image.src;
        modalImage.alt = image.alt || productName;
      }
      if (modalCount) {
        modalCount.textContent = `${currentIndex + 1} / ${images.length}`;
      }
      [...thumbButtons, ...modalThumbButtons].forEach((button) => {
        const isActive = Number(button.dataset.galleryIndex) === currentIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-current", isActive ? "true" : "false");
      });
      if (syncInlineThumb) {
        muteInlineScrollSelection();
        scrollActiveThumb();
      }
      preloadMainImage(images[(currentIndex + 1) % images.length]);
      preloadMainImage(images[(currentIndex - 1 + images.length) % images.length]);
    };

    const createThumb = (image, index, className) => {
      const button = document.createElement("button");
      const img = document.createElement("img");
      button.className = className;
      button.type = "button";
      button.dataset.galleryIndex = String(index);
      button.setAttribute("aria-label", `${productName} 商品画像 ${index + 1}枚目`);
      img.src = image.thumb || image.src;
      img.alt = image.alt || productName;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";
      button.append(img);
      button.addEventListener("click", (event) => {
        if (className === "product-thumbnail" && suppressThumbClick) {
          event.preventDefault();
          return;
        }
        setImage(index);
      });
      return button;
    };

    images.forEach((image, index) => {
      const inlineButton = createThumb(image, index, "product-thumbnail");
      const modalButton = createThumb(image, index, "product-lightbox-thumb");
      inlineButton.dataset.galleryThumb = "";
      modalButton.dataset.galleryModalThumb = "";
      inlineThumbs.append(inlineButton);
      modalThumbs?.append(modalButton);
      thumbButtons.push(inlineButton);
      modalThumbButtons.push(modalButton);
    });

    inlineThumbs.addEventListener(
      "click",
      (event) => {
        if (!suppressThumbClick) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );

    let thumbPointerId = null;
    let thumbStartX = 0;
    let thumbStartY = 0;
    let thumbStartScrollLeft = 0;
    let thumbDragged = false;
    let thumbPressTarget = null;
    let thumbSuppressTimer = null;

    const getInlineThumbIndex = (target) => {
      const button = target?.closest?.("[data-gallery-thumb]");
      if (!button || !inlineThumbs.contains(button)) {
        return null;
      }

      return Number(button.dataset.galleryIndex);
    };

    const suppressNextThumbClick = () => {
      suppressThumbClick = true;
      window.clearTimeout(thumbSuppressTimer);
      thumbSuppressTimer = window.setTimeout(() => {
        suppressThumbClick = false;
      }, 300);
    };

    const resetThumbDrag = (event) => {
      inlineThumbs.classList.remove("is-dragging");
      if (inlineThumbs.hasPointerCapture?.(event.pointerId)) {
        inlineThumbs.releasePointerCapture(event.pointerId);
      }

      thumbPointerId = null;
      thumbPressTarget = null;
    };

    inlineThumbs.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.isPrimary === false) {
        return;
      }
      inlineScrollSelectionMuted = false;
      window.clearTimeout(inlineScrollSelectionTimer);
      thumbPointerId = event.pointerId;
      thumbStartX = event.clientX;
      thumbStartY = event.clientY;
      thumbStartScrollLeft = inlineThumbs.scrollLeft;
      thumbDragged = false;
      thumbPressTarget = event.target.closest("[data-gallery-thumb]");
      try {
        inlineThumbs.setPointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture can fail for interrupted synthetic events.
      }
      if (event.pointerType !== "touch") {
        event.preventDefault();
      }
    });

    inlineThumbs.addEventListener(
      "pointermove",
      (event) => {
        if (thumbPointerId !== event.pointerId) {
          return;
        }
        const movedX = event.clientX - thumbStartX;
        const movedY = event.clientY - thumbStartY;

        if (Math.abs(movedX) < 8 || Math.abs(movedX) < Math.abs(movedY) * 1.15) {
          return;
        }

        thumbDragged = true;
        inlineThumbs.classList.add("is-dragging");
        inlineThumbs.scrollLeft = thumbStartScrollLeft - movedX;
        syncMainImageToLeadingInlineThumb();
        event.preventDefault();
      },
      { passive: false }
    );

    inlineThumbs.addEventListener("pointerup", (event) => {
      if (thumbPointerId !== event.pointerId) {
        return;
      }

      const pressedThumb = thumbPressTarget;
      const shouldSelect = !thumbDragged && pressedThumb;
      if (thumbDragged || shouldSelect) {
        suppressNextThumbClick();
      }

      resetThumbDrag(event);

      if (shouldSelect) {
        const index = getInlineThumbIndex(pressedThumb);
        if (Number.isFinite(index)) {
          setImage(index);
        }
      }
    });

    inlineThumbs.addEventListener("pointercancel", resetThumbDrag);
    inlineThumbs.addEventListener("lostpointercapture", () => {
      inlineThumbs.classList.remove("is-dragging");
      thumbPointerId = null;
      thumbPressTarget = null;
    });
    inlineThumbs.addEventListener("scroll", syncMainImageToLeadingInlineThumb, { passive: true });

    const shiftImage = (direction) => setImage(currentIndex + direction);
    inlinePrev?.addEventListener("click", () => shiftImage(-1));
    inlineNext?.addEventListener("click", () => shiftImage(1));
    let suppressMainClick = false;
    let mainSuppressTimer = null;
    let mainPointerId = null;
    let mainStartX = 0;
    let mainStartY = 0;

    const suppressNextMainClick = () => {
      suppressMainClick = true;
      window.clearTimeout(mainSuppressTimer);
      mainSuppressTimer = window.setTimeout(() => {
        suppressMainClick = false;
      }, 300);
    };

    const resetMainDrag = (event) => {
      mainButton?.classList.remove("is-dragging");
      if (mainButton?.hasPointerCapture?.(event.pointerId)) {
        mainButton.releasePointerCapture(event.pointerId);
      }
      mainPointerId = null;
    };

    const finishMainDrag = (event) => {
      if (mainPointerId !== event.pointerId) {
        return;
      }

      const movedX = event.clientX - mainStartX;
      const movedY = event.clientY - mainStartY;
      const isHorizontalSlide = Math.abs(movedX) >= 48 && Math.abs(movedX) > Math.abs(movedY) * 1.15;
      resetMainDrag(event);

      if (!isHorizontalSlide) {
        return;
      }

      suppressNextMainClick();
      shiftImage(movedX < 0 ? 1 : -1);
    };

    mainButton?.addEventListener("click", (event) => {
      if (suppressMainClick) {
        event.preventDefault();
        suppressMainClick = false;
        window.clearTimeout(mainSuppressTimer);
        return;
      }
      modal.hidden = false;
      document.body.classList.add("product-lightbox-open");
      setImage(currentIndex, false, false);
      modal.focus();
    });

    mainButton?.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.isPrimary === false) {
        return;
      }

      mainPointerId = event.pointerId;
      mainStartX = event.clientX;
      mainStartY = event.clientY;
      try {
        mainButton.setPointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture can fail for interrupted synthetic events.
      }
    });

    mainButton?.addEventListener(
      "pointermove",
      (event) => {
        if (mainPointerId !== event.pointerId) {
          return;
        }

        const movedX = event.clientX - mainStartX;
        const movedY = event.clientY - mainStartY;
        if (Math.abs(movedX) > 8 && Math.abs(movedX) > Math.abs(movedY) * 1.15) {
          mainButton.classList.add("is-dragging");
          event.preventDefault();
        }
      },
      { passive: false }
    );
    mainButton?.addEventListener("pointerup", finishMainDrag);
    mainButton?.addEventListener("pointercancel", resetMainDrag);
    mainButton?.addEventListener("lostpointercapture", () => {
      mainButton.classList.remove("is-dragging");
      mainPointerId = null;
    });

    const closeModal = () => {
      modal.hidden = true;
      document.body.classList.remove("product-lightbox-open");
    };

    modal.querySelector("[data-gallery-close]")?.addEventListener("click", closeModal);
    modal.querySelector("[data-gallery-prev]")?.addEventListener("click", () => shiftImage(-1));
    modal.querySelector("[data-gallery-next]")?.addEventListener("click", () => shiftImage(1));
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target === stage) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (modal.hidden) {
        return;
      }
      if (event.key === "Escape") {
        closeModal();
      }
      if (event.key === "ArrowLeft") {
        shiftImage(-1);
      }
      if (event.key === "ArrowRight") {
        shiftImage(1);
      }
    });

    let stagePointerId = null;
    let stageStartX = 0;
    let stageStartY = 0;

    const resetStageDrag = (event) => {
      stage?.classList.remove("is-dragging");
      if (stage?.hasPointerCapture?.(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      stagePointerId = null;
    };

    const finishStageDrag = (event) => {
      if (stagePointerId !== event.pointerId) {
        return;
      }

      const movedX = event.clientX - stageStartX;
      const movedY = event.clientY - stageStartY;
      resetStageDrag(event);

      if (Math.abs(movedX) >= 48 && Math.abs(movedX) > Math.abs(movedY) * 1.15) {
        shiftImage(movedX < 0 ? 1 : -1);
      }
    };

    stage?.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) {
        return;
      }

      stagePointerId = event.pointerId;
      stageStartX = event.clientX;
      stageStartY = event.clientY;
      try {
        stage.setPointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture can fail for interrupted synthetic events.
      }
    });

    stage?.addEventListener(
      "pointermove",
      (event) => {
        if (stagePointerId !== event.pointerId) {
          return;
        }

        if (Math.abs(event.clientX - stageStartX) > 8) {
          stage.classList.add("is-dragging");
          event.preventDefault();
        }
      },
      { passive: false }
    );
    stage?.addEventListener("pointerup", finishStageDrag);
    stage?.addEventListener("pointercancel", resetStageDrag);
    stage?.addEventListener("lostpointercapture", () => {
      stage.classList.remove("is-dragging");
      stagePointerId = null;
    });

    setImage(0, true, false);
  });

  document.querySelectorAll("[data-booth-filter]").forEach((filterPanel) => {
    const section = filterPanel.closest("section") || document;
    const list = section.querySelector("[data-booth-list]");
    const cards = list ? [...list.querySelectorAll("[data-booth-tags]")] : [];
    const filterButtons = [...filterPanel.querySelectorAll("[data-booth-filter-button]")];
    const subtagPanel = section.querySelector("[data-booth-subtag-filter]");
    const subtagButtons = subtagPanel ? [...subtagPanel.querySelectorAll("[data-booth-subtag-button]")] : [];
    const subtagToggle = subtagPanel ? subtagPanel.querySelector("[data-booth-subtag-toggle]") : null;
    const subtagRowToggle = subtagPanel ? subtagPanel.querySelector("[data-booth-subtag-row-toggle]") : null;
    const subtagPicker = subtagPanel ? subtagPanel.querySelector("[data-booth-subtag-picker]") : null;
    const sortButtons = [...section.querySelectorAll("[data-booth-sort-button]")];
    const pagination = section.querySelector("[data-booth-pagination]");
    const pageButtons = pagination ? [...pagination.querySelectorAll("[data-booth-page-button]")] : [];
    const pageStatus = pagination ? pagination.querySelector("[data-booth-page-status]") : null;
    const status = filterPanel.querySelector("[data-booth-filter-status]");
    const pageSize = Number.parseInt(filterPanel.dataset.pageSize || "12", 10);
    const suffix = filterPanel.dataset.countSuffix || "件";
    const originalIndex = new Map(cards.map((card, index) => [card, index]));
    const query = new URLSearchParams(window.location.search);
    const requestedTag = query.get("tag");
    const requestedSubtag = query.get("subtag");
    const hasTag = (tag) => tag === "all" || filterButtons.some((button) => button.dataset.boothFilterButton === tag);
    const hasSubtag = (subtag) => subtag === "all" || subtagButtons.some((button) => button.dataset.boothSubtagButton === subtag);
    let activeTag = requestedTag && hasTag(requestedTag) ? requestedTag : "all";
    let activeSubtag = requestedSubtag && hasSubtag(requestedSubtag) ? requestedSubtag : "all";
    let activeSort = "default";
    let currentPage = 1;

    const getLikeCount = (card) => {
      const rawValue = card.dataset.likes || card.dataset.popularity || "0";
      const normalizedValue = rawValue.replace(/,/g, "");
      const count = Number.parseInt(normalizedValue, 10);
      return Number.isNaN(count) ? 0 : count;
    };

    const compareOriginalOrder = (a, b) => originalIndex.get(a) - originalIndex.get(b);

    const getSubtagLabel = (subtag) => {
      const button = subtagButtons.find((item) => item.dataset.boothSubtagButton === subtag);
      return button?.textContent?.trim() || subtag;
    };

    const updateSubtagToggleLabel = () => {
      if (!subtagToggle) {
        return;
      }

      const defaultLabel = subtagToggle.dataset.defaultLabel || "すべて";
      subtagToggle.textContent = activeSubtag === "all" ? defaultLabel : getSubtagLabel(activeSubtag);
      subtagToggle.classList.toggle("is-selected", activeSubtag !== "all");
    };

    const setSubtagPickerOpen = (isOpen) => {
      if (!subtagToggle || !subtagPicker) {
        return;
      }

      subtagPicker.classList.toggle("is-open", isOpen);
      subtagToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    const setSubtagRowsExpanded = (isExpanded) => {
      if (!subtagRowToggle || !subtagPicker) {
        return;
      }

      subtagPicker.classList.toggle("is-expanded", isExpanded);
      subtagRowToggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      subtagRowToggle.textContent = isExpanded
        ? (subtagRowToggle.dataset.closeLabel || "閉じる ▲")
        : (subtagRowToggle.dataset.openLabel || "もっと見る ▼");
      subtagRowToggle.setAttribute(
        "aria-label",
        isExpanded
          ? (subtagRowToggle.dataset.closeAriaLabel || subtagRowToggle.textContent)
          : (subtagRowToggle.dataset.openAriaLabel || subtagRowToggle.textContent),
      );
    };

    const getVisibleCards = () => {
      const filtered = cards.filter((card) => {
        const tags = (card.dataset.boothTags || "").split(/\s+/);
        const subtags = (card.dataset.boothSubtags || "").split(/\s+/).filter(Boolean);
        const isMatchingTag = activeTag === "all" || tags.includes(activeTag);
        const isMatchingSubtag = activeSubtag === "all" || subtags.includes(activeSubtag);
        return isMatchingTag && isMatchingSubtag;
      });
      if (activeSort === "popular") {
        return filtered.sort((a, b) => getLikeCount(b) - getLikeCount(a) || compareOriginalOrder(a, b));
      }
      return filtered.sort(compareOriginalOrder);
    };

    const syncFilterButtons = () => {
      filterButtons.forEach((item) => {
        const isActive = item.dataset.boothFilterButton === activeTag;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      subtagButtons.forEach((item) => {
        const isActive = item.dataset.boothSubtagButton === activeSubtag;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      sortButtons.forEach((item) => {
        const isActive = item.dataset.boothSortButton === activeSort;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      updateSubtagToggleLabel();
    };

    const syncFilterUrl = () => {
      const url = new URL(window.location.href);
      if (activeTag === "all") {
        url.searchParams.delete("tag");
      } else {
        url.searchParams.set("tag", activeTag);
      }
      if (activeSubtag === "all") {
        url.searchParams.delete("subtag");
      } else {
        url.searchParams.set("subtag", activeSubtag);
      }
      window.history.replaceState(null, "", url.href);
    };

    const render = () => {
      const visibleCards = getVisibleCards();
      const totalPages = Math.max(1, Math.ceil(visibleCards.length / pageSize));
      currentPage = clamp(currentPage, 1, totalPages);
      const start = (currentPage - 1) * pageSize;
      const pageCards = new Set(visibleCards.slice(start, start + pageSize));

      visibleCards.forEach((card) => list.append(card));
      cards.forEach((card) => {
        card.classList.toggle("is-filter-hidden", !pageCards.has(card));
      });
      syncFilterButtons();

      if (status) {
        status.textContent = currentLanguage === "en" ? `${visibleCards.length} items` : `${visibleCards.length}${suffix}`;
      }
      if (pageStatus) {
        pageStatus.textContent = `${currentPage} / ${totalPages}`;
      }
      pageButtons.forEach((button) => {
        const isPrev = button.dataset.boothPageButton === "prev";
        button.disabled = isPrev ? currentPage <= 1 : currentPage >= totalPages;
      });
      if (pagination) {
        pagination.hidden = false;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeTag = button.dataset.boothFilterButton || "all";
        currentPage = 1;
        syncFilterUrl();
        render();
      });
    });

    subtagButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeSubtag = button.dataset.boothSubtagButton || "all";
        currentPage = 1;
        syncFilterUrl();
        render();
        setSubtagPickerOpen(false);
      });
    });

    if (subtagToggle) {
      subtagToggle.addEventListener("click", () => {
        const isOpen = subtagToggle.getAttribute("aria-expanded") === "true";
        setSubtagPickerOpen(!isOpen);
      });
    }

    if (subtagRowToggle) {
      setSubtagRowsExpanded(false);
      subtagRowToggle.addEventListener("click", () => {
        const isExpanded = subtagRowToggle.getAttribute("aria-expanded") === "true";
        setSubtagRowsExpanded(!isExpanded);
      });
    }

    sortButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeSort = button.dataset.boothSortButton || "default";
        currentPage = 1;
        sortButtons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        render();
      });
    });

    pageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        currentPage += button.dataset.boothPageButton === "prev" ? -1 : 1;
        render();
      });
    });
    window.addEventListener("macanon:languagechange", render);

    render();
  });

  document.querySelectorAll("[data-tips-list]").forEach((container) => {
    const panel = container.closest("section") || document;
    const list = container.querySelector(".tips-list-column");
    const cards = list ? [...list.querySelectorAll(".tip-list-card")] : [];
    const emptyMessage = list ? list.querySelector("[data-tips-empty]") : null;
    const filterPanel = panel.querySelector("[data-blog-filter]");
    const filterButtons = filterPanel ? [...filterPanel.querySelectorAll("[data-blog-filter-button]")] : [];
    const filterStatus = filterPanel ? filterPanel.querySelector("[data-blog-filter-status]") : null;
    const controls = panel.querySelector("[data-tips-pagination]");
    const previousButton = controls ? controls.querySelector("[data-tips-prev]") : null;
    const nextButton = controls ? controls.querySelector("[data-tips-next]") : null;
    const status = controls ? controls.querySelector("[data-tips-status]") : null;
    const pageSize = Number.parseInt(container.dataset.pageSize || "5", 10);
    const emptyText = container.dataset.emptyMessage || "記事はまだありません。";
    let activeTag = "all";
    let currentPage = 1;

    const getFilteredCards = () => {
      return cards.filter((card) => {
        const tags = (card.dataset.blogTags || card.dataset.tipTags || "").split(/\s+/);
        if (activeTag === "review-product") {
          return tags.includes("review") || tags.includes("product");
        }
        return activeTag === "all" || tags.includes(activeTag);
      });
    };

    const render = () => {
      const visibleCards = getFilteredCards();
      const visibleSet = new Set(visibleCards);
      const totalPages = Math.max(1, Math.ceil(visibleCards.length / pageSize));
      if (!visibleCards.length) {
        cards.forEach((card) => {
          card.hidden = true;
        });
        if (emptyMessage) {
          emptyMessage.hidden = false;
          emptyMessage.textContent = translateText(emptyText);
        }
        if (filterStatus) {
          filterStatus.textContent = currentLanguage === "en" ? "0 items" : "0件";
        }
        if (status) {
          status.textContent = "1 / 1";
        }
        if (previousButton) {
          previousButton.disabled = true;
        }
        if (nextButton) {
          nextButton.disabled = true;
        }
        if (controls) {
          controls.hidden = false;
        }
        return;
      }
      if (emptyMessage) {
        emptyMessage.hidden = true;
      }
      if (filterStatus) {
        filterStatus.textContent = currentLanguage === "en" ? `${visibleCards.length} items` : `${visibleCards.length}件`;
      }
      currentPage = clamp(currentPage, 1, totalPages);
      const start = (currentPage - 1) * pageSize;
      cards.forEach((card, cardIndex) => {
        if (!visibleSet.has(card)) {
          card.hidden = true;
          return;
        }
        const visibleIndex = visibleCards.indexOf(card);
        card.hidden = visibleIndex < start || visibleIndex >= start + pageSize;
      });
      if (status) {
        status.textContent = `${currentPage} / ${totalPages}`;
      }
      if (previousButton) {
        previousButton.disabled = currentPage <= 1;
      }
      if (nextButton) {
        nextButton.disabled = currentPage >= totalPages;
      }
      if (controls) {
        controls.hidden = false;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeTag = button.dataset.blogFilterButton || "all";
        currentPage = 1;
        filterButtons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        render();
      });
    });

    if (previousButton) {
      previousButton.addEventListener("click", () => {
        currentPage -= 1;
        render();
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        currentPage += 1;
        render();
      });
    }
    window.addEventListener("macanon:languagechange", render);

    render();
  });

  applyLanguage(currentLanguage);
})();

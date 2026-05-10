(() => {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const translations = {
    "VRChat 3D衣装・ギミック制作": "VRChat 3D Outfit & Gimmick",
    "macanon | VRChat向け3D衣装・ギミック": "macanon | VRChat 3D Outfits & Gimmicks",
    "BOOTH作品一覧 | macanon": "BOOTH Works | macanon",
    "制作PR・案件相談 | macanon": "Commissions | macanon",
    "利用規約 | macanon": "Terms | macanon",
    "macanonはVRChat向けの3D衣装、召喚ギミック、アクセサリーを制作しています。BOOTH商品、制作PR、Blog記事への導線をまとめた公式サイトです。": "macanon creates VRChat 3D outfits, summon gimmicks, and accessories. This official site collects links to BOOTH products, commission information, and blog posts.",
    "VRChat向けの3D衣装、召喚ギミック、アクセサリーを制作するmacanonの公式サイトです。": "The official macanon site for VRChat 3D outfits, summon gimmicks, and accessories.",
    "macanon BOOTH商品サムネイル": "macanon BOOTH product thumbnail",
    "macanonのVRChat向け3D衣装、召喚ギミック、アクセサリーをBOOTH商品サムネイルで確認できます。": "Browse macanon's VRChat 3D outfits, summon gimmicks, and accessories through BOOTH product thumbnails.",
    "macanonのVRChat向け3D衣装、召喚ギミック、アクセサリー一覧です。": "A list of macanon's VRChat 3D outfits, summon gimmicks, and accessories.",
    "macanonのVRChat向け3D衣装・ギミック制作PRページです。BOOTH販売実績、制作できる内容、案件相談の流れを掲載しています。": "A commission information page for macanon's VRChat 3D outfit and gimmick production, including BOOTH work examples, available services, and inquiry guidance.",
    "VRChat向け3D衣装・ギミック制作の実績と案件相談窓口です。": "Portfolio and commission contact information for VRChat 3D outfit and gimmick production.",
    "macanonサイトの利用規約と、BOOTH商品ページの規約確認に関する案内です。": "Terms for the macanon site and guidance for checking BOOTH product terms.",
    "macanonのVRChat、Unity、Modular Avatar向けTips、商品レビュー、制作ブログ記事一覧です。タグで絞り込みできます。": "A tag-filterable list of macanon tips, product reviews, and production blog posts for VRChat, Unity, and Modular Avatar.",
    "macanonのTips、商品レビュー、制作ブログ記事一覧です。": "A list of macanon tips, product reviews, and production blog posts.",
    "macanonのVRChat、Unity、Modular Avatar向けTips記事一覧です。記事は今後追加予定です。": "A list of macanon tips articles for VRChat, Unity, and Modular Avatar. Articles will be added in the future.",
    "macanonのVRChat、Unity、Modular Avatar向けTips記事一覧です。": "A list of macanon tips articles for VRChat, Unity, and Modular Avatar.",
    "BOOTH作品": "BOOTH Works",
    "制作PR": "Commissions",
    "利用規約": "Terms",
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
    "通常順": "Default",
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
    "レビュー": "Reviews",
    "商品紹介": "Product Posts",
    "制作メモ": "Work Logs",
    "該当するBlog記事はまだありません。": "No matching blog posts yet.",
    "Blog記事はまだありません。公開後はタグごとに絞り込みできます。": "There are no blog posts yet. Once published, they can be filtered by tag.",
    "Tips記事はまだありません。記事を追加すると、この一覧にカード形式で表示できます。": "There are no Tips articles yet. When articles are added, they will appear here as cards.",
    "このサイトは、macanonのBOOTH商品、制作実績、Blogへの導線をまとめた案内ページです。": "This site collects links to macanon's BOOTH products, portfolio works, and blog.",
    "各商品の利用条件、禁止事項、更新履歴、導入条件は、BOOTHの商品ページおよび商品同梱の規約を優先します。": "For each product, the BOOTH product page and included terms take priority for usage conditions, restrictions, update history, and setup requirements.",
    "画像、文章、商品データの無断転載、再配布、販売、AI学習への利用は行わないでください。": "Do not repost, redistribute, sell, or use images, text, or product data for AI training without permission.",
    "案件相談や商品に関する問い合わせは、BOOTHまたはXの案内からご連絡ください。": "For commissions or product inquiries, please contact me through BOOTH or X.",
    "アクセス解析について": "About Access Analytics",
    "当サイトでは、サイト改善や閲覧状況の把握のため、アクセス解析ツールを利用する場合があります。": "This site may use access analytics tools to improve the site and understand browsing activity.",
    "アクセス解析により、閲覧ページ、利用環境、アクセス日時などの情報が収集される場合があります。収集される情報は、個人を特定する目的では使用しません。": "Analytics may collect information such as viewed pages, usage environment, and access date and time. This information is not used to identify individuals.",
    "Google Analytics等の解析ツールを利用する場合、収集された情報は各提供元のプライバシーポリシーに基づいて管理されます。": "When analytics tools such as Google Analytics are used, collected information is managed according to each provider's privacy policy.",
    "BOOTHで規約を確認": "Check Terms on BOOTH"
  };

  const originalTextNodes = new WeakMap();
  const originalDocumentTitle = document.title;
  const originalAttributes = new WeakMap();
  const languageButtons = [...document.querySelectorAll("[data-language-option]")];
  let currentLanguage = localStorage.getItem("macanon-language") === "en" ? "en" : "ja";

  const translateText = (text) => (currentLanguage === "en" ? translations[text] || text : text);

  const translateAttributes = () => {
    document.title = currentLanguage === "en" ? translations[originalDocumentTitle] || originalDocumentTitle : originalDocumentTitle;
    document.querySelectorAll("[content], [alt], [aria-label]").forEach((element) => {
      ["content", "alt", "aria-label"].forEach((attribute) => {
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

  const applyLanguage = (language) => {
    currentLanguage = language === "en" ? "en" : "ja";
    localStorage.setItem("macanon-language", currentLanguage);
    document.documentElement.lang = currentLanguage;
    translateAttributes();
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

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.languageOption));
  });

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
    const isAtEnd = () => slider.scrollLeft >= getMaxScrollLeft() - 2;
    const getCurrentIndex = () => {
      const distance = getCardDistance();
      return distance > 0 ? clamp(Math.round(slider.scrollLeft / distance), 0, getMaxIndex()) : 0;
    };
    const getCurrentStepIndex = () => clamp(Math.round(getCurrentIndex() / stepSize), 0, getMaxStepIndex());

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
        fastScrollToStart();
        return;
      }
      if (shouldLoop && direction < 0 && slider.scrollLeft <= 2) {
        slider.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
        return;
      }
      slider.scrollTo({ left: getSlideLeft(currentIndex + direction * stepSize), behavior: "smooth" });
    };

    let autoSlideTimer = window.setInterval(() => slideByCard(1), 3600);
    const restartAutoSlide = () => {
      window.clearInterval(autoSlideTimer);
      autoSlideTimer = window.setInterval(() => slideByCard(1), 3600);
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
      window.clearInterval(autoSlideTimer);
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
    slider.addEventListener("mouseenter", () => window.clearInterval(autoSlideTimer));
    slider.addEventListener("mouseleave", restartAutoSlide);
    slider.addEventListener("focusin", () => window.clearInterval(autoSlideTimer));
    slider.addEventListener("focusout", restartAutoSlide);
    window.addEventListener("macanon:languagechange", updateDotLabels);
    window.addEventListener("resize", renderDots);

    renderDots();
  });

  document.querySelectorAll("[data-booth-filter]").forEach((filterPanel) => {
    const section = filterPanel.closest("section") || document;
    const list = section.querySelector("[data-booth-list]");
    const cards = list ? [...list.querySelectorAll("[data-booth-tags]")] : [];
    const filterButtons = [...filterPanel.querySelectorAll("[data-booth-filter-button]")];
    const sortButtons = [...section.querySelectorAll("[data-booth-sort-button]")];
    const pagination = section.querySelector("[data-booth-pagination]");
    const pageButtons = pagination ? [...pagination.querySelectorAll("[data-booth-page-button]")] : [];
    const pageStatus = pagination ? pagination.querySelector("[data-booth-page-status]") : null;
    const status = filterPanel.querySelector("[data-booth-filter-status]");
    const pageSize = Number.parseInt(filterPanel.dataset.pageSize || "12", 10);
    const suffix = filterPanel.dataset.countSuffix || "件";
    const originalIndex = new Map(cards.map((card, index) => [card, index]));
    let activeTag = "all";
    let activeSort = "default";
    let currentPage = 1;

    const getLikeCount = (card) => {
      const rawValue = card.dataset.likes || card.dataset.popularity || "0";
      const normalizedValue = rawValue.replace(/,/g, "");
      const count = Number.parseInt(normalizedValue, 10);
      return Number.isNaN(count) ? 0 : count;
    };

    const compareOriginalOrder = (a, b) => originalIndex.get(a) - originalIndex.get(b);

    const getVisibleCards = () => {
      const filtered = cards.filter((card) => {
        const tags = (card.dataset.boothTags || "").split(/\s+/);
        return activeTag === "all" || tags.includes(activeTag);
      });
      if (activeSort === "popular") {
        return filtered.sort((a, b) => getLikeCount(b) - getLikeCount(a) || compareOriginalOrder(a, b));
      }
      return filtered.sort(compareOriginalOrder);
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
        pagination.hidden = visibleCards.length <= pageSize;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeTag = button.dataset.boothFilterButton || "all";
        currentPage = 1;
        filterButtons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        render();
      });
    });

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
        return activeTag === "all" || tags.includes(activeTag);
      });
    };

    const render = () => {
      const visibleCards = getFilteredCards();
      const visibleSet = new Set(visibleCards);
      const totalPages = Math.ceil(visibleCards.length / pageSize);
      if (!totalPages) {
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
          status.textContent = "0 / 0";
        }
        if (controls) {
          controls.hidden = true;
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
        controls.hidden = totalPages <= 1;
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

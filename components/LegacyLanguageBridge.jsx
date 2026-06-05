"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import legacyI18n from "@/data/legacy-i18n.json";

const { translations, productPageEnglish } = legacyI18n;

const ATTRIBUTE_NAMES = [
  "content",
  "aria-label",
  "title",
  "alt",
  "placeholder",
  "data-open-label",
  "data-close-label",
  "data-open-aria-label",
  "data-close-aria-label",
  "data-default-label"
];

function safeLocalStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function replaceTrimmed(originalValue, nextText) {
  const originalText = originalValue.trim();
  return originalText ? originalValue.replace(originalText, nextText) : originalValue;
}

function translateText(text) {
  if (translations[text]) {
    return translations[text];
  }

  const pageTitle = text.match(/^(.+) \| macanon$/);
  if (pageTitle) {
    return `${translateText(pageTitle[1])} | macanon`;
  }

  const productImageSwitch = text.match(/^(.+)の商品画像を切り替え$/);
  if (productImageSwitch) {
    return `Switch ${translateText(productImageSwitch[1])} product images`;
  }

  const productImageOpen = text.match(/^(.+)の商品画像を拡大表示$/);
  if (productImageOpen) {
    return `Open ${translateText(productImageOpen[1])} product image gallery`;
  }

  const productPageLink = text.match(/^(.+)の商品ページへ$/);
  if (productPageLink) {
    return `Open ${translateText(productPageLink[1])} product page`;
  }

  const boothProductPageLink = text.match(/^(.+)のBOOTH商品ページへ$/);
  if (boothProductPageLink) {
    return `Open ${translateText(boothProductPageLink[1])} BOOTH product page`;
  }

  const termsPageAlt = text.match(/^(.+) (\d+)ページ目$/);
  if (termsPageAlt) {
    return `${translateText(termsPageAlt[1])} page ${termsPageAlt[2]}`;
  }

  const slideLabel = text.match(/^商品スライド (\d+)$/);
  if (slideLabel) {
    return `Product slide ${slideLabel[1]}`;
  }

  const thumbLabel = text.match(/^(\d+)枚目の画像を表示$/);
  if (thumbLabel) {
    return `Show image ${thumbLabel[1]}`;
  }

  const productImageLabel = text.match(/^(.+) 商品画像 (\d+)枚目$/);
  if (productImageLabel) {
    return `${translateText(productImageLabel[1])} product image ${productImageLabel[2]}`;
  }

  const itemCount = text.match(/^(\d+)件$/);
  if (itemCount) {
    return `${itemCount[1]} items`;
  }

  if (text === "クリックして画像を切り替えられます。") {
    return "Click to switch images.";
  }

  return text;
}

function buildProductTagsHtml(tags) {
  return tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function buildProductSpecsHtml(specs) {
  return specs
    .map(([term, description]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(description)}</dd></div>`)
    .join("");
}

function getLegacyProductKey(pathname) {
  const productRoute = pathname.match(/^\/products\/([^/]+)$/);
  if (productRoute) {
    return `product-${productRoute[1]}.html`;
  }

  const lastSegment = pathname.split("/").filter(Boolean).pop();
  return lastSegment?.startsWith("product-") && lastSegment.endsWith(".html") ? lastSegment : "";
}

export default function LegacyLanguageBridge() {
  const pathname = usePathname();
  const languageRef = useRef("ja");
  const isApplyingRef = useRef(false);
  const originalTextNodesRef = useRef(new WeakMap());
  const originalAttributesRef = useRef(new WeakMap());
  const originalElementValuesRef = useRef(new WeakMap());
  const originalDocumentTitleRef = useRef("");

  useEffect(() => {
    originalDocumentTitleRef.current = document.title;
    languageRef.current = safeLocalStorageGet("macanon-language") === "en" ? "en" : "ja";

    const rememberElementValue = (element, key, value) => {
      if (!originalElementValuesRef.current.has(element)) {
        originalElementValuesRef.current.set(element, new Map());
      }
      const values = originalElementValuesRef.current.get(element);
      if (!values.has(key)) {
        values.set(key, value);
      }
      return values.get(key);
    };

    const setProductElement = (selector, property, englishValue, isEnglish) => {
      const element = document.querySelector(selector);
      if (!element) return;
      const original = rememberElementValue(element, property, element[property]);
      element[property] = isEnglish ? englishValue : original;
    };

    const setProductAttribute = (selector, attribute, englishValue, isEnglish) => {
      document.querySelectorAll(selector).forEach((element) => {
        const original = rememberElementValue(element, attribute, element.getAttribute(attribute));
        if (isEnglish) {
          element.setAttribute(attribute, englishValue);
        } else if (original == null) {
          element.removeAttribute(attribute);
        } else {
          element.setAttribute(attribute, original);
        }
      });
    };

    const applyProductEnglish = (isEnglish) => {
      const productData = productPageEnglish[getLegacyProductKey(window.location.pathname)];
      if (!productData) return;

      document.title = isEnglish ? productData.pageTitle : originalDocumentTitleRef.current;
      setProductAttribute('meta[name="description"]', "content", productData.description, isEnglish);
      setProductAttribute('meta[property="og:description"]', "content", productData.description, isEnglish);
      setProductAttribute('meta[name="twitter:description"]', "content", productData.description, isEnglish);
      setProductAttribute('meta[property="og:title"]', "content", productData.pageTitle, isEnglish);
      setProductAttribute('meta[name="twitter:title"]', "content", productData.pageTitle, isEnglish);
      setProductAttribute('meta[property="og:image:alt"]', "content", productData.title, isEnglish);
      setProductAttribute('meta[name="twitter:image:alt"]', "content", productData.title, isEnglish);
      setProductAttribute("[data-product-main-image]", "alt", productData.title, isEnglish);
      setProductElement("#product-title", "textContent", productData.title, isEnglish);
      setProductElement(".product-summary-tags", "innerHTML", buildProductTagsHtml(productData.summaryTags), isEnglish);
      setProductElement(".product-specs", "innerHTML", buildProductSpecsHtml(productData.specs), isEnglish);
      setProductElement(
        ".product-note",
        "textContent",
        productData.note ||
          "Before purchasing, please check the compatible avatars, included files, price, usage conditions, and setup notes on the BOOTH product page.",
        isEnglish
      );
      setProductElement(".product-detail-grid", "innerHTML", productData.detailHtml, isEnglish);
    };

    const updateLanguageImages = (isEnglish) => {
      document.querySelectorAll("[data-ja-src][data-en-src]").forEach((image) => {
        const nextSrc = isEnglish ? image.dataset.enSrc : image.dataset.jaSrc;
        if (nextSrc && image.getAttribute("src") !== nextSrc) {
          image.setAttribute("src", nextSrc);
        }
      });
    };

    const translateAttributes = (isEnglish) => {
      document.querySelectorAll("*").forEach((element) => {
        if (element.closest("[data-no-translate]")) return;

        for (const attribute of ATTRIBUTE_NAMES) {
          if (!element.hasAttribute(attribute)) continue;

          if (!originalAttributesRef.current.has(element)) {
            originalAttributesRef.current.set(element, new Map());
          }

          const originalAttributes = originalAttributesRef.current.get(element);
          if (!originalAttributes.has(attribute)) {
            originalAttributes.set(attribute, element.getAttribute(attribute));
          }

          const originalValue = originalAttributes.get(attribute);
          const nextValue = isEnglish ? translateText(originalValue) : originalValue;
          if (nextValue == null) {
            element.removeAttribute(attribute);
          } else {
            element.setAttribute(attribute, nextValue);
          }
        }
      });
    };

    const translateTextNodes = (isEnglish) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || parent.closest("script, style, noscript, svg, [data-no-translate]")) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent.closest("[data-share-url]")) {
            return NodeFilter.FILTER_REJECT;
          }
          return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });

      const nodes = [];
      while (walker.nextNode()) {
        nodes.push(walker.currentNode);
      }

      nodes.forEach((node) => {
        const currentValue = node.nodeValue;
        const currentText = currentValue.trim();
        const storedValue = originalTextNodesRef.current.get(node);

        if (!storedValue) {
          originalTextNodesRef.current.set(node, currentValue);
        } else if (isEnglish) {
          const storedText = storedValue.trim();
          const translatedText = translateText(storedText);
          if (currentText !== storedText && currentText !== translatedText) {
            originalTextNodesRef.current.set(node, currentValue);
          }
        }

        const originalValue = originalTextNodesRef.current.get(node);
        const originalText = originalValue.trim();
        const nextText = isEnglish ? translateText(originalText) : originalText;
        node.nodeValue = replaceTrimmed(originalValue, nextText);
      });
    };

    const updateLanguageButtons = (language) => {
      document.querySelectorAll("[data-language-option]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.languageOption === language);
        button.setAttribute("aria-pressed", button.dataset.languageOption === language ? "true" : "false");
      });
    };

    const applyLanguage = (language) => {
      isApplyingRef.current = true;
      const normalizedLanguage = language === "en" ? "en" : "ja";
      const isEnglish = normalizedLanguage === "en";
      languageRef.current = normalizedLanguage;
      safeLocalStorageSet("macanon-language", normalizedLanguage);
      document.documentElement.lang = normalizedLanguage;
      document.title = isEnglish ? translateText(originalDocumentTitleRef.current) : originalDocumentTitleRef.current;
      updateLanguageButtons(normalizedLanguage);
      translateTextNodes(isEnglish);
      translateAttributes(isEnglish);
      updateLanguageImages(isEnglish);
      applyProductEnglish(isEnglish);
      window.dispatchEvent(new CustomEvent("macanon:languagechange"));
      window.requestAnimationFrame(() => {
        isApplyingRef.current = false;
      });
      if (isEnglish) {
        window.setTimeout(() => {
          if (languageRef.current !== "en") return;
          isApplyingRef.current = true;
          translateTextNodes(true);
          translateAttributes(true);
          updateLanguageImages(true);
          applyProductEnglish(true);
          window.requestAnimationFrame(() => {
            isApplyingRef.current = false;
          });
        }, 160);
      }
    };

    const onLanguageClick = (event) => {
      const button = event.target.closest("[data-language-option]");
      if (!button) return;
      applyLanguage(button.dataset.languageOption);
    };

    let observerTimer = null;
    const observer = new MutationObserver(() => {
      if (isApplyingRef.current || languageRef.current !== "en") return;
      window.clearTimeout(observerTimer);
      observerTimer = window.setTimeout(() => applyLanguage(languageRef.current), 80);
    });

    document.addEventListener("click", onLanguageClick);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.setTimeout(() => applyLanguage(languageRef.current), 0);

    return () => {
      document.removeEventListener("click", onLanguageClick);
      window.clearTimeout(observerTimer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

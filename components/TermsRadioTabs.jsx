"use client";

import { useEffect } from "react";

export default function TermsRadioTabs() {
  useEffect(() => {
    const setupRadioTabList = (tabList) => {
      const tabs = [...tabList.querySelectorAll('[role="tab"][for]')];
      if (!tabs.length) return () => {};

      const getInput = (tab) => document.getElementById(tab.getAttribute("for"));
      const getPanel = (tab) => document.getElementById(tab.getAttribute("aria-controls"));

      const updateTabs = () => {
        tabs.forEach((tab) => {
          const selected = Boolean(getInput(tab)?.checked);
          tab.setAttribute("aria-selected", selected ? "true" : "false");
          tab.tabIndex = selected ? 0 : -1;
          const panel = getPanel(tab);
          if (panel) {
            panel.hidden = !selected;
          }
        });
      };

      const selectTab = (tab, shouldFocus = false) => {
        const input = getInput(tab);
        if (!input) return;
        input.checked = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        updateTabs();
        if (shouldFocus) {
          tab.focus();
        }
      };

      const cleanups = tabs.flatMap((tab) => {
        const input = getInput(tab);
        const onChange = updateTabs;
        const onClick = () => window.requestAnimationFrame(updateTabs);
        const onKeyDown = (event) => {
          const currentIndex = tabs.indexOf(tab);
          let nextIndex = null;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            nextIndex = (currentIndex + 1) % tabs.length;
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          } else if (event.key === "Home") {
            nextIndex = 0;
          } else if (event.key === "End") {
            nextIndex = tabs.length - 1;
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectTab(tab);
            return;
          } else {
            return;
          }
          event.preventDefault();
          selectTab(tabs[nextIndex], true);
        };

        input?.addEventListener("change", onChange);
        tab.addEventListener("click", onClick);
        tab.addEventListener("keydown", onKeyDown);

        return [
          () => input?.removeEventListener("change", onChange),
          () => tab.removeEventListener("click", onClick),
          () => tab.removeEventListener("keydown", onKeyDown)
        ];
      });

      updateTabs();
      return () => cleanups.forEach((cleanup) => cleanup());
    };

    const cleanups = [...document.querySelectorAll(".terms-tab-list, .terms-license-switch")].map(setupRadioTabList);
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}

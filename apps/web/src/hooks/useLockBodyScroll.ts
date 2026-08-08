// src/hooks/useLockBodyScroll.ts
import { useLayoutEffect } from "react";

export function useLockBodyScroll(isLocked: boolean) {
  useLayoutEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const body = document.body;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
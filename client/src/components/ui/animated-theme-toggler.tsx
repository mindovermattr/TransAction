"use client";

import {
  getDataFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  setDataLocalStorage,
} from "@/lib/localstorage";
import { cn } from "@/lib/utils";
import { Moon, SunDim } from "lucide-react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

type props = {
  className?: string;
};

const rootElement = document.documentElement;

const initialTheme = getDataFromLocalStorage(LOCAL_STORAGE_KEYS.THEME) ?? false;

if (initialTheme) document.documentElement.classList.add("dark");

export const AnimatedThemeToggler = ({ className }: props) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(initialTheme);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const changeTheme = async () => {
    if (!buttonRef.current) return;

    if (!("startViewTransition" in document)) {
      const dark = rootElement.classList.toggle("dark");
      setIsDarkMode(dark);
      setDataLocalStorage(LOCAL_STORAGE_KEYS.THEME, dark);
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        const dark = rootElement.classList.toggle("dark");
        setIsDarkMode(dark);
        setDataLocalStorage(LOCAL_STORAGE_KEYS.THEME, dark);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 1000,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };
  return (
    <button
      ref={buttonRef}
      onClick={changeTheme}
      className={cn(className, "cursor-pointer")}
    >
      {isDarkMode ? <SunDim className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
};

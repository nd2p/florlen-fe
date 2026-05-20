'use client';

import { useEffect } from "react";

const OPTIONS = {
    outerWidth: 40,
    outerHeight: 40,
    outerStyle: "circle",
    hoverEffect: "circle-move",
    hoverItemMove: false,
    defaultCursor: false,
} as const;

const THEME_STYLE_ID = "magicmouse-theme";
const THEME_CSS = `
html body #magicMouseCursor { border-color: var(--color-primary) !important; z-index: 2147483647 !important; }
html body #magicPointer { background: var(--color-primary) !important; width: 14px !important; height: 14px !important; z-index: 2147483647 !important; }
html body #magicPointer.pointer-blur { border-color: var(--color-primary) !important; box-shadow: 0 0 15px -5px rgba(164, 0, 21, 0.6) !important; }
html body #magicPointer.pointer-overlay { box-shadow: 0 0 15px -5px rgba(164, 0, 21, 0.6) !important; }
html body #magicPointer.is-hover { background: var(--color-primary) !important; }
`;

export default function MagicMouse() {
    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            if (typeof window === "undefined") return;
            const initialized = (window as Window & { __magicMouseInitialized?: boolean }).__magicMouseInitialized;
            if (initialized) return;

            const existingCursor = document.getElementById("magicMouseCursor");
            const existingPointer = document.getElementById("magicPointer");
            if (existingCursor || existingPointer) {
                (window as Window & { __magicMouseInitialized?: boolean }).__magicMouseInitialized = true;
                return;
            }

            const { magicMouse } = await import("magicmouse.js");
            if (!isMounted) return;

            magicMouse(OPTIONS);

            if (!document.getElementById(THEME_STYLE_ID)) {
                const styleTag = document.createElement("style");
                styleTag.id = THEME_STYLE_ID;
                styleTag.textContent = THEME_CSS;
                document.head.appendChild(styleTag);
            }
            (window as Window & { __magicMouseInitialized?: boolean }).__magicMouseInitialized = true;
        };

        void init();

        return () => {
            isMounted = false;
        };
    }, []);

    return null;
}

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggleButton() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // 하이드레이션 오류 방지 (서버와 클라이언트의 테마 상태를 맞춤)
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-2 bg-gray-200 dark:bg-gray-800 rounded-md transition-colors`}
        >
            {theme === "dark" ? "🌙" : "☀️"}
        </button>
    );
}
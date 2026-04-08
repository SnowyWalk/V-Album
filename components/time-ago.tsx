"use client";

import { useEffect, useMemo, useState } from "react";

type TimeAgoProps = {
    /** ISO string or Date */
    date: string | Date;
    className?: string;
    /** 정확한 시각 포맷 locale (기본: ko-KR) */
    locale?: string;
    /** 1분마다 자동 갱신 여부 (기본: true) */
    live?: boolean;
};

function toDate(value: string | Date): Date {
    return value instanceof Date ? value : new Date(value);
}

function formatRelativeKorean(target: Date, now: Date): string {
    const diffMs = now.getTime() - target.getTime();
    const future = diffMs < 0;
    const absSec = Math.floor(Math.abs(diffMs) / 1000);

    if (absSec < 60) return "방금 전";

    const units = [
        { sec: 60 * 60 * 24 * 365, label: "년" },
        { sec: 60 * 60 * 24 * 30, label: "개월" },
        { sec: 60 * 60 * 24, label: "일" },
        { sec: 60 * 60, label: "시간" },
        { sec: 60, label: "분" },
        { sec: 1, label: "초" },
    ];

    for (const u of units) {
        if (absSec >= u.sec) {
            const n = Math.floor(absSec / u.sec);
            // 미래 시점 대응도 간단히 포함
            return future ? `${n}${u.label} 후` : `${n}${u.label} 전`;
        }
    }

    return "방금 전";
}

export default function TimeAgo({
                                    date,
                                    className,
                                    locale = "ko-KR",
                                    live = true,
                                }: TimeAgoProps) {
    const dateMemo = useMemo(() => toDate(date), [date]);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        if (!live) return;

        // "n분 전" 표시는 1분 단위 갱신이면 충분
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, [live]);

    const relativeText = useMemo(() => formatRelativeKorean(dateMemo, now), [dateMemo, now]);

    const exactText = useMemo(() => {
        // hover에서 보여줄 정확한 시각
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(dateMemo);
    }, [dateMemo, locale]);

    return (
        <time
            dateTime={dateMemo.toISOString()}
            title={exactText} // hover 시 정확 시각
            className={className}
            suppressHydrationWarning
        >
            {relativeText}
        </time>
    );
}
"use client";

import React, { useState, useMemo } from "react";
import { 
  format, addMonths, subMonths, addYears, subYears, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  isSameDay, isSameMonth, min, max, isToday, startOfDay, addDays
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  highlightDates: Date[];
  onDateSelect?: (date: Date) => void;
  className?: string;
}

type ViewMode = "month" | "year";

export default function CustomCalendar({ highlightDates, onDateSelect, className }: CustomCalendarProps) {
  const { normalizedHighlights, minDate, maxDate, initialDate } = useMemo(() => {
    const normalized = highlightDates.map(d => startOfDay(new Date(d)));
    if (!normalized.length) {
      const now = startOfDay(new Date());
      return { normalizedHighlights: [], minDate: startOfMonth(now), maxDate: endOfMonth(now), initialDate: now };
    }
    const dMin = startOfDay(startOfMonth(min(normalized)));
    const dMax = startOfDay(endOfMonth(max(normalized)));
    const dInitial = max(normalized); 
    return { normalizedHighlights: normalized, minDate: dMin, maxDate: dMax, initialDate: dInitial };
  }, [highlightDates]);

  const [currentViewDate, setCurrentViewDate] = useState<Date>(initialDate);
  const [lastActiveDate, setLastActiveDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const canGoPrev = () => {
    if (viewMode === "month") return startOfDay(endOfMonth(subMonths(currentViewDate, 1))) >= minDate;
    return subYears(currentViewDate, 1).getFullYear() >= minDate.getFullYear();
  };

  const canGoNext = () => {
    if (viewMode === "month") return startOfDay(startOfMonth(addMonths(currentViewDate, 1))) <= maxDate;
    return addYears(currentViewDate, 1).getFullYear() <= maxDate.getFullYear();
  };

  const handlePrev = () => {
    if (!canGoPrev()) return;
    setCurrentViewDate(prev => viewMode === "month" ? subMonths(prev, 1) : subYears(prev, 1));
  };

  const handleNext = () => {
    if (!canGoNext()) return;
    setCurrentViewDate(prev => viewMode === "month" ? addMonths(prev, 1) : addYears(prev, 1));
  };

  const toggleViewMode = () => {
    if (viewMode === "year") setCurrentViewDate(lastActiveDate);
    setViewMode(prev => prev === "month" ? "year" : "month");
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setLastActiveDate(day);
    onDateSelect?.(day);
  };

  const handleMonthClick = (targetMonth: Date) => {
    setCurrentViewDate(targetMonth);
    setLastActiveDate(targetMonth);
    setViewMode("month");
  };

  const daysInMonth = useMemo(() => {
    const startDate = startOfWeek(startOfMonth(currentViewDate));
    return Array.from({ length: 42 }, (_, i) => addDays(startDate, i));
  }, [currentViewDate]);

  return (
    <div className={cn(
      "w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm select-none tabular-nums overflow-hidden flex flex-col",
      className
    )}>
      {/* 헤더 */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
        <button
          onClick={toggleViewMode}
          className="text-sm font-bold tracking-tight hover:text-blue-600 transition-colors px-2 py-1 rounded"
        >
          {viewMode === "month" ? format(currentViewDate, "yyyy. MM") : format(currentViewDate, "yyyy")}
        </button>
        <div className="flex gap-0.5">
          <button onClick={handlePrev} disabled={!canGoPrev()} className="p-1.5 disabled:opacity-10 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={handleNext} disabled={!canGoNext()} className="p-1.5 disabled:opacity-10 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-[260px] p-2 flex-grow">
        {viewMode === "year" && (
          <div className="grid grid-cols-3 grid-rows-4 gap-1.5 h-full">
            {Array.from({ length: 12 }, (_, i) => {
              const targetMonth = startOfDay(new Date(currentViewDate.getFullYear(), i, 1));
              const monthEnd = endOfMonth(targetMonth);
              const isOutRange = startOfDay(monthEnd) < minDate || targetMonth > maxDate;
              const hasData = normalizedHighlights.some((d) => isSameMonth(d, targetMonth));
              const isThisMonth = isSameMonth(new Date(), targetMonth);

              return (
                <button
                  key={i}
                  disabled={isOutRange}
                  onClick={() => handleMonthClick(targetMonth)}
                  className={cn(
                    "relative flex flex-col items-center justify-center text-xs font-medium transition-all rounded-lg h-full",
                    isOutRange ? "opacity-10 cursor-not-allowed" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
                    // 오늘이 속한 월 하이라이트
                  )}
                >
                  {i + 1}월
                  {hasData && <div className="absolute bottom-2.5 w-1 h-1 bg-blue-500 rounded-full" />}
                </button>
              );
            })}
          </div>
        )}

        {viewMode === "month" && (
          <div className="grid grid-rows-[30px_1fr] h-full">
            <div className="grid grid-cols-7 items-center">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <span key={d} className="text-[11px] text-zinc-400 font-bold text-center">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-y-1 gap-x-0.5 h-full">
              {daysInMonth.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentViewDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);
                const hasData = normalizedHighlights.some((d) => isSameDay(d, day));
                const isOutRange = day < minDate || day > maxDate;

                if (!isCurrentMonth) return <div key={idx} />;

                return (
                  <button
                    key={idx}
                    disabled={isOutRange}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "relative flex flex-col items-center justify-center transition-all text-[13px] rounded-md h-full w-full",
                      isOutRange && "opacity-10 cursor-not-allowed",
                      // 🌟 오늘 날짜 하이라이트 (시인성 강화)
                      today && !isSelected && "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold ring-1 ring-blue-100 dark:ring-blue-800",
                      isSelected 
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold" 
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
                    )}
                  >
                    <span>{format(day, "d")}</span>
                    {hasData && (
                      <div className={cn(
                        "absolute bottom-1.5 w-0.5 h-0.5 rounded-full",
                        isSelected ? "bg-white dark:bg-zinc-900" : (today ? "bg-blue-600" : "bg-zinc-400")
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES, DAYS_OF_WEEK } from "@/common/constants";

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());


  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const numDays = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const dateCells = [];
  
  for (let i = 0; i < firstDayIndex; i++) {
    dateCells.push(null);
  }

  for (let day = 1; day <= numDays; day++) {
    dateCells.push(new Date(currentYear, currentMonth, day));
  }

  const isSelected = (date: Date) => {
    const formatted = formatDate(date);
    return formatted === selectedDate;
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isPastDate = (date: Date) => {
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayDate;
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-bold text-zinc-100">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_OF_WEEK.map((day: string) => (
          <div key={day} className="text-xs font-semibold text-zinc-500 py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {dateCells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />;
          }

          const disabled = isPastDate(date);
          const active = isSelected(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(formatDate(date))}
              className={`h-9 w-9 mx-auto flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 scale-105"
                  : disabled
                  ? "text-zinc-700 cursor-not-allowed"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-amber-400"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
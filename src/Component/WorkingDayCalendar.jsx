import { useState } from "react";

  export function WorkingDayCalendar({ value, onChange, minDate, workingDays }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const min = minDate ? new Date(minDate) : new Date(today.getTime() + 86400000);

  const [viewYear, setViewYear] = useState(() => {
    if (value) return new Date(value).getFullYear();
    return min.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(value).getMonth();
    return min.getMonth();
  });

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const WEEKDAY_MAP = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };

  const enabledWeekdays = new Set((workingDays || []).map((d) => WEEKDAY_MAP[d]));

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toDateStr = (d) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${viewYear}-${mm}-${dd}`;
  };

  const isDisabled = (d) => {
    if (!d) return true;
    const date = new Date(viewYear, viewMonth, d);
    date.setHours(0, 0, 0, 0);
    if (date < min) return true;
    if (workingDays && workingDays.length > 0 && !enabledWeekdays.has(date.getDay())) return true;
    return false;
  };

  const isSelected = (d) => {
    if (!d || !value) return false;
    return toDateStr(d) === value;
  };

  const isToday = (d) => {
    if (!d) return false;
    const date = new Date(viewYear, viewMonth, d);
    return date.toDateString() === today.toDateString();
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleClick = (d) => {
    if (isDisabled(d)) return;
    onChange(toDateStr(d));
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 select-none">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-700 text-zinc-300 hover:text-white transition">‹</button>
        <span className="text-white font-semibold text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-700 text-zinc-300 hover:text-white transition">›</button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((dn) => (
          <div key={dn} className="text-center text-xs text-zinc-500 font-medium py-1">{dn}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, idx) => {
          if (!d) return <div key={`empty-${idx}`} />;
          const disabled = isDisabled(d);
          const selected = isSelected(d);
          const todayMark = isToday(d);

          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(d)}
              className={`
                relative mx-auto w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition
                ${selected ? 'bg-white text-zinc-950 shadow font-bold' : disabled ? 'text-zinc-700 cursor-not-allowed' : 'text-white hover:bg-zinc-600 cursor-pointer'}
                ${todayMark && !selected ? 'ring-1 ring-zinc-500' : ''}
              `}
            >
              {d}
              {!disabled && !selected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
              )}
            </button>
          );
        })}
      </div>

      {workingDays && workingDays.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-700 flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" /> Unavailable</span>
        </div>
      )}
    </div>
  );
}
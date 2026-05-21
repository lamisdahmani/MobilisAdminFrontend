import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext'; 
import t from '../../i18n/translations.json';
import './Calendar.css';

export default function CalendarIcon() {
  const { lang } = useLang();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = {
    fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ar: ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  };

  const dayLabels = {
    fr: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
    en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    ar: ["أح", "إث", "ثلا", "أر", "خـم", "جم", "سب"]
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blankDays = Array(firstDayIndex).fill(null);
  const monthDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const calendarGrid = [...blankDays, ...monthDays];

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(year, month + direction, 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(new Date(year, month, day));
    setCalendarOpen(false);
  };

  return (
    <div className="calendar-dropdown-wrap">
      <button 
        className={`navbar-icon-btn ${calendarOpen ? 'active' : ''}`}
        onClick={() => setCalendarOpen(!calendarOpen)}
        aria-label="Open Calendar"
      >
        <Calendar size={18} />
      </button>

      {calendarOpen && (
        <div className={`calendar-popup-menu ${lang === 'ar' ? 'rtl-layout' : ''}`}>
          <div className="calendar-popup-header">
            <button onClick={() => changeMonth(-1)} className="cal-nav-btn"><ChevronLeft size={16} /></button>
            <span className="cal-current-label">{monthNames[lang][month]} {year}</span>
            <button onClick={() => changeMonth(1)} className="cal-nav-btn"><ChevronRight size={16} /></button>
          </div>

          <div className="calendar-days-grid-labels">
            {dayLabels[lang].map((lbl, idx) => <span key={idx} className="cal-day-label">{lbl}</span>)}
          </div>

          <div className="calendar-days-grid">
            {calendarGrid.map((day, idx) => (
              <div key={idx} className="cal-cell-slot">
                {day && (
                  <button 
                    onClick={() => handleDateClick(day)}
                    className={`cal-day-number-btn 
                      ${day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? 'cal-today' : ''} 
                      ${selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year ? 'cal-selected' : ''}`}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
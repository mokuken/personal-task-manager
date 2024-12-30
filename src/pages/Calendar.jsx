import React, { useState } from 'react';
import '../styles/Calendar.css';

const Calendar = () => {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const [currentDate, setCurrentDate] = useState(new Date());

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();

        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const days = [];

        // Add blank days for alignment
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="empty"></div>);
        }

        // Add the actual days
        for (let day = 1; day <= totalDays; day++) {
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const habits = isToday ? ['Habit 1', 'Habit 2', 'Habit 3', 'Habit 4'] : []; // Example habits

            const visibleHabits = habits.slice(0, 3); // Show only the first habit
            const remainingCount = habits.length - visibleHabits.length;

            days.push(
                <div key={day} className={`day ${isToday ? 'current-day' : ''}`}>
                    <strong>{day}</strong>
                    {habits.length > 0 && (
                        <ul className="habit-list">
                            {visibleHabits.map((habit, index) => (
                                <li key={index}>{habit}</li>
                            ))}
                            {remainingCount > 0 && (
                                <span className="more-task">
                                    <li>{habits[1]}</li>
                                    <li className="number">+{remainingCount}</li>
                                </span>
                            )}
                        </ul>
                    )}
                </div>
            );
        }

        return days;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    return (
        <div className="calendar">
            {/* Calendar Header */}
            <div className="calendar-header">
                <button className="prev-month" onClick={() => changeMonth(-1)}>&lt;</button>
                <h2 className="month-year">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button className="next-month" onClick={() => changeMonth(1)}>&gt;</button>
            </div>

            {/* Weekdays Header */}
            <div className="weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={index}>{day}</div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="days-grid">
                {renderDays()}
            </div>
        </div>
    );
};

export default Calendar;

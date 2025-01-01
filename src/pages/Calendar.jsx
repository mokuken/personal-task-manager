import React, { useState, useEffect } from 'react';
import { db } from '../firebase/db_connect'; // Ensure correct Firebase configuration is used
import { collection, query, onSnapshot } from 'firebase/firestore';
import '../styles/Calendar.css';

const Calendar = () => {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [habits, setHabits] = useState([]);

    // Fetch habits data once and set up a real-time listener
    useEffect(() => {
        const q = query(collection(db, 'habitList'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const habitsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setHabits(habitsData);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []);

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
            const currentDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

            // Filter habits for the current day
            const dailyHabits = habits.filter(habit =>
                habit.achieveDates && habit.achieveDates.includes(currentDay)
            );

            const visibleHabits = dailyHabits.slice(0, 3); // Show only the first 2 habits
            const lastHabit = dailyHabits[3] || { habitName: '' }; // Get the 3rd habit or empty object
            const remainingCount = dailyHabits.length - 4;

            days.push(
                <div key={day} className={`day ${isToday ? 'current-day' : ''}`}>
                    <strong>{day}</strong>
                    {dailyHabits.length > 0 && (
                        <ul className="habit-list">
                            {visibleHabits.map((habit, index) => (
                                <li key={index}>{habit.habitName}</li>
                            ))}
                            <span className='more-task'>
                                <li>{lastHabit.habitName}</li>
                                {dailyHabits.length > 4 && <li className="number">+{remainingCount}</li>}
                            </span>
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

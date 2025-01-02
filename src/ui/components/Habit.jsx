import React from 'react';
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/db_connect'; // Adjust the path as needed

const Habit = ({ habit, onClick, isSelected }) => {
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
        }
        return days;
    };

    const last7Days = getLast7Days();

    const toggleCheckIn = async (date) => {
        try {
            const habitRef = doc(db, 'habitList', habit.id);
            const updatedDates = habit.achieveDates || [];

            if (updatedDates.includes(date)) {
                const newDates = updatedDates.filter((d) => d !== date);
                await updateDoc(habitRef, { achieveDates: newDates });
            } else {
                updatedDates.push(date);
                await updateDoc(habitRef, { achieveDates: updatedDates });
            }
        } catch (error) {
            console.error('Error updating habit check-in:', error);
        }
    };

    return (
        <div
            className={`habit ${isSelected ? 'selected' : ''}`} // Conditional class
            onClick={onClick}
        >
            {habit.habitName}
            <div className="check-ins">
                {last7Days.map((day, index) => (
                    <div
                        key={index}
                        className="circle"
                        style={{
                            backgroundColor: habit.achieveDates?.includes(day) ? 'white' : 'transparent',
                            color: habit.achieveDates?.includes(day) ? 'black' : 'white',
                            cursor: 'pointer',
                        }}
                        onClick={() => toggleCheckIn(day)}
                    >
                        {habit.achieveDates?.includes(day) ? '✓' : ''}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Habit;
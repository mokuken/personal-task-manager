import React from 'react';
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/db_connect'; // Adjust the path as needed

const Habit = ({ habit, onClick }) => {
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD')); // Format as YYYY-MM-DD
    }
    return days;
  };

  const last7Days = getLast7Days();

  const toggleCheckIn = async (date) => {
    try {
      const habitRef = doc(db, 'habitList', habit.id); // Reference to the habit document
      const updatedDates = habit.achieveDates || [];

      if (updatedDates.includes(date)) {
        // Remove the date if already checked
        const newDates = updatedDates.filter((d) => d !== date);
        await updateDoc(habitRef, { achieveDates: newDates });
      } else {
        // Add the date if not checked
        updatedDates.push(date);
        await updateDoc(habitRef, { achieveDates: updatedDates });
      }
    } catch (error) {
      console.error('Error updating habit check-in:', error);
    }
  };

  return (
    <div
      className="habit"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {habit.habitName}
      <div className='check-ins'>
        {last7Days.map((day, index) => (
          <div
            key={index}
            className="circle"
            style={{
              backgroundColor: habit.achieveDates?.includes(day) ? 'white' : 'transparent',
              color: habit.achieveDates?.includes(day) ? 'black' : 'white',
              cursor: 'pointer',
            }}
            onClick={() => toggleCheckIn(day)} // Handle click
          >
            {habit.achieveDates?.includes(day) ? '✓' : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Habit;
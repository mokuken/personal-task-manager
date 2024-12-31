import React from 'react';

const Habit = ({ habit }) => {
  return (
    <div
      className="habit"
    >
      {habit.habitName}
    </div>
  );
};

export default Habit;
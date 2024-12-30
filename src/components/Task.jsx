import React from 'react';

const Task = ({ task }) => {
  return (
      <div className="task">{task.task}</div>
  );
};

export default Task;
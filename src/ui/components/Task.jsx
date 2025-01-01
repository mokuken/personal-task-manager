import React from 'react';

const Task = ({ task, onDragStart }) => {
  return (
    <div
      className="task"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      {task.task}
    </div>
  );
};

export default Task;
import { useEffect, useState } from 'react';
import { db } from '../firebase/db_connect';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import Task from "../components/Task";
import '../styles/TaskTracker.css';

function TaskTracker() {
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'taskList'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let tasksArr = [];
            querySnapshot.forEach((doc) => {
                tasksArr.push({ id: doc.id, ...doc.data() });
            });
            setTasks(tasksArr);
        });
        return () => unsubscribe();
    }, []);

    const createTask = async (e) => {
        e.preventDefault();
        if (input.trim() === '') {
            alert('Please enter a valid task');
            return;
        }
        await addDoc(collection(db, 'taskList'), {
            task: input,
            status: "Not started",
        });
        setInput(''); // Clear the input after creating the task
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            createTask(e); // Call createTask when the "Enter" key is pressed
        }
    };

    return (
        <div className='task-container'>
            <div className='task-header'>
                <h1>Task Tracker</h1>
            </div>
            <br />
            <div className='task-group'>
                <div className='task-group-container'>
                    <div className="task-group-header not-started">Not started</div>
                    <div className="task-group-list not-started">
                        {tasks.filter(task => task.status === 'Not started').map((task, index) => (
                            <Task
                                key={index}
                                task={task}
                            />
                        ))}

                        <input
                            className="new-task"
                            type="text"
                            placeholder="New task"
                            value={input}
                            onChange={(e) => setInput(e.target.value)} // Update input state
                            onKeyDown={handleKeyPress} // Handle "Enter" key
                        />
                    </div>
                </div>
                <div className='task-group-container'>
                    <div className="task-group-header in-progress">In progress</div>
                    <div className="task-group-list in-progress">
                        {tasks.filter(task => task.status === 'In progress').map((task, index) => (
                            <Task
                                key={index}
                                task={task}
                            />
                        ))}
                    </div>
                </div>
                <div className='task-group-container'>
                    <div className="task-group-header to-be-checked">To be checked</div>
                    <div className="task-group-list to-be-checked">
                        {tasks.filter(task => task.status === 'To be checked').map((task, index) => (
                            <Task
                                key={index}
                                task={task}
                            />
                        ))}
                    </div>
                </div>
                <div className='task-group-container'>
                    <div className="task-group-header done">Done</div>
                    <div className="task-group-list done">
                        {tasks.filter(task => task.status === 'Done').map((task, index) => (
                            <Task
                                key={index}
                                task={task}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskTracker;

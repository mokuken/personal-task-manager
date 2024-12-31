import { useEffect, useState } from 'react';
import { db } from '../firebase/db_connect';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Task from "../components/Task";
import '../styles/TaskTracker.css';

function TaskTracker() {
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState('');
    const [isDragging, setIsDragging] = useState(false); // Track dragging status

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
        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            createTask(e);
        }
    };

    const onDragStart = (e, id) => {
        setIsDragging(true); // Show delete area
        e.dataTransfer.setData('taskId', id);
    };
    
    const onDragEnd = () => {
        setIsDragging(false); // Hide delete area
    };

    // Ensure the delete area is hidden if drag ends anywhere
    useEffect(() => {
        const handleDragEndGlobal = () => setIsDragging(false);
        window.addEventListener('dragend', handleDragEndGlobal);
        return () => {
            window.removeEventListener('dragend', handleDragEndGlobal);
        };
    }, []);

    const onDrop = async (e, status) => {
        const id = e.dataTransfer.getData('taskId');
        if (status === 'delete') {
            await deleteTask(id); // Call the delete task function
        } else {
            const taskDoc = doc(db, 'taskList', id);
            await updateDoc(taskDoc, { status }); // Update status in Firestore
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id ? { ...task, status } : task
                )
            );
        }
    };

    const deleteTask = async (id) => {
        const taskDoc = doc(db, 'taskList', id);
        await deleteDoc(taskDoc); // Remove the task from Firestore
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id)); // Update local state
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className='task-container'>
            <div className='task-header'>
                <h1>Task Tracker</h1>
            </div>
            <br />
            <div className='task-group'>
                <div
                    className='task-group-container'
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, 'Not started')}
                >
                    <div className="task-group-header not-started">Not started</div>
                    <div className="task-group-list not-started">
                        {tasks.filter(task => task.status === 'Not started').map((task) => (
                            <Task
                                key={task.id}
                                task={task}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                            />
                        ))}
                        <input
                            className="new-task"
                            type="text"
                            placeholder="New task"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                    </div>
                </div>
                <div
                    className='task-group-container'
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, 'In progress')}
                >
                    <div className="task-group-header in-progress">In progress</div>
                    <div className="task-group-list in-progress">
                        {tasks.filter(task => task.status === 'In progress').map((task) => (
                            <Task
                                key={task.id}
                                task={task}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                            />
                        ))}
                    </div>
                </div>
                <div
                    className='task-group-container'
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, 'To be checked')}
                >
                    <div className="task-group-header to-be-checked">To be checked</div>
                    <div className="task-group-list to-be-checked">
                        {tasks.filter(task => task.status === 'To be checked').map((task) => (
                            <Task
                                key={task.id}
                                task={task}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                            />
                        ))}
                    </div>
                </div>
                <div
                    className='task-group-container'
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, 'Done')}
                >
                    <div className="task-group-header done">Done</div>
                    <div className="task-group-list done">
                        {tasks.filter(task => task.status === 'Done').map((task) => (
                            <Task
                                key={task.id}
                                task={task}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div
                className="delete-task"
                style={{ display: isDragging ? 'block' : 'none' }} // Conditionally show delete area
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, 'delete')}
            >
                Delete Task
            </div>
        </div>
    );
}

export default TaskTracker;

import { useEffect, useState } from 'react';
import { db } from '../firebase/db_connect';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Task from "../components/Task"
import '../styles/TaskTracker.css';

function TaskTracker() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'taskList'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let tasksArr = []
            querySnapshot.forEach((doc) => {
                tasksArr.push({id: doc.id, ...doc.data()});
            });
            setTasks(tasksArr);
        })
        return () => unsubscribe();
    }, []);
    
    return (
        <div className='task-container'>
            <div className='task-header'>
                <h1>Task Tracker</h1>
            </div>
            <br />
            <div className='task-group'>
                <div className='task-group-container'>
                    <div className="task-group-header not-started">Not started</div>
                    <div className="task-group-list not-started"></div>
                </div>
                <div className='task-group-container'>
                    <div className="task-group-header in-progress">In progress</div>
                    <div className="task-group-list in-progress">
                        {tasks.map((task, index) => (
                            <Task
                            key={index}
                            task={task}
                            />
                        ))}
                    </div>
                </div>
                <div className='task-group-container'>
                    <div className="task-group-header to-be-checked">To be checked</div>
                    <div className="task-group-list to-be-checked"></div>
                </div>
                <div className='task-group-container'>
                    <div className="task-group-header done">Done</div>
                    <div className="task-group-list done"></div>
                </div>
            </div>
        </div>
    )
}

export default TaskTracker
import { useEffect, useState } from 'react';
import { db } from '../../firebase/db_connect';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Task from "../components/Task";
import '../styles/TaskTracker.css';

function Kanban() {
    const [tasks, setTasks] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(''); // Track selected folder
    const [input, setInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        // Fetch tasks
        const taskQuery = query(collection(db, 'taskList'));
        const unsubscribeTasks = onSnapshot(taskQuery, (querySnapshot) => {
            let tasksArr = [];
            querySnapshot.forEach((doc) => {
                tasksArr.push({ id: doc.id, ...doc.data() });
            });
            setTasks(tasksArr);
        });

        // Fetch folders
        const folderQuery = query(collection(db, 'folders'));
        const unsubscribeFolders = onSnapshot(folderQuery, (querySnapshot) => {
            let foldersArr = [];
            querySnapshot.forEach((doc) => {
                foldersArr.push({ id: doc.id, ...doc.data() });
            });
            setFolders(foldersArr);
        });

        return () => {
            unsubscribeTasks();
            unsubscribeFolders();
        };
    }, []);

    const createFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (folderName && folderName.trim() !== '') {
            await addDoc(collection(db, 'folders'), { name: folderName });
        }
    };

    const createTask = async (e) => {
        e.preventDefault();
        if (input.trim() === '') {
            alert('Please enter a valid task');
            return;
        }
        if (selectedFolder === '') {
            alert('Please select a folder before adding a task');
            return;
        }
        await addDoc(collection(db, 'taskList'), {
            task: input,
            status: "Not started",
            folderName: selectedFolder, // Associate task with selected folder
        });
        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            createTask(e);
        }
    };

    const onDragStart = (e, id) => {
        setIsDragging(true);
        e.dataTransfer.setData('taskId', id);
    };

    const onDragEnd = () => {
        setIsDragging(false);
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
            await deleteTask(id);
        } else {
            const taskDoc = doc(db, 'taskList', id);
            await updateDoc(taskDoc, { status });
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === id ? { ...task, status } : task
                )
            );
        }
    };

    const deleteTask = async (id) => {
        const taskDoc = doc(db, 'taskList', id);
        await deleteDoc(taskDoc);
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className='task-container'>
            {/* Folder list */}
            <div className='task-folder'>
                {folders.map((folder) => (
                    <div
                        key={folder.id}
                        className={`folder ${selectedFolder === folder.name ? 'selected' : ''}`}
                        onClick={() => setSelectedFolder(folder.name)} // Set selected folder
                    >
                        {folder.name}
                    </div>
                ))}
                <div className='add-folder' onClick={createFolder}>+</div>
            </div>

            {/* Conditionally render task groups if a folder is selected */}
            {selectedFolder && (
                <div className='task-container'>
                    <div className='task-group'>
                        <div
                            className='task-group-container'
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, 'Not started')}
                        >
                            <div className="task-group-header not-started">Not started</div>
                            <div className="task-group-list not-started">
                                {tasks
                                    .filter(task => task.status === 'Not started' && task.folderName === selectedFolder)
                                    .map((task) => (
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
                        {/* Repeat for other task groups */}
                        <div
                            className='task-group-container'
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, 'In progress')}
                        >
                            <div className="task-group-header in-progress">In progress</div>
                            <div className="task-group-list in-progress">
                                {tasks
                                    .filter(task => task.status === 'In progress' && task.folderName === selectedFolder)
                                    .map((task) => (
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
                                {tasks
                                    .filter(task => task.status === 'To be checked' && task.folderName === selectedFolder)
                                    .map((task) => (
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
                                {tasks
                                    .filter(task => task.status === 'Done' && task.folderName === selectedFolder)
                                    .map((task) => (
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
                </div>
            )} {!selectedFolder && (
                <div className="no-folder-message">
                    <p>Select a folder to see list of tasks</p>
                </div>
            )}

            {/* Delete task area */}
            <div
                className="delete-task"
                style={{ display: isDragging ? 'block' : 'none' }}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, 'delete')}
            >
                Delete Task
            </div>
        </div>
    );

}

export default Kanban;

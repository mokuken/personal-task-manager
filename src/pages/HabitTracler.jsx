import { useEffect, useState } from 'react';
import { db } from '../firebase/db_connect';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Habit from "../components/Habit";
import '../styles/HabitTracker.css';


function HabitTracker() {
    const [habit, setHabits] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'habitList'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let habitArr = [];
            querySnapshot.forEach((doc) => {
                habitArr.push({ id: doc.id, ...doc.data() });
            });
            setHabits(habitArr);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className='habit-container'>
            <div className="habits">
                <h2>Habits</h2>
                <div className="habit-list">
                {habit.map((habit) => (
                            <Habit
                                key={habit.id}
                                habit={habit}
                            />
                        ))}
                </div>
            </div>
            <div className="habit-info"></div>
        </div>
    )
}

export default HabitTracker
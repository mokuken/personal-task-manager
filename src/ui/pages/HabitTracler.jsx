import { useEffect, useState, useMemo } from 'react';
import { db } from '../../firebase/db_connect';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import Habit from '../components/Habit';
import '../styles/HabitTracker.css';

function HabitTracker() {
    const [habits, setHabits] = useState([]);
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [input, setInput] = useState(''); // State for new habit input

    useEffect(() => {
        const q = query(collection(db, 'habitList'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let habitArr = [];
            querySnapshot.forEach((doc) => {
                habitArr.push({ id: doc.id, ...doc.data() });
            });
            setHabits(habitArr);

            // Update selected habit if it's part of the updated habits
            if (selectedHabit) {
                const updatedHabit = habitArr.find((habit) => habit.id === selectedHabit.id);
                setSelectedHabit(updatedHabit || null);
            }
        });
        return () => unsubscribe();
    }, [selectedHabit]);

    const createHabit = async (e) => {
        e.preventDefault();
        if (input.trim() === '') {
            alert('Please enter a valid habit');
            return;
        }
        await addDoc(collection(db, 'habitList'), {
            habitName: input,
            description: 'No description', // Default description
            achieveDates: [], // Empty array for dates
        });
        setInput(''); // Clear input after saving
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            createHabit(e);
        }
    };

    // Get current month matches
    const getCurrentMonthMatches = (achieveDates = []) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // 0-indexed (January is 0)
        const currentYear = currentDate.getFullYear();

        return achieveDates.filter((dateString) => {
            const date = new Date(dateString); // Parse the date string
            return (
                date.getMonth() === currentMonth && date.getFullYear() === currentYear
            );
        }).length;
    };

    // Calculate streak
    const calculateStreak = (achieveDates = []) => {
        if (!achieveDates || achieveDates.length === 0) return 0;

        // Sort dates in descending order
        const sortedDates = achieveDates
            .map((date) => new Date(date))
            .sort((a, b) => b - a);

        let streak = 0;
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1); // Start from yesterday
        let previousDate = currentDate;

        for (let date of sortedDates) {
            // Calculate the difference in days
            const diffInDays = Math.ceil((previousDate - date) / (1000 * 60 * 60 * 24));
            if (diffInDays === 1 || (streak === 0 && diffInDays === 0)) {
                // Consecutive days or same day
                streak++;
                previousDate = date;
            } else {
                break; // Streak is broken
            }
        }

        return streak;
    };

    // Memoize streak for performance
    const streak = useMemo(() => {
        return calculateStreak(selectedHabit?.achieveDates || []);
    }, [selectedHabit]);

    // Memoize current month matches
    const currentMonthMatches = useMemo(() => {
        return getCurrentMonthMatches(selectedHabit?.achieveDates || []);
    }, [selectedHabit]);

    const totalCheckIns = selectedHabit?.achieveDates?.length || 0;

    return (
        <div className='habit-container'>
            <div className="habits">
                <h2>Daily Habits</h2>
                <div className="habit-list">
                    {habits.map((habit) => (
                        <Habit
                            key={habit.id}
                            habit={habit}
                            onClick={() => setSelectedHabit(habit)}
                            isSelected={selectedHabit?.id === habit.id} // Pass selected state
                        />
                    ))}
                </div>
                <input
                    className="new-habit"
                    type="text"
                    placeholder="New Habit"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
            </div>
            <div className="habit-info">
                {selectedHabit ? (
                    <>
                        <div className='habit-description'>
                            <h3>{selectedHabit.habitName}</h3>
                            <p>{selectedHabit.description}</p>
                        </div>
                        <div className='habit-status'>
                            <div className='div1'>
                                <h4>Monthly Check-ins</h4>
                                <h2>
                                    {currentMonthMatches} {currentMonthMatches === 1 ? 'Day' : 'Days'}
                                </h2>
                            </div>
                            <div className='div2'>
                                <h4>Total Check-ins</h4>
                                <h2>
                                    {totalCheckIns} {totalCheckIns === 1 ? 'Day' : 'Days'}
                                </h2>
                            </div>
                            <div className='div3'>
                                <h4>Monthly Check-in rate</h4>
                                <h2>0%</h2>
                            </div>
                            <div className={`div4 ${streak >= 28 ? 'violet-streak' : streak >= 21 ? 'blue-streak' : streak >= 14 ? 'white-streak' : streak >= 7 ? 'streak' : ''}`}>
                                <h4>Streak</h4>
                                <h2>{streak} {streak === 1 ? 'Day' : 'Days'}</h2>
                            </div>
                        </div>
                        <div className='habit-logs'>
                            <h3>Habit Logs</h3>
                        </div>
                    </>
                ) : (
                    <div className='no-habit-selected'>
                        <p>Select a habit to see details</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HabitTracker;

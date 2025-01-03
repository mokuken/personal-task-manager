import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";

function Dashboard() {
    const [elapsedTime, setElapsedTime] = useState({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const birthDate = new Date(2003, 7, 3); // August 3, 2003

        const calculateElapsedTime = () => {
            const now = new Date();
            const years = now.getFullYear() - birthDate.getFullYear();
            const months = now.getMonth() - birthDate.getMonth();
            const days = now.getDate() - birthDate.getDate();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            const elapsedYears = years - (months < 0 || (months === 0 && days < 0) ? 1 : 0);

            let elapsedMonths = (months + 12) % 12;
            if (days < 0) {
                elapsedMonths -= 1;
            }

            let elapsedDays = days;
            if (elapsedDays < 0) {
                const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                elapsedDays += previousMonth.getDate();
            }

            setElapsedTime({
                years: elapsedYears,
                months: elapsedMonths,
                days: elapsedDays,
                hours,
                minutes,
                seconds,
            });
        };

        // Calculate immediately on mount
        calculateElapsedTime();

        // Update every second
        const interval = setInterval(calculateElapsedTime, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const formatTwoDigits = (value) => value.toString().padStart(2, "0");

    return (
        <div className="dashboard-container">
            <div className="board1">
                <h1>Welcome back, Harly Khen</h1>
            </div>
            <div className="board2">
                <div className="time-container">
                    <div className="year">
                        <h1>{formatTwoDigits(elapsedTime.years)}</h1>
                        <p>Years</p>
                    </div>
                    <div className="month">
                        <h1>{formatTwoDigits(elapsedTime.months)}</h1>
                        <p>Months</p>
                    </div>
                    <div className="day">
                        <h1>{formatTwoDigits(elapsedTime.days)}</h1>
                        <p>Days</p>
                    </div>
                    <div className="hour">
                        <h1>{formatTwoDigits(elapsedTime.hours)}</h1>
                        <p>Hours</p>
                    </div>
                    <div className="minute">
                        <h1>{formatTwoDigits(elapsedTime.minutes)}</h1>
                        <p>Minutes</p>
                    </div>
                    <div className="second">
                        <h1>{formatTwoDigits(elapsedTime.seconds)}</h1>
                        <p>Seconds</p>
                    </div>
                </div>
            </div>
            <div className="board3">
                <p>Net Worth</p>
                <h1>₱98,000</h1>
            </div>
            <div className="board4"></div>
            <div className="board5"></div>
            <div className="board6"></div>
        </div>
    );
}

export default Dashboard;

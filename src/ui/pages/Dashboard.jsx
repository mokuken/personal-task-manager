import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    Tooltip,
    RadialLinearScale,
    Filler
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/db_connect";

ChartJS.register(LineElement, PointElement, Tooltip, RadialLinearScale, Filler);

function Dashboard() {
    const [elapsedTime, setElapsedTime] = useState({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const [chartData, setChartData] = useState([0, 0, 0, 0, 0]);
    const labels = ["STR", "INT", "HLT", "WRK", "MNY"];

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

        calculateElapsedTime();
        const interval = setInterval(calculateElapsedTime, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const q = query(collection(db, "habitList"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const typeCounts = labels.map((label) => {
                let count = 0;
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.type && data.type.includes(label)) {
                        count += (data.achieveDates || []).length;
                    }
                });
                return count;
            });

            setChartData(typeCounts);
        });

        return () => unsubscribe();
    }, []);

    const formatTwoDigits = (value) => value.toString().padStart(2, "0");

    const data = {
        labels,
        datasets: [{
            label: 'Points',
            data: chartData,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 1
        }]
    };

    const options = {
        scales: {
            r: {
                grid: {
                    color: 'grey',
                },
                ticks: {
                    display: false,
                },
                pointLabels: {
                    font: {
                        size: 14, // Increase font size for better readability
                    },
                    padding: 15, // Add padding to increase the distance from the chart center
                },
            },
        },
    };

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
            <div className="board5">
                <Radar data={data} options={options}></Radar>
            </div>
            <div className="board6"></div>
        </div>
    );
}

export default Dashboard;

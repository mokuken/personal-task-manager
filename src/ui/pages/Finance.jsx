import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/db_connect';
import { collection, query, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { Line } from 'react-chartjs-2'; // Import Line chart
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
} from 'chart.js';
import '../styles/Finance.css';

import TransactionHistory from '../components/TransactionHistory';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const Finance = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalSavings, setTotalSavings] = useState(0);
    const [totalWallet, setTotalWallet] = useState(0);
    const [currentCard, setCurrentCard] = useState('wallet');

    useEffect(() => {
        const q = query(collection(db, 'finance'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const transactionsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort transactions by date (ascending)
            transactionsData.sort((a, b) => a.date.seconds - b.date.seconds);

            setTransactions(transactionsData);
        });

        return () => unsubscribe();
    }, []);

    const handleAddTransaction = async (newTransaction) => {
        try {
            await addDoc(collection(db, 'finance'), {
                ...newTransaction,
                date: Timestamp.fromDate(newTransaction.date),
            });
        } catch (error) {
            console.error('Error adding transaction: ', error);
        }
    };

    useEffect(() => {
        const savingsTotal = transactions
            .filter((transaction) => 
                transaction.category === 'withdraw/savings' || 
                transaction.category === 'deposit/savings'
            )
            .reduce((total, transaction) => {
                return transaction.category === 'deposit/savings'
                    ? total + transaction.amount
                    : total - transaction.amount;
            }, 0);
    
        setTotalSavings(savingsTotal);
    
        const totalIncome = transactions
            .filter((transaction) => transaction.category === 'income')
            .reduce((total, transaction) => total + transaction.amount, 0);
    
        const totalExpenses = transactions
            .filter((transaction) => transaction.category === 'expenses')
            .reduce((total, transaction) => total + transaction.amount, 0);
    
        const totalNone = transactions
            .filter((transaction) => transaction.category === 'none')
            .reduce((total, transaction) => total + transaction.amount, 0);
    
        setTotalWallet(totalIncome - totalExpenses + totalNone);
    }, [transactions]);

    const handleSwitch = () => {
        setCurrentCard((prevCard) => (prevCard === 'wallet' ? 'savings' : 'wallet'));
    };

    const renderCardContent = () => {
        if (currentCard === 'wallet') {
            return (
                <div className="balance-info">
                    <h5>balance</h5>
                    <h1>
                        ₱<span className="amount">
                            {new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(totalWallet)}
                        </span>
                    </h1>
                </div>
            );
        } else {
            return (
                <div className="balance-info">
                    <h5>balance</h5>
                    <h1>
                        ₱<span className="amount">
                            {new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(totalSavings)}
                        </span>
                    </h1>
                </div>
            );
        }
    };

    ChartJS.defaults.animation = false; // disables all animations
    ChartJS.defaults.animations.colors = false; // disables animation defined by the collection of 'colors' properties
    ChartJS.defaults.animations.x = false; // disables animation defined by the 'x' property
    ChartJS.defaults.transitions.active.animation.duration = 0; // disables the animation for 'active' mode

    const generateChartData = () => {
        // Create an object to store totals grouped by date
        const totalsByDate = {};
    
        transactions.forEach((transaction) => {
            const dateKey = new Date(transaction.date.seconds * 1000).toLocaleDateString();
    
            // Initialize the date key if it doesn't exist
            if (!totalsByDate[dateKey]) {
                totalsByDate[dateKey] = { income: 0, expenses: 0 };
            }
    
            // Add the transaction amount to the appropriate category
            if (transaction.category === 'income') {
                totalsByDate[dateKey].income += transaction.amount;
            } else if (transaction.category === 'expenses') {
                totalsByDate[dateKey].expenses += transaction.amount;
            }
        });
    
        // Get the current date in the same format as the keys
        const currentDateKey = new Date().toLocaleDateString();
    
        // Ensure the current date is included, even if there's no data
        if (!totalsByDate[currentDateKey]) {
            totalsByDate[currentDateKey] = { income: 0, expenses: 0 };
        }
    
        // Get sorted unique dates
        const uniqueDates = Object.keys(totalsByDate).sort((a, b) => new Date(a) - new Date(b));
    
        // Generate data for the chart
        const incomeData = uniqueDates.map((date) => totalsByDate[date].income);
        const expensesData = uniqueDates.map((date) => totalsByDate[date].expenses);
    
        return {
            labels: uniqueDates,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#609c52',
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) {
                            return 'rgba(0, 0, 0, 0)';
                        }
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(96, 156, 82, 0)');
                        gradient.addColorStop(1, 'rgba(96, 156, 82, 0.2)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.5,
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    borderColor: '#cc473d',
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) {
                            return 'rgba(0, 0, 0, 0)';
                        }
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(204, 71, 61, 0)');
                        gradient.addColorStop(1, 'rgba(204, 71, 61, 0.2)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.5,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true, // Ensures the chart adjusts to container size
        maintainAspectRatio: false, // Allows custom height/width
        plugins: {
            legend: {
                position: 'top',
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        scales: {
            y: {
                display: false,
                grid: {
                    color: '#fff', // Change y-axis grid line color to dark gray
                },
            },
            x: {
                grid: {
                    color: '#444444', // Change y-axis grid line color to dark gray
                },
            }
        },
    };


    return (
        <div className="finance-container">
            <div className="balance">
                <div className={`card-${currentCard === 'wallet' ? 'wallet' : 'savings'}`}>
                    <div className="card-header">
                        <h2>{currentCard === 'wallet' ? 'Wallet' : 'Savings'}</h2>
                        <div className="switch-button">
                            <button onClick={handleSwitch}>◄</button>
                            <button onClick={handleSwitch}>►</button>
                        </div>
                    </div>
                    {renderCardContent()}
                </div>
            </div>
            <div className="report">
                <div style={{ height: '100%' }}> {/* Set a custom height for the chart */}
                    <Line data={generateChartData()} options={chartOptions} />
                </div>
            </div>
            <div className="history">
                <TransactionHistory transactions={transactions} onAddTransaction={handleAddTransaction} />
            </div>
        </div>
    );
};

export default Finance;

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/db_connect';
import { collection, query, onSnapshot } from 'firebase/firestore';
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

    useEffect(() => {
        const savingsTotal = transactions
            .filter((transaction) => transaction.category === 'savings')
            .reduce((total, transaction) => {
                return transaction.type === 'deposit'
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

        setTotalWallet(totalIncome - totalExpenses);
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

    const generateChartData = () => {
        // Extract all unique dates and sort them in ascending order
        const uniqueDates = [...new Set(transactions.map((t) =>
            new Date(t.date.seconds * 1000).toLocaleDateString()
        ))].sort((a, b) => new Date(a) - new Date(b));

        // Initialize datasets for income and expenses
        const incomeData = uniqueDates.map((date) => {
            const transaction = transactions.find(
                (t) => new Date(t.date.seconds * 1000).toLocaleDateString() === date && t.category === 'income'
            );
            return transaction ? transaction.amount : 0;
        });

        const expensesData = uniqueDates.map((date) => {
            const transaction = transactions.find(
                (t) => new Date(t.date.seconds * 1000).toLocaleDateString() === date && t.category === 'expenses'
            );
            return transaction ? transaction.amount : 0;
        });

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
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(96, 156, 82, 0)');
                        gradient.addColorStop(1, 'rgba(96, 156, 82, 0.2)');
                        return gradient;
                    },
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    borderColor: '#cc473d',
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(204, 71, 61, 0)');
                        gradient.addColorStop(1, 'rgba(204, 71, 61, 0.2)');
                        return gradient;
                    },
                    tension: 0.3,
                    fill: true
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
                <div className='history-data'>
                    <div className="history-header">
                        <h2>Transaction History</h2>
                        <button>+</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Transaction Name</th>
                                <th style={{ width: '30%', textAlign: 'center' }}>Category</th>
                                <th style={{ width: '30%' }}>Amount</th>
                            </tr>
                        </thead>
                    </table>
                    <div className='data'>
                        <table>
                            <tbody>
                                {[...transactions].reverse().map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td style={{ width: '40%' }}>
                                            <div>
                                                <h3>{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</h3>
                                                <p>
                                                    {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(transaction.date.seconds * 1000))} at {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(transaction.date.seconds * 1000))}
                                                </p>
                                            </div>
                                        </td>
                                        <td style={{ width: '30%', textAlign: 'center' }}>{transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</td>
                                        <td style={{ width: '30%', color: transaction.type === 'withdraw' || transaction.category === 'expenses' ? '#cc473d' : '#609c52' }}>
                                            <h3>
                                                {transaction.type === 'withdraw' || transaction.category === 'expenses' ? '- ' : ''}
                                                ₱
                                                <span className="amount">
                                                    {new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(transaction.amount)}
                                                </span>
                                            </h3>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finance;

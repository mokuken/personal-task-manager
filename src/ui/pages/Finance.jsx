import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/db_connect';
import { collection, query, onSnapshot } from 'firebase/firestore';
import '../styles/Finance.css';

const Finance = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalSavings, setTotalSavings] = useState(0);
    const [totalWallet, setTotalWallet] = useState(0); // New state for wallet balance
    const [currentCard, setCurrentCard] = useState('wallet'); // State to track the displayed card

    useEffect(() => {
        const q = query(collection(db, 'finance'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const transactionsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTransactions(transactionsData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Calculate total savings
        const savingsTotal = transactions
            .filter((transaction) => transaction.category === 'savings')
            .reduce((total, transaction) => {
                return transaction.type === 'deposit'
                    ? total + transaction.amount
                    : total - transaction.amount;
            }, 0);

        setTotalSavings(savingsTotal);

        // Calculate wallet balance
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
            <div className="report"></div>
            <div className="history">
                <h2>Transaction</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr key={transaction.id}>
                                <td>{index + 1}</td>
                                <td>{new Date(transaction.date.seconds * 1000).toLocaleDateString()}</td>
                                <td>{transaction.category}</td>
                                <td>{transaction.type}</td>
                                <td style={{ color: transaction.type === 'withdraw' || transaction.category === 'expenses' ? '#cc473d' : '#609c52' }}>
                                    ₱
                                    <span className="amount">
                                        {new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2 }).format(transaction.amount)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Finance;

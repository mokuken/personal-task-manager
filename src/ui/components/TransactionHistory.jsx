import React, { useState } from 'react';
import '../styles/Finance.css'; // Create a CSS file to style the modal

const TransactionHistory = ({ transactions, onAddTransaction }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        type: '', // default type
        category: 'income', // default category
        amount: '',
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTransaction = {
            ...formData,
            amount: parseFloat(formData.amount),
            date: new Date(), // add current date and time
        };
        onAddTransaction(newTransaction);
        setShowModal(false); // Close the modal after adding
        setFormData({ type: '', category: 'income', amount: '' }); // Reset form
    };

    return (
        <div className='history-data'>
            <div className="history-header">
                <h2>Transaction History</h2>
                <button onClick={() => setShowModal(true)}>+</button>
            </div>
            <div className='data'>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Transaction Name</th>
                            <th style={{ width: '30%', textAlign: 'center' }}>Category</th>
                            <th style={{ width: '30%' }}>Amount</th>
                        </tr>
                    </thead>
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

            {/* Modal for adding new transaction */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>ADD TRANSACTION</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Transaction Name</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange}>
                                    <option value="income">Income</option>
                                    <option value="expenses">Expenses</option>
                                    <option value="savings">Savings</option>
                                </select>
                            </div>
                            <div>
                                <label>Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <button type="submit">Add Transaction</button>
                            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;

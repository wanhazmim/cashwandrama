import { useState } from 'react';
import './App.css';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'];

function App() {
  const [transactions, setTransactions] = useState([
    { id: 1, description: 'Salary', amount: 3000, type: 'income', category: 'Other', date: '2026-06-01' },
    { id: 2, description: 'Rent', amount: 800, type: 'expense', category: 'Bills', date: '2026-06-02' },
    { id: 3, description: 'Groceries', amount: 120, type: 'expense', category: 'Food', date: '2026-06-05' },
  ]);
  const [form, setForm] = useState({ description: '', amount: '', type: 'expense', category: 'Food' });
  const [error, setError] = useState('');

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.description.trim()) { setError('Description is required'); return; }
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { setError('Enter a valid amount'); return; }
    setTransactions(prev => [
      ...prev,
      { id: Date.now(), description: form.description.trim(), amount, type: form.type, category: form.category, date: new Date().toISOString().slice(0, 10) },
    ]);
    setForm({ description: '', amount: '', type: 'expense', category: 'Food' });
    setError('');
  }

  function handleDelete(id) {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="cwd-root">
      <header className="cwd-header">
        <h1>CashWanDrama 💸</h1>
        <p className="cwd-tagline">Track every ringgit, no drama.</p>
      </header>

      <section className="cwd-summary">
        <div className="cwd-card cwd-income">
          <span>Income</span>
          <strong>RM {totalIncome.toFixed(2)}</strong>
        </div>
        <div className={`cwd-card cwd-balance ${balance < 0 ? 'negative' : ''}`}>
          <span>Balance</span>
          <strong>RM {balance.toFixed(2)}</strong>
        </div>
        <div className="cwd-card cwd-expense">
          <span>Expenses</span>
          <strong>RM {totalExpenses.toFixed(2)}</strong>
        </div>
      </section>

      <section className="cwd-form-section">
        <h2>Add Transaction</h2>
        <form className="cwd-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Amount (RM)"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          />
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button type="submit">Add</button>
        </form>
        {error && <p className="cwd-error">{error}</p>}
      </section>

      <section className="cwd-list-section">
        <h2>Transactions</h2>
        {transactions.length === 0 ? (
          <p className="cwd-empty">No transactions yet. Add one above!</p>
        ) : (
          <ul className="cwd-list">
            {[...transactions].reverse().map(t => (
              <li key={t.id} className={`cwd-item ${t.type}`}>
                <div className="cwd-item-main">
                  <span className="cwd-item-desc">{t.description}</span>
                  <span className="cwd-item-meta">{t.category} · {t.date}</span>
                </div>
                <span className="cwd-item-amount">
                  {t.type === 'income' ? '+' : '-'} RM {t.amount.toFixed(2)}
                </span>
                <button className="cwd-delete" onClick={() => handleDelete(t.id)} aria-label="Delete">✕</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;

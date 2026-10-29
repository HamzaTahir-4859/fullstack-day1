import React, { useState, useEffect, useCallback } from 'react';

export default function PaymentPage({ onBack }) {
  const [amount, setAmount] = useState('25');
  const [method, setMethod] = useState('Credit / Debit Card');
  const [description, setDescription] = useState('Pro Task Workspace Subscription');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [payments, setPayments] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('access_token');

  const fetchPayments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/auth/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  async function handlePayAdmin(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    setStatusMsg('');

    try {
      const res = await fetch('http://localhost:3000/auth/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg(`✅ Payment of $${amount} sent to Admin!`);
        fetchPayments();
      } else {
        setStatusMsg(`❌ Payment failed: ${data.message}`);
      }
    } catch (err) {
      setStatusMsg('❌ Network error sending payment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: '750px',
        margin: '30px auto',
        padding: '24px',
        border: '1px solid #ddd',
        borderRadius: '12px',
        backgroundColor: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>💳 Pay Admin Portal</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
            Send instant payments or subscription fees directly to the System Administrator
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ← Back to Tasks
          </button>
        )}
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '8px',
            backgroundColor: '#e6ffed',
            color: '#006622',
            border: '1px solid #8cd9a0',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {statusMsg}
        </div>
      )}

      <form
        onSubmit={handlePayAdmin}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' }}>
            Amount (USD $)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' }}>
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          >
            <option value="Credit / Debit Card">Credit / Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="NayaPay / Digital Wallet">NayaPay / Digital Wallet</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' }}>
            Card / Account Reference
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' }}>
            Payment Note / Purpose
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Processing Payment...' : `💸 Pay $${amount} to Admin Now`}
          </button>
        </div>
      </form>

      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🧾 Your Payment History</h3>
      {payments.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '14px' }}>No payments made yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '8px' }}>ID</th>
              <th style={{ padding: '8px' }}>Amount</th>
              <th style={{ padding: '8px' }}>Method</th>
              <th style={{ padding: '8px' }}>Description</th>
              <th style={{ padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px' }}>#{p.id}</td>
                <td style={{ padding: '8px', fontWeight: 'bold', color: '#16a34a' }}>${p.amount}</td>
                <td style={{ padding: '8px' }}>{p.method}</td>
                <td style={{ padding: '8px' }}>{p.description}</td>
                <td style={{ padding: '8px' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px' }}>
                    {p.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
import React, { useEffect, useState, useCallback } from 'react';

export default function AdminDashboard({ onLogout }) {
  const [data, setData] = useState({
    stats: { totalUsers: 0, totalAdmins: 0, totalTasks: 0, completedTasks: 0 },
    users: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const token = localStorage.getItem('access_token');

  const fetchAdminOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/auth/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdminOverview();
  }, [fetchAdminOverview]);

  async function handleRoleToggle(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const res = await fetch(`http://localhost:3000/auth/admin/users/${user.id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      setStatusMsg(`Updated ${user.email} role to ${newRole.toUpperCase()}`);
      fetchAdminOverview();
    }
  }

  async function handleDeleteUser(id, email) {
    if (!window.confirm(`Delete user ${email}?`)) return;
    const res = await fetch(`http://localhost:3000/auth/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setStatusMsg(`Deleted user ${email}`);
      fetchAdminOverview();
    }
  }

  async function handleAdminDeleteTask(taskId) {
    await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatusMsg(`Task #${taskId} removed by Admin`);
    fetchAdminOverview();
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '32px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Admin Top Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            padding: '20px 24px',
            borderRadius: '12px',
            border: '1px solid #334155',
            marginBottom: '24px',
          }}
        >
          <div>
            <span style={{ backgroundColor: '#dc2626', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
              ADMIN CONSOLE
            </span>
            <h1 style={{ margin: '8px 0 0 0', fontSize: '24px' }}>System Administration Portal</h1>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Exit Admin Portal
          </button>
        </header>

        {statusMsg && (
          <div style={{ padding: '12px 16px', backgroundColor: '#064e3b', border: '1px solid #10b981', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            ✅ {statusMsg}
          </div>
        )}

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Registered Users', value: data.stats.totalUsers, color: '#38bdf8' },
            { label: 'System Admins', value: data.stats.totalAdmins, color: '#f87171' },
            { label: 'Total System Tasks', value: data.stats.totalTasks, color: '#a78bfa' },
            { label: 'Completed Tasks', value: data.stats.completedTasks, color: '#4ade80' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{stat.label}</p>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '32px', color: stat.color }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {loading ? (
          <p>Loading system records...</p>
        ) : (
          <>
            {/* Section 1: User & Role Management */}
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px' }}>
              <h3 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                👥 Registered Users & Role Permissions (Day 28)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Role</th>
                    <th style={{ padding: '10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '10px' }}>#{u.id}</td>
                      <td style={{ padding: '10px' }}>{u.name}</td>
                      <td style={{ padding: '10px' }}>{u.email}</td>
                      <td style={{ padding: '10px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: u.role === 'admin' ? '#7f1d1d' : '#1e3a8a',
                            color: u.role === 'admin' ? '#fca5a5' : '#93c5fd',
                          }}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleRoleToggle(u)}
                          style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Make {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          style={{ padding: '6px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 2: All Database Tasks */}
            <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                📋 Global Task Database Audit
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Title</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tasks.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '10px' }}>#{t.id}</td>
                      <td style={{ padding: '10px' }}>{t.title}</td>
                      <td style={{ padding: '10px' }}>{t.status}</td>
                      <td style={{ padding: '10px' }}>
                        <button
                          onClick={() => handleAdminDeleteTask(t.id)}
                          style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Remove Task
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
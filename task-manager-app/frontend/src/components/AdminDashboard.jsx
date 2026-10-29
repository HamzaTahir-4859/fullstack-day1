import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

export default function AdminDashboard({ onLogout }) {
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalAdmins: 0,
      totalTasks: 0,
      completedTasks: 0,
      totalRevenue: 0,
    },
    users: [],
    tasks: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Live Chat State
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);
  const chatScrollBoxRef = useRef(null);

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
        const firstRegularUser =
          result.users.find((u) => u.role !== 'admin') || result.users[0];
        if (firstRegularUser && !selectedUserRef.current) {
          selectedUserRef.current = firstRegularUser;
          setSelectedUser(firstRegularUser);
        }
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

  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:3000', {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      if (selectedUserRef.current) {
        socket.emit('joinThread', { targetUserId: selectedUserRef.current.id });
      }
    });

    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('chatHistory', (payload) => {
      if (
        selectedUserRef.current &&
        Number(payload.userId) === Number(selectedUserRef.current.id)
      ) {
        setChatMessages(payload.messages || []);
      }
    });

    socket.on('newMessage', (msg) => {
      if (
        selectedUserRef.current &&
        Number(msg.userId) === Number(selectedUserRef.current.id)
      ) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (chatScrollBoxRef.current) {
      chatScrollBoxRef.current.scrollTop = chatScrollBoxRef.current.scrollHeight;
    }
  }, [chatMessages]);

  function handleSelectChatUser(user) {
    selectedUserRef.current = user;
    setSelectedUser(user);
    setChatMessages([]);
    if (socketRef.current) {
      socketRef.current.emit('joinThread', { targetUserId: user.id });
    }
  }

  function handleAdminSendMessage(e) {
    e.preventDefault();
    if (!chatInput.trim() || !selectedUser || !socketRef.current) return;

    socketRef.current.emit('sendMessage', {
      targetUserId: selectedUser.id,
      content: chatInput.trim(),
    });
    setChatInput('');
  }

  async function handleRoleToggle(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const res = await fetch(
      `http://localhost:3000/auth/admin/users/${user.id}/role`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      }
    );

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        overflow: 'hidden',
        zIndex: 9999,
        boxSizing: 'border-box',
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1e293b',
          padding: '14px 28px',
          borderBottom: '1px solid #334155',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              backgroundColor: '#dc2626',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
            }}
          >
            ADMIN CONSOLE
          </span>
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            System Administration Portal
          </h1>
          <button
            onClick={fetchAdminOverview}
            style={{
              padding: '5px 10px',
              backgroundColor: '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh Live Data
          </button>
          {statusMsg && (
            <span
              style={{
                padding: '4px 12px',
                backgroundColor: '#064e3b',
                border: '1px solid #10b981',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#a7f3d0',
              }}
            >
              ✅ {statusMsg}
            </span>
          )}
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Exit Admin Portal
        </button>
      </header>

      {/* Main Full-Screen Body */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '20px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Row: 5 Metrics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
            flexShrink: 0,
          }}
        >
          {[
            { label: 'Registered Users', value: data.stats.totalUsers, color: '#38bdf8' },
            { label: 'System Admins', value: data.stats.totalAdmins, color: '#f87171' },
            { label: 'Total Tasks Added', value: data.stats.totalTasks, color: '#a78bfa' },
            { label: 'Tasks Completed', value: data.stats.completedTasks, color: '#4ade80' },
            { label: 'Total Revenue Paid', value: `$${data.stats.totalRevenue || 0}`, color: '#facc15' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#1e293b',
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid #334155',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{stat.label}</p>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', color: stat.color }}>
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Workspace Grid */}
        <div
          style={{
            flex: 1,
            minHeight: '520px',
            display: 'grid',
            gridTemplateColumns: '1.45fr 1fr',
            gap: '20px',
          }}
        >
          {/* LEFT COLUMN: Tasks Who Added/Completed + Payments + Users */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* Table 1: Who Added & Completed Tasks */}
            <div
              style={{
                flex: 1.2,
                minHeight: 0,
                backgroundColor: '#1e293b',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                📋 Task Activity Monitor (Who Added & Who Completed Tasks)
              </h3>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '8px' }}>Task</th>
                      <th style={{ padding: '8px' }}>Added By User</th>
                      <th style={{ padding: '8px' }}>Completion Status</th>
                      <th style={{ padding: '8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tasks.map((t) => {
                      const isDone = t.status === 'completed';
                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            #{t.id} {t.title}
                          </td>
                          <td style={{ padding: '8px', color: '#38bdf8' }}>
                            👤 {t.userName} ({t.userEmail})
                          </td>
                          <td style={{ padding: '8px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: isDone ? '#064e3b' : '#78350f',
                                color: isDone ? '#4ade80' : '#fcd34d',
                              }}
                            >
                              {isDone
                                ? `✅ DONE BY ${t.userName.toUpperCase()}`
                                : `⏳ ADDED / IN PROGRESS`}
                            </span>
                          </td>
                          <td style={{ padding: '8px' }}>
                            <button
                              onClick={() => handleAdminDeleteTask(t.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '11px',
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Payments Received from Users */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                backgroundColor: '#1e293b',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                💸 Payments Received from Users
              </h3>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {(!data.payments || data.payments.length === 0) ? (
                  <p style={{ color: '#64748b', fontSize: '13px' }}>No user payments received yet.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '8px' }}>Paid By</th>
                        <th style={{ padding: '8px' }}>Amount</th>
                        <th style={{ padding: '8px' }}>Method</th>
                        <th style={{ padding: '8px' }}>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payments.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '8px' }}>
                            {p.userName} ({p.userEmail})
                          </td>
                          <td style={{ padding: '8px', color: '#4ade80', fontWeight: 'bold' }}>
                            +${p.amount}
                          </td>
                          <td style={{ padding: '8px' }}>{p.method}</td>
                          <td style={{ padding: '8px', color: '#cbd5e1' }}>{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Table 3: Registered Users */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                backgroundColor: '#1e293b',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
                👥 Registered Users & Roles
              </h3>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '6px' }}>ID</th>
                      <th style={{ padding: '6px' }}>Name</th>
                      <th style={{ padding: '6px' }}>Email</th>
                      <th style={{ padding: '6px' }}>Role</th>
                      <th style={{ padding: '6px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '6px' }}>#{u.id}</td>
                        <td style={{ padding: '6px' }}>{u.name}</td>
                        <td style={{ padding: '6px' }}>{u.email}</td>
                        <td style={{ padding: '6px' }}>{u.role.toUpperCase()}</td>
                        <td style={{ padding: '6px', display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleRoleToggle(u)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', cursor: 'pointer', fontSize: '11px' }}
                          >
                            Make {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', backgroundColor: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '11px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Support Chat */}
          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '18px',
              borderRadius: '12px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #334155',
                paddingBottom: '10px',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15px' }}>💬 Real-Time User Support Chat</h3>
              <span style={{ fontSize: '12px', color: socketConnected ? '#4ade80' : '#f87171' }}>
                ● {socketConnected ? 'Socket Connected' : 'Disconnected'}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: '12px',
                overflow: 'hidden',
              }}
            >
              <div style={{ borderRight: '1px solid #334155', paddingRight: '10px', overflowY: 'auto', minHeight: 0 }}>
                {data.users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectChatUser(u)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '6px',
                      backgroundColor: selectedUser?.id === u.id ? '#2563eb' : '#0f172a',
                      border: '1px solid #334155',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{u.name}</div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{u.email}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <div
                  ref={chatScrollBoxRef}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    padding: '12px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '10px',
                    border: '1px solid #334155',
                  }}
                >
                  {chatMessages.map((m) => {
                    const isAdmin = m.senderRole === 'admin';
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          backgroundColor: isAdmin ? '#dc2626' : '#334155',
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      >
                        <div style={{ fontSize: '10px', opacity: 0.85, fontWeight: 'bold' }}>
                          {isAdmin ? 'You (Admin)' : m.senderName}
                        </div>
                        <div>{m.content}</div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleAdminSendMessage} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={selectedUser ? `Reply to ${selectedUser.email}...` : 'Select user...'}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#fff',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
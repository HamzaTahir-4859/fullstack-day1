import React, { useState, useEffect, useRef } from 'react';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('access_token');

  // 1. Load Profile on Mount (GET /auth/profile)
  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:3000/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.email) {
          setProfile(data);
          setName(data.name || '');
          setBio(data.bio || '');
          setAvatar(data.avatar || '');
        }
      })
      .catch((err) => console.error('Failed to load profile:', err));
  }, [token]);

  // 2. Convert selected image file to Base64 string
  function handlePictureChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setIsEditing(true); // Automatically open edit mode so user can click Save
    };
    reader.readAsDataURL(file);
  }

  // 3. Save updated profile to Backend (PATCH /auth/profile)
  async function handleSaveProfile(e) {
    e.preventDefault();
    setStatusMsg('Saving...');

    try {
      const res = await fetch('http://localhost:3000/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio, avatar }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMsg(`Error: ${data.message}`);
        return;
      }

      setProfile(data.user);
      setIsEditing(false);
      setStatusMsg('Profile updated!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg('Network error saving profile.');
    }
  }

  if (!token) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        backgroundColor: '#fafafa',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Profile Avatar Circle */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#0066cc',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              border: '2px solid #ccc',
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (name || profile?.email || 'U')[0].toUpperCase()
            )}
          </div>

          {/* Profile Info */}
          <div>
            <h3 style={{ margin: 0 }}>{profile?.name || 'User'}</h3>
            <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>{profile?.email}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#333' }}>
              {profile?.bio || 'No bio added yet.'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Picture & Edit Profile */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePictureChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
            }}
          >
            📷 Add Picture
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid #0066cc',
              backgroundColor: isEditing ? '#eee' : '#0066cc',
              color: isEditing ? '#333' : '#fff',
            }}
          >
            {isEditing ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <span style={{ fontSize: '13px', color: '#006622', fontWeight: 'bold' }}>{statusMsg}</span>
      )}

      {/* Collapsible Edit Profile Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '10px',
            paddingTop: '12px',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Bio</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio about yourself"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Save Profile Changes
          </button>
        </form>
      )}
    </div>
  );
}
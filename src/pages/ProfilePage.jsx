import { useEffect, useState } from 'react';
import api from '../api';
import { setStoredUser } from '../utils/auth';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        department: '',
        profilePicture: '',
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile/me');
            setProfile(response.data);
            setForm({
                name: response.data.name || '',
                phone: response.data.phone || '',
                department: response.data.department || '',
                profilePicture: response.data.profilePicture || '',
            });
        } catch (error) {
            console.error('Profile fetch failed', error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const response = await api.put('/profile/me', form);
            setStoredUser(response.data);
            setProfile(response.data);
            setMsg({ text: 'Profile details updated successfully!', type: 'success' });
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Profile update failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return <div className="card empty-state">Loading user profile...</div>;
    }

    return (
        <div className="page-grid">
            <div className="card profile-card">
                <div className="profile-avatar">
                    {profile.profilePicture ? (
                        <img src={profile.profilePicture} alt="avatar" />
                    ) : (
                        (profile.name || 'U').charAt(0).toUpperCase()
                    )}
                </div>

                <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '1.3rem' }}>{profile.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge info">{profile.role}</span>
                        <span className="badge neutral">{profile.department || 'General'}</span>
                        <span className="badge success">● ACTIVE</span>
                    </div>
                    <p style={{ marginTop: '10px', marginBottom: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                        {profile.email} • {profile.phone || 'No phone set'}
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Account Details & Personal Information</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Update your personal information visible to your teammates
                        </p>
                    </div>
                </div>

                {msg.text ? (
                    <div className={`badge ${msg.type}`} style={{ marginBottom: '14px', padding: '6px 12px' }}>
                        {msg.text}
                    </div>
                ) : null}

                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Full Name</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Phone Number</label>
                        <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+92-300-1234567"
                        />
                    </div>

                    <div className="field">
                        <label>Department</label>
                        <input
                            value={form.department}
                            onChange={(e) => setForm({ ...form, department: e.target.value })}
                            placeholder="Engineering / HR"
                        />
                    </div>

                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <label>Profile Image URL</label>
                        <input
                            value={form.profilePicture}
                            onChange={(e) => setForm({ ...form, profilePicture: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <button className="primary-btn" type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;

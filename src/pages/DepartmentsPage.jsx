import { useEffect, useState } from 'react';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const initialForm = {
    name: '',
    description: '',
    headId: '',
};

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const currentUser = getStoredUser();
    const canManageDept = ['SUPER_ADMIN', 'CEO', 'HR'].includes(currentUser?.role);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Departments fetch failed', error);
        }
    };

    const fetchUsers = async () => {
        if (canManageDept) {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Users fetch failed', error);
            }
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            await api.post('/departments', form);
            setMsg({ text: 'Department registered successfully!', type: 'success' });
            setForm(initialForm);
            fetchDepartments();
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Department creation failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-grid">
            {/* Create Department Form for Super Admin, CEO, HR */}
            {canManageDept ? (
                <div className="card">
                    <div className="page-header">
                        <div>
                            <h3>Create Organizational Department</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Structure business units and appoint departmental leadership
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
                            <label>Department Name *</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Quality Assurance & Testing"
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Department Head</label>
                            <select
                                value={form.headId}
                                onChange={(e) => setForm({ ...form, headId: e.target.value })}
                            >
                                <option value="">Select Department Lead</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>Description & Scope</label>
                            <textarea
                                rows="3"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="State primary departmental responsibilities..."
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Department'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            {/* Departments Table */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Organizational Departments</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Active business units and functional divisions
                        </p>
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Department Name</th>
                                <th>Description</th>
                                <th>Head Lead</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.length ? (
                                departments.map((item) => {
                                    const headUser = users.find((u) => u.id === item.headId);
                                    return (
                                        <tr key={item.id || item._id}>
                                            <td style={{ fontWeight: 700 }}>{item.name}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{item.description || '-'}</td>
                                            <td>
                                                <span className="badge neutral">
                                                    {headUser ? headUser.name : (item.headId || 'Unassigned')}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="3" className="empty-state">
                                        No departments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepartmentsPage;

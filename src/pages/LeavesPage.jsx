import { useEffect, useState } from 'react';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const initialForm = {
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
};

const LeavesPage = () => {
    const [leaves, setLeaves] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const currentUser = getStoredUser();
    const canManageLeaves = ['SUPER_ADMIN', 'HR', 'CEO', 'MANAGER'].includes(currentUser?.role);

    const fetchLeaves = async () => {
        try {
            const response = await api.get('/leaves');
            setLeaves(response.data);
        } catch (error) {
            console.error('Leaves fetch failed', error);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            await api.post('/leaves', form);
            setMsg({ text: 'Leave application submitted successfully!', type: 'success' });
            setForm(initialForm);
            fetchLeaves();
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Leave request failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (leaveId, status) => {
        try {
            await api.patch(`/leaves/${leaveId}/status`, { status });
            fetchLeaves();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update leave status.');
        }
    };

    return (
        <div className="page-grid">
            {/* Apply for Leave Form */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Request Time Off / Leave</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Submit an official leave request for approval by management / HR
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
                        <label>Leave Type *</label>
                        <select
                            value={form.leaveType}
                            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                        >
                            <option value="CASUAL">Casual Leave</option>
                            <option value="ANNUAL">Annual Leave</option>
                            <option value="SICK">Sick Leave</option>
                            <option value="MATERNITY">Maternity / Paternity</option>
                            <option value="UNPAID">Unpaid Leave</option>
                        </select>
                    </div>

                    <div className="field">
                        <label>Start Date *</label>
                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="field">
                        <label>End Date *</label>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <label>Reason / Notes</label>
                        <textarea
                            rows="2"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="State reason for absence..."
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <button className="primary-btn" type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Leave Application'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Leave Applications Table */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Leave Applications & Approvals</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {canManageLeaves
                                ? 'Review and manage team leave requests'
                                : 'Track status of submitted leave applications'}
                        </p>
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Department</th>
                                <th>Leave Type</th>
                                <th>Duration</th>
                                <th>Reason</th>
                                <th>Status</th>
                                {canManageLeaves ? <th>HR / Admin Action</th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.length ? (
                                leaves.map((item) => (
                                    <tr key={item.id || item._id}>
                                        <td style={{ fontWeight: 600 }}>{item.userName || 'Employee'}</td>
                                        <td>{item.department || 'General'}</td>
                                        <td><span className="badge neutral">{item.leaveType}</span></td>
                                        <td>
                                            {new Date(item.startDate).toLocaleDateString()} ➔ {new Date(item.endDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            {item.reason || '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                                                {item.status || 'PENDING'}
                                            </span>
                                        </td>
                                        {canManageLeaves ? (
                                            <td>
                                                {item.status === 'PENDING' ? (
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            className="success-btn"
                                                            onClick={() => handleStatusChange(item.id || item._id, 'APPROVED')}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="danger-btn"
                                                            onClick={() => handleStatusChange(item.id || item._id, 'REJECTED')}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Decision Recorded</span>
                                                )}
                                            </td>
                                        ) : null}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={canManageLeaves ? 7 : 6} className="empty-state">
                                        No leave requests submitted yet.
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

export default LeavesPage;

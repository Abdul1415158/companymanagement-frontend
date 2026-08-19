import { useEffect, useState } from 'react';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const initialForm = {
    userId: '',
    month: new Date().toISOString().slice(0, 7),
    basicSalary: '',
    allowances: '0',
    deductions: '0',
};

const PayrollPage = () => {
    const [rows, setRows] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const currentUser = getStoredUser();
    const canManagePayroll = ['SUPER_ADMIN', 'HR'].includes(currentUser?.role);
    const isExecutive = ['SUPER_ADMIN', 'HR', 'CEO'].includes(currentUser?.role);

    const fetchPayroll = async () => {
        try {
            const response = await api.get('/payroll');
            setRows(response.data || []);
        } catch (error) {
            console.error('Payroll fetch failed', error);
        }
    };

    const fetchUsers = async () => {
        if (canManagePayroll) {
            try {
                const response = await api.get('/users');
                const staffUsers = (response.data || []).filter(u => u.role !== 'CANDIDATE');
                setUsers(staffUsers);
                if (staffUsers.length > 0 && !form.userId) {
                    setForm((prev) => ({ ...prev, userId: staffUsers[0].id }));
                }
            } catch (error) {
                console.error('Users fetch failed', error);
            }
        }
    };

    useEffect(() => {
        fetchPayroll();
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            await api.post('/payroll', form);
            setMsg({ text: 'Payroll record generated and disbursed successfully!', type: 'success' });
            setForm((prev) => ({ ...initialForm, userId: users[0]?.id || '' }));
            fetchPayroll();
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Payroll generation failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    // Calculate total net disbursement for management view
    const totalDisbursed = rows.reduce((acc, curr) => acc + (Number(curr.netSalary) || 0), 0);

    return (
        <div className="page-grid">
            {/* If High Post (Super Admin or HR), show the Payroll Generation Form */}
            {canManagePayroll ? (
                <div className="card">
                    <div className="page-header">
                        <div>
                            <h3>Process & Disburse Employee Payroll</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Generate monthly compensation slips and record salary disbursements with disburser tracking
                            </p>
                        </div>
                        <span className="badge info">HR & Admin Authorized</span>
                    </div>

                    {msg.text ? (
                        <div className={`badge ${msg.type}`} style={{ marginBottom: '14px', padding: '6px 12px' }}>
                            {msg.text}
                        </div>
                    ) : null}

                    <form className="form-grid" onSubmit={handleSubmit}>
                        <div className="field">
                            <label>Select Staff Member *</label>
                            <select
                                value={form.userId}
                                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                                required
                            >
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.role} - {u.department})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Pay Month *</label>
                            <input
                                type="month"
                                value={form.month}
                                onChange={(e) => setForm({ ...form, month: e.target.value })}
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Basic Salary (PKR) *</label>
                            <input
                                type="number"
                                min="0"
                                value={form.basicSalary}
                                onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                                placeholder="e.g. 100000"
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Allowances / Bonuses (PKR)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.allowances}
                                onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div className="field">
                            <label>Deductions / Taxes (PKR)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.deductions}
                                onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? 'Processing...' : 'Disburse & Record Payroll'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            {/* Payroll / Payslip Records View */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>{isExecutive ? 'Company Payroll History & Disbursements' : 'My Personal Payslips'}</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {isExecutive
                                ? `Total Disbursed: PKR ${totalDisbursed.toLocaleString()} across ${rows.length} records`
                                : 'View your monthly salary breakdown, disburser details, and payment slips'}
                        </p>
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Month</th>
                                <th>Basic Salary</th>
                                <th>Allowances</th>
                                <th>Deductions</th>
                                <th>Net Salary</th>
                                <th>Status</th>
                                <th>Disbursed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length ? (
                                rows.map((row) => (
                                    <tr key={row.id || row._id}>
                                        <td style={{ fontWeight: 600 }}>
                                            {row.userName || 'Employee'}
                                            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                {row.department} • {row.userRole}
                                            </span>
                                        </td>
                                        <td><strong>{row.month}</strong></td>
                                        <td>PKR {Number(row.basicSalary).toLocaleString()}</td>
                                        <td style={{ color: 'var(--success)' }}>+PKR {Number(row.allowances || 0).toLocaleString()}</td>
                                        <td style={{ color: 'var(--danger)' }}>-PKR {Number(row.deductions || 0).toLocaleString()}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--primary-text)' }}>
                                            PKR {Number(row.netSalary).toLocaleString()}
                                        </td>
                                        <td>
                                            <span className="badge success">{row.status || 'PAID'}</span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                                                {row.disbursedByName || 'HR / Admin'}
                                            </span>
                                            {row.disbursedByRole ? (
                                                <span className="badge neutral" style={{ marginLeft: '6px', fontSize: '0.66rem' }}>
                                                    {row.disbursedByRole}
                                                </span>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="empty-state">
                                        No payroll slips available.
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

export default PayrollPage;

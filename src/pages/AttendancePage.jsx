import { useEffect, useState } from 'react';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const AttendancePage = () => {
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const currentUser = getStoredUser();
    const todayStr = new Date().toISOString().slice(0, 10);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance');
            setRecords(response.data || []);
        } catch (error) {
            console.error('Attendance fetch failed', error);
        }
    };

    useEffect(() => {
        fetchAttendance();
        const interval = setInterval(fetchAttendance, 6000);
        return () => clearInterval(interval);
    }, []);

    // Find current logged-in user's record for today
    const myTodayRecord = records.find((r) => {
        const rUserId = (typeof r.userId === 'object' && r.userId !== null)
            ? (r.userId._id || r.userId.id)
            : r.userId;
        const cUserId = currentUser?.id || currentUser?._id;

        const isSameUser =
            (rUserId && cUserId && String(rUserId) === String(cUserId)) ||
            (r.userEmail && currentUser?.email && r.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
            (r.userName && currentUser?.name && r.userName.toLowerCase() === currentUser.name.toLowerCase());

        return isSameUser && r.date === todayStr;
    });

    const handleCheckIn = async () => {
        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            const res = await api.post('/attendance/checkin');
            setMsg({ text: res.data.message || 'Check-in successful!', type: 'success' });
            await fetchAttendance();
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Check-in failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            const res = await api.post('/attendance/checkout');
            setMsg({ text: res.data.message || 'Check-out successful!', type: 'success' });
            await fetchAttendance();
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Check-out failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter((rec) => {
        const matchesSearch =
            !searchTerm ||
            (rec.userName && rec.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rec.department && rec.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rec.userRole && rec.userRole.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rec.userEmail && rec.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDate = !dateFilter || rec.date === dateFilter;

        return matchesSearch && matchesDate;
    });

    return (
        <div className="page-grid">
            {/* Personal Check In / Check Out Card */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>My Daily Attendance</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Logged in as <strong>{currentUser?.name || 'User'}</strong> ({currentUser?.role || 'EMPLOYEE'}) • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            className="primary-btn"
                            onClick={handleCheckIn}
                            disabled={loading || Boolean(myTodayRecord?.checkIn)}
                        >
                            {myTodayRecord?.checkIn ? '✓ Checked In' : 'Check In'}
                        </button>
                        <button
                            className="secondary-btn"
                            onClick={handleCheckOut}
                            disabled={loading || !myTodayRecord?.checkIn || Boolean(myTodayRecord?.checkOut)}
                        >
                            {myTodayRecord?.checkOut ? '✓ Checked Out' : 'Check Out'}
                        </button>
                    </div>
                </div>

                {msg.text ? (
                    <div className={`badge ${msg.type}`} style={{ marginBottom: '12px', padding: '6px 12px' }}>
                        {msg.text}
                    </div>
                ) : null}

                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--panel-alt)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S STATUS</div>
                        <div style={{ marginTop: '4px', fontWeight: 700 }}>
                            {myTodayRecord ? (
                                <span className="badge success">{myTodayRecord.status || 'PRESENT'}</span>
                            ) : (
                                <span className="badge warning">NOT MARKED</span>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--panel-alt)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHECK-IN TIME</div>
                        <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--primary-text)' }}>
                            {myTodayRecord?.checkIn ? new Date(myTodayRecord.checkIn).toLocaleTimeString() : '--:--'}
                        </div>
                    </div>

                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--panel-alt)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHECK-OUT TIME</div>
                        <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--text)' }}>
                            {myTodayRecord?.checkOut ? new Date(myTodayRecord.checkOut).toLocaleTimeString() : '--:--'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Company-Wide Attendance Log */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Live Company Attendance Log</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            All check-ins and check-outs across the organization ({filteredRecords.length} records)
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Search employee / dept..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                fontSize: '0.82rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--panel-alt)',
                                color: 'var(--text)'
                            }}
                        />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{
                                padding: '6px 10px',
                                fontSize: '0.82rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--panel-alt)',
                                color: 'var(--text)'
                            }}
                        />
                        {dateFilter ? (
                            <button className="secondary-btn" onClick={() => setDateFilter('')} style={{ padding: '6px 10px', fontSize: '0.8rem' }}>
                                Clear Date
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length ? (
                                filteredRecords.map((record) => {
                                    const isCurrent =
                                        (record.userId && currentUser?.id && String(record.userId) === String(currentUser.id)) ||
                                        (record.userEmail && currentUser?.email && record.userEmail.toLowerCase() === currentUser.email.toLowerCase());

                                    return (
                                        <tr key={record.id || record._id}>
                                            <td style={{ fontWeight: 600 }}>
                                                {record.userName || 'Staff Member'} {isCurrent ? '(You)' : ''}
                                                {record.userEmail ? (
                                                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                        {record.userEmail}
                                                    </span>
                                                ) : null}
                                            </td>
                                            <td>
                                                <span className="badge neutral">{record.userRole || 'EMPLOYEE'}</span>
                                            </td>
                                            <td>{record.department || 'General'}</td>
                                            <td>{record.date}</td>
                                            <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                {record.checkOut ? (
                                                    new Date(record.checkOut).toLocaleTimeString()
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Active / Working</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${record.status === 'PRESENT' ? 'success' : 'warning'}`}>
                                                    {record.status || 'PRESENT'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No attendance records found for the selected criteria.
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

export default AttendancePage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const HomePage = () => {
    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalAttendance: 0,
        totalTasks: 0,
        totalLeaves: 0,
        totalPayroll: 0,
        totalCandidates: 0,
        totalProjects: 0,
        totalDepartments: 0,
        activeUsersCount: 0,
        activeUsers: [],
        todayAttendanceCount: 0,
        todayAttendance: [],
    });
    const [myApplications, setMyApplications] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const currentUser = getStoredUser();
    const userRole = currentUser?.role || 'CANDIDATE';

    const fetchSummary = async () => {
        try {
            const response = await api.get('/dashboard/summary');
            setSummary(response.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Dashboard summary fetch failed', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPersonalData = async () => {
        if (userRole === 'CANDIDATE') {
            try {
                const res = await api.get('/candidates');
                setMyApplications(res.data || []);
            } catch (err) {}
        } else {
            try {
                const res = await api.get('/tasks');
                const userTasks = (res.data || []).filter(t => 
                    String(t.assignedTo) === String(currentUser?.id) || 
                    String(t.assignedToId) === String(currentUser?.id)
                );
                setMyTasks(userTasks);
            } catch (err) {}
        }
    };

    useEffect(() => {
        fetchSummary();
        fetchPersonalData();

        // Automatic polling every 8 seconds for live dashboard updates
        const timer = setInterval(() => {
            fetchSummary();
        }, 8000);

        return () => clearInterval(timer);
    }, [userRole]);

    // Dashboard Title & Subtitle based on role
    const getDashboardHeader = () => {
        switch (userRole) {
            case 'SUPER_ADMIN':
                return {
                    title: 'System Administration Dashboard',
                    subtitle: 'Full system health, user permissions, and real-time operations',
                };
            case 'CEO':
                return {
                    title: 'Executive CEO Overview',
                    subtitle: 'Company performance, department analytics, and high-level summaries',
                };
            case 'CTO':
                return {
                    title: 'Technical Leadership Dashboard',
                    subtitle: 'Engineering projects, technical tasks, and development operations',
                };
            case 'CMO':
                return {
                    title: 'Marketing Leadership Dashboard',
                    subtitle: 'Marketing campaigns, projects, talent acquisition, and performance',
                };
            case 'HR':
                return {
                    title: 'HR & People Operations Dashboard',
                    subtitle: 'Talent management, daily attendance, leave approvals, and payroll',
                };
            case 'MANAGER':
                return {
                    title: 'Team Manager Dashboard',
                    subtitle: 'Team tasks, leave approvals, project milestones, and team attendance',
                };
            case 'INTERN':
                return {
                    title: 'Intern Workspace Dashboard',
                    subtitle: 'Assigned tasks, learning progress, and personal attendance',
                };
            case 'EMPLOYEE':
                return {
                    title: 'Employee Workspace Dashboard',
                    subtitle: 'My daily attendance, assigned tasks, leave balances, and salary slips',
                };
            case 'CANDIDATE':
            default:
                return {
                    title: 'Candidate Application Portal',
                    subtitle: 'Track your job applications, view available openings, and manage profile',
                };
        }
    };

    const headerInfo = getDashboardHeader();

    // Render Candidate-specific dashboard
    if (userRole === 'CANDIDATE') {
        const latestApp = myApplications[0];
        const candidateSteps = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'HIRED'];
        const stageMessages = {
            APPLIED: 'Application Received: Thank you for applying! Our talent acquisition team will review your qualifications.',
            UNDER_REVIEW: 'Under Review: Your profile and qualifications are actively being reviewed by the hiring team.',
            SHORTLISTED: 'Shortlisted: Congratulations! Your application has been shortlisted for the evaluation round.',
            INTERVIEW: 'Interview Round: You have progressed to the interview stage. HR will contact you with scheduling details.',
            SELECTED: 'Offer Selected: Congratulations! You have been selected. Our HR department is preparing your offer details.',
            HIRED: 'Hired & Onboarded: Welcome to the company! Your staff onboarding credentials will be issued.',
            REJECTED: 'Application Concluded: Thank you for your interest. We have decided to proceed with other applicants at this time.',
        };

        const currentStageMessage = latestApp ? (stageMessages[latestApp.status] || 'Application submitted.') : null;

        return (
            <div className="page-grid">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem' }}>{headerInfo.title}</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {headerInfo.subtitle} • Live synced
                        </p>
                    </div>
                    <Link to="/candidates" className="primary-btn" style={{ textDecoration: 'none' }}>
                        Browse Open Jobs & Apply
                    </Link>
                </div>

                <div className="stats-grid">
                    <div className="card stat-card stat-blue">
                        <div className="stat-label">Applications Submitted</div>
                        <div className="stat-value">{myApplications.length}</div>
                        <div className="stat-trend">Active Submissions</div>
                    </div>
                    <div className="card stat-card stat-green">
                        <div className="stat-label">Current Stage</div>
                        <div className="stat-value">
                            {latestApp ? (latestApp.status?.replace('_', ' ') || 'APPLIED') : 'None'}
                        </div>
                        <div className="stat-trend">Latest Application</div>
                    </div>
                    <div className="card stat-card stat-amber">
                        <div className="stat-label">Career Openings</div>
                        <div className="stat-value">5</div>
                        <div className="stat-trend">Available Roles</div>
                    </div>
                </div>

                {latestApp ? (
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <div className="page-header">
                            <div>
                                <h3>Active Application Progression</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Position Applied: <strong>{latestApp.positionApplied || latestApp.roleApplied}</strong>
                                </p>
                            </div>
                            <span className="badge info" style={{ padding: '5px 12px' }}>
                                Stage: {latestApp.status?.replace('_', ' ')}
                            </span>
                        </div>

                        {latestApp.status !== 'REJECTED' ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: '14px 0',
                                gap: '6px',
                                flexWrap: 'wrap'
                            }}>
                                {candidateSteps.map((stepKey, idx) => {
                                    const currentStepIdx = candidateSteps.indexOf(latestApp.status) >= 0
                                        ? candidateSteps.indexOf(latestApp.status)
                                        : 0;
                                    const isPassed = idx <= currentStepIdx;
                                    const isCurrent = idx === currentStepIdx;

                                    return (
                                        <div
                                            key={stepKey}
                                            style={{
                                                flex: '1 1 100px',
                                                padding: '8px',
                                                borderRadius: 'var(--radius-sm)',
                                                textAlign: 'center',
                                                backgroundColor: isCurrent ? 'var(--primary-soft)' : (isPassed ? 'var(--panel-alt)' : 'transparent'),
                                                border: `1px solid ${isCurrent ? 'var(--primary)' : (isPassed ? 'var(--border-subtle)' : 'var(--border)')}`,
                                            }}
                                        >
                                            <div style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: isCurrent ? 'var(--primary-text)' : (isPassed ? 'var(--text)' : 'var(--text-muted)')
                                            }}>
                                                {idx + 1}. {stepKey.replace('_', ' ')}
                                            </div>
                                            <div style={{ fontSize: '0.64rem', color: isPassed ? 'var(--success)' : 'var(--text-muted)', marginTop: '2px' }}>
                                                {isCurrent ? '● Active' : (isPassed ? '✓ Completed' : 'Pending')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}

                        <div style={{
                            padding: '12px 14px',
                            backgroundColor: 'var(--panel-alt)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.84rem',
                            lineHeight: 1.5
                        }}>
                            📢 <strong>Status Update:</strong> {currentStageMessage}
                        </div>
                    </div>
                ) : null}

                <div className="card">
                    <div className="page-header">
                        <div>
                            <h3>My Applications</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Live tracking for applications registered with {currentUser?.email}
                            </p>
                        </div>
                        <Link to="/candidates" className="secondary-btn" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.8rem' }}>
                            View Career Portal
                        </Link>
                    </div>

                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Position Applied</th>
                                    <th>Organization</th>
                                    <th>Stage</th>
                                    <th>Date Applied</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myApplications.length > 0 ? (
                                    myApplications.map((app) => (
                                        <tr key={app.id || app._id}>
                                            <td style={{ fontWeight: 600 }}>{app.positionApplied || app.roleApplied || 'General'}</td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Company Management System</td>
                                            <td>
                                                <span className={`badge ${
                                                    app.status === 'HIRED' || app.status === 'SELECTED' ? 'success' : 
                                                    app.status === 'REJECTED' ? 'danger' : 
                                                    app.status === 'INTERVIEW' || app.status === 'SHORTLISTED' || app.status === 'UNDER_REVIEW' ? 'info' : 'warning'
                                                }`}>
                                                    {app.status?.replace('_', ' ') || 'APPLIED'}
                                                </span>
                                            </td>
                                            <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}</td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : (app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            You haven't submitted any job applications yet.{' '}
                                            <Link to="/candidates" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                Apply now.
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Dynamic stats cards tailored for staff roles
    const getRoleStats = () => {
        if (userRole === 'SUPER_ADMIN') {
            return [
                { label: 'Active Users Online', value: summary.activeUsersCount || 0, color: 'stat-green', trend: 'Live Right Now' },
                { label: 'Total Accounts', value: summary.totalUsers || 0, color: 'stat-blue', trend: 'Across System' },
                { label: 'Today Attendance', value: summary.todayAttendanceCount || 0, color: 'stat-amber', trend: 'Checked In' },
                { label: 'Tasks in System', value: summary.totalTasks || 0, color: 'stat-blue', trend: 'All Departments' },
                { label: 'Active Projects', value: summary.totalProjects || 0, color: 'stat-green', trend: 'Active' },
                { label: 'Pending Leaves', value: summary.totalLeaves || 0, color: 'stat-rose', trend: 'Requires Action' },
                { label: 'Candidates', value: summary.totalCandidates || 0, color: 'stat-amber', trend: 'In Pipeline' },
                { label: 'Departments', value: summary.totalDepartments || 0, color: 'stat-blue', trend: 'Configured' },
            ];
        }
        if (userRole === 'HR') {
            return [
                { label: 'Total Employees', value: summary.totalUsers || 0, color: 'stat-blue', trend: 'Active Staff' },
                { label: 'Today Attendance', value: summary.todayAttendanceCount || 0, color: 'stat-green', trend: 'Present Today' },
                { label: 'Pending Leaves', value: summary.totalLeaves || 0, color: 'stat-rose', trend: 'Pending Approval' },
                { label: 'Candidates Pipeline', value: summary.totalCandidates || 0, color: 'stat-amber', trend: 'Active Applicants' },
                { label: 'Payroll Records', value: summary.totalPayroll || 0, color: 'stat-blue', trend: 'Disbursements' },
                { label: 'Active Online', value: summary.activeUsersCount || 0, color: 'stat-green', trend: 'Logged In' },
            ];
        }
        if (userRole === 'CEO') {
            return [
                { label: 'Company Headcount', value: summary.totalUsers || 0, color: 'stat-blue', trend: 'Total Staff' },
                { label: 'Active Projects', value: summary.totalProjects || 0, color: 'stat-green', trend: 'Across Depts' },
                { label: 'Departments', value: summary.totalDepartments || 0, color: 'stat-blue', trend: 'Operational' },
                { label: 'Today Attendance', value: summary.todayAttendanceCount || 0, color: 'stat-amber', trend: 'Present' },
                { label: 'Active Tasks', value: summary.totalTasks || 0, color: 'stat-blue', trend: 'In Progress' },
                { label: 'Active Online', value: summary.activeUsersCount || 0, color: 'stat-green', trend: 'Logged In' },
            ];
        }
        if (userRole === 'CTO') {
            return [
                { label: 'Active Tech Projects', value: summary.totalProjects || 0, color: 'stat-green', trend: 'Development' },
                { label: 'Technical Tasks', value: summary.totalTasks || 0, color: 'stat-blue', trend: 'Engineering' },
                { label: 'Active Online', value: summary.activeUsersCount || 0, color: 'stat-green', trend: 'Logged In' },
                { label: 'Today Attendance', value: summary.todayAttendanceCount || 0, color: 'stat-amber', trend: 'Marked' },
            ];
        }
        if (userRole === 'CMO') {
            return [
                { label: 'Active Campaigns', value: summary.totalProjects || 0, color: 'stat-green', trend: 'Marketing' },
                { label: 'Marketing Tasks', value: summary.totalTasks || 0, color: 'stat-blue', trend: 'Assigned' },
                { label: 'Recruitment Candidates', value: summary.totalCandidates || 0, color: 'stat-amber', trend: 'In Pipeline' },
                { label: 'Active Online', value: summary.activeUsersCount || 0, color: 'stat-green', trend: 'Logged In' },
            ];
        }
        if (userRole === 'MANAGER') {
            return [
                { label: 'Team Tasks', value: summary.totalTasks || 0, color: 'stat-blue', trend: 'Assigned' },
                { label: 'Active Projects', value: summary.totalProjects || 0, color: 'stat-green', trend: 'Milestones' },
                { label: 'Pending Leaves', value: summary.totalLeaves || 0, color: 'stat-rose', trend: 'To Review' },
                { label: 'Today Attendance', value: summary.todayAttendanceCount || 0, color: 'stat-amber', trend: 'Logged' },
            ];
        }
        // EMPLOYEE & INTERN
        return [
            { label: 'My Assigned Tasks', value: myTasks.length || 0, color: 'stat-blue', trend: 'Pending Action' },
            { label: 'Today Attendance', value: summary.todayAttendanceCount || 0, color: 'stat-green', trend: 'Company Check-ins' },
            { label: 'Active Projects', value: summary.totalProjects || 0, color: 'stat-blue', trend: 'Involved' },
            { label: 'Team Online', value: summary.activeUsersCount || 0, color: 'stat-green', trend: 'Colleagues Online' },
        ];
    };

    const stats = getRoleStats();

    return (
        <div className="page-grid">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{headerInfo.title}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {headerInfo.subtitle} • Synced at {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="secondary-btn" onClick={fetchSummary} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        🔄 Refresh Data
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid">
                {stats.map((item) => (
                    <div className={`card stat-card ${item.color}`} key={item.label}>
                        <div className="stat-label">{item.label}</div>
                        <div className="stat-value">{item.value}</div>
                        <div className="stat-trend">{item.trend}</div>
                    </div>
                ))}
            </div>

            {/* Live Active Logged-in Users Section */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                            <h3 style={{ margin: 0 }}>Active Logged-in Team Members</h3>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Colleagues currently logged in and active
                        </p>
                    </div>
                    <span className="badge success">
                        {summary.activeUsers?.length || 0} Online
                    </span>
                </div>

                {summary.activeUsers && summary.activeUsers.length > 0 ? (
                    <div className="online-users-container">
                        {summary.activeUsers.map((u) => (
                            <div className="online-user-badge" key={u.id}>
                                <div className="online-user-avatar">
                                    {u.profilePicture ? <img src={u.profilePicture} alt={u.name} /> : (u.name || 'U').charAt(0).toUpperCase()}
                                    <span className="online-dot" />
                                </div>
                                <div className="online-user-info">
                                    <div className="online-user-name">
                                        {u.name} {u.id === currentUser?.id ? '(You)' : ''}
                                    </div>
                                    <div className="online-user-meta">
                                        <span className="badge info" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>{u.role}</span>
                                        <span>{u.department}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        No other active users online right now.
                    </div>
                )}
            </div>

            {/* Today's Attendance Activity Section */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Today's Attendance Activity</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Real-time check-in status for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <Link to="/attendance" className="secondary-btn" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.8rem' }}>
                        Open Full Attendance Roster
                    </Link>
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Check-in Time</th>
                                <th>Check-out Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.todayAttendance && summary.todayAttendance.length > 0 ? (
                                summary.todayAttendance.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.userName}</td>
                                        <td><span className="badge neutral">{item.userRole}</span></td>
                                        <td>{item.department}</td>
                                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                                            {item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : '-'}
                                        </td>
                                        <td>
                                            {item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Currently Working</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${item.status === 'PRESENT' ? 'success' : 'warning'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        No attendance entries recorded yet for today.
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

export default HomePage;

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { clearStoredUser, clearToken, getStoredUser } from '../utils/auth';
import api from '../api';

const navigation = [
    {
        label: 'Dashboard',
        path: '/',
        roles: ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR', 'MANAGER', 'EMPLOYEE', 'INTERN', 'CANDIDATE']
    },
    {
        label: 'Attendance',
        path: '/attendance',
        roles: ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR', 'MANAGER', 'EMPLOYEE', 'INTERN']
    },
    {
        label: 'Tasks',
        path: '/tasks',
        roles: ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR', 'MANAGER', 'EMPLOYEE', 'INTERN']
    },
    {
        label: 'Projects',
        path: '/projects',
        roles: ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'MANAGER', 'EMPLOYEE', 'INTERN']
    },
    {
        label: 'Leaves',
        path: '/leaves',
        roles: ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR', 'MANAGER', 'EMPLOYEE', 'INTERN']
    },
    {
        label: 'Departments',
        path: '/departments',
        roles: ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR']
    },
    {
        label: 'User Management',
        path: '/users',
        roles: ['SUPER_ADMIN', 'HR']
    },
    {
        label: 'Team Directory',
        path: '/users',
        roles: ['CEO', 'CTO', 'CMO', 'MANAGER', 'EMPLOYEE', 'INTERN']
    },
    {
        label: 'Salary / Payroll',
        path: '/payroll',
        roles: ['SUPER_ADMIN', 'HR', 'CEO', 'CTO', 'CMO', 'MANAGER', 'EMPLOYEE', 'INTERN']
    },
    {
        label: 'Recruitment & Hiring',
        path: '/candidates',
        roles: ['SUPER_ADMIN', 'HR', 'CEO', 'CMO']
    },
    {
        label: 'Job Openings & Status',
        path: '/candidates',
        roles: ['CANDIDATE']
    },
    {
        label: 'My Profile',
        path: '/profile',
        roles: ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR', 'MANAGER', 'EMPLOYEE', 'INTERN', 'CANDIDATE']
    },
];

const DashboardLayout = ({ theme, setTheme }) => {
    const navigate = useNavigate();
    const user = getStoredUser();
    const userRole = user?.role || 'EMPLOYEE';

    // Filter navigation matching current user's role without duplicate paths
    const visibleNavigation = [];
    const seenPaths = new Set();

    for (const item of navigation) {
        if (item.roles.includes(userRole) && !seenPaths.has(item.path)) {
            visibleNavigation.push(item);
            seenPaths.add(item.path);
        }
    }

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            clearToken();
            clearStoredUser();
            navigate('/login');
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-mark">M</div>
                    <div className="brand-text">
                        <h3>Management System</h3>
                        <span>{userRole === 'CANDIDATE' ? 'Candidate Portal' : 'Enterprise Portal'}</span>
                    </div>
                </div>

                <div className="nav-section">
                    <div className="nav-title">{userRole === 'CANDIDATE' ? 'Candidate Menu' : 'Workspace Menu'}</div>
                    <ul className="nav-list">
                        {visibleNavigation.map((item) => (
                            <li key={item.path + item.label}>
                                <NavLink to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={item.path === '/'}>
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            <main className="content">
                <header className="topbar">
                    <div>
                        <h2>Welcome, {user?.name || 'User'}</h2>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Role: <strong style={{ color: 'var(--primary-text)' }}>{userRole}</strong> {userRole !== 'CANDIDATE' && `| Dept: ${user?.department || 'General'}`}
                        </span>
                    </div>

                    <div className="topbar-actions">
                        <button className="toggle-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                        </button>
                        <div className="user-menu">
                            <div className="avatar">
                                {user?.profilePicture ? <img src={user.profilePicture} alt="profile" /> : (user?.name || 'U').charAt(0).toUpperCase()}
                                <span className="online-dot" title="Online" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{user?.name || 'User'}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{userRole}</div>
                            </div>
                            <button className="secondary-btn" onClick={handleLogout} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;

import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
    const location = useLocation();
    const user = getStoredUser();
    const userRole = user?.role || 'EMPLOYEE';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Auto-close mobile drawer when switching routes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Handle Escape key to close mobile drawer
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Prevent body background scroll on mobile when drawer is active
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.classList.add('drawer-open');
        } else {
            document.body.classList.remove('drawer-open');
        }
        return () => {
            document.body.classList.remove('drawer-open');
        };
    }, [isSidebarOpen]);

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
            {/* Mobile Drawer Backdrop Overlay */}
            <div
                className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar (Desktop Sticky + Mobile Drawer Popup) */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand">
                        <div className="brand-mark">M</div>
                        <div className="brand-text">
                            <h3>Management System</h3>
                            <span>{userRole === 'CANDIDATE' ? 'Candidate Portal' : 'Enterprise Portal'}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="sidebar-close-btn"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close navigation menu"
                        title="Close Menu"
                    >
                        ✕
                    </button>
                </div>

                <div className="nav-section">
                    <div className="nav-title">{userRole === 'CANDIDATE' ? 'Candidate Menu' : 'Workspace Menu'}</div>
                    <ul className="nav-list">
                        {visibleNavigation.map((item) => (
                            <li key={item.path + item.label}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    end={item.path === '/'}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <div className="sidebar-user-preview">
                        <div className="avatar">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="profile" />
                            ) : (
                                (user?.name || 'U').charAt(0).toUpperCase()
                            )}
                            <span className="online-dot" title="Online" />
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name || 'User'}</div>
                            <div className="sidebar-user-role">{userRole}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Application Area */}
            <div className="main-wrapper">
                {/* Sleek Top Enterprise Banner Div */}
                <div className="enterprise-topbar">
                    <div className="enterprise-topbar-inner">
                        <div className="enterprise-brand">
                            <span className="enterprise-logo-dot"></span>
                            <span className="enterprise-title">
                                Management System • {userRole === 'CANDIDATE' ? 'Candidate Portal' : 'Enterprise Portal'}
                            </span>
                        </div>
                        <div className="enterprise-status">
                            <span className="status-indicator-dot"></span>
                            <span className="status-indicator-text">Live Workspace</span>
                        </div>
                    </div>
                </div>

                {/* Main Content with Responsive Navbar */}
                <main className="content">
                    <header className="topbar">
                        <div className="topbar-left">
                            <button
                                type="button"
                                className="menu-toggle-btn"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                aria-label="Toggle navigation menu"
                                title="Toggle Menu"
                            >
                                <span className="hamburger-bar"></span>
                                <span className="hamburger-bar"></span>
                                <span className="hamburger-bar"></span>
                            </button>
                            <div className="topbar-greeting">
                                <h2>Welcome, {user?.name || 'User'}</h2>
                                <div className="topbar-user-meta">
                                    <span className="role-tag">{userRole}</span>
                                    {userRole !== 'CANDIDATE' && user?.department && (
                                        <span className="dept-tag">Dept: {user.department}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="topbar-actions">
                            <button
                                type="button"
                                className="toggle-btn theme-btn"
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            >
                                <span className="theme-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
                                <span className="theme-text">{theme === 'light' ? 'Dark' : 'Light'}</span>
                            </button>

                            <div className="user-menu">
                                <div className="avatar">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="profile" />
                                    ) : (
                                        (user?.name || 'U').charAt(0).toUpperCase()
                                    )}
                                    <span className="online-dot" title="Online" />
                                </div>
                                <div className="user-menu-details">
                                    <div className="user-menu-name">{user?.name || 'User'}</div>
                                    <div className="user-menu-role">{userRole}</div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="secondary-btn logout-btn"
                                onClick={handleLogout}
                                title="Sign out"
                            >
                                <span className="logout-icon">↪</span>
                                <span className="logout-text">Logout</span>
                            </button>
                        </div>
                    </header>

                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

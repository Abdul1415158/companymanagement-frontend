import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import SetPasswordPage from './pages/SetPasswordPage';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import AttendancePage from './pages/AttendancePage';
import TasksPage from './pages/TasksPage';
import LeavesPage from './pages/LeavesPage';
import CandidatesPage from './pages/CandidatesPage';
import PayrollPage from './pages/PayrollPage';
import ProjectsPage from './pages/ProjectsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ProfilePage from './pages/ProfilePage';
import { getStoredUser, getToken } from './utils/auth';

const allStaffRoles = ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR', 'MANAGER', 'EMPLOYEE', 'INTERN'];
const allRoles = [...allStaffRoles, 'CANDIDATE'];

const rolePermissions = {
    '/': allRoles,
    '/users': allStaffRoles,
    '/attendance': allStaffRoles,
    '/tasks': allStaffRoles,
    '/leaves': allStaffRoles,
    '/candidates': ['SUPER_ADMIN', 'CEO', 'CMO', 'HR', 'CANDIDATE'],
    '/payroll': allStaffRoles,
    '/projects': ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'MANAGER', 'EMPLOYEE', 'INTERN'],
    '/departments': ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR'],
    '/profile': allRoles,
};

const ProtectedRoute = ({ children }) => {
    const token = getToken();
    return token ? children : <Navigate to="/login" replace />;
};

const RoleProtectedRoute = ({ children, path }) => {
    const token = getToken();
    const user = getStoredUser();
    const role = user?.role || 'CANDIDATE';

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const allowedRoles = rolePermissions[path] || rolePermissions['/'];
    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const App = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="app-shell">
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/set-password" element={<SetPasswordPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout theme={theme} setTheme={setTheme} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<RoleProtectedRoute path="/"><HomePage /></RoleProtectedRoute>} />
                    <Route path="attendance" element={<RoleProtectedRoute path="/attendance"><AttendancePage /></RoleProtectedRoute>} />
                    <Route path="tasks" element={<RoleProtectedRoute path="/tasks"><TasksPage /></RoleProtectedRoute>} />
                    <Route path="projects" element={<RoleProtectedRoute path="/projects"><ProjectsPage /></RoleProtectedRoute>} />
                    <Route path="leaves" element={<RoleProtectedRoute path="/leaves"><LeavesPage /></RoleProtectedRoute>} />
                    <Route path="departments" element={<RoleProtectedRoute path="/departments"><DepartmentsPage /></RoleProtectedRoute>} />
                    <Route path="users" element={<RoleProtectedRoute path="/users"><UsersPage /></RoleProtectedRoute>} />
                    <Route path="payroll" element={<RoleProtectedRoute path="/payroll"><PayrollPage /></RoleProtectedRoute>} />
                    <Route path="candidates" element={<RoleProtectedRoute path="/candidates"><CandidatesPage /></RoleProtectedRoute>} />
                    <Route path="profile" element={<RoleProtectedRoute path="/profile"><ProfilePage /></RoleProtectedRoute>} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
};

export default App;

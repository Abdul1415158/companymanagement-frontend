import { useEffect, useState } from 'react';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        department: 'Engineering',
        phone: '',
    });
    const [creating, setCreating] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const currentUser = getStoredUser();
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const isHR = currentUser?.role === 'HR';
    const canCreateInternalUsers = isSuperAdmin || isHR;

    // Available roles for creation
    const availableRolesForCreation = isSuperAdmin
        ? ['CEO', 'CTO', 'CMO', 'HR', 'MANAGER', 'EMPLOYEE', 'INTERN']
        : ['MANAGER', 'EMPLOYEE', 'INTERN'];

    const availableRolesForUpdate = isSuperAdmin
        ? ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR', 'MANAGER', 'EMPLOYEE', 'INTERN']
        : ['MANAGER', 'EMPLOYEE', 'INTERN'];

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Users fetch failed', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        setMsg({ text: '', type: '' });

        try {
            const res = await api.post('/users', newUserForm);
            setMsg({ text: res.data.message || 'Internal user created successfully.', type: 'success' });
            setShowCreateModal(false);
            setNewUserForm({
                name: '',
                email: '',
                password: '',
                role: isHR ? 'EMPLOYEE' : 'EMPLOYEE',
                department: 'Engineering',
                phone: '',
            });
            fetchUsers();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Failed to create internal user.', type: 'danger' });
        } finally {
            setCreating(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/users/${userId}`, { role: newRole });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update user role.');
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await api.patch(`/users/${userId}`, { status: newStatus });
            setMsg({ text: `User account status changed to ${newStatus}.`, type: 'info' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update user status.');
        }
    };

    const handleOffboardUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to offboard / remove "${userName}"? This will terminate their account and revoke all system access.`)) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            setMsg({ text: `User "${userName}" has been offboarded and removed from active roster.`, type: 'success' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to offboard user.');
        }
    };

    const departments = Array.from(new Set(users.map((u) => u.department || 'General')));
    const allRoles = Array.from(new Set(users.map((u) => u.role || 'EMPLOYEE')));

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            !searchTerm ||
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = deptFilter === 'ALL' || u.department === deptFilter;
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

        return matchesSearch && matchesDept && matchesRole;
    });

    return (
        <div className="page-grid">
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>{isSuperAdmin || isHR ? 'User & Role Management' : 'Team Directory'}</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {isSuperAdmin || isHR
                                ? 'Manage internal staff accounts, roles, termination/offboarding, and department assignments'
                                : 'Company personnel roster across departments'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {canCreateInternalUsers ? (
                            <button
                                className="primary-btn"
                                onClick={() => setShowCreateModal(!showCreateModal)}
                                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                            >
                                {showCreateModal ? 'Close Form' : '+ Create / Invite User'}
                            </button>
                        ) : null}

                        <input
                            type="text"
                            placeholder="Search team member..."
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

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{
                                padding: '6px 10px',
                                fontSize: '0.82rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--panel-alt)',
                                color: 'var(--text)'
                            }}
                        >
                            <option value="ALL">All Roles</option>
                            {allRoles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>

                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            style={{
                                padding: '6px 10px',
                                fontSize: '0.82rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--panel-alt)',
                                color: 'var(--text)'
                            }}
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {msg.text ? (
                    <div className={`badge ${msg.type}`} style={{ marginBottom: '12px', padding: '8px 12px' }}>
                        {msg.text}
                    </div>
                ) : null}

                {/* Internal User Creation Form Modal / Card */}
                {showCreateModal && canCreateInternalUsers ? (
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--panel-alt)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '16px'
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px' }}>
                            Create Internal Staff Account ({isSuperAdmin ? 'Super Admin Mode' : 'HR Mode'})
                        </div>
                        <p style={{ margin: '0 0 12px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            {isSuperAdmin
                                ? 'As Super Admin, you can assign leadership (CEO, CTO, CMO), HR, and team roles.'
                                : 'As HR, you can create and onboard Manager, Employee, and Intern accounts.'}
                        </p>

                        <form onSubmit={handleCreateUser} className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                            <div className="field">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Asad Farooq"
                                    value={newUserForm.name}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="asad@company.com"
                                    value={newUserForm.email}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label>Internal Role *</label>
                                <select
                                    value={newUserForm.role}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                >
                                    {availableRolesForCreation.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label>Department</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Engineering / HR / Sales"
                                    value={newUserForm.department}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    placeholder="+92-300-1234567"
                                    value={newUserForm.phone}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label>Temporary Password *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Min 8 chars, 1 Upper, 1 Num, 1 Symbol"
                                    value={newUserForm.password}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : null}

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Contact</th>
                                <th>Role / Designation</th>
                                <th>Department</th>
                                <th>Online</th>
                                <th>Account Status</th>
                                {canCreateInternalUsers ? <th>Role Action</th> : null}
                                {isSuperAdmin ? <th>Offboard Action</th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length ? (
                                filteredUsers.map((user) => {
                                    const isCurrentUser = user.id === currentUser?.id || user._id === currentUser?.id;
                                    return (
                                        <tr key={user.id || user._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="online-user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                        {user.profilePicture ? (
                                                            <img src={user.profilePicture} alt={user.name} />
                                                        ) : (
                                                            (user.name || 'U').charAt(0).toUpperCase()
                                                        )}
                                                        {user.isOnline ? <span className="online-dot" /> : null}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>
                                                            {user.name} {isCurrentUser ? '(You)' : ''}
                                                        </div>
                                                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.82rem' }}>{user.phone || '-'}</td>
                                            <td>
                                                <span className={`badge ${
                                                    user.role === 'SUPER_ADMIN' ? 'danger' :
                                                    ['CEO', 'CTO', 'CMO'].includes(user.role) ? 'warning' :
                                                    user.role === 'HR' ? 'info' : 'neutral'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{user.department || 'General'}</td>
                                            <td>
                                                {user.isOnline ? (
                                                    <span className="badge success">ONLINE</span>
                                                ) : (
                                                    <span className="badge neutral">OFFLINE</span>
                                                )}
                                            </td>
                                            <td>
                                                {canCreateInternalUsers && !isCurrentUser ? (
                                                    <select
                                                        className="table-select"
                                                        value={user.status || 'ACTIVE'}
                                                        onChange={(e) => handleStatusChange(user.id || user._id, e.target.value)}
                                                    >
                                                        <option value="ACTIVE">ACTIVE</option>
                                                        <option value="INACTIVE">INACTIVE</option>
                                                        <option value="TERMINATED">TERMINATED</option>
                                                        <option value="PENDING">PENDING</option>
                                                    </select>
                                                ) : (
                                                    <span className={`badge ${
                                                        user.status === 'ACTIVE' ? 'success' :
                                                        user.status === 'TERMINATED' ? 'danger' : 'warning'
                                                    }`}>
                                                        {user.status || 'ACTIVE'}
                                                    </span>
                                                )}
                                            </td>
                                            {canCreateInternalUsers ? (
                                                <td>
                                                    {isSuperAdmin || (isHR && ['MANAGER', 'EMPLOYEE', 'INTERN'].includes(user.role)) ? (
                                                        <select
                                                            className="table-select"
                                                            value={user.role}
                                                            disabled={isCurrentUser}
                                                            onChange={(e) => handleRoleChange(user.id || user._id, e.target.value)}
                                                        >
                                                            {availableRolesForUpdate.map((r) => (
                                                                <option key={r} value={r}>{r}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Protected</span>
                                                    )}
                                                </td>
                                            ) : null}
                                            {isSuperAdmin ? (
                                                <td>
                                                    {!isCurrentUser ? (
                                                        <button
                                                            className="danger-btn"
                                                            onClick={() => handleOffboardUser(user.id || user._id, user.name)}
                                                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                                        >
                                                            Offboard / Remove
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Self</span>
                                                    )}
                                                </td>
                                            ) : null}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 8 : (canCreateInternalUsers ? 7 : 6)} className="empty-state">
                                        No team members found matching your search.
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

export default UsersPage;

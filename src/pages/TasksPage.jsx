import { useEffect, useState } from 'react';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const initialForm = {
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    department: 'Engineering',
};

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [msg, setMsg] = useState({ text: '', type: '' });

    const currentUser = getStoredUser();
    const canCreateTask = ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'HR', 'MANAGER'].includes(currentUser?.role);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Tasks fetch failed', error);
        }
    };

    const fetchUsers = async () => {
        if (canCreateTask) {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
                if (response.data.length > 0 && !form.assignedTo) {
                    setForm((prev) => ({ ...prev, assignedTo: response.data[0].id }));
                }
            } catch (error) {
                console.error('Users fetch failed', error);
            }
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            await api.post('/tasks', form);
            setMsg({ text: 'Task created and assigned successfully!', type: 'success' });
            setForm((prev) => ({ ...initialForm, assignedTo: users[0]?.id || '' }));
            fetchTasks();
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Task creation failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update task status.');
        }
    };

    const filteredTasks = tasks.filter((t) => {
        if (filterStatus === 'ALL') return true;
        return t.status === filterStatus;
    });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'DONE': return 'success';
            case 'IN_PROGRESS': return 'info';
            case 'REVIEW': return 'warning';
            default: return 'neutral';
        }
    };

    return (
        <div className="page-grid">
            {/* Task Creation Form for Managers/Executives/Super Admin */}
            {canCreateTask ? (
                <div className="card">
                    <div className="page-header">
                        <div>
                            <h3>Create & Assign Task</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Delegate responsibilities to team members with due dates
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
                            <label>Task Title *</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Implement OAuth Flow"
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Assign To Team Member</label>
                            <select
                                value={form.assignedTo}
                                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                            >
                                <option value="">Unassigned</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.role} - {u.department})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Department</label>
                            <input
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                placeholder="Engineering / Marketing"
                            />
                        </div>

                        <div className="field">
                            <label>Due Date</label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            />
                        </div>

                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>Description & Scope</label>
                            <textarea
                                rows="3"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Provide context, acceptance criteria or instructions..."
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? 'Assigning...' : 'Create & Assign Task'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            {/* Tasks Board & Management */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Team Tasks & Assignments</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Track and update work progress across projects
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['ALL', 'OPEN', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((st) => (
                            <button
                                key={st}
                                className={filterStatus === st ? 'primary-btn' : 'secondary-btn'}
                                onClick={() => setFilterStatus(st)}
                                style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Task Title</th>
                                <th>Department</th>
                                <th>Assigned Member</th>
                                <th>Assigned By</th>
                                <th>Due Date</th>
                                <th>Current Status</th>
                                <th>Action / Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length ? (
                                filteredTasks.map((task) => (
                                    <tr key={task.id || task._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{task.title}</div>
                                            {task.description ? (
                                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {task.description}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td>{task.department || 'General'}</td>
                                        <td style={{ fontWeight: 600 }}>
                                            {task.assignedUser || 'Unassigned'}
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {task.assignedByName || 'Management'}
                                        </td>
                                        <td>
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                                                {task.status || 'OPEN'}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="table-select"
                                                value={task.status || 'OPEN'}
                                                onChange={(e) => handleStatusChange(task.id || task._id, e.target.value)}
                                            >
                                                <option value="OPEN">OPEN</option>
                                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                                <option value="REVIEW">REVIEW</option>
                                                <option value="DONE">DONE</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No tasks found under {filterStatus} filter.
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

export default TasksPage;

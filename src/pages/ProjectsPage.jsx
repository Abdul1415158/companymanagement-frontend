import { useEffect, useState } from 'react';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const initialForm = {
    name: '',
    description: '',
    department: 'Engineering',
    status: 'ACTIVE',
};

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const currentUser = getStoredUser();
    const canCreateProject = ['SUPER_ADMIN', 'CEO', 'CTO', 'CMO', 'MANAGER'].includes(currentUser?.role);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Projects fetch failed', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            await api.post('/projects', form);
            setMsg({ text: 'Project created successfully!', type: 'success' });
            setForm(initialForm);
            fetchProjects();
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Project creation failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-grid">
            {/* Create Project Form for Executives / Managers */}
            {canCreateProject ? (
                <div className="card">
                    <div className="page-header">
                        <div>
                            <h3>Create New Project</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Initialize a company initiative or client deliverable
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
                            <label>Project Title *</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Core Banking Integration"
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Lead Department</label>
                            <input
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                placeholder="Engineering / Marketing"
                            />
                        </div>

                        <div className="field">
                            <label>Initial Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="ON_HOLD">ON HOLD</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                        </div>

                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>Project Scope & Objectives</label>
                            <textarea
                                rows="3"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Detail deliverables, milestones and timeline..."
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button className="primary-btn" type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Initialize Project'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            {/* Projects Roster */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Company Projects & Initiatives</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Active strategic developments and project statuses
                        </p>
                    </div>
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Department</th>
                                <th>Lead</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length ? (
                                projects.map((project) => (
                                    <tr key={project.id || project._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{project.name}</div>
                                            {project.description ? (
                                                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {project.description}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td>{project.department || 'General'}</td>
                                        <td>{project.ownerName || 'Lead'}</td>
                                        <td>
                                            <span className={`badge ${project.status === 'ACTIVE' ? 'success' : project.status === 'COMPLETED' ? 'info' : 'warning'}`}>
                                                {project.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        No active projects recorded.
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

export default ProjectsPage;

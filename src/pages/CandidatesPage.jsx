import { useEffect, useState } from 'react';
import api from '../api';
import { getStoredUser } from '../utils/auth';

const openJobPositions = [
    { title: 'Full Stack Engineer', department: 'Engineering', type: 'Full-time', location: 'Remote / Hybrid' },
    { title: 'Frontend Developer (React)', department: 'Engineering', type: 'Full-time', location: 'Remote' },
    { title: 'Software Engineering Intern', department: 'Engineering', type: 'Internship', location: 'Onsite' },
    { title: 'Marketing Associate', department: 'Marketing', type: 'Full-time', location: 'Onsite' },
    { title: 'HR & Talent Specialist', department: 'Human Resources', type: 'Full-time', location: 'Onsite' },
    { title: 'Chief Technology Officer (CTO)', department: 'Executive', type: 'Full-time', location: 'Onsite' },
];

const recruitmentStages = [
    { key: 'APPLIED', label: 'Applied', color: 'neutral', message: 'Application Received: Thank you for applying! Our talent acquisition team will review your qualifications.' },
    { key: 'UNDER_REVIEW', label: 'Under Review', color: 'info', message: 'Under Review: Your profile and qualifications are actively being reviewed by the hiring team.' },
    { key: 'SHORTLISTED', label: 'Shortlisted', color: 'info', message: 'Shortlisted: Congratulations! Your application has been shortlisted for candidate evaluation.' },
    { key: 'INTERVIEW', label: 'Interview', color: 'warning', message: 'Interview Stage: You have progressed to the interview round! HR will contact you with interview scheduling details.' },
    { key: 'SELECTED', label: 'Selected', color: 'success', message: 'Candidate Selected: Congratulations! You have been selected. Our HR department is preparing your offer details.' },
    { key: 'HIRED', label: 'Hired', color: 'success', message: 'Hired & Onboarded: Welcome aboard! Your employee profile and system credentials have been approved.' },
    { key: 'REJECTED', label: 'Rejected', color: 'danger', message: 'Application Concluded: Thank you for your interest. We have decided to proceed with other applicants for this position at this time.' },
];

const candidateSteps = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'HIRED'];

const CandidatesPage = () => {
    const currentUser = getStoredUser();
    const isCandidate = currentUser?.role === 'CANDIDATE';
    const canManageCandidates = ['SUPER_ADMIN', 'HR', 'CEO', 'CMO'].includes(currentUser?.role);
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    const [candidates, setCandidates] = useState([]);
    const [stageFilter, setStageFilter] = useState('ALL');
    const [portalFilter, setPortalFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Application / Registration Form state
    const [form, setForm] = useState({
        fullName: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        positionApplied: 'Full Stack Engineer',
        source: isCandidate ? 'Candidate Portal' : 'LinkedIn',
        status: 'APPLIED',
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Invitation Modal state
    const [inviteModal, setInviteModal] = useState({ open: false, candidate: null, link: '', token: '', copied: false });

    // Onboarding Modal state
    const [onboardModal, setOnboardModal] = useState({
        open: false,
        candidate: null,
        internalRole: 'EMPLOYEE',
        department: 'Engineering',
        phone: '',
        temporaryPassword: '',
        submitting: false,
    });

    const fetchCandidates = async () => {
        try {
            const response = await api.get('/candidates');
            setCandidates(response.data || []);
        } catch (error) {
            console.error('Candidates fetch failed', error);
        }
    };

    useEffect(() => {
        fetchCandidates();
        const interval = setInterval(fetchCandidates, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });

        try {
            const res = await api.post('/candidates', form);
            setMsg({
                text: res.data.message || (isCandidate
                    ? 'Your application has been submitted successfully! You can track your stage updates below.'
                    : 'Candidate successfully registered in recruitment pipeline! (No password required)'),
                type: 'success'
            });
            if (!isCandidate) {
                setForm({
                    fullName: '',
                    email: '',
                    phone: '',
                    positionApplied: 'Full Stack Engineer',
                    source: 'LinkedIn',
                    status: 'APPLIED',
                });
            }
            fetchCandidates();
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Application submission failed.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyForRole = (jobTitle) => {
        setForm((prev) => ({ ...prev, positionApplied: jobTitle }));
        const formEl = document.getElementById('apply-form-section');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    };

    const handleStatusChange = async (candidateId, status) => {
        try {
            await api.patch(`/candidates/${candidateId}/status`, { status });
            fetchCandidates();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update candidate status.');
        }
    };

    const handleSendInvitation = async (candidate) => {
        try {
            const res = await api.post(`/candidates/${candidate.id || candidate._id}/invite`);
            const fullLink = `${window.location.origin}${res.data.invitationLink}`;
            setInviteModal({
                open: true,
                candidate,
                link: fullLink,
                token: res.data.invitationToken,
                copied: false
            });
            fetchCandidates();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to generate invitation.');
        }
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteModal.link);
        setInviteModal(prev => ({ ...prev, copied: true }));
        setTimeout(() => {
            setInviteModal(prev => ({ ...prev, copied: false }));
        }, 3000);
    };

    const openOnboardModal = (candidate) => {
        setOnboardModal({
            open: true,
            candidate,
            internalRole: 'EMPLOYEE',
            department: candidate.positionApplied?.toLowerCase().includes('marketing') ? 'Marketing' : 'Engineering',
            phone: candidate.phone || '',
            temporaryPassword: '',
            submitting: false,
        });
    };

    const handleOnboardSubmit = async (e) => {
        e.preventDefault();
        setOnboardModal(prev => ({ ...prev, submitting: true }));

        try {
            const res = await api.post(`/candidates/${onboardModal.candidate.id || onboardModal.candidate._id}/onboard`, {
                internalRole: onboardModal.internalRole,
                department: onboardModal.department,
                phone: onboardModal.phone,
                temporaryPassword: onboardModal.temporaryPassword || undefined,
            });

            setMsg({ text: res.data.message || 'Candidate onboarded successfully as an employee!', type: 'success' });
            setOnboardModal({ open: false, candidate: null, internalRole: 'EMPLOYEE', department: 'Engineering', phone: '', temporaryPassword: '', submitting: false });
            fetchCandidates();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to onboard candidate.');
            setOnboardModal(prev => ({ ...prev, submitting: false }));
        }
    };

    const getStageInfo = (statusKey) => {
        const found = recruitmentStages.find(s => s.key === statusKey);
        return found || { key: statusKey, label: statusKey || 'Applied', color: 'neutral', message: 'Application submitted.' };
    };

    const filteredCandidates = candidates.filter((c) => {
        const matchesSearch =
            !searchTerm ||
            c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.positionApplied || c.roleApplied || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStage = stageFilter === 'ALL' || c.status === stageFilter;
        const matchesPortal = portalFilter === 'ALL' || (c.portalAccess || (c.userId ? 'ACTIVE' : 'NOT_INVITED')) === portalFilter;
        return matchesSearch && matchesStage && matchesPortal;
    });

    const latestCandidateApp = candidates[0];

    return (
        <div className="page-grid">
            {/* Candidate Experience: Open Jobs Roster */}
            {isCandidate ? (
                <div className="card">
                    <div className="page-header">
                        <div>
                            <h3>Available Career & Internship Opportunities</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Choose an open position to apply or submit a tailored application below
                            </p>
                        </div>
                    </div>

                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                        {openJobPositions.map((job) => (
                            <div
                                key={job.title}
                                style={{
                                    padding: '14px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-subtle)',
                                    backgroundColor: 'var(--panel-alt)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '10px'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{job.title}</div>
                                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {job.department} • {job.type} • {job.location}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => handleApplyForRole(job.title)}
                                    style={{ fontSize: '0.78rem', padding: '5px 10px', alignSelf: 'flex-start' }}
                                >
                                    Select & Apply
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Candidate Real-Time Status Tracker Card */}
            {isCandidate && latestCandidateApp ? (
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="page-header">
                        <div>
                            <h3>Application Progress Tracker</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Position Applied: <strong>{latestCandidateApp.positionApplied || latestCandidateApp.roleApplied}</strong>
                            </p>
                        </div>
                        <span className={`badge ${getStageInfo(latestCandidateApp.status).color}`} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                            Stage: {getStageInfo(latestCandidateApp.status).label}
                        </span>
                    </div>

                    {/* Visual Stage Progress Stepper */}
                    {latestCandidateApp.status !== 'REJECTED' ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            margin: '16px 0',
                            gap: '6px',
                            flexWrap: 'wrap'
                        }}>
                            {candidateSteps.map((stepKey, idx) => {
                                const currentStepIdx = candidateSteps.indexOf(latestCandidateApp.status) >= 0
                                    ? candidateSteps.indexOf(latestCandidateApp.status)
                                    : 0;
                                const isPassed = idx <= currentStepIdx;
                                const isCurrent = idx === currentStepIdx;

                                return (
                                    <div
                                        key={stepKey}
                                        style={{
                                            flex: '1 1 110px',
                                            padding: '10px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            textAlign: 'center',
                                            backgroundColor: isCurrent ? 'var(--primary-soft)' : (isPassed ? 'var(--panel-alt)' : 'transparent'),
                                            border: `1px solid ${isCurrent ? 'var(--primary)' : (isPassed ? 'var(--border-subtle)' : 'var(--border)')}`,
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            color: isCurrent ? 'var(--primary-text)' : (isPassed ? 'var(--text)' : 'var(--text-muted)')
                                        }}>
                                            {idx + 1}. {getStageInfo(stepKey).label}
                                        </div>
                                        <div style={{ fontSize: '0.66rem', color: isPassed ? 'var(--success)' : 'var(--text-muted)', marginTop: '2px' }}>
                                            {isCurrent ? '● Active Stage' : (isPassed ? '✓ Done' : 'Pending')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}

                    {/* Candidate User-Friendly Stage Message */}
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--panel-alt)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.84rem',
                        color: 'var(--text)',
                        lineHeight: 1.5
                    }}>
                        📢 <strong>Status Update:</strong> {getStageInfo(latestCandidateApp.status).message}
                    </div>
                </div>
            ) : null}

            {/* Application / Registration Form */}
            <div className="card" id="apply-form-section">
                <div className="page-header">
                    <div>
                        <h3>{isCandidate ? 'Submit Candidate Application' : 'Register Candidate to Recruitment Pipeline'}</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {isCandidate
                                ? 'Submit your application for review by our talent acquisition team'
                                : 'Add applicant record to recruitment pipeline (No password required — Candidate exists only as applicant until portal invitation is sent)'}
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
                        <label>Full Name *</label>
                        <input
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            placeholder="e.g. Zulfikar Ali"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="zulfikar@gmail.com"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Phone Number</label>
                        <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+92-300-1122334"
                        />
                    </div>

                    <div className="field">
                        <label>Position Applied For *</label>
                        <input
                            value={form.positionApplied}
                            onChange={(e) => setForm({ ...form, positionApplied: e.target.value })}
                            placeholder="e.g. Full Stack Engineer / CTO / Marketing Associate"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Application Source</label>
                        <input
                            value={form.source}
                            onChange={(e) => setForm({ ...form, source: e.target.value })}
                            placeholder="LinkedIn / Referral / Website"
                        />
                    </div>

                    {canManageCandidates ? (
                        <div className="field">
                            <label>Initial Recruitment Stage</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                {recruitmentStages.map((s) => (
                                    <option key={s.key} value={s.key}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    ) : null}

                    <div style={{ gridColumn: '1 / -1' }}>
                        <button className="primary-btn" type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : (isCandidate ? 'Submit Job Application' : 'Add Candidate to Pipeline')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Applications History & HR Recruitment Pipeline Table */}
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>{isCandidate ? 'My Applications & Status' : 'Talent Pipeline & Stage Management'}</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {isCandidate
                                ? 'Real-time progression of all your submitted applications'
                                : `Manage applicant stages and portal access across the recruitment lifecycle (${filteredCandidates.length} records)`}
                        </p>
                    </div>

                    {canManageCandidates ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Search candidate / position..."
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
                                value={stageFilter}
                                onChange={(e) => setStageFilter(e.target.value)}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '0.82rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-subtle)',
                                    backgroundColor: 'var(--panel-alt)',
                                    color: 'var(--text)'
                                }}
                            >
                                <option value="ALL">All Stages</option>
                                {recruitmentStages.map((s) => (
                                    <option key={s.key} value={s.key}>{s.label}</option>
                                ))}
                            </select>

                            <select
                                value={portalFilter}
                                onChange={(e) => setPortalFilter(e.target.value)}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '0.82rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-subtle)',
                                    backgroundColor: 'var(--panel-alt)',
                                    color: 'var(--text)'
                                }}
                            >
                                <option value="ALL">All Portal Access</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INVITATION_SENT">INVITATION_SENT</option>
                                <option value="NOT_INVITED">NOT_INVITED</option>
                            </select>
                        </div>
                    ) : null}
                </div>

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Contact</th>
                                <th>Position Applied</th>
                                <th>Source</th>
                                <th>Stage</th>
                                <th>Applied Date</th>
                                {canManageCandidates ? <th>Portal Access</th> : null}
                                {canManageCandidates ? <th>Recruitment Actions</th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates.length ? (
                                filteredCandidates.map((c) => {
                                    const stage = getStageInfo(c.status);
                                    const portalStatus = c.portalAccess || (c.userId ? 'ACTIVE' : 'NOT_INVITED');
                                    const isHiredOrSelected = c.status === 'HIRED' || c.status === 'SELECTED';

                                    return (
                                        <tr key={c.id || c._id}>
                                            <td style={{ fontWeight: 600 }}>
                                                {c.fullName}
                                                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                                    {c.email}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.82rem' }}>{c.phone || '-'}</td>
                                            <td>
                                                <span className="badge neutral" style={{ fontWeight: 600 }}>
                                                    {c.positionApplied || c.roleApplied || 'General'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.source || 'Direct'}</td>
                                            <td>
                                                <span className={`badge ${stage.color}`}>
                                                    {stage.label}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                                            </td>
                                            {canManageCandidates ? (
                                                <td>
                                                    <span className={`badge ${
                                                        portalStatus === 'ACTIVE' ? 'success' :
                                                        portalStatus === 'INVITATION_SENT' ? 'info' : 'neutral'
                                                    }`}>
                                                        {portalStatus}
                                                    </span>
                                                </td>
                                            ) : null}
                                            {canManageCandidates ? (
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <select
                                                            className="table-select"
                                                            value={c.status || 'APPLIED'}
                                                            onChange={(e) => handleStatusChange(c.id || c._id, e.target.value)}
                                                            style={{ maxWidth: '130px' }}
                                                        >
                                                            {recruitmentStages.map((s) => (
                                                                <option key={s.key} value={s.key}>{s.label}</option>
                                                            ))}
                                                        </select>

                                                        {portalStatus !== 'ACTIVE' ? (
                                                            <button
                                                                className="secondary-btn"
                                                                onClick={() => handleSendInvitation(c)}
                                                                style={{ padding: '4px 8px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                                                                title="Send Candidate Portal Invitation"
                                                            >
                                                                {portalStatus === 'INVITATION_SENT' ? 'Resend Invite' : 'Send Invite'}
                                                            </button>
                                                        ) : null}

                                                        {isHiredOrSelected ? (
                                                            <button
                                                                className="primary-btn"
                                                                onClick={() => openOnboardModal(c)}
                                                                style={{ padding: '4px 8px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                                                                title="Formal employee profile onboarding"
                                                            >
                                                                Onboard Staff
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            ) : null}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={canManageCandidates ? 8 : 6} className="empty-state">
                                        {isCandidate
                                            ? 'No applications submitted yet.'
                                            : 'No candidates found matching the selected criteria.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Portal Invitation Link Modal */}
            {inviteModal.open && inviteModal.candidate ? (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '24px' }}>
                        <div className="page-header" style={{ marginBottom: '14px' }}>
                            <div>
                                <h3>Portal Invitation Generated</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Candidate: <strong>{inviteModal.candidate.fullName}</strong> ({inviteModal.candidate.email})
                                </p>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '12px' }}>
                            The candidate can use this secure link to set their password and access their candidate dashboard. (No plain-text password is set or known by HR).
                        </p>

                        <div style={{
                            padding: '10px 12px',
                            backgroundColor: 'var(--panel-alt)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            wordBreak: 'break-all',
                            fontSize: '0.76rem',
                            fontFamily: 'monospace',
                            marginBottom: '16px'
                        }}>
                            {inviteModal.link}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setInviteModal({ open: false, candidate: null, link: '', token: '', copied: false })}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={copyInviteLink}
                            >
                                {inviteModal.copied ? '✓ Copied Link!' : 'Copy Invitation Link'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Onboard Hired Candidate as Employee Modal */}
            {onboardModal.open && onboardModal.candidate ? (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
                        <div className="page-header" style={{ marginBottom: '14px' }}>
                            <div>
                                <h3>Onboard Candidate to Staff Roster</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Convert hired applicant <strong>{onboardModal.candidate.fullName}</strong> into active internal employee
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleOnboardSubmit} className="form-grid">
                            <div className="field">
                                <label>Candidate Name</label>
                                <input value={onboardModal.candidate.fullName} disabled style={{ opacity: 0.8 }} />
                            </div>

                            <div className="field">
                                <label>Email Address</label>
                                <input value={onboardModal.candidate.email} disabled style={{ opacity: 0.8 }} />
                            </div>

                            <div className="field">
                                <label>System Role to Assign *</label>
                                <select
                                    value={onboardModal.internalRole}
                                    onChange={(e) => setOnboardModal({ ...onboardModal, internalRole: e.target.value })}
                                >
                                    <option value="EMPLOYEE">EMPLOYEE</option>
                                    <option value="INTERN">INTERN</option>
                                    <option value="MANAGER">MANAGER</option>
                                    {isSuperAdmin ? <option value="HR">HR</option> : null}
                                    {isSuperAdmin ? <option value="CTO">CTO</option> : null}
                                    {isSuperAdmin ? <option value="CMO">CMO</option> : null}
                                    {isSuperAdmin ? <option value="CEO">CEO</option> : null}
                                </select>
                            </div>

                            <div className="field">
                                <label>Assigned Department *</label>
                                <input
                                    required
                                    value={onboardModal.department}
                                    onChange={(e) => setOnboardModal({ ...onboardModal, department: e.target.value })}
                                    placeholder="Engineering / Marketing / HR"
                                />
                            </div>

                            <div className="field">
                                <label>Phone</label>
                                <input
                                    value={onboardModal.phone}
                                    onChange={(e) => setOnboardModal({ ...onboardModal, phone: e.target.value })}
                                    placeholder="+92-300-1234567"
                                />
                            </div>

                            <div className="field">
                                <label>Temporary Password</label>
                                <input
                                    type="password"
                                    value={onboardModal.temporaryPassword}
                                    onChange={(e) => setOnboardModal({ ...onboardModal, temporaryPassword: e.target.value })}
                                    placeholder="Min 8 chars (Leave blank for default)"
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setOnboardModal({ open: false, candidate: null, internalRole: 'EMPLOYEE', department: 'Engineering', phone: '', temporaryPassword: '', submitting: false })}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn" disabled={onboardModal.submitting}>
                                    {onboardModal.submitting ? 'Onboarding...' : 'Confirm Employee Onboarding'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default CandidatesPage;

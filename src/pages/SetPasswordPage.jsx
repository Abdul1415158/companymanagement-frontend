import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { setToken, setStoredUser } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [verifying, setVerifying] = useState(true);
    const [candidateInfo, setCandidateInfo] = useState(null);
    const [verifyError, setVerifyError] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!token || !email) {
            setVerifying(false);
            setVerifyError('Missing invitation token or email. Please use the complete link sent by HR.');
            return;
        }

        const checkToken = async () => {
            try {
                const res = await axios.get(`${API_BASE}/auth/verify-invitation`, {
                    params: { token, email }
                });
                setCandidateInfo(res.data.candidate);
            } catch (err) {
                setVerifyError(err.response?.data?.message || 'Invalid or expired invitation link.');
            } finally {
                setVerifying(false);
            }
        };

        checkToken();
    }, [token, email]);

    const pwChecks = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const isPasswordValid = Object.values(pwChecks).every(Boolean);
    const passwordsMatch = password && password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!isPasswordValid) {
            setErrorMsg('Please ensure your password meets all complexity requirements below.');
            return;
        }

        if (!passwordsMatch) {
            setErrorMsg('Passwords do not match. Please re-enter.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/auth/accept-invitation`, {
                token,
                email,
                password,
            });

            setSuccessMsg(res.data.message || 'Account activated successfully! Redirecting to your candidate portal...');
            setToken(res.data.token);
            setStoredUser(res.data.user);

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to activate account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="login-shell">
                <div className="login-card" style={{ textAlign: 'center', padding: '32px' }}>
                    <h3>Verifying Invitation...</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        Checking security credentials for your candidate portal access.
                    </p>
                </div>
            </div>
        );
    }

    if (verifyError) {
        return (
            <div className="login-shell">
                <div className="login-card" style={{ padding: '32px', textAlign: 'center' }}>
                    <div className="badge danger" style={{ padding: '8px 14px', marginBottom: '16px' }}>
                        Invalid Invitation Link
                    </div>
                    <h3>Invitation Expired or Invalid</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '12px 0 20px' }}>
                        {verifyError}
                    </p>
                    <Link to="/login" className="primary-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Go to Candidate Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="login-shell">
            <div className="login-card" style={{ maxWidth: '440px' }}>
                <div className="login-header">
                    <h2>Activate Candidate Portal Access</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                        Welcome <strong>{candidateInfo?.fullName}</strong>! Set a secure password to access your application dashboard for <strong>{candidateInfo?.positionApplied}</strong>.
                    </p>
                </div>

                {errorMsg && (
                    <div className="badge danger" style={{ width: '100%', boxSizing: 'border-box', marginBottom: '12px', padding: '8px 12px' }}>
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="badge success" style={{ width: '100%', boxSizing: 'border-box', marginBottom: '12px', padding: '8px 12px' }}>
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="field">
                        <label>Candidate Email</label>
                        <input type="email" value={email || ''} disabled style={{ opacity: 0.8, backgroundColor: 'var(--panel-alt)' }} />
                    </div>

                    <div className="field">
                        <label>Create New Password *</label>
                        <input
                            type="password"
                            required
                            placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Symbol"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            required
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {confirmPassword && !passwordsMatch && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: '3px' }}>
                                ✗ Passwords do not match
                            </span>
                        )}
                    </div>

                    {/* Password requirements checklist */}
                    <div style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--panel-alt)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.74rem',
                        border: '1px solid var(--border-subtle)',
                        lineHeight: 1.6
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Password Requirements:</div>
                        <div style={{ color: pwChecks.length ? 'var(--success)' : 'var(--text-muted)' }}>
                            {pwChecks.length ? '✓' : '○'} At least 8 characters
                        </div>
                        <div style={{ color: pwChecks.upper ? 'var(--success)' : 'var(--text-muted)' }}>
                            {pwChecks.upper ? '✓' : '○'} At least 1 uppercase letter (A-Z)
                        </div>
                        <div style={{ color: pwChecks.lower ? 'var(--success)' : 'var(--text-muted)' }}>
                            {pwChecks.lower ? '✓' : '○'} At least 1 lowercase letter (a-z)
                        </div>
                        <div style={{ color: pwChecks.number ? 'var(--success)' : 'var(--text-muted)' }}>
                            {pwChecks.number ? '✓' : '○'} At least 1 number (0-9)
                        </div>
                        <div style={{ color: pwChecks.special ? 'var(--success)' : 'var(--text-muted)' }}>
                            {pwChecks.special ? '✓' : '○'} At least 1 special character (!@#$%^&*)
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="primary-btn"
                        style={{ width: '100%', padding: '10px', marginTop: '6px' }}
                        disabled={loading || !isPasswordValid || !passwordsMatch}
                    >
                        {loading ? 'Activating Account...' : 'Set Password & Enter Portal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPasswordPage;

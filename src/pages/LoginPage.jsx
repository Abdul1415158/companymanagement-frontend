import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { setStoredUser, setToken } from '../utils/auth';

const defaultLoginForm = {
    email: '',
    password: '',
};

const defaultRegisterForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
};

const LoginPage = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [loginForm, setLoginForm] = useState(defaultLoginForm);
    const [registerForm, setRegisterForm] = useState(defaultRegisterForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm((prev) => ({ ...prev, [name]: value }));
    };

    // Password criteria evaluation
    const password = registerForm.password;
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    };

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);
    const doPasswordsMatch = registerForm.password === registerForm.confirmPassword && registerForm.confirmPassword.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'register') {
            if (!isPasswordValid) {
                setError('Please satisfy all password security requirements before proceeding.');
                return;
            }
            if (registerForm.password !== registerForm.confirmPassword) {
                setError('Passwords do not match. Please re-enter.');
                return;
            }
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                const response = await api.post('/auth/login', {
                    email: loginForm.email,
                    password: loginForm.password,
                });
                setToken(response.data.token);
                setStoredUser(response.data.user);
                navigate('/');
            } else {
                // Public Registration - automatically assigned as CANDIDATE by backend
                const response = await api.post('/auth/register', {
                    name: registerForm.name,
                    email: registerForm.email,
                    phone: registerForm.phone,
                    password: registerForm.password,
                });
                setToken(response.data.token);
                setStoredUser(response.data.user);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please verify credentials and connection.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
    };

    return (
        <div className="auth-page-wrapper">
            {/* Left Enterprise Branding Showcase */}
            <div className="auth-brand-pane">
                <div className="brand-pane-bg-glow glow-1"></div>
                <div className="brand-pane-bg-glow glow-2"></div>

                <div className="brand-pane-content">
                    <div className="brand-pane-header">
                        <div className="brand-logo-badge">
                            <span className="brand-logo-letter">M</span>
                        </div>
                        <div>
                            <h1 className="brand-pane-title">Management System</h1>
                            <span className="brand-pane-badge">Enterprise Edition</span>
                        </div>
                    </div>

                    <div className="brand-pane-body">
                        <h2 className="brand-headline">
                            Modern Workforce & Operations Platform.
                        </h2>
                        <p className="brand-subheadline">
                            Empowering teams with seamless role-based workflows, live attendance tracking, automated payroll, and streamlined candidate recruitment.
                        </p>

                        <div className="feature-cards-grid">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper icon-blue">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div>
                                    <h4>Multi-Role Architecture</h4>
                                    <p>Executive, HR, Manager, Staff & Candidate portals</p>
                                </div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon-wrapper icon-green">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <div>
                                    <h4>Live Attendance & Sync</h4>
                                    <p>Real-time daily punch-in/out and activity logging</p>
                                </div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon-wrapper icon-amber">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </div>
                                <div>
                                    <h4>Recruitment Pipeline</h4>
                                    <p>7-stage hiring lifecycle with self-service portal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="brand-pane-footer">
                        <div className="status-live-pill">
                            <span className="live-pulse-dot"></span>
                            <span>Enterprise Cloud • 99.9% Uptime</span>
                        </div>
                        <div className="security-tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <span>256-Bit TLS Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Authentication Form Pane */}
            <div className="auth-form-pane">
                <div className="auth-form-container">
                    {/* Mobile Brand Bar (Visible only on small viewports) */}
                    <div className="auth-mobile-header">
                        <div className="brand-logo-badge mobile-logo">
                            <span className="brand-logo-letter">M</span>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Management System</h3>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Enterprise SaaS Portal</span>
                        </div>
                    </div>

                    {/* Segmented Mode Selector Tabs */}
                    <div className="auth-segmented-tabs">
                        <button
                            type="button"
                            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                            onClick={() => switchMode('login')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            <span>Sign In</span>
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
                            onClick={() => switchMode('register')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                            <span>Register Candidate</span>
                        </button>
                    </div>

                    {/* Auth Header */}
                    <div className="auth-form-header">
                        <h2>{mode === 'login' ? 'Welcome Back' : 'Create Candidate Account'}</h2>
                        <p>
                            {mode === 'login'
                                ? 'Enter your credentials to access your workspace and company dashboard'
                                : 'Register to submit applications, track review status, and receive hiring updates'}
                        </p>
                    </div>

                    {mode === 'register' && (
                        <div className="candidate-notice-box">
                            <div className="notice-icon">💡</div>
                            <div className="notice-text">
                                Public registration grants <strong>Candidate Portal</strong> access. Staff and executive roles (CEO, CTO, HR, Manager, Employee) are provisioned directly by company administration.
                            </div>
                        </div>
                    )}

                    {/* Authentication Form */}
                    <form className="auth-main-form" onSubmit={handleSubmit} noValidate>
                        {mode === 'register' ? (
                            <>
                                <div className="input-group">
                                    <label htmlFor="reg-name">Full Name *</label>
                                    <div className="input-with-icon">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <input
                                            id="reg-name"
                                            type="text"
                                            name="name"
                                            value={registerForm.name}
                                            onChange={handleRegisterChange}
                                            placeholder="e.g. Asad Farooq"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="reg-email">Email Address *</label>
                                    <div className="input-with-icon">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        <input
                                            id="reg-email"
                                            type="email"
                                            name="email"
                                            value={registerForm.email}
                                            onChange={handleRegisterChange}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="reg-phone">Phone Number (Optional)</label>
                                    <div className="input-with-icon">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <input
                                            id="reg-phone"
                                            type="tel"
                                            name="phone"
                                            value={registerForm.phone}
                                            onChange={handleRegisterChange}
                                            placeholder="+92-300-1234567"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <div className="label-row">
                                        <label htmlFor="reg-password">Password *</label>
                                        <button
                                            type="button"
                                            className="toggle-pw-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <div className="input-with-icon">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input
                                            id="reg-password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={registerForm.password}
                                            onChange={handleRegisterChange}
                                            placeholder="Create a strong password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <div className="label-row">
                                        <label htmlFor="reg-confirm-pw">Confirm Password *</label>
                                        <button
                                            type="button"
                                            className="toggle-pw-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <div className="input-with-icon">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input
                                            id="reg-confirm-pw"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={registerForm.confirmPassword}
                                            onChange={handleRegisterChange}
                                            placeholder="Re-enter your password"
                                            required
                                        />
                                    </div>
                                    {registerForm.confirmPassword && (
                                        <div className={`pw-match-indicator ${doPasswordsMatch ? 'match' : 'no-match'}`}>
                                            {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </div>
                                    )}
                                </div>

                                {/* Live Password Security Checklist */}
                                <div className="premium-pw-checklist">
                                    <div className="checklist-heading">Password Security Requirements</div>
                                    <div className="checklist-items">
                                        <div className={`checklist-item ${passwordChecks.length ? 'met' : ''}`}>
                                            <span className="check-icon">{passwordChecks.length ? '✓' : '○'}</span>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className={`checklist-item ${passwordChecks.uppercase ? 'met' : ''}`}>
                                            <span className="check-icon">{passwordChecks.uppercase ? '✓' : '○'}</span>
                                            <span>One uppercase letter (A-Z)</span>
                                        </div>
                                        <div className={`checklist-item ${passwordChecks.lowercase ? 'met' : ''}`}>
                                            <span className="check-icon">{passwordChecks.lowercase ? '✓' : '○'}</span>
                                            <span>One lowercase letter (a-z)</span>
                                        </div>
                                        <div className={`checklist-item ${passwordChecks.number ? 'met' : ''}`}>
                                            <span className="check-icon">{passwordChecks.number ? '✓' : '○'}</span>
                                            <span>One numeric digit (0-9)</span>
                                        </div>
                                        <div className={`checklist-item ${passwordChecks.special ? 'met' : ''}`}>
                                            <span className="check-icon">{passwordChecks.special ? '✓' : '○'}</span>
                                            <span>One special symbol (!@#$%^&*)</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="input-group">
                                    <label htmlFor="login-email">Work / Account Email</label>
                                    <div className="input-with-icon">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        <input
                                            id="login-email"
                                            type="email"
                                            name="email"
                                            value={loginForm.email}
                                            onChange={handleLoginChange}
                                            placeholder="Enter your email address"
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <div className="label-row">
                                        <label htmlFor="login-password">Password</label>
                                        <button
                                            type="button"
                                            className="toggle-pw-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <div className="input-with-icon">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={loginForm.password}
                                            onChange={handleLoginChange}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="auth-alert-box alert-danger">
                                <span className="alert-icon">⚠️</span>
                                <span className="alert-msg">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading || (mode === 'register' && (!isPasswordValid || !doPasswordsMatch))}
                        >
                            {loading ? (
                                <span className="btn-loading-content">
                                    <span className="btn-spinner"></span>
                                    <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                                </span>
                            ) : (
                                <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Candidate Account'}</span>
                            )}
                        </button>
                    </form>

                    <div className="auth-card-footer">
                        <p>Enterprise Security Notice • Protected by Role-Based Access Controls</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

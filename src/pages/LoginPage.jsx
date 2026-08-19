import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { setStoredUser, setToken } from '../utils/auth';

const defaultLoginForm = {
    email: 'admin@company.com',
    password: 'admin123',
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
            setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="brand" style={{ marginBottom: '12px', padding: 0 }}>
                    <div className="brand-mark">M</div>
                    <div className="brand-text">
                        <h3>Management System</h3>
                        <span>Enterprise Portal</span>
                    </div>
                </div>

                <div className="auth-toggle">
                    <button
                        type="button"
                        className={mode === 'login' ? 'active' : ''}
                        onClick={() => switchMode('login')}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        className={mode === 'register' ? 'active' : ''}
                        onClick={() => switchMode('register')}
                    >
                        Register
                    </button>
                </div>

                <h2>{mode === 'login' ? 'Welcome back' : 'Create an Account'}</h2>
                <p className="auth-subtitle">
                    {mode === 'login'
                        ? 'Sign in to access your company dashboard and workspace'
                        : 'Register as a candidate to apply for positions and track applications'}
                </p>

                {mode === 'register' ? (
                    <div style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--primary-soft)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.76rem',
                        color: 'var(--primary-text)',
                        marginBottom: '12px'
                    }}>
                        ℹ️ Public registrations create a <strong>Candidate</strong> portal account. Internal staff accounts (CEO, CTO, HR, Manager, Employee, Intern) are created by authorized company administrators.
                    </div>
                ) : null}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {mode === 'register' ? (
                        <>
                            <div className="field">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={registerForm.name}
                                    onChange={handleRegisterChange}
                                    placeholder="e.g. Sara Ahmed"
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={registerForm.email}
                                    onChange={handleRegisterChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Phone Number (Optional)</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={registerForm.phone}
                                    onChange={handleRegisterChange}
                                    placeholder="+92-300-1234567"
                                />
                            </div>

                            <div className="field">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>Password *</label>
                                    <span
                                        style={{ fontSize: '0.74rem', color: 'var(--primary-text)', cursor: 'pointer', fontWeight: 600 }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </span>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={registerForm.password}
                                    onChange={handleRegisterChange}
                                    placeholder="Min 8 chars, 1 Uppercase, 1 Number, 1 Symbol"
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Confirm Password *</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={registerForm.confirmPassword}
                                    onChange={handleRegisterChange}
                                    placeholder="Re-type your password"
                                    required
                                />
                                {registerForm.confirmPassword && (
                                    <div style={{
                                        fontSize: '0.72rem',
                                        marginTop: '4px',
                                        color: doPasswordsMatch ? 'var(--success)' : 'var(--danger)',
                                        fontWeight: 600
                                    }}>
                                        {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </div>
                                )}
                            </div>

                            <div className="pw-checklist">
                                <div className="pw-checklist-title">Password Security Requirements</div>
                                <div className={`pw-rule ${passwordChecks.length ? 'valid' : 'invalid'}`}>
                                    <span className="pw-rule-dot" />
                                    <span>At least 8 characters long</span>
                                </div>
                                <div className={`pw-rule ${passwordChecks.uppercase ? 'valid' : 'invalid'}`}>
                                    <span className="pw-rule-dot" />
                                    <span>At least one uppercase letter (A-Z)</span>
                                </div>
                                <div className={`pw-rule ${passwordChecks.lowercase ? 'valid' : 'invalid'}`}>
                                    <span className="pw-rule-dot" />
                                    <span>At least one lowercase letter (a-z)</span>
                                </div>
                                <div className={`pw-rule ${passwordChecks.number ? 'valid' : 'invalid'}`}>
                                    <span className="pw-rule-dot" />
                                    <span>At least one number (0-9)</span>
                                </div>
                                <div className={`pw-rule ${passwordChecks.special ? 'valid' : 'invalid'}`}>
                                    <span className="pw-rule-dot" />
                                    <span>At least one special character (!@#$%^&*)</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="field">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={loginForm.email}
                                    onChange={handleLoginChange}
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>

                            <div className="field">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>Password *</label>
                                    <span
                                        style={{ fontSize: '0.74rem', color: 'var(--primary-text)', cursor: 'pointer', fontWeight: 600 }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </span>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={loginForm.password}
                                    onChange={handleLoginChange}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {error ? <div className="badge danger" style={{ justifyContent: 'center', padding: '8px' }}>{error}</div> : null}

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading || (mode === 'register' && (!isPasswordValid || !doPasswordsMatch))}
                    >
                        {loading ? (mode === 'login' ? 'Signing in...' : 'Registering candidate account...') : (mode === 'login' ? 'Sign In' : 'Create Candidate Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

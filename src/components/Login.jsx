import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { useNavigate, Navigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { currentUser, loginWithEmail, signup, loginWithGoogle, resetPassword } = useAuth();
    const navigate = useNavigate();

    // If the user's auth state exists, immediately redirect out of login
    if (currentUser) {
        return <Navigate to="/" />;
    }

    const handleValidation = () => {
        if (!email.endsWith('@york.ac.uk') && email !== 'benlairig@yorksu.org') {
            setError('Only @york.ac.uk emails are allowed.');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!handleValidation()) return;

        try {
            setLoading(true);
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                await signup(email, password, name || email.split('@')[0]);
            }
            navigate('/');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please log in.');
            } else if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                // User closed the popup, silently ignore or clear loading
                return;
            }
            setError(err.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setError('');
        setMessage('');
        try {
            setLoading(true);
            await resetPassword(email);
            setMessage('Check your inbox for password reset instructions.');
        } catch (err) {
            setError('Failed to reset password. Please check the email address.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
            <div className="competency-block max-w-md w-full shadow-crisp">
                <div className="flex justify-center mb-8">
                    <Logo className="w-40 h-40" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2 tracking-[0.05em] uppercase">Ben Lairig</h2>
                <p className="text-center text-gray-600 mb-8 font-medium">Competency Tracker</p>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">{error}</div>}
                {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wider" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required={!isLogin}
                                className="w-full border border-black p-3 focus:outline-none focus:border-accent"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider" htmlFor="email">
                            University Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full border border-black p-3 focus:outline-none focus:border-accent"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@york.ac.uk"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full border border-black p-3 focus:outline-none focus:border-accent"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        {isLogin && (
                            <div className="mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs font-bold uppercase tracking-wider hover:text-accent transition-colors underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary text-lg mt-4 shadow-crisp hover:-translate-y-0.5"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="mt-6 mb-6 flex items-center justify-center relative">
                    <div className="absolute inset-x-0 h-px bg-gray-300"></div>
                    <span className="relative z-10 bg-white px-4 text-sm font-bold text-gray-400 uppercase tracking-widest">or</span>
                </div>

                <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full btn btn-secondary text-lg flex justify-center items-center shadow-crisp hover:-translate-y-0.5"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
                    Continue with Google
                </button>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-sm font-bold underline hover:text-accent uppercase tracking-wider transition-colors"
                    >
                        {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Restricted to @york.ac.uk emails.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;

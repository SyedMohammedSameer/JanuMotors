import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { WrenchScrewdriverIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';

// Eye Icons for password visibility
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.243 4.243L9.88 9.88" />
    </svg>
);

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { state, dispatch } = useAppContext();
    const navigate = useNavigate();

    // Decorative particles: positions are generated once so they don't jump around on every keystroke.
    const particles = useMemo(
        () =>
            Array.from({ length: 14 }, () => ({
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
            })),
        []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!supabase) {
            setError('Database not configured. Check your environment variables.');
            setIsLoading(false);
            return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            setError(authError.message);
            setIsLoading(false);
            return;
        }

        dispatch({ type: 'LOGIN' });
        navigate('/', { replace: true });
    };

    // Already signed in (e.g. page refresh restored the session): skip the form.
    if (state.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gradient-luxury flex items-center justify-center px-4 py-8 sm:p-6 relative overflow-hidden">
            {/* Background Particles (decorative, never intercept clicks) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                {particles.map((style, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-primary-500/20 rounded-full animate-float motion-reduce:animate-none"
                        style={style}
                    ></div>
                ))}
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md relative z-10">
                <div className="card-luxury p-4 min-[360px]:p-5 sm:p-8 space-y-6 sm:space-y-8 animate-slide-up">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-luxury border-2 border-primary-500/40 shadow-gold">
                            <img src="/assets/logo.png" alt="JANU MOTORS" className="h-full w-full object-cover" />
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">JANU MOTORS</h1>
                            <p className="text-primary-500/80 font-medium tracking-wider text-xs uppercase">Premium Garage Management</p>
                        </div>

                        <div className="space-y-1 pt-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-white">Welcome Back</h2>
                            <p className="text-sm text-white/60">Sign in to access your garage management system</p>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input w-full px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-primary-500/50 transition-all duration-300"
                                placeholder="admin@janumotor.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input w-full px-4 py-3 pr-12 text-white placeholder-white/50 focus:ring-2 focus:ring-primary-500/50 transition-all duration-300"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                    className="absolute inset-y-0 right-0 w-12 flex items-center justify-center rounded-r-lg text-primary-500/60 hover:text-primary-500 focus:outline-none focus-visible:text-primary-500 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/50 transition-colors duration-300"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 flex-shrink-0 accent-primary-500 bg-dark-50 border-primary-500/30 rounded focus:ring-primary-500/50 focus:ring-2"
                                />
                                <span className="text-sm text-white/70 whitespace-nowrap">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm text-primary-500 hover:text-primary-400 whitespace-nowrap min-h-[44px] sm:min-h-0 transition-colors duration-300"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Error Message (kept next to the button so it is visible on short screens) */}
                        {error && (
                            <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                <p className="text-sm text-red-400 text-center break-words">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            aria-busy={isLoading}
                            aria-label={isLoading ? 'Signing in' : undefined}
                            className="btn-luxury w-full h-12 px-4 rounded-lg text-base font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="loading-dot w-2 h-2 bg-black rounded-full"></span>
                                    <span className="loading-dot w-2 h-2 bg-black rounded-full"></span>
                                    <span className="loading-dot w-2 h-2 bg-black rounded-full"></span>
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 sm:mt-8 space-y-2">
                    <p className="text-white/50 text-xs sm:text-sm">© {new Date().getFullYear()} JANU MOTORS. All rights reserved.</p>
                    <div className="flex items-center justify-center gap-1.5">
                        <div className="w-1.5 h-1.5 flex-shrink-0 bg-primary-500 rounded-full"></div>
                        <p className="text-xs text-white/50">Secure & Encrypted</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WrenchScrewdriverIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

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
    const { dispatch } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate login delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch({ type: 'LOGIN' });
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-primary-500/20 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md relative z-10">
                <div className="card-luxury p-8 space-y-8 animate-slide-up">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="relative mx-auto w-20 h-20 mb-6">
                            <div className="absolute inset-0 bg-gradient-gold rounded-full animate-pulse-gold"></div>
                            <div className="relative z-10 w-full h-full bg-gradient-luxury rounded-full flex items-center justify-center border-2 border-primary-500/30">
                                <WrenchScrewdriverIcon className="h-10 w-10 text-primary-500 icon-glow" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-gradient">JANU MOTORS</h1>
                            <p className="text-primary-500/80 font-medium tracking-wider text-sm uppercase">Premium Garage Management</p>
                        </div>
                        
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
                            <p className="text-white/60">Sign in to access your garage management system</p>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-white/80">
                                Email Address
                            </label>
                            <div className="relative">
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
                                <div className="absolute inset-0 rounded-lg bg-primary-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-white/80">
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
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500/60 hover:text-primary-500 transition-colors duration-300"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                                <div className="absolute inset-0 rounded-lg bg-primary-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-primary-500 bg-dark-50 border-primary-500/30 rounded focus:ring-primary-500/50 focus:ring-2"
                                />
                                <span className="text-sm text-white/70">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm text-primary-500 hover:text-primary-400 transition-colors duration-300"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-luxury w-full py-3 text-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="loading-dot w-2 h-2 bg-black rounded-full"></div>
                                    <div className="loading-dot w-2 h-2 bg-black rounded-full"></div>
                                    <div className="loading-dot w-2 h-2 bg-black rounded-full"></div>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Info */}
                    <div className="text-center space-y-3">
                        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"></div>
                        <div className="glass rounded-lg p-4 border border-primary-500/20">
                            <p className="text-sm text-white/60 mb-2">Demo Access</p>
                            <p className="text-xs text-primary-500/80">Any email and password will work for this demo</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 space-y-2">
                    <p className="text-white/40 text-sm">© 2025 JANU MOTORS. All rights reserved.</p>
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                        <p className="text-xs text-primary-500/60">Secure & Encrypted</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WrenchScrewdriverIcon } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { dispatch } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate a successful login
        dispatch({ type: 'LOGIN' });
        navigate('/', { replace: true });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center mb-4">
                        <WrenchScrewdriverIcon className="h-12 w-12 text-primary-600" />
                        <span className="ml-3 text-3xl font-bold text-gray-800 dark:text-white">JANU MOTORS</span>
                    </div>
                    <h2 className="text-xl text-center text-gray-600 dark:text-gray-300">
                        Welcome back! Please sign in.
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Email address (e.g., admin@example.com)"
                            />
                        </div>
                        <div>
                            <label htmlFor="password"className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Password (e.g., password)"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                 <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    This is a demo. Any login will work.
                </p>
            </div>
        </div>
    );
};

export default Login;
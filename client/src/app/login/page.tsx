"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000') + '/api/login';
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            localStorage.setItem('accessToken', data.access_token);
            router.push('/home');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid username or password. Please try again.';
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50 flex flex-col items-center justify-center text-gray-800 font-sans">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                        S
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-teal-700">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">Log in to continue your wellness journey</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mt-4">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link href="/forgot-password" className="font-medium text-teal-600 hover:text-teal-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-teal-500 text-white rounded-md shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <div className="text-center text-sm mt-4">
                    <p className="text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-teal-600 hover:text-teal-500">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
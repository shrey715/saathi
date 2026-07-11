"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { access_token } = await authApi.login({ username, password });
            localStorage.setItem('accessToken', access_token);
            router.push('/home');
        } catch (err: unknown) {
            const errorMessage = err instanceof ApiError ? err.message : 'Invalid username or password. Please try again.';
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: 'var(--mood-focus)' }} />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: 'var(--mood-joy)' }} />
            <div className="w-full max-w-md bg-card rounded-3xl shadow-neu-lg p-8 relative">
                <div className="text-center">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-display font-bold mx-auto shadow-neu-sm">
                        S
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-foreground">Welcome Back</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Log in to continue your wellness journey</p>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm mt-4">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-foreground">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-4 py-2.5 bg-background border-transparent rounded-xl shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2.5 bg-background border-transparent rounded-xl shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-full shadow-neu-sm hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <div className="text-center text-sm mt-4">
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

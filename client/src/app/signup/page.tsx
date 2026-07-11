"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';

export default function Signup() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setSex] = useState('');
    const [dob, setDob] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            await authApi.signup({ username, password, gender, dob });
            router.push('/login?registered=true');
        } catch (err: unknown) {
            setError(err instanceof ApiError ? err.message : 'Failed to create account. Please try again.');
            console.error('Signup error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: 'var(--mood-tender)' }} />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ background: 'var(--mood-growth)' }} />
            <div className="w-full max-w-md bg-card rounded-3xl shadow-neu-lg p-8 relative">
                <div className="text-center">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-display font-bold mx-auto shadow-neu-sm">
                        S
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-foreground">Join Saathi</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Create an account and start your wellness journey</p>
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
                                placeholder="Be anonymous, or don't :)"
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2.5 bg-background border-transparent rounded-xl shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-foreground">
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                value={gender}
                                onChange={(e) => setSex(e.target.value)}
                                className="mt-1 block w-full px-4 py-2.5 bg-background border-transparent rounded-xl shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            >
                                <option value="" disabled>
                                    Select your gender
                                </option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-foreground">
                                Date of Birth
                            </label>
                            <input
                                id="dob"
                                name="dob"
                                type="text"
                                required
                                value={dob}
                                placeholder="mm/dd/yyyy"
                                pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                                onFocus={(e) => (e.target.type = 'date')}
                                onBlur={(e) => (e.target.type = 'text')}
                                onChange={(e) => setDob(e.target.value)}
                                className="mt-1 block w-full px-4 py-2.5 bg-background border-transparent rounded-xl shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-full shadow-neu-sm hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="text-center text-sm mt-4">
                    <p className="text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            Log in
                        </Link>
                    </p>
                </div>

                <div className="text-xs text-center text-muted-foreground mt-4">
                    By signing up, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:text-primary/80">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary/80">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from './insforge';

interface User {
    id: string;
    email?: string;
    name?: string;
    avatar_url?: string;
    phone?: string;
    provider?: string;
    emailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    profile?: {
        name?: string;
        avatar_url?: string;
        phone?: string;
        [key: string]: any;
    };
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithOAuth: (provider: 'google' | 'linkedin' | 'github') => Promise<void>;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithOAuth: async () => { },
    signOut: async () => { },
    refreshSession: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function hydrateAuth() {
            const { data, error } = await insforge.auth.getCurrentUser();

            if (cancelled) return;

            if (error || !data?.user) {
                // Token might be expired - try to refresh the session
                try {
                    const { data: refreshData, error: refreshError } = await insforge.auth.refreshSession(
                        {} // SDK will read refresh token from httpOnly cookie automatically
                    );

                    if (cancelled) return;

                    if (refreshError || !refreshData?.user) {
                        setUser(null);
                    } else {
                        setUser(refreshData.user as User);
                    }
                } catch (refreshErr) {
                    console.error('[Auth] Refresh error:', refreshErr);
                    if (!cancelled) setUser(null);
                }
            } else {
                setUser(data.user as User);
            }
            setLoading(false);
        }

        void hydrateAuth();
        return () => {
            cancelled = true;
        };
    }, []);

    const signInWithOAuth = async (provider: 'google' | 'linkedin' | 'github') => {
        await insforge.auth.signInWithOAuth({
            provider,
            redirectTo: `${window.location.origin}/auth/callback`,
        });
    };

    const signOut = async () => {
        const { error } = await insforge.auth.signOut();
        if (!error) {
            setUser(null);
        }
    };

    const refreshSession = async (): Promise<boolean> => {
        try {
            const { data, error } = await insforge.auth.refreshSession({});
            if (error || !data?.user) {
                setUser(null);
                return false;
            }
            setUser(data.user as User);
            return true;
        } catch (err) {
            console.error('[Auth] Manual refresh error:', err);
            setUser(null);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithOAuth, signOut, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

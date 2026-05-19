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
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithOAuth: (provider: 'google' | 'linkedin' | 'github') => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithOAuth: async () => { },
    signOut: async () => { },
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
                setUser(null);
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

    return (
        <AuthContext.Provider value={{ user, loading, signInWithOAuth, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

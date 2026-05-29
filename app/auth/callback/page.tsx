"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function AuthCallbackPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [timeoutReached, setTimeoutReached] = useState(false);

    useEffect(() => {
        // The InsForge SDK auto-detects insforge_code in the URL and exchanges it
        // We just need to wait for AuthContext to hydrate with the user

        if (!loading) {
            if (user) {

                // Auth successful - check if onboarding is complete
                if (user.profile?.phone) {
                    router.push("/dashboard");
                } else {
                    router.push("/onboarding");
                }
            } else if (timeoutReached) {
                // Timeout reached with no user, redirect back to login
                console.error('[Callback] Timeout reached, redirecting to login');
                router.push("/auth/login");
            }
        }

        // Set timeout after 8 seconds (increased from 5s to allow for slower networks)
        const timer = setTimeout(() => {
            if (!user && loading) {
                console.warn('[Callback] Setting timeout flag');
                setTimeoutReached(true);
            }
        }, 8000);

        return () => clearTimeout(timer);
    }, [user, loading, router, timeoutReached]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-4 text-center max-w-md">
                <Loader2Icon className="w-12 h-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-semibold text-foreground">
                    Completing sign in...
                </h2>
                <p className="text-sm text-muted-foreground">
                    Please wait while we verify your account
                </p>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast, Toaster } from "sonner";
import { insforge } from "@/lib/auth/insforge";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        async function handleCallback() {
            try {

                // Check if there's an OAuth code in the URL
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get("insforge_code");
                const error = urlParams.get("insforge_error");


                if (error) {
                    console.error('[Callback] Auth error:', error);
                    setStatus("error");
                    toast.error("Authentication failed. Please try again.");
                    setTimeout(() => router.push("/auth/login"), 2000);
                    return;
                }

                if (code) {
                    // Exchange the code for a session
                    const { data, error: exchangeError } = await insforge.auth.exchangeOAuthCode(code);


                    if (exchangeError) {
                        console.error("[Callback] OAuth exchange error:", exchangeError);
                        setStatus("error");
                        toast.error("Failed to complete sign in");
                        setTimeout(() => router.push("/auth/login"), 2000);
                        return;
                    }

                    if (data?.accessToken) {
                        setStatus("success");
                        toast.success("Login successful! Redirecting to dashboard...");
                        // Give the SDK time to save the session before redirecting
                        setTimeout(() => {
                            router.push("/dashboard");
                        }, 1500);
                        return;
                    }
                }

                // If no code in URL, SDK might have auto-handled it
                // Check if user is already authenticated
                const { data: userData, error: userError } = await insforge.auth.getCurrentUser();

                if (userData?.user) {
                    setStatus("success");
                    toast.success("Login successful! Redirecting to dashboard...");
                    // Give the SDK time to save the session before redirecting
                    setTimeout(() => {
                        router.push("/dashboard");
                    }, 1500);
                } else {
                    console.error('[Callback] No user found after callback');
                    setStatus("error");
                    toast.error("Authentication failed. Please try again.");
                    setTimeout(() => router.push("/auth/login"), 2000);
                }
            } catch (err) {
                console.error("[Callback] Callback error:", err);
                setStatus("error");
                toast.error("An error occurred during sign in");
                setTimeout(() => router.push("/auth/login"), 2000);
            }
        }

        handleCallback();
    }, [router]);

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-4 text-center max-w-md">
                    {status === "loading" && (
                        <>
                            <Loader2Icon className="w-12 h-12 animate-spin text-primary mx-auto" />
                            <h2 className="text-xl font-semibold text-foreground">
                                Completing sign in...
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Please wait while we verify your account
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-foreground">
                                Login successful!
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Redirecting you to the dashboard...
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-foreground">
                                Authentication failed
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Redirecting you back to login...
                            </p>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

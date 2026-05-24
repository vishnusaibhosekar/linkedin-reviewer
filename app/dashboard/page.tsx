"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2Icon, LogOut, User, Download, FileText, TrendingUp, Clock, CheckCircle2, Play, Shield, Plus, User2 } from "lucide-react";
import Logo from "@/app/components/Logo";
import { toast } from "sonner";

interface Review {
    id: string;
    overall_score: number | null;
    score_band: string | null;
    status: string;
    created_at: string;
    full_name: string;
    professional_status: string;
}

interface RewriteOrder {
    id: string;
    status: string;
    payment_status: string;
    created_at: string;
    due_date: string;
    deliverable_path: string | null;
    reviews: {
        full_name: string;
        overall_score: number | null;
        score_band: string | null;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, signOut, refreshSession } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [rewrites, setRewrites] = useState<RewriteOrder[]>([]);
    const [loadingRewrites, setLoadingRewrites] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Don't do anything if user is signing out
        if (isSigningOut) return;

        if (!loading && !user) {
            // Try to refresh session before redirecting to login
            handleAuthExpired();
        } else if (!loading && user) {
            fetchReviews();
            fetchRewrites();
        }

        // Cleanup: abort pending requests on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };
    }, [user, loading, router, isSigningOut]);

    const handleAuthExpired = async () => {
        console.log('[Dashboard] Auth appears expired, attempting refresh...');
        const refreshed = await refreshSession();
        if (refreshed) {
            console.log('[Dashboard] Session refreshed successfully, staying on dashboard');
            // Session was refreshed, re-fetch data
            fetchReviews();
            fetchRewrites();
        } else {
            console.log('[Dashboard] Refresh failed, redirecting to login');
            router.push('/auth/login');
        }
    };

    const fetchReviews = async () => {
        try {
            // Create new abort controller if one doesn't exist
            if (!abortControllerRef.current) {
                abortControllerRef.current = new AbortController();
            }

            const res = await fetch(`/api/reviews?userId=${user?.id}`, {
                credentials: 'include',
                signal: abortControllerRef.current.signal
            });

            // If unauthorized, try to refresh session (but not during sign out)
            if (res.status === 401) {
                if (isSigningOut) return; // Don't retry during logout

                console.log('[Dashboard] fetchReviews got 401, attempting refresh...');
                const refreshed = await refreshSession();
                if (refreshed) {
                    // Retry the fetch with refreshed session
                    return fetchReviews();
                } else {
                    router.push('/auth/login');
                    return;
                }
            }

            const data = await res.json();
            if (res.ok && data.success) {
                // Filter out pending reviews (awaiting payment)
                const activeReviews = data.reviews.filter(
                    (review: Review) => review.status !== 'pending'
                );
                setReviews(activeReviews);
            }
        } catch (error: any) {
            // Ignore aborted requests (happens during logout/navigation)
            if (error.name === 'AbortError') {
                return;
            }
            // Only log other errors, don't crash
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const fetchRewrites = async () => {
        try {
            // Reuse the same abort controller
            if (!abortControllerRef.current) {
                abortControllerRef.current = new AbortController();
            }

            const res = await fetch(`/api/rewrites?userId=${user?.id}`, {
                credentials: 'include',
                signal: abortControllerRef.current.signal
            });

            // If unauthorized, try to refresh session (but not during sign out)
            if (res.status === 401) {
                if (isSigningOut) return; // Don't retry during logout

                console.log('[Dashboard] fetchRewrites got 401, attempting refresh...');
                const refreshed = await refreshSession();
                if (refreshed) {
                    // Retry the fetch with refreshed session
                    return fetchRewrites();
                } else {
                    router.push('/auth/login');
                    return;
                }
            }

            const data = await res.json();
            if (res.ok && data.success) {
                // Filter out unpaid rewrites (pending_payment status or pending payment_status)
                const activeRewrites = data.rewrites.filter(
                    (rewrite: RewriteOrder) =>
                        rewrite.status !== 'pending_payment' &&
                        rewrite.status !== 'cancelled' &&
                        rewrite.payment_status !== 'pending'
                );
                setRewrites(activeRewrites);
            }
        } catch (error: any) {
            // Ignore aborted requests (happens during logout/navigation)
            if (error.name === 'AbortError') {
                return;
            }
            // Only log other errors, don't crash
            console.error('Failed to fetch rewrites:', error);
        } finally {
            setLoadingRewrites(false);
        }
    };

    const handleDownloadRewrite = async (rewriteId: string, deliverablePath: string) => {
        try {
            const response = await fetch(`/api/rewrites/download?userId=${user?.id}&path=${encodeURIComponent(deliverablePath)}`);
            if (response.ok) {
                const { downloadUrl } = await response.json();
                window.open(downloadUrl, '_blank');
            } else {
                toast.error('Failed to download rewrite');
            }
        } catch (error) {
            toast.error('Failed to download rewrite');
        }
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);

        // Abort any pending fetch requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        await signOut();
        // Small delay to ensure isSigningOut state is processed before redirect
        // This prevents useEffect from trying to refresh session
        setTimeout(() => {
            router.push("/");
        }, 50);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const statusConfig: Record<string, { label: string; bg: string; icon: any }> = {
            pending_payment: { label: 'Payment Pending', bg: 'bg-gray-100 text-gray-700 border border-gray-200', icon: Clock },
            paid: { label: 'Paid', bg: 'bg-blue-50 text-blue-700 border border-blue-200', icon: CheckCircle2 },
            in_progress: { label: 'In Progress', bg: 'bg-yellow-50 text-yellow-700 border border-yellow-200', icon: Play },
            completed: { label: 'Completed', bg: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
            delivered: { label: 'Delivered', bg: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
        };

        const config = statusConfig[status] || { label: status, bg: 'bg-gray-100 text-gray-700 border border-gray-200', icon: Clock };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Logo size="sm" />
                        </div>

                        {/* User Info & Sign Out */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                            </div>
                            <Button
                                onClick={handleSignOut}
                                variant="outline"
                                size="sm"
                                className="gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap border-gray-300"
                            >
                                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-6">
                        <User2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Welcome!
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
                        Analyze your LinkedIn profile and get actionable insights to improve your professional presence.
                    </p>

                    <div className="pt-8">
                        <Button
                            size="lg"
                            onClick={() => router.push('/dashboard/new-review')}
                            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 text-white font-semibold"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Start New Review
                        </Button>
                    </div>
                </div>

                {/* Past Reviews Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Your Reviews</h3>
                    </div>

                    {loadingReviews ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                            <Loader2Icon className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                            <p className="text-sm text-gray-500 mt-4">Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-600">No reviews yet</p>
                            <p className="text-sm text-gray-400 mt-2">Start your first LinkedIn profile review to see it here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => {
                                const score = review.overall_score ?? 0;
                                const radius = 28;
                                const circumference = 2 * Math.PI * radius;
                                const filled = (score / 100) * circumference;
                                const color =
                                    score >= 90 ? '#16a34a' :
                                        score >= 80 ? '#ceeb3fff' :
                                            score >= 70 ? '#ea580c' :
                                                '#dc2626';

                                return (
                                    <div
                                        key={review.id}
                                        onClick={() => router.push(`/dashboard/review/${review.id}/report`)}
                                        className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 text-lg">{review.full_name}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {!review.overall_score && (
                                                    <p className="text-sm text-blue-600 mt-1 font-medium">Processing...</p>
                                                )}
                                            </div>
                                            {review.overall_score ? (
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                                                        <circle
                                                            cx="32" cy="32" r={radius}
                                                            fill="none"
                                                            stroke="#E5E7EB"
                                                            strokeWidth="6"
                                                        />
                                                        <circle
                                                            cx="32" cy="32" r={radius}
                                                            fill="none"
                                                            stroke={color}
                                                            strokeWidth="6"
                                                            strokeLinecap="round"
                                                            strokeDasharray={`${filled} ${circumference}`}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-gray-900">{score}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
                                                    {review.status}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* My Rewrites Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">My Rewrites</h3>
                    </div>

                    {loadingRewrites ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                            <Loader2Icon className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                            <p className="text-sm text-gray-500 mt-4">Loading rewrites...</p>
                        </div>
                    ) : rewrites.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No rewrite orders yet</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Purchase a rewrite from your score report to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rewrites.map((rewrite) => (
                                <div
                                    key={rewrite.id}
                                    className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-200 transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-lg">LinkedIn Rewrite</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {rewrite.reviews?.full_name || 'Profile Rewrite'} - Score: {rewrite.reviews?.overall_score || 'N/A'}/100
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Ordered on {new Date(rewrite.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            {rewrite.due_date && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Due: {new Date(rewrite.due_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right space-y-2 flex-shrink-0 ml-4">
                                            <StatusBadge status={rewrite.status} />
                                            {rewrite.deliverable_path && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownloadRewrite(rewrite.id, rewrite.deliverable_path!)}
                                                    className="border-gray-300"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

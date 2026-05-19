"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2Icon, LogOut, User } from "lucide-react";
import Logo from "@/app/components/Logo";

interface Review {
    id: string;
    overall_score: number | null;
    score_band: string | null;
    status: string;
    created_at: string;
    full_name: string;
    professional_status: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, signOut } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    useEffect(() => {
        if (!loading && !user && !isSigningOut) {
            router.push("/auth/login");
        } else if (!loading && user) {
            fetchReviews();
        }
    }, [user, loading, router, isSigningOut]);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/reviews');
            const data = await res.json();
            if (res.ok && data.success) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut();
        router.push("/");
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-[#DFE1E6] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        {/* Logo - shrink on mobile */}
                        <div className="flex-shrink-0">
                            <Logo size="sm" />
                        </div>

                        {/* User Info & Sign Out - hide email on mobile */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-[#172B4D]">{user.name}</p>
                                <p className="text-xs text-[#6B778C] truncate max-w-[150px]">{user.email}</p>
                            </div>
                            {/* Mobile: Just show name */}
                            {/* <div className="text-right sm:hidden">
                                <p className="text-xs font-medium text-[#172B4D]">{user.name || "User"}</p>
                            </div> */}
                            <Button
                                onClick={handleSignOut}
                                variant="outline"
                                size="sm"
                                className="gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
                            >
                                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                                <span className="sm:hidden"></span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold text-[#172B4D]">
                        Welcome back! 👋
                    </h2>
                    <p className="text-lg text-[#6B778C] max-w-2xl mx-auto">
                        Analyze your LinkedIn profile and get actionable insights to improve your professional presence.
                    </p>

                    <div className="pt-8">
                        <Button
                            size="lg"
                            className="text-lg px-8 py-6"
                            onClick={() => router.push('/dashboard/new-review')}
                        >
                            <User className="w-5 h-5 mr-2" />
                            Start New Review
                        </Button>
                    </div>
                </div>

                {/* Past Reviews Section */}
                <div className="mt-16">
                    <h3 className="text-2xl font-semibold text-[#172B4D] mb-6">Past Reviews</h3>

                    {loadingReviews ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-12 text-center">
                            <Loader2Icon className="w-8 h-8 animate-spin text-[#0052CC] mx-auto" />
                            <p className="text-sm text-[#6B778C] mt-4">Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-12 text-center">
                            <div className="text-[#6B778C]">
                                <p className="text-lg">No reviews yet</p>
                                <p className="text-sm mt-2">Start your first LinkedIn profile review to see it here</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    onClick={() => router.push(`/dashboard/review/${review.id}/report`)}
                                    className="bg-white rounded-lg shadow border border-[#DFE1E6] p-6 cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-[#6B778C]">
                                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-lg font-semibold text-[#172B4D] mt-1">
                                                {review.overall_score ? `Score: ${review.overall_score}/100` : 'Processing...'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {review.score_band ? (
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${review.score_band === 'Exceptional' || review.score_band === 'Strong'
                                                        ? 'bg-green-100 text-green-800'
                                                        : review.score_band === 'Average'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {review.score_band}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {review.status}
                                                </span>
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

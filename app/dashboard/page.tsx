"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2Icon, LogOut, User } from "lucide-react";
import Logo from "@/app/components/Logo";

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, signOut } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    useEffect(() => {
        if (!loading && !user && !isSigningOut) {
            router.push("/auth/login");
        } else if (!loading && user) {
        }
    }, [user, loading, router, isSigningOut]);

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
                        <Button size="lg" className="text-lg px-8 py-6">
                            <User className="w-5 h-5 mr-2" />
                            Start New Review
                        </Button>
                    </div>
                </div>

                {/* Past Reviews Section */}
                <div className="mt-16">
                    <h3 className="text-2xl font-semibold text-[#172B4D] mb-6">Past Reviews</h3>
                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-12 text-center">
                        <div className="text-[#6B778C]">
                            <p className="text-lg">No reviews yet</p>
                            <p className="text-sm mt-2">Start your first LinkedIn profile review to see it here</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

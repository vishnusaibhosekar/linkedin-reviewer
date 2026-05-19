"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2Icon, LogOut, User } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading, signOut } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth/login");
        } else if (!loading && user) {
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/auth/login");
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
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#0077b5] rounded flex items-center justify-center text-white font-bold text-sm">
                            in
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">LinkedIn Reviewer</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{user.name || user.email || "User"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold text-foreground">
                        Welcome back! 👋
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                    <h3 className="text-2xl font-semibold text-foreground mb-6">Past Reviews</h3>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                        <div className="text-muted-foreground">
                            <p className="text-lg">No reviews yet</p>
                            <p className="text-sm mt-2">Start your first LinkedIn profile review to see it here</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

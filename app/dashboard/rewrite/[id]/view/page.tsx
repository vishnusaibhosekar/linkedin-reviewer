"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LinkedInProfileView from '@/app/components/LinkedInProfileView';

export default function ViewRewritePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const rewriteId = params.id as string;

    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchRewrittenProfile();
    }, [user, rewriteId]);

    const fetchRewrittenProfile = async () => {
        try {
            const res = await fetch(`/api/rewrites/${rewriteId}`, {
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Failed to fetch rewritten profile');
            }

            const data = await res.json();

            if (data.rewriteOrder?.rewritten_profile_data) {
                setProfileData(data.rewriteOrder.rewritten_profile_data);
            } else {
                toast.error('No rewritten profile data found');
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Fetch error:', error);
            toast.error(error.message || 'Failed to load rewritten profile');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-4 text-gray-600">Loading your rewritten profile...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Your Rewritten LinkedIn Profile</h1>
                    <div className="w-32"></div>
                </div>
            </div>

            {/* Profile Preview - Full Width, No Form */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                <LinkedInProfileView profileData={profileData} />
            </div>
        </div>
    );
}

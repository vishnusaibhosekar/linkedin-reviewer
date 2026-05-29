"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CategoryScore {
    score: number;
    weight: number;
    findings: string[];
    recommendations: string[];
}

interface Recommendation {
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    impact: string;
}

interface ReviewData {
    id: string;
    full_name: string;
    status: string;
    overall_score: number;
    score_band: string;
    category_scores: {
        profile_photo_banner: CategoryScore;
        headline: CategoryScore;
        about_summary: CategoryScore;
        work_experience: CategoryScore;
        education: CategoryScore;
        skills_endorsements: CategoryScore;
        recommendations: CategoryScore;
        achievements_licenses: CategoryScore;
        activity_posts: CategoryScore;
    };
    recommendations: Recommendation[];
    strengths: string[];
    weaknesses: string[];
    created_at: string;
}

const categoryLabels: Record<string, string> = {
    profile_photo_banner: 'Profile Photo & Banner',
    headline: 'Headline',
    about_summary: 'About / Summary',
    work_experience: 'Work Experience',
    education: 'Education',
    skills_endorsements: 'Skills & Endorsements',
    recommendations: 'Recommendations',
    achievements_licenses: 'Achievements & Licenses',
    activity_posts: 'Activity & Recent Posts',
};

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const reviewId = params.id as string;

    const [review, setReview] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function fetchReview() {
            if (!user?.id) {
                return;
            }

            try {
                const response = await fetch(`/api/reviews/${reviewId}?userId=${user.id}`, {
                    credentials: 'include'
                });
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to fetch review');
                }

                setReview(result.review);
            } catch (err: any) {
                console.error('[Report] Error fetching review:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchReview();
    }, [reviewId, user]);

    const getScoreBandColor = (band: string | undefined | null) => {
        if (!band) return 'bg-[#6B778C] text-white';

        switch (band.toLowerCase()) {
            case 'excellent': return 'bg-[#00875A] text-white';
            case 'good': return 'bg-[#0052CC] text-white';
            case 'fair': return 'bg-[#FF991F] text-white';
            case 'poor': return 'bg-[#DE350B] text-white';
            default: return 'bg-[#6B778C] text-white';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const CircularProgressBar = ({ score, size = 180 }: { score: number; size?: number }) => {
        const radius = (size - 12) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#DFE1E6"
                        strokeWidth="8"
                        fill="none"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#0052CC"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-[#172B4D]">{score}</span>
                    <span className="text-sm text-[#6B778C] mt-1">out of 100</span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#0052CC] mx-auto mb-4" />
                    <p className="text-[#6B778C]">Loading your report...</p>
                </div>
            </div>
        );
    }

    if (error || !review) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-[#172B4D] mb-2">Failed to Load Report</h2>
                    <p className="text-[#6B778C] mb-6">{error || 'Review not found'}</p>
                    <Button onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const categories = Object.entries(review.category_scores || {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/dashboard')}
                            className="text-[#6B778C] hover:text-[#172B4D]"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>

                        <Button
                            onClick={() => router.push(`/dashboard/review/${reviewId}/rewrite`)}
                            className="bg-[#0052CC] text-white hover:bg-[#0043A8]"
                        >
                            Get Your LinkedIn Rewritten →
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <CircularProgressBar score={review.overall_score || 0} />

                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-[#172B4D] mb-2">
                                    {review.full_name}'s LinkedIn Review
                                </h1>
                                <p className="text-sm text-[#6B778C] mb-4">
                                    Generated on {new Date(review.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                    <span className="text-lg text-[#6B778C]">Overall Rating:</span>
                                    <span className={`px-4 py-2 rounded-full text-lg font-semibold ${getScoreBandColor(review.score_band)}`}>
                                        {review.score_band}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>



                {/* Category Scores Grid */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#172B4D] mb-6">Detailed Breakdown</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map(([key, category]) => (
                            <div key={key} className="bg-white rounded-xl border border-[#DFE1E6] p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-[#172B4D]">
                                        {categoryLabels[key] || key}
                                    </h3>
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-[#0052CC]">
                                        {category.score}/100
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-[#F4F5F7] rounded-full h-2 mb-4">
                                    <div
                                        className="bg-[#0052CC] h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${category.score}%` }}
                                    />
                                </div>

                                <div className="text-xs text-[#6B778C] mb-3">Weight: {category.weight}%</div>

                                {/* Findings */}
                                {category.findings && category.findings.length > 0 && (
                                    <div className="mb-3">
                                        <h4 className="text-xs font-semibold text-[#172B4D] mb-2">Key Findings:</h4>
                                        <ul className="space-y-1">
                                            {category.findings.slice(0, 2).map((finding, idx) => (
                                                <li key={idx} className="text-xs text-[#6B778C] flex items-start gap-2">
                                                    <span className="text-[#0052CC] mt-1">•</span>
                                                    <span>{finding}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {category.recommendations && category.recommendations.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#172B4D] mb-2">To Improve:</h4>
                                        <ul className="space-y-1">
                                            {category.recommendations.slice(0, 2).map((rec, idx) => (
                                                <li key={idx} className="text-xs text-[#6B778C] flex items-start gap-2">
                                                    <span className="text-[#00875A] mt-1">→</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Strengths */}
                    <div className="bg-white rounded-xl border border-[#DFE1E6] p-6">
                        <h2 className="text-xl font-bold text-[#172B4D] mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-[#00875A]" />
                            Strengths
                        </h2>
                        <ul className="space-y-3">
                            {review.strengths?.map((strength, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-[#00875A] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#172B4D]">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-white rounded-xl border border-[#DFE1E6] p-6">
                        <h2 className="text-xl font-bold text-[#172B4D] mb-4 flex items-center gap-2">
                            <XCircle className="w-6 h-6 text-[#DE350B]" />
                            Areas to Improve
                        </h2>
                        <ul className="space-y-3">
                            {review.weaknesses?.map((weakness, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-[#DE350B] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-[#172B4D]">{weakness}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="bg-white rounded-xl border border-[#DFE1E6] p-6 mb-8">
                    <h2 className="text-2xl font-bold text-[#172B4D] mb-6">Priority Recommendations</h2>
                    <div className="space-y-4">
                        {review.recommendations
                            ?.sort((a, b) => {
                                const priorityOrder = { high: 0, medium: 1, low: 2 };
                                return priorityOrder[a.priority] - priorityOrder[b.priority];
                            })
                            .map((rec, idx) => (
                                <div key={idx} className="border border-[#DFE1E6] rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(rec.priority)}`}>
                                            {rec.priority.toUpperCase()}
                                        </span>
                                        <span className="text-xs font-medium text-[#6B778C] bg-[#F4F5F7] px-2 py-1 rounded">
                                            {rec.category}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-[#172B4D] mb-2">{rec.action}</h3>
                                    <p className="text-sm text-[#6B778C]">
                                        <strong>Expected Impact:</strong> {rec.impact}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Rewrite CTA Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[#172B4D] mb-2">
                                Want a Professional Rewrite?
                            </h3>
                            <p className="text-sm text-[#6B778C] mb-4">
                                Get your LinkedIn profile rewritten by Manish Maryada (YC Alum, Forbes 30u30).
                                Includes Headline, About/Summary, Experience bullets, and Skills recommendations.
                                Delivered in 2–3 business days.
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push(`/dashboard/review/${reviewId}/rewrite`)}
                            className="bg-[#0052CC] text-white hover:bg-[#0043A8] whitespace-nowrap px-8 py-6 text-lg"
                        >
                            Get Your LinkedIn Rewritten →
                        </Button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/new-review')}
                        className="text-lg px-8 py-6"
                    >
                        Start New Review
                    </Button>

                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProcessingPage() {
    const params = useParams();
    const router = useRouter();
    const reviewId = params.id as string;
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'uploading' | 'parsing' | 'analyzing' | 'scoring' | 'complete'>('uploading');

    const steps = [
        { label: 'Uploading your files', status: 'uploading' },
        { label: 'Parsing your LinkedIn data', status: 'parsing' },
        { label: 'Analyzing profile optimization', status: 'analyzing' },
        { label: 'Generating your score', status: 'scoring' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setStatus('complete');
                    return 100;
                }
                return prev + 1;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress < 25) setStatus('uploading');
        else if (progress < 50) setStatus('parsing');
        else if (progress < 75) setStatus('analyzing');
        else if (progress < 100) setStatus('scoring');
    }, [progress]);

    const handleViewReport = () => {
        router.push(`/dashboard/review/${reviewId}/report`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0052CC] mb-6">
                        {status === 'complete' ? (
                            <CheckCircle className="w-10 h-10 text-white" />
                        ) : (
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        )}
                    </div>
                    <h1 className="text-3xl font-semibold text-[#172B4D] mb-3">
                        {status === 'complete' ? 'Your Review is Ready!' : 'Analyzing Your Profile'}
                    </h1>
                    <p className="text-lg text-[#6B778C]">
                        {status === 'complete'
                            ? 'We\'ve completed your comprehensive LinkedIn profile analysis'
                            : 'Our AI is working its magic to unlock your optimization potential...'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#DFE1E6] p-8 mb-6">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-[#172B4D]">Progress</span>
                            <span className="text-sm font-semibold text-[#0052CC]">{Math.min(progress, 100)}%</span>
                        </div>
                        <div className="w-full bg-[#F4F5F7] rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-[#0052CC] to-[#0747A6] h-full rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {steps.map((step, index) => {
                            const stepProgress = (index + 1) * 25;
                            const isComplete = progress >= stepProgress;
                            const isActive = status === step.status;

                            return (
                                <div key={step.status} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-[#0052CC]' : isActive ? 'bg-[#DFE1E6] animate-pulse' : 'bg-[#F4F5F7]'}`}>
                                        {isComplete ? (
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        ) : (
                                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#0052CC]' : 'bg-[#C1C7D0]'}`} />
                                        )}
                                    </div>
                                    <span className={`text-sm ${isComplete ? 'text-[#172B4D] font-medium' : isActive ? 'text-[#172B4D]' : 'text-[#6B778C]'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Complete Action */}
                {status === 'complete' && (
                    <div className="text-center">
                        <Button
                            onClick={handleViewReport}
                            className="h-12 px-8 text-base bg-[#0052CC] hover:bg-[#0747A6]"
                        >
                            View Your Score Report
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <p className="text-sm text-[#0747A6]">
                        <strong>What happens next?</strong> Once complete, you'll receive a detailed breakdown of your LinkedIn profile score with actionable recommendations to optimize your visibility and impact.
                    </p>
                </div>
            </div>
        </div>
    );
}

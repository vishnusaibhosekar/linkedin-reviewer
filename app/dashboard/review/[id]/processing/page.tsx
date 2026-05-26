"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, ArrowRight, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProcessingPage() {
    const params = useParams();
    const router = useRouter();
    const reviewId = params.id as string;
    const hasStarted = useRef(false); // prevent double-fire from React StrictMode
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'uploading' | 'parsing' | 'processing_screenshots' | 'extracting' | 'analyzing' | 'scoring' | 'recommendations' | 'finalizing' | 'complete' | 'error'>('uploading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const steps = [
        { label: 'Uploading your LinkedIn data', status: 'uploading', icon: '📤' },
        { label: 'Reading your profile', status: 'parsing', icon: '📄' },
        { label: 'Analyzing your profile screenshots', status: 'processing_screenshots', icon: '' },
        { label: 'Understanding your experience with AI', status: 'extracting', icon: '🤖' },
        { label: 'Finding optimization opportunities', status: 'analyzing', icon: '🔍' },
        { label: 'Scoring your profile across 9 areas', status: 'scoring', icon: '⭐' },
        { label: 'Creating personalized recommendations', status: 'recommendations', icon: '💡' },
        { label: 'Preparing your final report', status: 'finalizing', icon: '✨' },
    ];

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.status === status);
    };

    const startProcessing = useCallback(async () => {
        setStatus('parsing');
        setProgress(10);
        setErrorMessage('');

        try {
            // Step 1: Extract profile data (parses PDF + screenshots) (10-40%)
            setStatus('parsing');
            setProgress(15);

            const extractResponse = await fetch(`/api/reviews/${reviewId}/extract-profile`);

            setStatus('processing_screenshots');
            setProgress(25);

            const extractResult = await extractResponse.json();

            if (!extractResponse.ok) {
                throw new Error(extractResult.error || 'Failed to extract profile data');
            }

            setStatus('extracting');
            setProgress(35);

            // Simulate extraction progress (the API call already completed, but show UX feedback)
            await new Promise(resolve => setTimeout(resolve, 500));
            setProgress(40);

            // Step 2: Get base64 screenshots from sessionStorage
            // Try both keys: 'review_{id}_screenshots' (new) and 'new_review_screenshots' (legacy)
            const screenshotsJson = sessionStorage.getItem(`review_${reviewId}_screenshots`)
                || sessionStorage.getItem('new_review_screenshots');
            const screenshots = screenshotsJson ? JSON.parse(screenshotsJson) : {};
            const screenshotBase64Array = Object.values(screenshots) as string[];

            // Step 3: Call AI Scoring with base64 images (40-85%)
            setStatus('analyzing');
            setProgress(45);

            const scoreResponse = await fetch(`/api/reviews/${reviewId}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    screenshotBase64: screenshotBase64Array
                }),
            });

            setStatus('scoring');
            setProgress(60);

            const scoreResult = await scoreResponse.json();

            if (!scoreResponse.ok) {
                // If already completed (e.g. StrictMode double-fire), treat as success
                if (scoreResult.error === 'Review already completed') {
                    setProgress(100);
                    setStatus('complete');
                    toast.success('Your LinkedIn review is complete!');
                    return;
                }
                throw new Error(scoreResult.error || 'AI scoring failed');
            }

            setStatus('recommendations');
            setProgress(80);

            // Step 4: Finalize (85-100%)
            setStatus('finalizing');
            setProgress(90);

            // Small delay for UX polish
            await new Promise(resolve => setTimeout(resolve, 300));
            setProgress(95);

            setProgress(100);
            setStatus('complete');
            toast.success('Your LinkedIn review is complete!');

            // Clean up sessionStorage
            sessionStorage.removeItem(`review_${reviewId}_screenshots`);

        } catch (error: any) {
            console.error('Processing error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Analysis failed. Please try again.');
            toast.error(error.message || 'Analysis failed');
        }
    }, [reviewId]);

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        startProcessing();
    }, [startProcessing]);

    const handleRetry = () => {
        setProgress(0);
        startProcessing();
    };

    const handleViewReport = () => {
        router.push(`/dashboard/review/${reviewId}/report`);
    };

    const handleGoDashboard = () => {
        router.push('/dashboard');
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0052CC] mb-6 relative">
                        {status === 'complete' ? (
                            <CheckCircle className="w-10 h-10 text-white" />
                        ) : status === 'error' ? (
                            <AlertCircle className="w-10 h-10 text-white" />
                        ) : (
                            <>
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                                <div className="absolute inset-0 rounded-full bg-[#0052CC] animate-ping opacity-20" />
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl font-semibold text-[#172B4D] mb-3">
                        {status === 'complete'
                            ? 'Your Review is Ready!'
                            : status === 'error'
                                ? 'Analysis Failed'
                                : 'Analyzing Your Profile'}
                    </h1>
                    <p className="text-lg text-[#6B778C]">
                        {status === 'complete'
                            ? 'We\'ve completed your comprehensive LinkedIn profile analysis'
                            : status === 'error'
                                ? errorMessage
                                : 'Our AI is working its magic to unlock your optimization potential...'}
                    </p>
                </div>

                {/* Progress Section */}
                {status !== 'error' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#DFE1E6] p-8 mb-6">
                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-[#172B4D]">Progress</span>
                                <span className="text-sm font-semibold text-[#0052CC]">{Math.min(progress, 100)}%</span>
                            </div>
                            <div className="w-full bg-[#F4F5F7] rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-[#0052CC] to-[#0747A6] h-full rounded-full transition-all duration-700 ease-out relative"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                >
                                    {progress < 100 && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Active Step Display */}
                        {status !== 'complete' && currentStepIndex >= 0 && (
                            <div className="space-y-6">
                                {/* Current Step - Large & Animated */}
                                <div className="text-center py-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 animate-pulse">
                                        <span className="text-3xl">{steps[currentStepIndex].icon}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-[#172B4D] mb-2">
                                        {steps[currentStepIndex].label}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 text-[#6B778C]">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Processing...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completion Message */}
                        {status === 'complete' && (
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                    <Sparkles className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-[#172B4D] font-medium">
                                    AI Review ready!
                                </p>
                            </div>
                        )}

                        {status !== 'complete' && (
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-[#0747A6]">
                                    <strong>Note:</strong>
                                    <br />
                                    This may take 30-60 seconds depending on profile complexity. Please don't close this page.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Complete Action */}
                {status === 'complete' && (
                    <div className="text-center space-y-4">
                        <Button
                            onClick={handleViewReport}
                            className="h-12 px-8 text-base bg-[#0052CC] hover:bg-[#0747A6]"
                        >
                            View Your Score Report
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                        <div>
                            <Button
                                variant="ghost"
                                onClick={handleGoDashboard}
                                className="text-[#6B778C] hover:text-[#172B4D]"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error Action */}
                {status === 'error' && (
                    <div className="text-center space-y-4">
                        <Button
                            onClick={handleRetry}
                            className="h-12 px-8 text-base bg-[#0052CC] hover:bg-[#0747A6]"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Retry Analysis
                        </Button>
                        <div>
                            <Button
                                variant="ghost"
                                onClick={handleGoDashboard}
                                className="text-[#6B778C] hover:text-[#172B4D]"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

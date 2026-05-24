"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { insforge } from '@/lib/auth/insforge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshSession } = useAuth();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    const sessionId = searchParams.get('session_id');
    const reviewId = searchParams.get('review_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reviewId) {
                setStatus('error');
                setErrorMessage('Missing review ID');
                return;
            }

            try {
                // Refresh session first to ensure we're authenticated after payment redirect
                const { data: sessionData } = await insforge.auth.getCurrentUser();
                let userId = user?.id || sessionData?.user?.id;

                if (!userId) {
                    const refreshed = await refreshSession();
                    if (refreshed) {
                        // Get the user ID from the refreshed session
                        const { data: refreshedData } = await insforge.auth.getCurrentUser();
                        userId = refreshedData?.user?.id;
                    }
                }

                if (!userId) {
                    setStatus('error');
                    setErrorMessage('Authentication required. Please log in again.');
                    return;
                }


                // Wait a moment for webhook to process
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check if review exists and has been marked as paid
                const response = await fetch(`/api/reviews/${reviewId}?userId=${userId}`);
                const result = await response.json();

                if (result.success && result.review) {
                    const review = result.review;

                    // Check if payment was successful (webhook has processed)
                    if (review.payment_status === 'paid' || review.status !== 'pending') {
                        setStatus('success');
                        toast.success('Payment successful!');

                        // Redirect to processing page after brief delay
                        setTimeout(() => {
                            router.push(`/dashboard/review/${reviewId}/processing`);
                        }, 2000);
                    } else {
                        // Payment might still be processing via webhook
                        // Check if we have files in sessionStorage (from upload before payment)
                        const pdfData = sessionStorage.getItem('new_review_pdf');
                        const screenshotsData = sessionStorage.getItem('new_review_screenshots');

                        if (pdfData && screenshotsData) {
                            // Finalize the review creation
                            await finalizeReviewCreation(reviewId, pdfData, screenshotsData, userId);
                        } else {
                            setStatus('error');
                            setErrorMessage('Payment verified but upload data not found. Please contact support.');
                        }
                    }
                } else {
                    setStatus('error');
                    setErrorMessage('Review not found');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setErrorMessage('Failed to verify payment');
            }
        };

        verifyPayment();
    }, [reviewId, router]);

    const finalizeReviewCreation = async (reviewId: string, pdfData: string, screenshotsData: string, userId: string) => {
        try {
            const pdfObj = JSON.parse(pdfData);
            const screenshotsObj = JSON.parse(screenshotsData);

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    fullName: pdfObj.fullName,
                    professionalStatus: pdfObj.professionalStatus,
                    workExperience: pdfObj.workExperience,
                    currentJobTitle: pdfObj.currentJobTitle,
                    purpose: pdfObj.purpose,
                    linkedinUrl: pdfObj.linkedinUrl,
                    pdfPath: pdfObj.pdfPath,
                    screenshotPaths: screenshotsObj.screenshotPaths,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Clear sessionStorage
                sessionStorage.removeItem('new_review_pdf');
                sessionStorage.removeItem('new_review_screenshots');

                setStatus('success');

                // Redirect to processing page
                setTimeout(() => {
                    router.push(`/dashboard/review/${reviewId}/processing`);
                }, 2000);
            } else {
                setStatus('error');
                setErrorMessage('Failed to create review');
            }
        } catch (error) {
            console.error('Finalize review error:', error);
            setStatus('error');
            setErrorMessage('Failed to finalize review');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                {status === 'verifying' && (
                    <>
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#172B4D] mb-2">Verifying Payment</h2>
                        <p className="text-[#6B778C]">
                            Please wait while we confirm your payment...
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#172B4D] mb-2">Payment Successful!</h2>
                        <p className="text-[#6B778C] mb-6">
                            Your LinkedIn review is being prepared. Redirecting to progress page...
                        </p>
                        <div className="animate-pulse flex justify-center">
                            <Loader2 className="w-5 h-5 text-[#0052CC] animate-spin" />
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#172B4D] mb-2">Payment Verification Failed</h2>
                        <p className="text-[#6B778C] mb-6">
                            {errorMessage || 'Unable to verify your payment'}
                        </p>
                        <Button
                            onClick={() => router.push('/dashboard')}
                            className="bg-[#0052CC] hover:bg-[#0043A8]"
                        >
                            Return to Dashboard
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#172B4D] mb-2">Loading...</h2>
                    </div>
                </div>
            }
        >
            <PaymentSuccessContent />
        </Suspense>
    );
}

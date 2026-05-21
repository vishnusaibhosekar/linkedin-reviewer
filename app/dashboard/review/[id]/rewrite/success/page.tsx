"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RewriteSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const { user } = useAuth();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    const reviewId = params.id as string;
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reviewId) {
                setStatus('error');
                setErrorMessage('Missing review ID');
                return;
            }

            try {
                // Wait a moment for webhook to process
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check if rewrite order has been marked as paid
                const response = await fetch(`/api/rewrites/${reviewId}`, {
                    credentials: 'include'
                });
                const result = await response.json();

                if (result.success && result.rewriteOrder) {
                    const rewriteOrder = result.rewriteOrder;

                    if (rewriteOrder.payment_status === 'paid') {
                        setStatus('success');
                        toast.success('Payment successful!');

                        // Redirect to dashboard to see rewrite order
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 2000);
                    } else {
                        setStatus('error');
                        setErrorMessage('Payment not yet confirmed. Please wait or contact support.');
                    }
                } else {
                    setStatus('error');
                    setErrorMessage('Rewrite order not found');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setErrorMessage('Failed to verify payment');
            }
        };

        verifyPayment();
    }, [reviewId, router]);

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
                            Your LinkedIn profile rewrite has been ordered. Redirecting to dashboard...
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
                            onClick={() => router.push(`/dashboard`)}
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

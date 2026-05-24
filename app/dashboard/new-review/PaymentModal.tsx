"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, CreditCard, Lock, Loader2, ExternalLink } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
    currencySymbol: string;
    userName: string;
    userEmail: string;
    reviewId: string;
    userId: string;
    region: 'IN' | 'US';
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, currencySymbol, userName, userEmail, reviewId, userId, region }: PaymentModalProps) {
    const router = useRouter();
    const [processing, setProcessing] = useState(false);

    const handleDodoPayment = async () => {
        setProcessing(true);

        try {
            // Create checkout session
            const response = await fetch('/api/checkout/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId,
                    email: userEmail,
                    userName,
                    userId,
                    region, // Pass region for geographic pricing
                    metadata: {
                        amount: String(amount),
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout');
            }

            // Redirect to Dodo checkout
            window.location.href = data.checkoutUrl;
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to start payment');
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#6B778C] hover:text-[#172B4D] transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-[#0052CC]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#172B4D]">Complete Payment</h2>
                    <p className="text-sm text-[#6B778C] mt-2">LinkedIn Profile Review</p>
                </div>

                {/* Order Summary */}
                <div className="bg-[#F4F5F7] rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[#6B778C]">LinkedIn AI Review</span>
                        <span className="font-semibold text-[#172B4D]">{currencySymbol}{amount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-[#6B778C] mb-2">
                        AI-powered analysis of your LinkedIn profile
                    </div>
                    <div className="border-t border-[#DFE1E6] pt-2 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#172B4D]">Total</span>
                            <span className="text-xl font-bold text-[#0052CC]">{currencySymbol}{amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Secure Payment Notice */}
                <div className="flex items-center gap-2 mt-6 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Lock className="w-4 h-4 text-[#0052CC] flex-shrink-0" />
                    <div className="text-xs text-[#172B4D]">
                        <p className="font-semibold mb-1">Secure Payment via Dodo Payments</p>
                        <p className="text-[#6B778C]">You'll be redirected to our secure payment partner to complete your purchase</p>
                    </div>
                </div>

                {/* Pay Button */}
                <Button
                    onClick={handleDodoPayment}
                    disabled={processing}
                    className="w-full h-12 text-lg bg-[#0052CC] hover:bg-[#0043A8]"
                >
                    {processing ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Redirecting to Payment...
                        </>
                    ) : (
                        <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Pay {currencySymbol}{amount.toFixed(2)} Securely
                        </>
                    )}
                </Button>

                {/* Payment Methods */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-[#6B778C] text-center">
                        <strong>Accepted:</strong> Visa, Mastercard, UPI, Net Banking, Wallets
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, CreditCard, Lock, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
    userName: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, userName }: PaymentModalProps) {
    const router = useRouter();
    const [processing, setProcessing] = useState(false);

    const handleMockPayment = async () => {
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProcessing(false);
        toast.success('Payment successful!');

        // Call the success callback
        onSuccess();
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
                        <span className="text-sm text-[#6B778C]">LinkedIn Review</span>
                        <span className="font-semibold text-[#172B4D]">₹{amount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-[#DFE1E6] pt-2 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#172B4D]">Total</span>
                            <span className="text-xl font-bold text-[#0052CC]">₹{amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Mock Payment Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#172B4D] mb-2">
                            Card Number
                        </label>
                        <Input
                            placeholder="4242 4242 4242 4242"
                            defaultValue="4242 4242 4242 4242"
                            className="h-11"
                            disabled={processing}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                Expiry
                            </label>
                            <Input
                                placeholder="MM/YY"
                                defaultValue="12/25"
                                className="h-11"
                                disabled={processing}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                CVC
                            </label>
                            <Input
                                placeholder="123"
                                defaultValue="123"
                                className="h-11"
                                disabled={processing}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#172B4D] mb-2">
                            Name on Card
                        </label>
                        <Input
                            placeholder={userName}
                            defaultValue={userName}
                            className="h-11"
                            disabled={processing}
                        />
                    </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 mt-6 mb-6 text-xs text-[#6B778C]">
                    <Lock className="w-3 h-3" />
                    <span>Mock payment - no real charges will be made</span>
                </div>

                {/* Pay Button */}
                <Button
                    onClick={handleMockPayment}
                    disabled={processing}
                    className="w-full h-12 text-lg bg-[#0052CC] hover:bg-[#0043A8]"
                >
                    {processing ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing Payment...
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4 mr-2" />
                            Pay ₹{amount.toFixed(2)}
                        </>
                    )}
                </Button>

                {/* Test Mode Notice */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                        <strong>Test Mode:</strong> Using demo card ending in 4242
                    </p>
                </div>
            </div>
        </div>
    );
}

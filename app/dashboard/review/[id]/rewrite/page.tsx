"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Upload, Loader2, X, CheckCircle, FileText } from 'lucide-react';
import RewritePaymentModal from './RewritePaymentModal';
import { detectUserRegion, CustomerRegion, getPricingInfo } from '@/lib/utils/region';

interface ReviewData {
    id: string;
    full_name: string;
    overall_score: number;
    score_band: string;
    purpose: string;
    current_job_title: string;
}

export default function RewriteIntakePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const reviewId = params.id as string;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [review, setReview] = useState<ReviewData | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [region, setRegion] = useState<CustomerRegion>('US');
    const [pricingInfo, setPricingInfo] = useState(getPricingInfo('US', 'rewrite'));

    // Detect user region on mount
    useEffect(() => {
        detectUserRegion().then(detectedRegion => {
            setRegion(detectedRegion);
            setPricingInfo(getPricingInfo(detectedRegion, 'rewrite'));
        });
    }, []);

    const [formData, setFormData] = useState({
        resumeFile: null as File | null,
        resumePath: '',
        keyAccomplishments: '',
        targetRoles: '',
        tonePreference: '',
        sectionsToImprove: [] as string[],
        specialRequests: '',
        contactEmail: user?.email || ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [uploading, setUploading] = useState(false);
    const [pendingRewriteId, setPendingRewriteId] = useState<string | null>(null);

    // Fetch review data on mount
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

                // Pre-fill target roles from review data
                if (result.review.purpose || result.review.current_job_title) {
                    setFormData(prev => ({
                        ...prev,
                        targetRoles: result.review.purpose || result.review.current_job_title || ''
                    }));
                }
            } catch (err: any) {
                console.error('[Rewrite] Error fetching review:', err);
                toast.error(err.message);
                router.push('/dashboard');
            }
        }

        fetchReview();
    }, [reviewId, user, router]);

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        if (step === 3 && !validateStep3()) return;
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const validateStep1 = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.resumeFile) {
            newErrors.resume = 'Resume upload is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.keyAccomplishments.trim()) {
            newErrors.keyAccomplishments = 'Key accomplishments are required';
        }
        if (!formData.targetRoles.trim()) {
            newErrors.targetRoles = 'Target roles are required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.tonePreference) {
            newErrors.tonePreference = 'Tone preference is required';
        }
        if (formData.sectionsToImprove.length === 0) {
            newErrors.sectionsToImprove = 'Select at least one section';
        }
        if (!formData.contactEmail.trim()) {
            newErrors.contactEmail = 'Contact email is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResumeUpload = async (file: File, retries = 2) => {
        setUploading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const response = await fetch('/api/upload/resume', {
                method: 'POST',
                body: uploadFormData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            setFormData(prev => ({
                ...prev,
                resumeFile: file,
                resumePath: result.path
            }));

            toast.success('Resume uploaded successfully');
        } catch (error: any) {
            if (retries > 0 && error.name !== 'AbortError') {
                console.warn(`Resume upload failed, retrying... (${retries} attempts left)`, error);
                setUploading(false);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                return handleResumeUpload(file, retries - 1);
            }
            toast.error(error.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    const handleSectionToggle = (section: string) => {
        setFormData(prev => {
            const sections = prev.sectionsToImprove.includes(section)
                ? prev.sectionsToImprove.filter(s => s !== section)
                : [...prev.sectionsToImprove, section];
            return { ...prev, sectionsToImprove: sections };
        });
    };

    const handleSubmitAndPay = async () => {
        // Validate user is authenticated
        if (!user?.id) {
            toast.error('Authentication required. Please log in again.');
            router.push('/auth/login');
            return;
        }

        setLoading(true);
        try {
            // Create rewrite order in database BEFORE payment (status: pending_payment)
            const response = await Promise.race([
                fetch('/api/rewrites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        reviewId,
                        resumePath: formData.resumePath,
                        keyAccomplishments: formData.keyAccomplishments,
                        targetRoles: formData.targetRoles,
                        tonePreference: formData.tonePreference,
                        sectionsToImprove: formData.sectionsToImprove,
                        specialRequests: formData.specialRequests,
                        contactEmail: formData.contactEmail
                    }),
                }),
                new Promise<Response>((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout - please check your connection')), 30000)
                )
            ]);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create rewrite order');
            }

            // Store the rewrite ID for payment modal
            setPendingRewriteId(result.rewriteId);

            // Open payment modal
            setShowPaymentModal(true);
        } catch (error: any) {
            console.error('handleSubmitAndPay error:', error);
            let errorMessage = 'Failed to create rewrite order. Please try again.';
            if (error.message?.includes('timeout')) {
                errorMessage = 'Request took too long. Please check your internet connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!review) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#0052CC]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/review/${reviewId}/report`)}
                        className="mb-6 text-[#6B778C] hover:text-[#172B4D]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Report
                    </Button>

                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8">
                        <h1 className="text-3xl font-bold text-[#172B4D] mb-2">
                            Get Your LinkedIn Rewritten
                        </h1>
                        <p className="text-[#6B778C]">
                            Professional rewrite by Manish Maryada (YC Alum, Forbes 30u30)
                        </p>

                        {/* Progress Indicator */}
                        <div className="flex items-center gap-2 mt-6">
                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? 'bg-[#0052CC]' : 'bg-[#DFE1E6]'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-[#6B778C] mt-2">Step {step} of 4</p>
                    </div>
                </div>

                {/* Step 1: Upload Resume */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8">
                        <h2 className="text-2xl font-bold text-[#172B4D] mb-4">Upload Your Resume</h2>
                        <p className="text-sm text-[#6B778C] mb-6">
                            Upload your current resume (PDF or DOCX, max 20MB). This helps us understand your background and achievements.
                        </p>

                        <div className="border-2 border-dashed border-[#DFE1E6] rounded-lg p-8 text-center">
                            {formData.resumeFile ? (
                                <div className="space-y-4">
                                    <FileText className="w-12 h-12 text-[#0052CC] mx-auto" />
                                    <div>
                                        <p className="font-semibold text-[#172B4D]">{formData.resumeFile.name}</p>
                                        <p className="text-sm text-[#6B778C]">
                                            {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setFormData(prev => ({ ...prev, resumeFile: null, resumePath: '' }))}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-12 h-12 text-[#6B778C] mx-auto mb-4" />
                                    <p className="text-sm text-[#6B778C] mb-4">
                                        Click to upload or drag and drop
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf,.docx,.doc"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleResumeUpload(file);
                                        }}
                                        className="hidden"
                                        id="resume-upload"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById('resume-upload')?.click()}
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            'Select File'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {errors.resume && (
                            <p className="text-sm text-red-600 mt-2">{errors.resume}</p>
                        )}

                        <div className="flex justify-end mt-8">
                            <Button onClick={handleNext} className="bg-[#0052CC] hover:bg-[#0043A8]">
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Additional Context */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8">
                        <h2 className="text-2xl font-bold text-[#172B4D] mb-4">Additional Context</h2>
                        <p className="text-sm text-[#6B778C] mb-6">
                            Help us understand your goals and what you want to highlight.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Key Accomplishments or Projects *
                                </label>
                                <textarea
                                    value={formData.keyAccomplishments}
                                    onChange={(e) => setFormData(prev => ({ ...prev, keyAccomplishments: e.target.value }))}
                                    placeholder="What projects or achievements do you want highlighted?"
                                    className="w-full min-h-[120px] p-3 border border-[#DFE1E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                                />
                                {errors.keyAccomplishments && (
                                    <p className="text-sm text-red-600 mt-1">{errors.keyAccomplishments}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Target Roles or Industries *
                                </label>
                                <Input
                                    value={formData.targetRoles}
                                    onChange={(e) => setFormData(prev => ({ ...prev, targetRoles: e.target.value }))}
                                    placeholder="e.g., Senior Software Engineer, Product Management"
                                    className="h-11"
                                />
                                {errors.targetRoles && (
                                    <p className="text-sm text-red-600 mt-1">{errors.targetRoles}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <Button variant="outline" onClick={handleBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={handleNext} className="bg-[#0052CC] hover:bg-[#0043A8]">
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Preferences */}
                {step === 3 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8">
                        <h2 className="text-2xl font-bold text-[#172B4D] mb-4">Your Preferences</h2>
                        <p className="text-sm text-[#6B778C] mb-6">
                            Customize your rewrite experience.
                        </p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Tone Preference *
                                </label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['formal', 'conversational', 'bold'].map((tone) => (
                                        <button
                                            key={tone}
                                            onClick={() => setFormData(prev => ({ ...prev, tonePreference: tone }))}
                                            className={`p-4 border-2 rounded-lg capitalize transition-colors ${formData.tonePreference === tone
                                                ? 'border-[#0052CC] bg-blue-50 text-[#0052CC]'
                                                : 'border-[#DFE1E6] hover:border-[#0052CC]'
                                                }`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                                {errors.tonePreference && (
                                    <p className="text-sm text-red-600 mt-1">{errors.tonePreference}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Sections to Improve Most *
                                </label>
                                <div className="space-y-2">
                                    {['Headline', 'About', 'Experience', 'Skills', 'All'].map((section) => (
                                        <label key={section} className="flex items-center gap-3 p-3 border border-[#DFE1E6] rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={formData.sectionsToImprove.includes(section)}
                                                onChange={() => handleSectionToggle(section)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-[#172B4D]">{section}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.sectionsToImprove && (
                                    <p className="text-sm text-red-600 mt-1">{errors.sectionsToImprove}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Special Requests (Optional)
                                </label>
                                <textarea
                                    value={formData.specialRequests}
                                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                                    placeholder="Anything else you'd like us to know?"
                                    className="w-full min-h-[80px] p-3 border border-[#DFE1E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Contact Email *
                                </label>
                                <Input
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                                    placeholder="your@email.com"
                                    className="h-11"
                                />
                                {errors.contactEmail && (
                                    <p className="text-sm text-red-600 mt-1">{errors.contactEmail}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <Button variant="outline" onClick={handleBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={handleNext} className="bg-[#0052CC] hover:bg-[#0043A8]">
                                Review & Payment
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Review & Payment */}
                {step === 4 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8">
                        <h2 className="text-2xl font-bold text-[#172B4D] mb-4">Review & Payment</h2>
                        <p className="text-sm text-[#6B778C] mb-6">
                            Review your order details before proceeding to payment.
                        </p>

                        <div className="bg-[#F4F5F7] rounded-lg p-6 space-y-4 mb-6">
                            <div>
                                <h3 className="text-sm font-semibold text-[#172B4D] mb-2">Review Summary</h3>
                                <p className="text-sm text-[#6B778C]">
                                    {review.full_name} - Score: {review.overall_score}/100 ({review.score_band})
                                </p>
                            </div>

                            <div className="border-t border-[#DFE1E6] pt-4">
                                <h3 className="text-sm font-semibold text-[#172B4D] mb-2">Tone Preference</h3>
                                <p className="text-sm text-[#6B778C] capitalize">{formData.tonePreference}</p>
                            </div>

                            <div className="border-t border-[#DFE1E6] pt-4">
                                <h3 className="text-sm font-semibold text-[#172B4D] mb-2">Sections to Improve</h3>
                                <p className="text-sm text-[#6B778C]">{formData.sectionsToImprove.join(', ')}</p>
                            </div>

                            <div className="border-t border-[#DFE1E6] pt-4">
                                <h3 className="text-sm font-semibold text-[#172B4D] mb-2">Contact Email</h3>
                                <p className="text-sm text-[#6B778C]">{formData.contactEmail}</p>
                            </div>

                            <div className="border-t border-[#DFE1E6] pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-[#172B4D]">Total</span>
                                    <span className="text-2xl font-bold text-[#0052CC]">{pricingInfo.currencySymbol}{pricingInfo.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={handleBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                onClick={handleSubmitAndPay}
                                disabled={loading}
                                className="bg-[#0052CC] hover:bg-[#0043A8]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating Order...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Proceed to Payment
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                <RewritePaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={() => {
                        // After payment redirect, go to success page
                        setShowPaymentModal(false);
                    }}
                    amount={pricingInfo.price}
                    currencySymbol={pricingInfo.currencySymbol}
                    userName={user?.name || review?.full_name || ''}
                    userEmail={user?.email || ''}
                    reviewId={reviewId}
                    userId={user?.id || ''}
                    region={region}
                />
            </div>
        </div>
    );
}

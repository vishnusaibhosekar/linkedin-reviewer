"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Upload, CheckCircle, Loader2, X, ChevronLeft, Info } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { detectUserRegion, CustomerRegion, getPricingInfo } from '@/lib/utils/region';

export default function NewReviewPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isPreparingReview, setIsPreparingReview] = useState(false);
    const [prepareStatus, setPrepareStatus] = useState<string>('');
    const [region, setRegion] = useState<CustomerRegion>('US');
    const [pricingInfo, setPricingInfo] = useState(getPricingInfo('US', 'review'));

    // Detect user region on mount
    useEffect(() => {
        detectUserRegion().then(detectedRegion => {
            setRegion(detectedRegion);
            setPricingInfo(getPricingInfo(detectedRegion, 'review'));
        });
    }, []);

    const [formData, setFormData] = useState({
        fullName: '',
        professionalStatus: '',
        workExperience: '',
        currentJobTitle: '',
        purpose: '',
        linkedinUrl: '',
        pdfFile: null as File | null,
        screenshots: {
            profileBanner: null as File | null,
            endorsements: null as File | null,
            recommendations: null as File | null,
            activityPosts: null as File | null
        }
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showTooltip, setShowTooltip] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);

    // Use ref to track base64 data synchronously (avoid async state update issues)
    const base64ScreenshotsRef = useRef<{ [key: string]: string }>({});

    // Holds the in-flight upload promise so payment success can await it
    const uploadResultRef = useRef<Promise<{ pdfPath: string; screenshotPaths: string[] }> | null>(null);

    const screenshotFields = [
        {
            key: 'profileBanner' as const,
            label: '1. Profile Photo & Banner',
            tooltip: 'Take a screenshot of your LinkedIn profile header showing your profile photo, background/banner image, and headline. Make sure both your photo and banner are fully visible in the frame.'
        },
        {
            key: 'endorsements' as const,
            label: '2. Skills & Endorsements',
            tooltip: 'Scroll to the "Skills" section on your profile and take a screenshot. Capture ALL your skills with their endorsement counts (not just the top 3 shown on the main profile). Click "Show all" if needed to see the full list.'
        },
        {
            key: 'recommendations' as const,
            label: '3. Recommendations',
            tooltip: 'Screenshot the "Recommendations" section. If you have received recommendations, capture them all. If you don\'t have any yet, that\'s okay - just screenshot the empty section or skip this if the option doesn\'t appear.'
        },
        {
            key: 'activityPosts' as const,
            label: '4. Activity & Recent Posts',
            tooltip: 'Scroll to the "Activity" section showing your recent posts, likes, and comments. Capture at least your last 2-3 activities. This helps us assess your engagement and content strategy.'
        }
    ];

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(step + 1);
    };

    const validateStep1 = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        if (!formData.professionalStatus) {
            newErrors.professionalStatus = 'Occupation status is required';
        }
        if (!formData.workExperience) {
            newErrors.workExperience = 'Work experience is required';
        }
        if (formData.professionalStatus === 'employed' && !formData.currentJobTitle.trim()) {
            newErrors.currentJobTitle = 'Current job title is required';
        }
        if (!formData.purpose) {
            newErrors.purpose = 'Purpose of review is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.linkedinUrl.trim()) {
            newErrors.linkedinUrl = 'LinkedIn profile URL is required';
        }
        if (!formData.pdfFile) {
            newErrors.pdfFile = 'LinkedIn PDF export is required';
        }

        // Validate each screenshot
        const screenshotLabels: { [key: string]: string } = {
            profileBanner: 'Profile Photo & Banner screenshot',
            endorsements: 'Skills & Endorsements screenshot',
            recommendations: 'Recommendations screenshot',
            activityPosts: 'Activity & Posts screenshot'
        };

        Object.entries(formData.screenshots).forEach(([key, value]) => {
            if (!value) {
                newErrors[`screenshot_${key}`] = `${screenshotLabels[key]} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePdfUpload = async (file: File): Promise<string> => {
        const uploadForm = new FormData();
        uploadForm.append('file', file);

        const response = await fetch('/api/upload/pdf', {
            method: 'POST',
            body: uploadForm,
            credentials: 'include'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'PDF upload failed');
        }

        return result.path;
    };

    const handleScreenshotUpload = async (file: File, slotName: string): Promise<string> => {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        uploadForm.append('slot', slotName);

        // Convert to base64 for AI processing (run concurrently with upload)
        const [response, base64] = await Promise.all([
            fetch('/api/upload/screenshots', {
                method: 'POST',
                body: uploadForm,
                credentials: 'include'
            }),
            new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            })
        ]);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `${slotName} upload failed`);
        }

        // Store in ref for synchronous access by payment success handler
        base64ScreenshotsRef.current[slotName] = base64;

        return result.path;
    };

    // Uploads PDF + all 4 screenshots in parallel — called as soon as modal opens
    const startUploads = (): Promise<{ pdfPath: string; screenshotPaths: string[] }> => {
        const screenshotKeys = ['profileBanner', 'endorsements', 'recommendations', 'activityPosts'] as const;

        const pdfUpload = handlePdfUpload(formData.pdfFile!);

        // All 4 screenshots upload in parallel
        const screenshotUploads = Promise.all(
            screenshotKeys.map(key => handleScreenshotUpload(formData.screenshots[key]!, key))
        );

        return Promise.all([pdfUpload, screenshotUploads]).then(([pdfPath, screenshotPaths]) => ({
            pdfPath,
            screenshotPaths
        }));
    };

    const handleCancel = () => {
        const hasData = formData.fullName ||
            formData.professionalStatus ||
            formData.linkedinUrl ||
            formData.pdfFile ||
            Object.values(formData.screenshots).some(s => s !== null);

        if (hasData) {
            if (window.confirm('Are you sure you want to cancel? All entered information will be lost.')) {
                // Clear sessionStorage
                sessionStorage.removeItem('new_review_pdf');
                sessionStorage.removeItem('new_review_screenshots');
                router.push('/dashboard');
            }
        } else {
            router.push('/dashboard');
        }
    };

    const handlePayAndSubmit = async () => {
        console.log('handlePayAndSubmit called, pendingReviewId:', pendingReviewId);

        // If reviewId already exists (user closed modal before), just reopen it
        if (pendingReviewId) {
            console.log('Reusing existing reviewId, opening modal');
            setShowPaymentModal(true);
            return;
        }

        setLoading(true);

        // Reset base64 ref for fresh uploads
        base64ScreenshotsRef.current = {};

        // Start uploads in the background
        const uploadPromise = startUploads();
        uploadResultRef.current = uploadPromise;

        try {
            // Wait for uploads to complete
            const { pdfPath, screenshotPaths } = await uploadPromise;

            // Store upload data in sessionStorage for payment success page
            sessionStorage.setItem('new_review_pdf', JSON.stringify({
                fullName: formData.fullName,
                professionalStatus: formData.professionalStatus,
                workExperience: formData.workExperience,
                currentJobTitle: formData.currentJobTitle,
                purpose: formData.purpose,
                linkedinUrl: formData.linkedinUrl,
                pdfPath,
            }));

            sessionStorage.setItem('new_review_screenshots', JSON.stringify({
                screenshotPaths,
            }));

            // Create a pending review record in DB (payment_status: 'pending')
            const reviewResponse = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    fullName: formData.fullName,
                    professionalStatus: formData.professionalStatus,
                    workExperience: formData.workExperience,
                    currentJobTitle: formData.currentJobTitle,
                    purpose: formData.purpose,
                    linkedinUrl: formData.linkedinUrl,
                    pdfPath,
                    screenshotPaths,
                    paymentStatus: 'pending',
                    customerRegion: region, // Store for analytics
                }),
            });

            const reviewResult = await reviewResponse.json();

            if (!reviewResponse.ok) {
                throw new Error(reviewResult.error || 'Failed to create review');
            }

            const reviewId = reviewResult.reviewId;
            console.log('Review created with ID:', reviewId);

            // Store base64 screenshots in sessionStorage for AI processing after payment
            try {
                sessionStorage.setItem(`review_${reviewId}_screenshots`, JSON.stringify(base64ScreenshotsRef.current));
            } catch (storageError) {
                console.warn('sessionStorage quota exceeded, screenshots will be fetched from server:', storageError);
            }

            // Set the review ID for payment modal
            setPendingReviewId(reviewId);

            // Reset loading before opening payment modal
            setLoading(false);

            // Open payment modal
            console.log('Opening payment modal...');
            setShowPaymentModal(true);
        } catch (error: any) {
            console.error('handlePayAndSubmit error:', error);
            toast.error(error.message || 'Failed to prepare review. Please try again.');
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        // This is now handled by the payment success page after redirect
        setShowPaymentModal(false);
    };

    // Full-screen overlay shown between modal close and redirect
    if (isPreparingReview) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0052CC] mb-6">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                    <h2 className="text-2xl font-semibold text-[#172B4D] mb-2">Preparing Your Review</h2>
                    <p className="text-[#6B778C]">{prepareStatus}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Cancel Button */}
                <div className="mb-6 flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="text-[#6B778C] hover:text-[#172B4D]"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#172B4D]">Step {step} of 3</span>
                        <span className="text-sm text-[#6B778C]">
                            {step === 1 ? 'Personal Information' : step === 2 ? 'LinkedIn Data' : 'Review & Submit'}
                        </span>
                    </div>
                    <div className="w-full bg-[#DFE1E6] rounded-full h-2">
                        <div
                            className="bg-[#0052CC] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step 1: Personal Information */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#172B4D]">Personal Information</h2>
                            <p className="text-sm text-[#6B778C] mt-1">Tell us about your professional background</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.fullName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, fullName: e.target.value });
                                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                                    }}
                                    placeholder="John Doe"
                                    className={`h-11 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.fullName && (
                                    <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Occupation Status <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.professionalStatus}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, professionalStatus: value, currentJobTitle: value === 'employed' ? formData.currentJobTitle : '' });
                                        if (errors.professionalStatus) setErrors({ ...errors, professionalStatus: '' });
                                    }}
                                >
                                    <SelectTrigger className={`h-11 w-full ${errors.professionalStatus ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Select your status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employed">Employed</SelectItem>
                                        <SelectItem value="unemployed">Unemployed</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.professionalStatus && (
                                    <p className="text-xs text-red-600 mt-1">{errors.professionalStatus}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Total Work Experience <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.workExperience}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, workExperience: value });
                                        if (errors.workExperience) setErrors({ ...errors, workExperience: '' });
                                    }}
                                >
                                    <SelectTrigger className={`h-11 w-full ${errors.workExperience ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Select experience..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-1">0-1 years</SelectItem>
                                        <SelectItem value="1-3">1-3 years</SelectItem>
                                        <SelectItem value="3-7">3-7 years</SelectItem>
                                        <SelectItem value="7+">7+ years</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.workExperience && (
                                    <p className="text-xs text-red-600 mt-1">{errors.workExperience}</p>
                                )}
                            </div>

                            {formData.professionalStatus === 'employed' && (
                                <div>
                                    <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                        Current Job Title <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={formData.currentJobTitle}
                                        onChange={(e) => {
                                            setFormData({ ...formData, currentJobTitle: e.target.value });
                                            if (errors.currentJobTitle) setErrors({ ...errors, currentJobTitle: '' });
                                        }}
                                        placeholder="Software Engineer"
                                        className={`h-11 ${errors.currentJobTitle ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {errors.currentJobTitle && (
                                        <p className="text-xs text-red-600 mt-1">{errors.currentJobTitle}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    Purpose of Review <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formData.purpose}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, purpose: value });
                                        if (errors.purpose) setErrors({ ...errors, purpose: '' });
                                    }}
                                >
                                    <SelectTrigger className={`h-11 w-full ${errors.purpose ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Select purpose..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="job-search">Job Search</SelectItem>
                                        <SelectItem value="networking">Networking</SelectItem>
                                        <SelectItem value="personal-branding">Personal Branding</SelectItem>
                                        <SelectItem value="freelancing">Freelancing</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.purpose && (
                                    <p className="text-xs text-red-600 mt-1">{errors.purpose}</p>
                                )}
                            </div>
                        </div>

                        <Button onClick={handleNext} className="w-full h-11 text-base">
                            Next Step
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {/* Step 2: LinkedIn Profile Data */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#172B4D]">LinkedIn Profile Data</h2>
                            <p className="text-sm text-[#6B778C] mt-1">Upload your LinkedIn profile information</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    LinkedIn Profile URL <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.linkedinUrl}
                                    onChange={(e) => {
                                        setFormData({ ...formData, linkedinUrl: e.target.value });
                                        if (errors.linkedinUrl) setErrors({ ...errors, linkedinUrl: '' });
                                    }}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    type="url"
                                    className={`h-11 ${errors.linkedinUrl ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.linkedinUrl && (
                                    <p className="text-xs text-red-600 mt-1">{errors.linkedinUrl}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#172B4D] mb-2">
                                    LinkedIn PDF Export <span className="text-red-500">*</span>
                                </label>
                                <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-[#0052CC] transition-colors ${errors.pdfFile ? 'border-red-500 bg-red-50' : 'border-[#DFE1E6]'}`}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 20 * 1024 * 1024) {
                                                    toast.error('PDF file must be less than 20MB');
                                                    return;
                                                }
                                                setFormData({ ...formData, pdfFile: file });
                                                if (errors.pdfFile) setErrors({ ...errors, pdfFile: '' });
                                            }
                                        }}
                                        className="hidden"
                                        id="pdf-upload"
                                    />
                                    <label htmlFor="pdf-upload" className="cursor-pointer">
                                        <Upload className="w-8 h-8 mx-auto mb-2 text-[#6B778C]" />
                                        {formData.pdfFile ? (
                                            <div>
                                                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                                                <p className="text-sm text-green-600 font-medium">{formData.pdfFile.name}</p>
                                                <p className="text-xs text-[#6B778C] mt-1">{(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-[#172B4D] font-medium">Click to upload PDF</p>
                                                <p className="text-xs text-[#6B778C] mt-1">Max 20MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {errors.pdfFile ? (
                                    <p className="text-xs text-red-600 mt-2">{errors.pdfFile}</p>
                                ) : (
                                    <p className="text-xs text-[#6B778C] mt-2">
                                        Go to LinkedIn → Click "More" on your profile → "Save to PDF"
                                    </p>
                                )}
                            </div>

                            {/* Screenshot Uploads */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <label className="block text-sm font-medium text-[#172B4D]">
                                        LinkedIn Screenshots <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs text-[#6B778C]">(4 required - sections NOT included in PDF export)</span>
                                </div>

                                {screenshotFields.map((field) => (
                                    <div key={field.key}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-sm font-medium text-[#172B4D]">
                                                {field.label}
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTooltip(showTooltip === field.key ? null : field.key)}
                                                    className="text-[#6B778C] hover:text-[#0052CC] transition-colors"
                                                >
                                                    <Info className="w-4 h-4" />
                                                </button>
                                                {showTooltip === field.key && (
                                                    <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-[#172B4D] text-white text-xs rounded-lg shadow-lg">
                                                        {field.tooltip}
                                                        <div className="absolute -top-1 left-4 w-2 h-2 bg-[#172B4D] rotate-45" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${errors[`screenshot_${field.key}`] ? 'border-red-500 bg-red-50' : formData.screenshots[field.key] ? 'border-green-500 bg-green-50' : 'border-[#DFE1E6] hover:border-[#0052CC]'}`}>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 10 * 1024 * 1024) {
                                                            toast.error(`${field.label} must be less than 10MB`);
                                                            return;
                                                        }
                                                        setFormData({
                                                            ...formData,
                                                            screenshots: {
                                                                ...formData.screenshots,
                                                                [field.key]: file
                                                            }
                                                        });
                                                        if (errors[`screenshot_${field.key}`]) {
                                                            setErrors({ ...errors, [`screenshot_${field.key}`]: '' });
                                                        }
                                                    }
                                                }}
                                                className="hidden"
                                                id={`screenshot-${field.key}`}
                                            />
                                            <label htmlFor={`screenshot-${field.key}`} className="cursor-pointer">
                                                {formData.screenshots[field.key] ? (
                                                    <div>
                                                        <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                                                        <p className="text-sm text-green-600 font-medium">{formData.screenshots[field.key]!.name}</p>
                                                        <p className="text-xs text-[#6B778C] mt-1">{(formData.screenshots[field.key]!.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload className="w-6 h-6 mx-auto mb-2 text-[#6B778C]" />
                                                        <p className="text-sm text-[#172B4D] font-medium">Click to upload</p>
                                                        <p className="text-xs text-[#6B778C] mt-1">PNG, JPG, WEBP - Max 10MB</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        {errors[`screenshot_${field.key}`] && (
                                            <p className="text-xs text-red-600 mt-2">{errors[`screenshot_${field.key}`]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-11">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={handleNext} className="flex-1 h-11">
                                Next Step
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-[#DFE1E6] p-8 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#172B4D]">Review & Submit</h2>
                            <p className="text-sm text-[#6B778C] mt-1">Confirm your information before submitting</p>
                        </div>

                        <div className="bg-[#F4F5F7] rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-[#172B4D] mb-2">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-[#6B778C]">Name:</span>
                                        <p className="font-medium text-[#172B4D]">{formData.fullName}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#6B778C]">Status:</span>
                                        <p className="font-medium text-[#172B4D] capitalize">{formData.professionalStatus}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#6B778C]">Experience:</span>
                                        <p className="font-medium text-[#172B4D]">{formData.workExperience} years</p>
                                    </div>
                                    {formData.currentJobTitle && (
                                        <div>
                                            <span className="text-[#6B778C]">Role:</span>
                                            <p className="font-medium text-[#172B4D]">{formData.currentJobTitle}</p>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <span className="text-[#6B778C]">Purpose:</span>
                                        <p className="font-medium text-[#172B4D] capitalize">{formData.purpose.replace('-', ' ')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[#DFE1E6] pt-4">
                                <h3 className="font-semibold text-[#172B4D] mb-2">LinkedIn Data</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-[#6B778C]">URL:</span>
                                        <p className="font-medium text-[#172B4D] break-all">{formData.linkedinUrl}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#6B778C]">PDF:</span>
                                        <p className="font-medium text-[#172B4D]">{formData.pdfFile?.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-[#6B778C]">Screenshots:</span>
                                        <p className="font-medium text-[#172B4D]">
                                            {[formData.screenshots.profileBanner, formData.screenshots.endorsements, formData.screenshots.recommendations, formData.screenshots.activityPosts].filter(Boolean).length}/4 uploaded
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-11">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                onClick={handlePayAndSubmit}
                                className="flex-1 h-11 text-base"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Pay & Get Review
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                    amount={pricingInfo.price}
                    currencySymbol={pricingInfo.currencySymbol}
                    userName={formData.fullName}
                    userEmail={user?.email || ''}
                    reviewId={pendingReviewId || ''}
                    userId={user?.id || ''}
                    region={region}
                />
            </div>
        </div>
    );
}

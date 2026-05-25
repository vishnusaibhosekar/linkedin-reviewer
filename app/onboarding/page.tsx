"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { insforge } from "@/lib/auth/insforge";
import { auth } from "@/firebase";
import {
    ConfirmationResult,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2Icon, PhoneIcon, ChevronDownIcon } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function OnboardingPage() {
    const router = useRouter();
    const { user, loading, refreshSession } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("+91");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const countries = [
        { code: "+91", flag: "🇮🇳", name: "India" },
        { code: "+1", flag: "🇺🇸", name: "United States" },
        { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
        { code: "+61", flag: "🇦🇺", name: "Australia" },
        { code: "+86", flag: "🇨🇳", name: "China" },
        { code: "+81", flag: "🇯🇵", name: "Japan" },
        { code: "+49", flag: "🇩🇪", name: "Germany" },
        { code: "+33", flag: "🇫🇷", name: "France" },
        { code: "+55", flag: "🇧🇷", name: "Brazil" },
        { code: "+971", flag: "🇦🇪", name: "UAE" },
    ];

    const selectedCountryData = countries.find(c => c.code === selectedCountry);

    // Redirect if already has phone or not authenticated
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/auth/login");
            } else if (user.profile?.phone) {
                router.push("/dashboard");
            }
        }
    }, [user, loading, router]);

    // Initialize RecaptchaVerifier
    useEffect(() => {
        let verifier: RecaptchaVerifier | null = null;

        try {
            verifier = new RecaptchaVerifier(
                auth,
                "recaptcha-container",
                {
                    size: "invisible",
                }
            );
            setRecaptchaVerifier(verifier);
        } catch (error) {
            console.error("Failed to initialize RecaptchaVerifier:", error);
        }

        return () => {
            if (verifier) {
                verifier.clear();
            }
        };
    }, []);

    // Resend countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    // Auto-verify OTP when 6 digits entered
    useEffect(() => {
        if (otp.length === 6 && otpSent && confirmationResult) {
            verifyOtp();
        }
    }, [otp]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowCountryDropdown(false);
        };

        if (showCountryDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showCountryDropdown]);

    const sendOtp = async () => {
        setIsSendingOtp(true);

        try {
            if (!recaptchaVerifier) {
                toast.error("reCAPTCHA not initialized. Please refresh the page.");
                setIsSendingOtp(false);
                return;
            }

            const fullPhoneNumber = `${selectedCountry}${phoneNumber.replace(/\s/g, '')}`;

            // Validate phone number length
            const digitsOnly = phoneNumber.replace(/\D/g, '');
            if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                toast.error("Please enter a valid phone number");
                setIsSendingOtp(false);
                return;
            }

            // Send OTP via Firebase
            const result = await signInWithPhoneNumber(
                auth,
                fullPhoneNumber,
                recaptchaVerifier
            );

            setConfirmationResult(result);
            setOtpSent(true);
            setResendCountdown(60);

            toast.success("OTP sent successfully!");
        } catch (err: any) {
            console.error("Failed to send OTP:", err);

            if (err.code === "auth/invalid-phone-number") {
                toast.error("Invalid phone number. Please check the number.");
            } else if (err.code === "auth/too-many-requests") {
                toast.error("Too many requests. Please try again later.");
            } else {
                toast.error(err.message || "Failed to send OTP. Please try again.");
            }
        } finally {
            setIsSendingOtp(false);
        }
    };

    const verifyOtp = async () => {
        if (!otpSent || otp.length !== 6 || !confirmationResult) return;

        setIsVerifyingOtp(true);

        try {
            // Verify OTP with Firebase
            await confirmationResult.confirm(otp);

            // OTP verified successfully - save phone to InsForge profile
            const fullPhoneNumber = `${selectedCountry}${phoneNumber.replace(/\s/g, '')}`;

            console.log('[Onboarding] Saving phone to profile:', fullPhoneNumber);

            const { data, error } = await insforge.auth.setProfile({
                phone: fullPhoneNumber,
            });

            if (error) {
                console.error('[Onboarding] setProfile error:', error);
                throw error;
            }

            console.log('[Onboarding] setProfile success:', data);

            // Refresh AuthContext session to ensure it has the latest phone number
            console.log('[Onboarding] Refreshing session...');
            const refreshed = await refreshSession();
            console.log('[Onboarding] Session refreshed:', refreshed);

            // Log the updated user object to see the structure
            const { data: userData } = await insforge.auth.getCurrentUser();
            console.log('[Onboarding] User after refresh:', userData?.user);

            toast.success("Phone verified successfully!");

            // Redirect to dashboard after session refresh
            setTimeout(() => {
                router.push("/dashboard");
            }, 500);
        } catch (err: any) {
            console.error("Failed to verify OTP:", err);

            if (err.code === "auth/invalid-verification-code") {
                toast.error("Invalid OTP. Please try again.");
            } else {
                toast.error(err.message || "Failed to verify OTP. Please try again.");
            }
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCountdown > 0) return;

        setOtp("");
        setConfirmationResult(null);
        await sendOtp();
    };

    const handleChangeNumber = () => {
        setOtpSent(false);
        setOtp("");
        setConfirmationResult(null);
        setResendCountdown(0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-gray-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">

                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                                <PhoneIcon className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Verify Your Phone
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {!otpSent
                                    ? "Enter your phone number to receive a verification code"
                                    : `Enter the 6-digit code sent to ${selectedCountryData?.flag} ${selectedCountry} ${phoneNumber}`
                                }
                            </p>
                        </div>

                        {/* Phone Number Form (before OTP sent) */}
                        {!otpSent && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {/* Country Code Selector */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowCountryDropdown(!showCountryDropdown);
                                                }}
                                                className="h-11 px-3 flex items-center gap-1.5 bg-gray-50 border border-input rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="text-lg">{selectedCountryData?.flag}</span>
                                                <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
                                            </button>

                                            {showCountryDropdown && (
                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
                                                >
                                                    {countries.map((country) => (
                                                        <button
                                                            key={country.code}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCountry(country.code);
                                                                setShowCountryDropdown(false);
                                                            }}
                                                            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <span className="text-lg">{country.flag}</span>
                                                            <span className="flex-1 text-left text-sm">{country.name}</span>
                                                            <span className="text-sm text-muted-foreground">{country.code}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Phone Input */}
                                        <Input
                                            type="tel"
                                            placeholder="9876543210"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="h-11 flex-1"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={sendOtp}
                                    disabled={!phoneNumber || isSendingOtp || resendCountdown > 0}
                                    className="w-full h-11"
                                >
                                    {isSendingOtp ? (
                                        <>
                                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : resendCountdown > 0 ? (
                                        `Resend OTP in ${resendCountdown}s`
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* OTP Input (after OTP sent) */}
                        {otpSent && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground">
                                        Code sent to {selectedCountryData?.flag} {selectedCountry} {phoneNumber}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleChangeNumber}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Change number
                                    </button>
                                </div>

                                <div className="flex justify-center">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={(value) => setOtp(value)}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCountdown > 0}
                                        className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resendCountdown > 0
                                            ? `Resend OTP in ${resendCountdown}s`
                                            : "Resend OTP"
                                        }
                                    </button>
                                </div>

                                <Button
                                    disabled={otp.length !== 6 || isVerifyingOtp}
                                    className="w-full h-11"
                                >
                                    {isVerifyingOtp ? (
                                        <>
                                            <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                            Verifying OTP...
                                        </>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">
                                We'll use this to contact you about your LinkedIn review
                            </p>
                        </div>

                        {/* reCAPTCHA Container */}
                        <div id="recaptcha-container" className="hidden" />
                    </div>
                </div>
            </div>
        </>
    );
}

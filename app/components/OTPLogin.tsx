"use client";

import { auth } from "@/firebase";
import {
    ConfirmationResult,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";
import React, { FormEvent, useEffect, useState, useTransition } from "react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PhoneIcon, Loader2Icon, ChevronDownIcon } from "lucide-react";
import { Toaster, toast } from "sonner";

function OtpLogin() {
    const router = useRouter();

    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState("");
    const [resendCountdown, setResendCountdown] = useState(0);
    const [selectedCountry, setSelectedCountry] = useState("+91");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

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

    const [recaptchaVerifier, setRecaptchaVerifier] =
        useState<RecaptchaVerifier | null>(null);

    const [confirmationResult, setConfirmationResult] =
        useState<ConfirmationResult | null>(null);

    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    useEffect(() => {
        const recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "invisible",
            }
        );

        setRecaptchaVerifier(recaptchaVerifier);

        return () => {
            recaptchaVerifier.clear();
        };
    }, [auth]);

    useEffect(() => {
        const hasEnteredAllDigits = otp.length === 6;
        if (hasEnteredAllDigits) {
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

    const verifyOtp = async () => {
        startTransition(async () => {
            setError("");

            if (!confirmationResult) {
                setError("Please request OTP first.");
                return;
            }

            try {
                await confirmationResult?.confirm(otp);
                toast.success("Login successful! Redirecting...");
                setTimeout(() => router.replace("/"), 1000);
            } catch (error) {
                console.log(error);

                setError("Failed to verify OTP. Please check the OTP.");
                toast.error("Failed to verify OTP. Please check the code.");
            }
        });
    };

    const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        setResendCountdown(60);

        startTransition(async () => {
            setError("");

            if (!recaptchaVerifier) {
                return setError("RecaptchaVerifier is not initialized.");
            }

            const fullPhoneNumber = `${selectedCountry}${phoneNumber.replace(/\s/g, '')}`;

            try {
                const confirmationResult = await signInWithPhoneNumber(
                    auth,
                    fullPhoneNumber,
                    recaptchaVerifier
                );

                setConfirmationResult(confirmationResult);
                toast.success("OTP sent successfully!");
            } catch (err: any) {
                console.log(err);
                setResendCountdown(0);

                if (err.code === "auth/invalid-phone-number") {
                    setError("Invalid phone number. Please check the number.");
                    toast.error("Invalid phone number. Please check the number.");
                } else if (err.code === "auth/too-many-requests") {
                    setError("Too many requests. Please try again later.");
                    toast.error("Too many requests. Please try again later.");
                } else {
                    setError("Failed to send OTP. Please try again.");
                    toast.error("Failed to send OTP. Please try again.");
                }
            }
        });
    };

    const loadingIndicator = (
        <div role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
        </div>
    );

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                            <PhoneIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground">
                            Phone Verification
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {!confirmationResult
                                ? "Enter your phone number to receive a verification code"
                                : "Enter the 6-digit code sent to your phone"}
                        </p>
                    </div>

                    {/* Form */}
                    {!confirmationResult && (
                        <form onSubmit={requestOtp} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
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
                                    <Input
                                        type="tel"
                                        placeholder="9876543210"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="h-11 flex-1"
                                    />
                                </div>
                            </div>
                        </form>
                    )}

                    {confirmationResult && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                    Code sent to {selectedCountryData?.flag} {selectedCountry} {phoneNumber}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmationResult(null);
                                        setOtp("");
                                        setResendCountdown(0);
                                    }}
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
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        {!confirmationResult ? (
                            <Button
                                disabled={!phoneNumber || isPending || resendCountdown > 0}
                                onClick={() => requestOtp()}
                                className="w-full h-11"
                            >
                                {isPending ? (
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
                        ) : (
                            <Button
                                disabled={otp.length !== 6 || isPending}
                                className="w-full h-11"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying OTP
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </Button>
                        )}
                    </div>

                    {/* reCAPTCHA Container */}
                    <div id="recaptcha-container" className="hidden" />
                </div>
            </div>
        </>
    );
}

export default OtpLogin;
